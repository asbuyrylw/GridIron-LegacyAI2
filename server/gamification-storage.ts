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
  // For now, return mock data for the leaderboard
  const users = await this.getAllUsers();
  const athletes = await this.getAllAthletes();
  
  // Map users to athletes
  const athleteUsers = athletes.map(athlete => {
    const user = users.find(u => u.id === athlete.userId);
    return {
      userId: user?.id || 0,
      athleteId: athlete.id,
      username: user?.username || '',
      fullName: `${athlete.firstName} ${athlete.lastName}`,
      profileImage: athlete.profileImage,
    };
  }).filter(au => au.userId > 0);
  
  // Generate random leaderboard entries
  return athleteUsers.map((au, index) => {
    const rank = index + 1;
    const previousRank = Math.max(1, rank + (Math.floor(Math.random() * 3) - 1));
    
    return {
      userId: au.userId,
      athleteId: au.athleteId,
      username: au.username,
      fullName: au.fullName,
      profileImage: au.profileImage,
      points: Math.max(0, 1000 - (index * 50) + Math.floor(Math.random() * 30)),
      rank,
      previousRank,
      achievements: Math.floor(Math.random() * 20) + 1,
      topAchievement: 'Performance Master',
    };
  });
}