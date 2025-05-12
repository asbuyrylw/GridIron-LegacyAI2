import { MemStorage } from "./storage";
import { 
  InsertLeaderboard, 
  InsertLeaderboardEntry,
  Leaderboard,
  LeaderboardEntry
} from "@shared/schema";

// Leaderboard methods implementation
export async function getLeaderboards(this: MemStorage, activeOnly: boolean = false): Promise<Leaderboard[]> {
  const leaderboards = Array.from(this.leaderboardsMap.values());
  
  if (activeOnly) {
    return leaderboards.filter(lb => lb.active);
  }
  
  return leaderboards;
}

export async function getLeaderboardById(this: MemStorage, id: number): Promise<Leaderboard | undefined> {
  return this.leaderboardsMap.get(id);
}

export async function createLeaderboard(this: MemStorage, leaderboard: InsertLeaderboard): Promise<Leaderboard> {
  const id = ++this.currentLeaderboardId;
  
  const newLeaderboard: Leaderboard = {
    ...leaderboard,
    id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.leaderboardsMap.set(id, newLeaderboard);
  return newLeaderboard;
}

export async function updateLeaderboard(this: MemStorage, id: number, updates: Partial<InsertLeaderboard>): Promise<Leaderboard | undefined> {
  const leaderboard = this.leaderboardsMap.get(id);
  
  if (!leaderboard) {
    return undefined;
  }
  
  const updatedLeaderboard: Leaderboard = {
    ...leaderboard,
    ...updates,
    updatedAt: new Date()
  };
  
  this.leaderboardsMap.set(id, updatedLeaderboard);
  return updatedLeaderboard;
}

export async function deleteLeaderboard(this: MemStorage, id: number): Promise<boolean> {
  return this.leaderboardsMap.delete(id);
}

// Leaderboard entry methods
export async function getLeaderboardEntries(this: MemStorage, leaderboardId: number): Promise<any[]> {
  const entries = Array.from(this.leaderboardEntriesMap.values())
    .filter(entry => entry.leaderboardId === leaderboardId);
  
  // Sort entries by value - descending or ascending based on the metric type
  const leaderboard = this.leaderboardsMap.get(leaderboardId);
  const isLowerBetter = leaderboard?.lowerIsBetter || false;
  
  entries.sort((a, b) => {
    if (isLowerBetter) {
      return a.value - b.value; // Sort ascending for metrics where lower is better (e.g., time)
    } else {
      return b.value - a.value; // Sort descending for metrics where higher is better (e.g., points)
    }
  });
  
  // Get all athletes for name lookups
  const athletes = await this.getAllAthletes();
  
  // Add rank and athlete name to each entry
  return entries.map((entry, index) => {
    const athlete = athletes.find(a => a.id === entry.athleteId);
    
    return {
      ...entry,
      rank: index + 1,
      athleteName: athlete ? `${athlete.firstName} ${athlete.lastName}` : `Athlete #${entry.athleteId}`
    };
  });
}

export async function getLeaderboardEntry(this: MemStorage, id: number): Promise<LeaderboardEntry | undefined> {
  return this.leaderboardEntriesMap.get(id);
}

export async function getLeaderboardEntryByAthlete(this: MemStorage, leaderboardId: number, athleteId: number): Promise<LeaderboardEntry | undefined> {
  return Array.from(this.leaderboardEntriesMap.values())
    .find(entry => entry.leaderboardId === leaderboardId && entry.athleteId === athleteId);
}

export async function createOrUpdateLeaderboardEntry(this: MemStorage, entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
  // Check if an entry already exists for this athlete and leaderboard
  const existingEntry = await this.getLeaderboardEntryByAthlete(entry.leaderboardId, entry.athleteId);
  
  if (existingEntry) {
    // Update existing entry
    const updatedEntry: LeaderboardEntry = {
      ...existingEntry,
      value: entry.value,
      updatedAt: new Date()
    };
    
    this.leaderboardEntriesMap.set(existingEntry.id, updatedEntry);
    return updatedEntry;
  } else {
    // Create new entry
    const id = ++this.currentLeaderboardEntryId;
    
    const newEntry: LeaderboardEntry = {
      ...entry,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.leaderboardEntriesMap.set(id, newEntry);
    return newEntry;
  }
}

export async function deleteLeaderboardEntry(this: MemStorage, id: number): Promise<boolean> {
  return this.leaderboardEntriesMap.delete(id);
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