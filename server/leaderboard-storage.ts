import { MemStorage } from "./storage";
import { 
  InsertLeaderboard, 
  InsertLeaderboardEntry,
  Leaderboard,
  LeaderboardEntry
} from "@shared/schema";

// Leaderboard methods implementation
export async function getLeaderboards(this: MemStorage, activeOnly: boolean = false): Promise<Leaderboard[]> {
  // Use type assertion to access private class member
  const leaderboardsMap = (this as any).leaderboardsMap;
  const leaderboards = Array.from(leaderboardsMap.values());
  
  if (activeOnly) {
    return leaderboards.filter(lb => lb.active);
  }
  
  return leaderboards;
}

export async function getLeaderboardById(this: MemStorage, id: number): Promise<Leaderboard | undefined> {
  // Use type assertion to access private class member
  const leaderboardsMap = (this as any).leaderboardsMap;
  return leaderboardsMap.get(id);
}

export async function createLeaderboard(this: MemStorage, leaderboard: InsertLeaderboard): Promise<Leaderboard> {
  // Use type assertion to access private class member
  let currentId = (this as any).currentLeaderboardId;
  const leaderboardsMap = (this as any).leaderboardsMap;
  
  // Increment the ID counter
  currentId = currentId + 1;
  (this as any).currentLeaderboardId = currentId;
  
  const newLeaderboard: Leaderboard = {
    ...leaderboard,
    id: currentId,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Ensure all nullable fields are explicitly set
    startDate: leaderboard.startDate || null,
    endDate: leaderboard.endDate || null,
    active: leaderboard.active !== undefined ? leaderboard.active : true,
    lowerIsBetter: leaderboard.lowerIsBetter !== undefined ? leaderboard.lowerIsBetter : false,
    rules: leaderboard.rules || null
  };
  
  leaderboardsMap.set(currentId, newLeaderboard);
  return newLeaderboard;
}

export async function updateLeaderboard(this: MemStorage, id: number, updates: Partial<InsertLeaderboard>): Promise<Leaderboard | undefined> {
  // Use type assertion to access private class member
  const leaderboardsMap = (this as any).leaderboardsMap;
  
  const leaderboard = leaderboardsMap.get(id);
  
  if (!leaderboard) {
    return undefined;
  }
  
  const updatedLeaderboard: Leaderboard = {
    ...leaderboard,
    ...updates,
    updatedAt: new Date()
  };
  
  leaderboardsMap.set(id, updatedLeaderboard);
  return updatedLeaderboard;
}

export async function deleteLeaderboard(this: MemStorage, id: number): Promise<boolean> {
  // Use type assertion to access private class member
  const leaderboardsMap = (this as any).leaderboardsMap;
  return leaderboardsMap.delete(id);
}

// Leaderboard entry methods
export async function getLeaderboardEntries(this: MemStorage, leaderboardId: number): Promise<LeaderboardEntry[]> {
  // Use type assertion to access private class members
  const leaderboardEntriesMap = (this as any).leaderboardEntriesMap;
  const leaderboardsMap = (this as any).leaderboardsMap;
  
  const entries = Array.from(leaderboardEntriesMap.values())
    .filter(entry => entry.leaderboardId === leaderboardId);
  
  // Sort entries by value - descending or ascending based on the metric type
  const leaderboard = leaderboardsMap.get(leaderboardId);
  const isLowerBetter = leaderboard?.lowerIsBetter || false;
  
  entries.sort((a, b) => {
    if (isLowerBetter) {
      return a.value - b.value; // Sort ascending for metrics where lower is better (e.g., time)
    } else {
      return b.value - a.value; // Sort descending for metrics where higher is better (e.g., points)
    }
  });
  
  return entries;
}

export async function getLeaderboardEntry(this: MemStorage, id: number): Promise<LeaderboardEntry | undefined> {
  // Use type assertion to access private class member
  const leaderboardEntriesMap = (this as any).leaderboardEntriesMap;
  return leaderboardEntriesMap.get(id);
}

export async function getLeaderboardEntryByAthlete(this: MemStorage, leaderboardId: number, athleteId: number): Promise<LeaderboardEntry | undefined> {
  // Use type assertion to access private class member
  const leaderboardEntriesMap = (this as any).leaderboardEntriesMap;
  
  return Array.from(leaderboardEntriesMap.values())
    .find(entry => entry.leaderboardId === leaderboardId && entry.athleteId === athleteId);
}

