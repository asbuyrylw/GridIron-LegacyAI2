import { MemStorage } from '../storage';
import { InsertHudlVideo, HudlVideo, ExternalServiceToken } from '../../shared/external-integrations';

class HudlService {
  private readonly enabled: boolean;

  constructor() {
    // Only enable if we have Hudl API credentials
    this.enabled = !!process.env.HUDL_CLIENT_ID && 
                   !!process.env.HUDL_CLIENT_SECRET && 
                   !!process.env.HUDL_CALLBACK_URL;
  }

  /**
   * Check if the service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get the OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    if (!this.enabled) {
      throw new Error('Hudl service is not enabled. Hudl API credentials are missing.');
    }
    
    // Implementation would use Hudl OAuth 2.0
    // This is a placeholder - actual implementation would require the Hudl API
    const callbackUrl = process.env.HUDL_CALLBACK_URL || '';
    const authUrl = `https://www.hudl.com/oauth/authorize?client_id=${process.env.HUDL_CLIENT_ID}&redirect_uri=${callbackUrl}&response_type=code&scope=manage.video&state=state`;
    
    return authUrl;
  }

  /**
   * Process the OAuth callback
   */
  async processOAuthCallback(code: string, userId: number, storage: MemStorage): Promise<ExternalServiceToken | null> {
    if (!this.enabled) {
      throw new Error('Hudl service is not enabled. Hudl API credentials are missing.');
    }

    try {
      // In a real implementation, we would exchange the code for tokens
      // For now, we'll create a dummy token record
      const tokenData = {
        userId,
        service: 'hudl',
        accessToken: 'dummy_hudl_access_token', // Would be replaced with actual token
        refreshToken: 'dummy_hudl_refresh_token', // Would be replaced with actual token
        tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        scope: 'manage.video',
        isActive: true,
      };

      // Store the tokens
      const token = await storage.createExternalServiceToken(tokenData);
      
      return token;
    } catch (error) {
      console.error('Error processing Hudl OAuth callback:', error);
      return null;
    }
  }

  /**
   * Sync videos from Hudl
   */
  async syncVideos(userId: number, storage: MemStorage): Promise<HudlVideo[]> {
    if (!this.enabled) {
      throw new Error('Hudl service is not enabled. Hudl API credentials are missing.');
    }

    try {
      // Find the user's Hudl token
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'hudl');
      
      if (!token || !token.isActive) {
        throw new Error('No active Hudl token found for this user');
      }

      // Get the athlete ID for this user
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (!athlete) {
        throw new Error('Athlete not found for this user');
      }

      // In a real implementation, we would call the Hudl API to get videos
      // For now, we'll create some sample videos
      const sampleVideos: InsertHudlVideo[] = [
        {
          athleteId: athlete.id,
          hudlId: `hudl_${Date.now()}_1`,
          title: 'Game Highlights - Week 1',
          description: 'Highlights from the first game of the season',
          videoUrl: 'https://hudl.com/video/sample1',
          thumbnailUrl: 'https://hudl.com/thumbnail/sample1',
          uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          duration: 180, // 3 minutes
          tags: ['game', 'highlights', 'offense'],
          isHighlight: true,
          views: 45,
          isPublic: true,
        },
        {
          athleteId: athlete.id,
          hudlId: `hudl_${Date.now()}_2`,
          title: 'Practice Drills - QB Footwork',
          description: 'Quarterback footwork drills from Tuesday practice',
          videoUrl: 'https://hudl.com/video/sample2',
          thumbnailUrl: 'https://hudl.com/thumbnail/sample2',
          uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          duration: 300, // 5 minutes
          tags: ['practice', 'drills', 'quarterback'],
          isHighlight: false,
          views: 12,
          isPublic: true,
        }
      ];

      // Save to database - first check if videos already exist by hudlId
      const savedVideos: HudlVideo[] = [];
      
      for (const video of sampleVideos) {
        const existingVideo = await storage.getHudlVideoByHudlId(video.hudlId);
        
        if (existingVideo) {
          // Update existing video
          const updatedVideo = await storage.updateHudlVideo(existingVideo.id, {
            ...video,
            syncedAt: new Date(),
          });
          
          if (updatedVideo) {
            savedVideos.push(updatedVideo);
          }
        } else {
          // Create new video
          const newVideo = await storage.createHudlVideo(video);
          savedVideos.push(newVideo);
        }
      }

      // Update token with last sync date
      await storage.updateExternalServiceToken(token.id, {
        lastSyncDate: new Date(),
      });
      
      return savedVideos;
    } catch (error) {
      console.error('Error syncing Hudl videos:', error);
      return [];
    }
  }

  /**
   * Get videos for an athlete
   */
  async getAthleteVideos(athleteId: number, storage: MemStorage): Promise<HudlVideo[]> {
    try {
      const videos = await storage.getHudlVideosByAthlete(athleteId);
      return videos;
    } catch (error) {
      console.error('Error getting Hudl videos:', error);
      return [];
    }
  }

  /**
   * Get highlight videos for an athlete
   */
  async getAthleteHighlights(athleteId: number, storage: MemStorage): Promise<HudlVideo[]> {
    try {
      const videos = await storage.getHudlVideosByAthlete(athleteId, true);
      return videos;
    } catch (error) {
      console.error('Error getting Hudl highlights:', error);
      return [];
    }
  }

  /**
   * Check and refresh token if needed
   */
  async checkAndRefreshToken(userId: number, storage: MemStorage): Promise<boolean> {
    try {
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'hudl');
      
      if (!token) {
        return false;
      }
      
      // Check if token is expired or about to expire
      const now = new Date();
      const tokenExpiry = token.tokenExpiry ? new Date(token.tokenExpiry) : null;
      
      if (tokenExpiry && tokenExpiry <= now) {
        // Token is expired, refresh it
        // In a real implementation, we would use the refresh token to get a new access token
        
        const updatedToken = await storage.updateExternalServiceToken(token.id, {
          accessToken: 'new_dummy_hudl_access_token',
          tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        });
        
        return !!updatedToken;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking/refreshing Hudl token:', error);
      return false;
    }
  }

  /**
   * Disconnect Hudl for a user
   */
  async disconnectHudl(userId: number, storage: MemStorage): Promise<boolean> {
    try {
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'hudl');
      
      if (!token) {
        return false;
      }
      
      // Set token as inactive
      const updatedToken = await storage.updateExternalServiceToken(token.id, {
        isActive: false,
      });
      
      return !!updatedToken;
    } catch (error) {
      console.error('Error disconnecting Hudl:', error);
      return false;
    }
  }

  /**
   * Update Hudl link for an athlete
   */
  async updateHudlLink(athleteId: number, hudlLink: string, storage: MemStorage): Promise<boolean> {
    try {
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return false;
      }
      
      await storage.updateAthlete(athleteId, { hudlLink });
      return true;
    } catch (error) {
      console.error('Error updating Hudl link:', error);
      return false;
    }
  }

  /**
   * Get the Hudl profile URL for an athlete
   */
  getProfileUrl(hudlLink: string | null): string | null {
    if (!hudlLink) {
      return null;
    }
    
    // If it's already a full URL, return it
    if (hudlLink.startsWith('http')) {
      return hudlLink;
    }
    
    // Otherwise, assume it's a Hudl username and construct URL
    return `https://www.hudl.com/profile/${hudlLink}`;
  }
}

export const hudlService = new HudlService();