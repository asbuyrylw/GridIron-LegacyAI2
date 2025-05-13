import { Express } from "express";
import { loginStreakService } from "../login-streak-service";
import { storage } from "../storage";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export function setupLoginStreakRoutes(app: Express) {
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };

  // Get current user's login streak
  app.get("/api/login-streak", isAuthenticated, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      const userId = req.user.id;
      
      // Get or create login streak for this user
      let streak = await loginStreakService.getLoginStreak(userId);
      
      if (!streak) {
        streak = await loginStreakService.createLoginStreak({ userId });
      }
      
      res.json(streak);
    } catch (error) {
      console.error("Error getting login streak:", error);
      res.status(500).json({ message: "Failed to get login streak" });
    }
  });

  // Update login streak (processes a login)
  app.post("/api/login-streak/update", isAuthenticated, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      const userId = req.user.id;
      
      // Process the login and update streak
      const updatedStreak = await loginStreakService.processLogin(userId);
      
      // Check if any streak achievements should be unlocked
      await updateStreakAchievements(userId, updatedStreak.currentStreak);
      
      res.json(updatedStreak);
    } catch (error) {
      console.error("Error updating login streak:", error);
      res.status(500).json({ message: "Failed to update login streak" });
    }
  });

  // Get login streak leaderboard
  app.get("/api/login-streak/leaderboard", isAuthenticated, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      // Fetch all streaks
      const allStreaks = loginStreakService.getAllStreaks();
      
      // Define the response type
      interface LeaderboardEntry {
        id: number;
        userId: number;
        currentStreak: number;
        longestStreak: number;
        lastLoginDate: string | null;
        username: string;
        userType: string;
        fullName: string;
      }
      
      // Sort by current streak (descending)
      const leaderboard = allStreaks
        .sort((a, b) => b.currentStreak - a.currentStreak)
        .slice(0, 10); // Get top 10
      
      // Get user info for display
      const leaderboardWithUserInfo: LeaderboardEntry[] = await Promise.all(
        leaderboard.map(async (streak): Promise<LeaderboardEntry> => {
          try {
            const user = await storage.getUser(streak.userId);
            
            if (!user) {
              return {
                id: streak.id,
                userId: streak.userId,
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                lastLoginDate: streak.lastLoginDate,
                username: 'Unknown',
                userType: 'unknown',
                fullName: 'Unknown User'
              };
            }
            
            const athlete = user.userType === 'athlete' 
              ? await storage.getAthlete(streak.userId) 
              : null;
              
            return {
              id: streak.id,
              userId: streak.userId,
              currentStreak: streak.currentStreak,
              longestStreak: streak.longestStreak,
              lastLoginDate: streak.lastLoginDate,
              username: user.username || 'Unknown',
              userType: user.userType || 'unknown',
              fullName: athlete 
                ? `${athlete.firstName} ${athlete.lastName}` 
                : user.username
            };
          } catch (error) {
            console.error("Error getting user info for streak leaderboard:", error);
            return {
              id: streak.id,
              userId: streak.userId,
              currentStreak: streak.currentStreak,
              longestStreak: streak.longestStreak,
              lastLoginDate: streak.lastLoginDate,
              username: 'Unknown',
              userType: 'unknown',
              fullName: 'Unknown User'
            };
          }
        })
      );
      
      res.json(leaderboardWithUserInfo);
    } catch (error) {
      console.error("Error getting login streak leaderboard:", error);
      res.status(500).json({ message: "Failed to get login streak leaderboard" });
    }
  });
}

// Helper function to update achievements based on login streak
async function updateStreakAchievements(userId: number, streakCount: number) {
  try {
    // Get the user data
    const user = await storage.getUser(userId);
    
    if (!user || user.userType !== 'athlete') {
      console.log("No athlete found for streak achievements");
      return;
    }
    
    // Get the athlete ID for this user
    const athlete = await storage.getAthlete(userId);
    
    if (!athlete) {
      console.log("No athlete found for streak achievements");
      return;
    }
    
    // Update achievement progress based on the current streak
    // For each achievement, we set the progress to the current streak
    // as long as it doesn't exceed the maximum
    
    // Bronze - 5 day streak
    if (streakCount >= 5) {
      await storage.updateAchievementProgress(
        userId,
        'login-streak-bronze',
        Math.min(streakCount, 5)
      );
    } else if (streakCount > 0) {
      // Partial progress
      await storage.updateAchievementProgress(
        userId,
        'login-streak-bronze',
        streakCount
      );
    }
    
    // Silver - 10 day streak
    if (streakCount >= 10) {
      await storage.updateAchievementProgress(
        userId,
        'login-streak-silver',
        Math.min(streakCount, 10)
      );
    } else if (streakCount > 0) {
      // Partial progress
      await storage.updateAchievementProgress(
        userId,
        'login-streak-silver',
        streakCount
      );
    }
    
    // Gold - 25 day streak
    if (streakCount >= 25) {
      await storage.updateAchievementProgress(
        userId,
        'login-streak-gold',
        Math.min(streakCount, 25)
      );
    } else if (streakCount > 0) {
      // Partial progress
      await storage.updateAchievementProgress(
        userId,
        'login-streak-gold',
        streakCount
      );
    }
    
    // Platinum - 50 day streak
    if (streakCount >= 50) {
      await storage.updateAchievementProgress(
        userId,
        'login-streak-platinum',
        Math.min(streakCount, 50)
      );
    } else if (streakCount > 0) {
      // Partial progress
      await storage.updateAchievementProgress(
        userId,
        'login-streak-platinum',
        streakCount
      );
    }
    
    console.log(`Updated login streak achievements for user ${userId}, streak: ${streakCount}`);
  } catch (error) {
    console.error("Error updating streak achievements:", error);
  }
}