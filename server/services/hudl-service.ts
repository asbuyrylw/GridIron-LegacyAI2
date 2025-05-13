import { MemStorage } from '../storage';
import { 
  ExternalServiceToken, 
  InsertExternalServiceToken,
  HudlVideo,
  InsertHudlVideo
} from '../../shared/external-integrations';

/**
 * Service for Hudl API integration
 */
class HudlService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly enabled: boolean;

  constructor() {
    // Initialize with environment variables
    this.clientId = process.env.HUDL_CLIENT_ID || '';
    this.clientSecret = process.env.HUDL_CLIENT_SECRET || '';
    this.redirectUri = process.env.HUDL_REDIRECT_URI || 'http://localhost:5000/api/hudl/callback';
    
    // Check if the service is enabled (has valid credentials)
    this.enabled = Boolean(this.clientId && this.clientSecret);
    
    if (this.enabled) {
      console.log('Hudl service initialized successfully');
    } else {
      console.log('Hudl service disabled: Missing API credentials');
    }
  }

  /**
   * Check if the Hudl integration is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get the OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    if (!this.enabled) {
      throw new Error('Hudl integration is not enabled');
    }
    
    // In a real implementation, this would generate an OAuth URL with the proper scopes
    // For now, we'll return a placeholder URL
    return `https://www.hudl.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&scope=videos.readonly`;
  }

  /**
   * Process the OAuth callback
   */
  async processOAuthCallback(
    code: string, 
    userId: number,
    storage: MemStorage
  ): Promise<ExternalServiceToken | null> {
    if (!this.enabled) {
      throw new Error('Hudl integration is not enabled');
    }
    
    try {
      // In a real implementation, this would exchange the code for an access token
      // For demonstration purposes, we'll create a token record directly
      
      const tokenData: InsertExternalServiceToken = {
        userId,
        service: 'hudl',
        accessToken: `hudl_mock_token_${Date.now()}`,
        refreshToken: `hudl_mock_refresh_${Date.now()}`,
        tokenType: 'bearer',
        expiresAt: new Date(Date.now() + 86400 * 1000), // 24 hours from now
        isActive: true,
        lastSyncDate: new Date()
      };
      
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
      throw new Error('Hudl integration is not enabled');
    }
    
    try {
      // Check if user has an active Hudl token
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'hudl');
      
      if (!token || !token.isActive) {
        throw new Error('User does not have an active Hudl connection');
      }
      
      // Get the athlete associated with this user
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (!athlete) {
        throw new Error('Athlete not found for user');
      }
      
      // In a real implementation, this would fetch videos from the Hudl API
      // For demonstration purposes, we'll create some sample videos
      
      const currentDate = new Date();
      const mockVideos = [
        {
          athleteId: athlete.id,
          hudlId: `hudl_game_${Date.now()}_1`,
          title: 'Game Highlights vs Western High',
          description: 'Full game footage from our matchup against Western High School',
          videoUrl: 'https://www.hudl.com/video/mock-1',
          thumbnailUrl: 'https://via.placeholder.com/320x180?text=Game+Footage',
          duration: 5400, // 1 hour 30 minutes
          uploadDate: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          isHighlight: false,
          tags: ['game', 'full', 'varsity'],
          views: 45,
          downloads: 5,
          categoryId: 1,
          categoryName: 'Game Footage'
        },
        {
          athleteId: athlete.id,
          hudlId: `hudl_highlight_${Date.now()}_2`,
          title: 'Season Highlight Reel',
          description: 'My best plays from the 2024-2025 season',
          videoUrl: 'https://www.hudl.com/video/mock-2',
          thumbnailUrl: 'https://via.placeholder.com/320x180?text=Highlight+Reel',
          duration: 210, // 3 minutes 30 seconds
          uploadDate: new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
          isHighlight: true,
          tags: ['highlight', 'season', 'top plays'],
          views: 128,
          downloads: 12,
          categoryId: 2,
          categoryName: 'Highlights'
        },
        {
          athleteId: athlete.id,
          hudlId: `hudl_practice_${Date.now()}_3`,
          title: 'Spring Practice Drills',
          description: 'Footage from spring practice session focusing on agility drills',
          videoUrl: 'https://www.hudl.com/video/mock-3',
          thumbnailUrl: 'https://via.placeholder.com/320x180?text=Practice+Drills',
          duration: 1800, // 30 minutes
          uploadDate: new Date(currentDate.getTime() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
          isHighlight: false,
          tags: ['practice', 'drills', 'spring'],
          views: 22,
          downloads: 2,
          categoryId: 3,
          categoryName: 'Practice'
        }
      ];
      
      const savedVideos: HudlVideo[] = [];
      
      // Save each video to storage
      for (const videoData of mockVideos) {
        const existingVideo = await storage.getHudlVideoByHudlId(videoData.hudlId);
        
        if (existingVideo) {
          // Update existing video
          const updatedVideo = await storage.updateHudlVideo(existingVideo.id, videoData);
          if (updatedVideo) savedVideos.push(updatedVideo);
        } else {
          // Create new video
          const newVideo = await storage.createHudlVideo(videoData as InsertHudlVideo);
          savedVideos.push(newVideo);
        }
      }
      
      // Update the token's lastSyncDate
      await storage.updateExternalServiceToken(token.id, {
        lastSyncDate: new Date()
      });
      
      return savedVideos;
    } catch (error) {
      console.error('Error syncing Hudl videos:', error);
      return [];
    }
  }

  /**
   * Get athlete's Hudl videos
   */
  async getAthleteVideos(athleteId: number, storage: MemStorage): Promise<HudlVideo[]> {
    try {
      return await storage.getHudlVideosByAthlete(athleteId);
    } catch (error) {
      console.error('Error getting athlete Hudl videos:', error);
      return [];
    }
  }

  /**
   * Get athlete's Hudl highlight videos
   */
  async getAthleteHighlights(athleteId: number, storage: MemStorage): Promise<HudlVideo[]> {
    try {
      return await storage.getHudlVideosByAthlete(athleteId, true);
    } catch (error) {
      console.error('Error getting athlete Hudl highlights:', error);
      return [];
    }
  }

  /**
   * Update Hudl link for an athlete
   */
  async updateHudlLink(athleteId: number, hudlLink: string, storage: MemStorage): Promise<boolean> {
    try {
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        throw new Error('Athlete not found');
      }
      
      const updatedAthlete = await storage.updateAthlete(athleteId, {
        hudlLink
      });
      
      return !!updatedAthlete;
    } catch (error) {
      console.error('Error updating Hudl link:', error);
      return false;
    }
  }

  /**
   * Disconnect Hudl account
   */
  async disconnectHudl(userId: number, storage: MemStorage): Promise<boolean> {
    try {
      // Find the user's Hudl token
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'hudl');
      
      if (!token) {
        // No token found to disconnect
        return true;
      }
      
      // In a real implementation, this might revoke the token on Hudl's side
      
      // Update the token to be inactive
      const updatedToken = await storage.updateExternalServiceToken(token.id, {
        isActive: false
      });
      
      return !!updatedToken;
    } catch (error) {
      console.error('Error disconnecting Hudl:', error);
      return false;
    }
  }

  /**
   * Get the Hudl profile URL for an athlete
   */
  getProfileUrl(hudlLink: string | null): string | null {
    if (!hudlLink) return null;
    
    // Check if the link already has the correct format
    if (hudlLink.startsWith('https://www.hudl.com/profile/')) {
      return hudlLink;
    }
    
    // Extract the ID if it's just the ID number
    const hudlId = hudlLink.trim().replace(/[^\d]/g, '');
    
    if (hudlId) {
      return `https://www.hudl.com/profile/${hudlId}`;
    }
    
    return hudlLink;
  }
}

export const hudlService = new HudlService();