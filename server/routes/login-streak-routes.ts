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
    // Get the athlete ID for this user
    const athlete = await storage.getAthleteByUserId(userId);
    
    if (!athlete) {
      console.log("No athlete found for streak achievements");
      return;
    }
    
    // Get achievements for streak milestones
    const achievementMapping: { [milestone: number]: string } = {
      3: 'streak-three-days',
      7: 'streak-one-week',
      14: 'streak-two-weeks',
      30: 'streak-one-month',
      60: 'streak-two-months',
      90: 'streak-three-months',
      180: 'streak-six-months',
      365: 'streak-one-year'
    };
    
    // Find the highest milestone achieved
    const milestones = Object.keys(achievementMapping)
      .map(key => parseInt(key))
      .sort((a, b) => a - b);
    
    for (const milestone of milestones) {
      if (streakCount >= milestone) {
        const achievementId = achievementMapping[milestone];
        
        // Update this achievement progress to 100%
        await storage.updateAchievementProgress(
          userId,
          achievementId,
          100
        );
      }
    }
  } catch (error) {
    console.error("Error updating streak achievements:", error);
  }
}