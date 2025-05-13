import { MemStorage } from '../storage';
import { 
  ExternalServiceToken, 
  InsertExternalServiceToken,
  MaxPrepsStats,
  InsertMaxPrepsStats
} from '../../shared/external-integrations';

/**
 * Service for MaxPreps API integration
 */
class MaxPrepsService {
  private readonly apiKey: string;
  private readonly enabled: boolean;

  constructor() {
    // Initialize with environment variables
    this.apiKey = process.env.MAXPREPS_API_KEY || '';
    
    // Check if the service is enabled (has valid credentials)
    this.enabled = Boolean(this.apiKey);
    
    if (this.enabled) {
      console.log('MaxPreps service initialized successfully');
    } else {
      console.log('MaxPreps service disabled: Missing API credentials');
    }
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
      throw new Error('MaxPreps integration is not enabled');
    }
    
    try {
      // In a real implementation, this might validate the MaxPreps ID
      // For demonstration purposes, we'll create a token record directly
      
      const tokenData: InsertExternalServiceToken = {
        userId,
        service: 'maxpreps',
        accessToken: `maxpreps_token_${maxPrepsId}`,
        isActive: true,
        lastSyncDate: new Date()
      };
      
      const token = await storage.createExternalServiceToken(tokenData);
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
      throw new Error('MaxPreps integration is not enabled');
    }
    
    try {
      // Check if user has an active MaxPreps token
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'maxpreps');
      
      if (!token || !token.isActive) {
        throw new Error('User does not have an active MaxPreps connection');
      }
      
      // Get the athlete associated with this user
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (!athlete) {
        throw new Error('Athlete not found for user');
      }
      
      // In a real implementation, this would fetch stats from the MaxPreps API
      // For demonstration purposes, we'll create some sample stats
      
      const currentYear = new Date().getFullYear();
      const mockStats = [
        {
          athleteId: athlete.id,
          season: `Fall ${currentYear - 1}`,
          jerseyNumber: '12',
          position: athlete.position || 'Quarterback (QB)',
          gameCount: 10,
          teamName: 'Central High School',
          teamRecord: '8-2',
          verified: true,
          statsData: {
            passing: {
              attempts: 250,
              completions: 165,
              yards: 2200,
              touchdowns: 22,
              interceptions: 7,
              longPass: 75,
              qbRating: 94.2
            },
            rushing: {
              attempts: 45,
              yards: 320,
              touchdowns: 5,
              fumbles: 2,
              longRush: 32
            }
          }
        },
        {
          athleteId: athlete.id,
          season: `Fall ${currentYear - 2}`,
          jerseyNumber: '12',
          position: athlete.position || 'Quarterback (QB)',
          gameCount: 8,
          teamName: 'Central High School JV',
          teamRecord: '6-2',
          verified: true,
          statsData: {
            passing: {
              attempts: 180,
              completions: 112,
              yards: 1500,
              touchdowns: 14,
              interceptions: 8,
              longPass: 62,
              qbRating: 87.5
            },
            rushing: {
              attempts: 38,
              yards: 220,
              touchdowns: 3,
              fumbles: 3,
              longRush: 28
            }
          }
        }
      ];
      
      const savedStats: MaxPrepsStats[] = [];
      
      // Save each stat to storage
      for (const statData of mockStats) {
        const existingStat = await storage.getMaxPrepsStatsByAthleteSeason(
          athlete.id, 
          statData.season
        );
        
        if (existingStat) {
          // Update existing stat
          const updatedStat = await storage.updateMaxPrepsStats(existingStat.id, statData);
          if (updatedStat) savedStats.push(updatedStat);
        } else {
          // Create new stat
          const newStat = await storage.createMaxPrepsStats(statData as InsertMaxPrepsStats);
          savedStats.push(newStat);
        }
      }
      
      // Update the token's lastSyncDate
      await storage.updateExternalServiceToken(token.id, {
        lastSyncDate: new Date()
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
      return await storage.getMaxPrepsStatsByAthlete(athleteId);
    } catch (error) {
      console.error('Error getting athlete MaxPreps stats:', error);
      return [];
    }
  }

  /**
   * Get stats for a specific season
   */
  async getAthleteStatsBySeason(athleteId: number, season: string, storage: MemStorage): Promise<MaxPrepsStats | null> {
    try {
      const stats = await storage.getMaxPrepsStatsByAthleteSeason(athleteId, season);
      return stats || null;
    } catch (error) {
      console.error('Error getting athlete MaxPreps stats for season:', error);
      return null;
    }
  }

  /**
   * Disconnect MaxPreps for a user
   */
  async disconnectMaxPreps(userId: number, storage: MemStorage): Promise<boolean> {
    try {
      // Find the user's MaxPreps token
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'maxpreps');
      
      if (!token) {
        // No token found to disconnect
        return true;
      }
      
      // Update the token to be inactive
      const updatedToken = await storage.updateExternalServiceToken(token.id, {
        isActive: false
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
        throw new Error('Athlete not found');
      }
      
      const updatedAthlete = await storage.updateAthlete(athleteId, {
        maxPrepsLink
      });
      
      return !!updatedAthlete;
    } catch (error) {
      console.error('Error updating MaxPreps link:', error);
      return false;
    }
  }

  /**
   * Get the MaxPreps profile URL for an athlete
   */
  getProfileUrl(maxPrepsLink: string | null): string | null {
    if (!maxPrepsLink) return null;
    
    // Check if the link already has the correct format
    if (maxPrepsLink.startsWith('https://www.maxpreps.com/athlete/')) {
      return maxPrepsLink;
    }
    
    // If it's just a profile ID, format it correctly
    if (/^[a-zA-Z0-9-]+$/.test(maxPrepsLink.trim())) {
      const profileId = maxPrepsLink.trim();
      return `https://www.maxpreps.com/athlete/${profileId}/stats`;
    }
    
    return maxPrepsLink;
  }
}

export const maxPrepsService = new MaxPrepsService();