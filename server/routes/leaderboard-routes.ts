import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Get all leaderboards
router.get("/", async (req: Request, res: Response) => {
  try {
    const leaderboards = await storage.getAllLeaderboards();
    return res.json(leaderboards);
  } catch (error) {
    console.error("Error fetching leaderboards:", error);
    return res.status(500).json({ message: "Failed to fetch leaderboards" });
  }
});

// Get a specific leaderboard by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid leaderboard ID" });
    }

    const leaderboard = await storage.getLeaderboardById(id);
    if (!leaderboard) {
      return res.status(404).json({ message: "Leaderboard not found" });
    }

    return res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

// Get entries for a specific leaderboard
router.get("/:id/entries", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid leaderboard ID" });
    }

    // Fetch the leaderboard to check if it exists
    const leaderboard = await storage.getLeaderboardById(id);
    if (!leaderboard) {
      return res.status(404).json({ message: "Leaderboard not found" });
    }

    // Get all entries for this leaderboard
    const entries = await storage.getLeaderboardEntries(id);

    // Add athlete names to the entries
    const entriesWithNames = await Promise.all(
      entries.map(async (entry) => {
        const athlete = await storage.getAthleteById(entry.athleteId);
        return {
          ...entry,
          athleteName: athlete 
            ? `${athlete.firstName} ${athlete.lastName}` 
            : `Athlete #${entry.athleteId}`
        };
      })
    );

    // Sort the entries based on the leaderboard's metric
    // Note: lower is better for some metrics like time
    const sortedEntries = entriesWithNames.sort((a, b) => {
      if (leaderboard.lowerIsBetter) {
        return a.value - b.value; // Lower values first
      } else {
        return b.value - a.value; // Higher values first
      }
    });

    // Add rank to entries
    const rankedEntries = sortedEntries.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    return res.json(rankedEntries);
  } catch (error) {
    console.error("Error fetching leaderboard entries:", error);
    return res.status(500).json({ message: "Failed to fetch leaderboard entries" });
  }
});

// Get leaderboards by period (daily, weekly, monthly, all-time)
router.get("/period/:period", async (req: Request, res: Response) => {
  try {
    const periodSchema = z.enum(['daily', 'weekly', 'monthly', 'all-time']);
    const periodResult = periodSchema.safeParse(req.params.period);
    
    if (!periodResult.success) {
      return res.status(400).json({ 
        message: "Invalid period. Must be one of: daily, weekly, monthly, all-time" 
      });
    }
    
    const period = periodResult.data;
    const leaderboards = await storage.getLeaderboardsByPeriod(period);
    
    return res.json(leaderboards);
  } catch (error) {
    console.error("Error fetching leaderboards by period:", error);
    return res.status(500).json({ message: "Failed to fetch leaderboards by period" });
  }
});

// Get an athlete's position on all leaderboards
router.get("/athlete/:athleteId", async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    if (isNaN(athleteId)) {
      return res.status(400).json({ message: "Invalid athlete ID" });
    }

    // Check if athlete exists
    const athlete = await storage.getAthleteById(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: "Athlete not found" });
    }
    
    // Get all leaderboards
    const leaderboards = await storage.getAllLeaderboards();
    
    // Get athlete's position on each leaderboard
    const athletePositions = await Promise.all(
      leaderboards.map(async (leaderboard) => {
        // Get all entries for this leaderboard
        const entries = await storage.getLeaderboardEntries(leaderboard.id);
        
        // Sort entries based on the leaderboard metric
        const sortedEntries = entries.sort((a, b) => {
          if (leaderboard.lowerIsBetter) {
            return a.value - b.value;
          } else {
            return b.value - a.value;
          }
        });
        
        // Find athlete's entry and position
        const athleteIndex = sortedEntries.findIndex(entry => entry.athleteId === athleteId);
        
        // Calculate position if athlete is on this leaderboard
        if (athleteIndex !== -1) {
          const athleteEntry = sortedEntries[athleteIndex];
          return {
            leaderboardId: leaderboard.id,
            leaderboardName: leaderboard.name,
            period: leaderboard.period,
            position: athleteIndex + 1,
            value: athleteEntry.value,
            totalEntries: sortedEntries.length
          };
        }
        
        // Return null if athlete not on this leaderboard
        return null;
      })
    );
    
    // Filter out null values (leaderboards athlete is not on)
    const filteredPositions = athletePositions.filter(position => position !== null);
    
    return res.json(filteredPositions);
  } catch (error) {
    console.error("Error fetching athlete leaderboard positions:", error);
    return res.status(500).json({ message: "Failed to fetch athlete leaderboard positions" });
  }
});

export const leaderboardRoutes = router;