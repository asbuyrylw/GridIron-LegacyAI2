import { MemStorage } from './storage';

export interface LoginStreak {
  id: number;
  userId: number;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  streakHistory: { date: string; count: number }[];
}

export interface InsertLoginStreak {
  userId: number;
  currentStreak?: number;
  longestStreak?: number;
  lastLoginDate?: string | null;
  streakHistory?: { date: string; count: number }[];
}

export class LoginStreakService {
  private streakMap: Map<number, LoginStreak>;
  private currentId: number = 1;

  constructor() {
    this.streakMap = new Map();
  }

  // Get all streaks for leaderboard
  getAllStreaks(): LoginStreak[] {
    return Array.from(this.streakMap.values());
  }

  // Get a user's login streak record
  async getLoginStreak(userId: number): Promise<LoginStreak | undefined> {
    return Array.from(this.streakMap.values()).find(s => s.userId === userId);
  }

  // Create a new login streak record
  async createLoginStreak(data: InsertLoginStreak): Promise<LoginStreak> {
    const id = this.currentId++;
    const newStreak: LoginStreak = {
      id,
      userId: data.userId,
      currentStreak: data.currentStreak || 0,
      longestStreak: data.longestStreak || 0,
      lastLoginDate: data.lastLoginDate || null,
      streakHistory: data.streakHistory || []
    };
    this.streakMap.set(id, newStreak);
    return newStreak;
  }

  // Update a login streak record
  async updateLoginStreak(id: number, data: Partial<InsertLoginStreak>): Promise<LoginStreak | undefined> {
    const existing = this.streakMap.get(id);
    if (!existing) return undefined;

    const updated: LoginStreak = {
      ...existing,
      ...data,
    };
    this.streakMap.set(id, updated);
    return updated;
  }

  // Process a user login and update their streak
  async processLogin(userId: number): Promise<LoginStreak> {
    let streak = await this.getLoginStreak(userId);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    if (!streak) {
      // First time logging in, create a new streak record
      return this.createLoginStreak({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: today,
        streakHistory: [{ date: today, count: 1 }]
      });
    }

    // User already logged in today, return existing streak
    if (streak.lastLoginDate === today) {
      return streak;
    }

    let newCurrentStreak = 0;
    const lastLoginDate = streak.lastLoginDate ? new Date(streak.lastLoginDate) : null;
    const todayDate = new Date(today);
    
    // Check if the last login was yesterday
    if (lastLoginDate) {
      const yesterday = new Date(todayDate);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (
        lastLoginDate.getFullYear() === yesterday.getFullYear() &&
        lastLoginDate.getMonth() === yesterday.getMonth() &&
        lastLoginDate.getDate() === yesterday.getDate()
      ) {
        // Consecutive login
        newCurrentStreak = streak.currentStreak + 1;
      } else {
        // Streak broken, start a new one
        newCurrentStreak = 1;
      }
    } else {
      // No previous login, start with 1
      newCurrentStreak = 1;
    }

    // Update longest streak if current streak is longer
    const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);
    
    // Update streak history
    const streakHistory = [...streak.streakHistory];
    streakHistory.push({ date: today, count: newCurrentStreak });
    
    // Only keep the last 30 days of history to prevent excessive data
    if (streakHistory.length > 30) {
      streakHistory.splice(0, streakHistory.length - 30);
    }

    // Update the streak record
    return this.updateLoginStreak(streak.id, {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastLoginDate: today,
      streakHistory
    }) as Promise<LoginStreak>;
  }
}

export const loginStreakService = new LoginStreakService();