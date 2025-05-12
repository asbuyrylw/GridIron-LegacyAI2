import { MemStorage } from "./storage";
import { 
  achievements, 
  atletheAchievements, 
  leaderboards, 
  leaderboardEntries 
} from "@shared/schema";
import { 
  AthleteAchievement, 
  InsertAthleteAchievement, 
  LeaderboardEntry 
} from "@shared/schema";

// Implementation of athlete achievement methods
export async function getAthleteAchievements(this: MemStorage, athleteId: number): Promise<AthleteAchievement[]> {
  return this.athleteAchievements.filter(aa => aa.athleteId === athleteId);
}

export async function getAthleteAchievementByStringId(this: MemStorage, athleteId: number, achievementStringId: string): Promise<AthleteAchievement | undefined> {
  return this.athleteAchievements.find(aa => aa.athleteId === athleteId && aa.achievementStringId === achievementStringId);
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
    achievementId: aa.achievementStringId,
    progress: aa.progress,
    completed: aa.completed,
    completedAt: aa.completedAt?.toISOString()
  }));
}

export async function getAchievementProgressByAthleteId(this: MemStorage, athleteId: number): Promise<any[]> {
  // Get the athlete's achievements
  const athleteAchievements = await this.getAthleteAchievements(athleteId);
  
  // Map to the format expected by the frontend
  return athleteAchievements.map(aa => ({
    achievementId: aa.achievementStringId,
    progress: aa.progress,
    completed: aa.completed,
    completedAt: aa.completedAt?.toISOString()
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
  const achievement = this.achievements.find(a => a.id === achievementId);
  const progressMax = achievement?.progressMax || 100;
  
  // Calculate if the achievement is completed
  const isCompleted = progress >= progressMax;
  
  if (athleteAchievement) {
    // Update the existing achievement
    const updatedAchievement = {
      ...athleteAchievement,
      progress,
      completed: isCompleted,
    };
    
    // If it was just completed, set the completedAt timestamp
    if (isCompleted && !previouslyCompleted) {
      updatedAchievement.completedAt = new Date();
    }
    
    // Update in storage
    const index = this.athleteAchievements.findIndex(
      aa => aa.id === athleteAchievement!.id
    );
    
    if (index !== -1) {
      this.athleteAchievements[index] = updatedAchievement;
    }
    
    return {
      achievementId,
      progress,
      completed: isCompleted,
      previouslyCompleted,
      completedAt: updatedAchievement.completedAt?.toISOString(),
    };
  } else {
    // Create a new achievement record
    const newAchievement: InsertAthleteAchievement = {
      athleteId: athlete.id,
      achievementStringId: achievementId,
      progress,
      completed: isCompleted,
      completedAt: isCompleted ? new Date() : null,
    };
    
    // Add to storage
    const createdAchievement = await this.createAthleteAchievement(newAchievement);
    
    return {
      achievementId,
      progress,
      completed: isCompleted,
      previouslyCompleted: false,
      completedAt: createdAchievement.completedAt?.toISOString(),
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