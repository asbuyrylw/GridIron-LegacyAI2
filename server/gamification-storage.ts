import { MemStorage } from "./storage";
import { 
  Achievement,
  AthleteAchievement, 
  InsertAthleteAchievement
} from "@shared/schema";

// Implementation of athlete achievement methods
export async function getAthleteAchievements(this: MemStorage, athleteId: number): Promise<AthleteAchievement[]> {
  // Use the athleteAchievementsMap from the MemStorage instance
  return Array.from(this.athleteAchievementsMap.values())
    .filter(aa => aa.athleteId === athleteId);
}

export async function getAthleteAchievementByStringId(this: MemStorage, athleteId: number, achievementStringId: string): Promise<AthleteAchievement | undefined> {
  // Find achievement by athlete ID and string ID
  return Array.from(this.athleteAchievementsMap.values())
    .find(aa => aa.athleteId === athleteId && aa.achievementId === achievementStringId);
}

export async function getAchievementProgressByUserId(this: MemStorage, userId: number): Promise<any[]> {
  // First, get the athlete's ID from the user ID
  const athlete = await this.getAthleteByUserId(userId);
  if (!athlete) {
    return [];
  }
  
  // Get the athlete's achievements
  const athleteAchievements = await this.getAthleteAchievements(athlete.id);
  
  // Map to the format expected by the frontend
  return athleteAchievements.map(aa => ({
    achievementId: aa.achievementId,
    progress: aa.progress || 0,
    completed: aa.completed || false,
    completedAt: aa.earnedAt?.toISOString()
  }));
}

export async function getAchievementProgressByAthleteId(this: MemStorage, athleteId: number): Promise<any[]> {
  // Get the athlete's achievements
  const athleteAchievements = await this.getAthleteAchievements(athleteId);
  
  // Map to the format expected by the frontend
  return athleteAchievements.map(aa => ({
    achievementId: aa.achievementId,
    progress: aa.progress || 0,
    completed: aa.completed || false,
    completedAt: aa.earnedAt?.toISOString()
  }));
}

export async function updateAchievementProgress(this: MemStorage, userId: number, achievementId: string, progress: number): Promise<any> {
  // First, get the athlete's ID from the user ID
  const athlete = await this.getAthleteByUserId(userId);
  if (!athlete) {
    throw new Error('Athlete not found');
  }
  
  // Check if the achievement already exists for this athlete
  let athleteAchievement = await this.getAthleteAchievementByStringId(athlete.id, achievementId);
  
  const previouslyCompleted = athleteAchievement?.completed || false;
  
  // Get the achievement to check if the progress is enough to complete it
  const progressMax = 100; // We'll set a default progress max of 100
  
  // Calculate if the achievement is completed
  const isCompleted = progress >= progressMax;
  
  if (athleteAchievement) {
    // Update the existing achievement
    const updatedAchievement = {
      ...athleteAchievement,
      progress,
      completed: isCompleted,
    };
    
    // If it was just completed, set the earnedAt timestamp
    if (isCompleted && !previouslyCompleted) {
      updatedAchievement.earnedAt = new Date();
    }
    
    // Update in storage
    const result = await this.updateAthleteAchievement(athleteAchievement.id, {
      progress,
      completed: isCompleted,
      earnedAt: isCompleted && !previouslyCompleted ? new Date() : athleteAchievement.earnedAt
    });
    
    return {
      achievementId,
      progress,
      completed: isCompleted,
      previouslyCompleted,
      completedAt: result?.earnedAt?.toISOString(),
    };
  } else {
    // Create a new achievement record
    const newAchievement: InsertAthleteAchievement = {
      athleteId: athlete.id,
      achievementId,
      progress,
      completed: isCompleted,
      earnedAt: isCompleted ? new Date() : null,
      createdAt: new Date()
    };
    
    // Add to storage
    const createdAchievement = await this.createAthleteAchievement(newAchievement);
    
    return {
      achievementId,
      progress,
      completed: isCompleted,
      previouslyCompleted: false,
      completedAt: createdAchievement.earnedAt?.toISOString(),
    };
  }
}

// Implementation of leaderboard methods
export async function getLeaderboard(this: MemStorage, timeframe: string, scope: string): Promise<any[]> {
  // Get all users and athletes
  const users = await this.getAllUsers();
  const athletes = await this.getAllAthletes();
  
  // Map users to athletes
  const athleteUsers = athletes
    .filter(athlete => athlete.firstName && athlete.lastName) // Only include athletes with names
    .map(athlete => {
      const user = users.find(u => u.id === athlete.userId);
      return {
        userId: user?.id || 0,
        athleteId: athlete.id,
        username: user?.username || '',
        firstName: athlete.firstName || '',
        lastName: athlete.lastName || '',
        profileImage: athlete.profileImage,
        achievements: 0,
        points: 0
      };
    }).filter(au => au.userId > 0);
  
  // Get all athlete achievements
  const allAchievements = Array.from(this.athleteAchievementsMap.values());
  
  // Filter achievements based on timeframe
  let filteredAchievements = allAchievements;
  if (timeframe === 'week') {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    filteredAchievements = allAchievements.filter(a => 
      a.earnedAt && a.earnedAt > oneWeekAgo && a.completed
    );
  } else if (timeframe === 'month') {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    filteredAchievements = allAchievements.filter(a => 
      a.earnedAt && a.earnedAt > oneMonthAgo && a.completed
    );
  } else {
    // 'all-time' - only count completed achievements
    filteredAchievements = allAchievements.filter(a => a.completed);
  }
  
  // Count achievements and calculate points for each athlete
  for (const achievement of filteredAchievements) {
    const athleteUser = athleteUsers.find(au => au.athleteId === achievement.athleteId);
    if (athleteUser) {
      // Each completed achievement is worth 50 points
      athleteUser.points += 50;
      athleteUser.achievements += 1;
    }
  }
  
  // Filter by scope if needed (e.g., team, region, position)
  // This is a placeholder for future implementation
  let scopedAthletes = athleteUsers;
  
  // Sort by points (descending)
  const sortedLeaderboard = scopedAthletes
    .sort((a, b) => b.points - a.points);
  
  // Add rank and format
  return sortedLeaderboard.map((entry, index) => ({
    userId: entry.userId,
    athleteId: entry.athleteId,
    username: entry.username,
    firstName: entry.firstName,
    lastName: entry.lastName,
    fullName: `${entry.firstName} ${entry.lastName}`,
    profileImage: entry.profileImage,
    points: entry.points,
    rank: index + 1,
    achievements: entry.achievements,
    isCurrentUser: false // This will be set on the client side
  }));
}