export async function createLeaderboardEntry(this: MemStorage, entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
  // Use type assertion to access private class members
  let currentId = (this as any).currentLeaderboardEntryId;
  const leaderboardEntriesMap = (this as any).leaderboardEntriesMap;
  
  // Increment the ID counter
  currentId = currentId + 1;
  (this as any).currentLeaderboardEntryId = currentId;
  
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: currentId,
    createdAt: new Date(),
    updatedAt: new Date(),
    rank: null // Ensure rank is set explicitly
  };
  
  leaderboardEntriesMap.set(currentId, newEntry);
  return newEntry;
}

export async function updateLeaderboardEntry(this: MemStorage, id: number, updates: Partial<LeaderboardEntry>): Promise<LeaderboardEntry | undefined> {
  // Use type assertion to access private class member
  const leaderboardEntriesMap = (this as any).leaderboardEntriesMap;
  
  const entry = leaderboardEntriesMap.get(id);
  if (!entry) return undefined;
  
  const updatedEntry: LeaderboardEntry = {
    ...entry,
    ...updates,
    updatedAt: new Date()
  };
  
  leaderboardEntriesMap.set(id, updatedEntry);
  return updatedEntry;
}

// This is for backward compatibility with existing code
export async function createOrUpdateLeaderboardEntry(this: MemStorage, entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
  // Get all leaderboard entries
  const leaderboardEntriesMap = (this as any).leaderboardEntriesMap;
  const entries = Array.from(leaderboardEntriesMap.values());
  
  // Find existing entry manually
  const existingEntry = entries.find((e: any) => 
    e.leaderboardId === entry.leaderboardId && 
    e.athleteId === entry.athleteId
  );
  
  if (existingEntry) {
    // Update existing entry directly
    const updatedEntry: LeaderboardEntry = {
      ...existingEntry,
      value: entry.value,
      updatedAt: new Date()
    };
    
    leaderboardEntriesMap.set(existingEntry.id, updatedEntry);
    return updatedEntry;
  } else {
    // Create new entry
    return this.createLeaderboardEntry(entry);
  }
}

export async function deleteLeaderboardEntry(this: MemStorage, id: number): Promise<boolean> {
  // Use type assertion to access private class member
  const leaderboardEntriesMap = (this as any).leaderboardEntriesMap;
  return leaderboardEntriesMap.delete(id);
}

// Helper method to get leaderboards by period (daily, weekly, monthly, all-time)
export async function getLeaderboardsByPeriod(this: MemStorage, period: string): Promise<Leaderboard[]> {
  const leaderboards = await this.getLeaderboards(true);
  return leaderboards.filter(lb => lb.period === period);
}

// Seed initial leaderboards
export async function seedLeaderboards(storage: MemStorage): Promise<void> {
  console.log('Seeding leaderboards...');
  
  // Check if leaderboards already exist
  const existingLeaderboards = await storage.getLeaderboards();
  if (existingLeaderboards.length > 0) {
    console.log(`${existingLeaderboards.length} leaderboards already exist, skipping seed.`);
    return;
  }
  
  // Default leaderboards to create
  const defaultLeaderboards: InsertLeaderboard[] = [
    {
      name: "40-Yard Dash",
      description: "Fastest 40-yard dash times",
      metric: "seconds",
      period: "all-time",
      active: true,
      lowerIsBetter: true,
      startDate: null,
      endDate: null,
      rules: "Record your fastest 40-yard dash time"
    },
    {
      name: "Vertical Jump",
      description: "Highest vertical jump measurements",
      metric: "inches",
      period: "all-time",
      active: true,
      lowerIsBetter: false,
      startDate: null,
      endDate: null,
      rules: "Record your highest vertical jump measurement"
    },
    {
      name: "Bench Press Reps",
      description: "Most bench press reps at 225 lbs",
      metric: "reps",
      period: "all-time",
      active: true,
      lowerIsBetter: false,
      startDate: null,
      endDate: null,
      rules: "Record maximum number of bench press repetitions at 225 lbs"
    },
    {
      name: "Achievement Points",
      description: "Most achievement points earned",
      metric: "points",
      period: "all-time",
      active: true,
      lowerIsBetter: false,
      startDate: null,
      endDate: null,
      rules: "Earn points by completing achievements"
    },
    {
      name: "Workouts Completed",
      description: "Most training sessions completed",
      metric: "workouts",
      period: "monthly",
      active: true,
      lowerIsBetter: false,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      rules: "Complete training sessions to earn points"
    }
  ];
  
  // Create the leaderboards
  let createdCount = 0;
  for (const leaderboard of defaultLeaderboards) {
    try {
      await storage.createLeaderboard(leaderboard);
      createdCount++;
    } catch (error) {
      console.error(`Error creating leaderboard ${leaderboard.name}:`, error);
    }
  }
  
  console.log(`Created ${createdCount} leaderboards`);
}