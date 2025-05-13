import { MemStorage } from '../storage';
import { InsertMaxPrepsStats, MaxPrepsStats, ExternalServiceToken } from '../../shared/external-integrations';

class MaxPrepsService {
  private readonly enabled: boolean;

  constructor() {
    // Only enable if we have MaxPreps API credentials
    this.enabled = !!process.env.MAXPREPS_API_KEY;
  }

  /**
   * Check if the service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Authorize with MaxPreps (may use a different auth flow than OAuth)
   */
  async authorizeMaxPreps(
    userId: number, 
    maxPrepsId: string, 
    storage: MemStorage
  ): Promise<ExternalServiceToken | null> {
    if (!this.enabled) {
      throw new Error('MaxPreps service is not enabled. MaxPreps API credentials are missing.');
    }

    try {
      // In a real implementation, we would validate the MaxPreps ID
      // For now, we'll create a dummy token record
      const tokenData = {
        userId,
        service: 'maxpreps',
        accessToken: maxPrepsId, // Store the MaxPreps ID as the token
        isActive: true,
      };

      // Store the tokens
      const token = await storage.createExternalServiceToken(tokenData);
      
      // Also update the athlete's MaxPreps link
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (athlete) {
        await storage.updateAthlete(athlete.id, {
          maxPrepsLink: maxPrepsId
        });
      }
      
      return token;
    } catch (error) {
      console.error('Error authorizing MaxPreps:', error);
      return null;
    }
  }

  /**
   * Sync stats from MaxPreps
   */
  async syncStats(userId: number, storage: MemStorage): Promise<MaxPrepsStats[]> {
    if (!this.enabled) {
      throw new Error('MaxPreps service is not enabled. MaxPreps API credentials are missing.');
    }

    try {
      // Find the user's MaxPreps token
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'maxpreps');
      
      if (!token || !token.isActive) {
        throw new Error('No active MaxPreps token found for this user');
      }

      // Get the athlete ID for this user
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (!athlete) {
        throw new Error('Athlete not found for this user');
      }

      // In a real implementation, we would call the MaxPreps API to get stats
      // For now, we'll create sample stats
      const sampleSeasons = ['Fall 2024', 'Fall 2023'];
      const savedStats: MaxPrepsStats[] = [];
      
      for (const season of sampleSeasons) {
        // Generate position-specific stats based on athlete's position
        const position = athlete.position?.toLowerCase() || '';
        let statsData: any = {
          gamesPlayed: 10,
          teamRecord: '8-2',
        };
        
        if (position.includes('quarterback') || position.includes('qb')) {
          statsData = {
            ...statsData,
            passingYards: 2450,
            passingTouchdowns: 22,
            passingCompletions: 165,
            passingAttempts: 280,
            passingInterceptions: 8,
            rushingYards: 350,
            rushingAttempts: 45,
            rushingTouchdowns: 3,
          };
        } else if (position.includes('running back') || position.includes('rb')) {
          statsData = {
            ...statsData,
            rushingYards: 1200,
            rushingAttempts: 220,
            rushingTouchdowns: 14,
            receivingYards: 250,
            receivingReceptions: 18,
            receivingTouchdowns: 2,
          };
        } else if (position.includes('wide receiver') || position.includes('wr')) {
          statsData = {
            ...statsData,
            receivingYards: 950,
            receivingReceptions: 65,
            receivingTouchdowns: 11,
            receivingTargets: 90,
          };
        } else if (position.includes('linebacker') || position.includes('lb')) {
          statsData = {
            ...statsData,
            tackles: 85,
            soloTackles: 52,
            assistedTackles: 33,
            tacklesForLoss: 12,
            sacks: 4.5,
            interceptions: 1,
            passesDefended: 3,
            forcedFumbles: 2,
          };
        } else if (position.includes('defensive') || position.includes('safety') || 
                  position.includes('cornerback') || position.includes('cb')) {
          statsData = {
            ...statsData,
            tackles: 45,
            soloTackles: 32,
            assistedTackles: 13,
            interceptions: 3,
            passesDefended: 12,
            forcedFumbles: 1,
          };
        } else {
          // Generic stats for other positions
          statsData = {
            ...statsData,
            tackles: 35,
            soloTackles: 22,
            assistedTackles: 13,
          };
        }

        const statsEntry: InsertMaxPrepsStats = {
          athleteId: athlete.id,
          season,
          statsData,
          gameCount: 10,
          teamRecord: '8-2',
          position: athlete.position || 'Unknown',
          jerseyNumber: Math.floor(Math.random() * 99 + 1).toString(), // Random jersey number
          teamName: 'Central High School',
          verified: true,
        };

        // Check if stats for this season already exist
        const existingStats = await storage.getMaxPrepsStatsByAthleteSeason(
          athlete.id, 
          season
        );
        
        if (existingStats) {
          // Update existing stats
          const updatedStats = await storage.updateMaxPrepsStats(existingStats.id, {
            ...statsEntry,
          });
          
          if (updatedStats) {
            savedStats.push(updatedStats);
          }
        } else {
          // Create new stats
          const newStats = await storage.createMaxPrepsStats(statsEntry);
          savedStats.push(newStats);
        }
      }

      // Update token with last sync date
      await storage.updateExternalServiceToken(token.id, {
        lastSyncDate: new Date(),
      });
      
      return savedStats;
    } catch (error) {
      console.error('Error syncing MaxPreps stats:', error);
      return [];
    }
  }

  /**
   * Get stats for an athlete
   */
  async getAthleteStats(athleteId: number, storage: MemStorage): Promise<MaxPrepsStats[]> {
    try {
      const stats = await storage.getMaxPrepsStatsByAthlete(athleteId);
      return stats;
    } catch (error) {
      console.error('Error getting MaxPreps stats:', error);
      return [];
    }
  }

  /**
   * Get stats for a specific season
   */
  async getAthleteStatsBySeason(athleteId: number, season: string, storage: MemStorage): Promise<MaxPrepsStats | null> {
    try {
      const stats = await storage.getMaxPrepsStatsByAthleteSeason(athleteId, season);
      return stats;
    } catch (error) {
      console.error('Error getting MaxPreps stats for season:', error);
      return null;
    }
  }

  /**
   * Disconnect MaxPreps for a user
   */
  async disconnectMaxPreps(userId: number, storage: MemStorage): Promise<boolean> {
    try {
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'maxpreps');
      
      if (!token) {
        return false;
      }
      
      // Set token as inactive
      const updatedToken = await storage.updateExternalServiceToken(token.id, {
        isActive: false,
      });
      
      return !!updatedToken;
    } catch (error) {
      console.error('Error disconnecting MaxPreps:', error);
      return false;
    }
  }

  /**
   * Update MaxPreps link for an athlete
   */
  async updateMaxPrepsLink(athleteId: number, maxPrepsLink: string, storage: MemStorage): Promise<boolean> {
    try {
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return false;
      }
      
      await storage.updateAthlete(athleteId, { maxPrepsLink });
      return true;
    } catch (error) {
      console.error('Error updating MaxPreps link:', error);
      return false;
    }
  }

  /**
   * Get the MaxPreps profile URL for an athlete
   */
  getProfileUrl(maxPrepsLink: string | null): string | null {
    if (!maxPrepsLink) {
      return null;
    }
    
    // If it's already a full URL, return it
    if (maxPrepsLink.startsWith('http')) {
      return maxPrepsLink;
    }
    
    // Otherwise, assume it's a MaxPreps ID and construct URL
    return `https://www.maxpreps.com/athlete/${maxPrepsLink}`;
  }
}

export const maxPrepsService = new MaxPrepsService();