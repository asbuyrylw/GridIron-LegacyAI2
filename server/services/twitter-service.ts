import { MemStorage } from '../storage';
import { 
  ExternalServiceToken, 
  InsertExternalServiceToken,
  TwitterPost,
  InsertTwitterPost
} from '../../shared/external-integrations';

/**
 * Service for Twitter API integration
 */
class TwitterService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly enabled: boolean;

  constructor() {
    // Initialize with environment variables
    this.clientId = process.env.TWITTER_CLIENT_ID || '';
    this.clientSecret = process.env.TWITTER_CLIENT_SECRET || '';
    this.redirectUri = process.env.TWITTER_REDIRECT_URI || 'http://localhost:5000/api/twitter/callback';
    
    // Check if the service is enabled (has valid credentials)
    this.enabled = Boolean(this.clientId && this.clientSecret);
    
    if (this.enabled) {
      console.log('Twitter service initialized successfully');
    } else {
      console.log('Twitter service disabled: Missing API credentials');
    }
  }

  /**
   * Check if the Twitter integration is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get the OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    if (!this.enabled) {
      throw new Error('Twitter integration is not enabled');
    }
    
    // In a real implementation, this would generate an OAuth URL with the proper scopes
    // For now, we'll return a placeholder URL
    const scopes = ['tweet.read', 'tweet.write', 'users.read'];
    const scopeString = encodeURIComponent(scopes.join(' '));
    
    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${scopeString}&state=state&code_challenge=challenge&code_challenge_method=plain`;
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
      throw new Error('Twitter integration is not enabled');
    }
    
    try {
      // In a real implementation, this would exchange the code for an access token
      // For demonstration purposes, we'll create a token record directly
      
      const tokenData: InsertExternalServiceToken = {
        userId,
        service: 'twitter',
        accessToken: `twitter_mock_token_${Date.now()}`,
        refreshToken: `twitter_mock_refresh_${Date.now()}`,
        tokenType: 'bearer',
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
        isActive: true,
        lastSyncDate: new Date()
      };
      
      const token = await storage.createExternalServiceToken(tokenData);
      return token;
    } catch (error) {
      console.error('Error processing Twitter OAuth callback:', error);
      return null;
    }
  }

  /**
   * Post a tweet
   */
  async postTweet(
    userId: number, 
    content: string, 
    mediaUrls: string[] = [],
    storage: MemStorage
  ): Promise<TwitterPost | null> {
    if (!this.enabled) {
      throw new Error('Twitter integration is not enabled');
    }
    
    try {
      // Check if user has an active Twitter token
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'twitter');
      
      if (!token || !token.isActive) {
        throw new Error('User does not have an active Twitter connection');
      }
      
      // In a real implementation, this would use the Twitter API to post a tweet
      // For demonstration purposes, we'll create a record of the tweet directly
      
      const tweetData: InsertTwitterPost = {
        userId,
        content,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        isPosted: true,
        postedAt: new Date(),
        tweetId: `twitter_mock_id_${Date.now()}`,
        engagementStats: {
          likes: 0,
          retweets: 0,
          replies: 0,
          impressions: 0
        }
      };
      
      const tweet = await storage.createTwitterPost(tweetData);
      return tweet;
    } catch (error) {
      console.error('Error posting tweet:', error);
      return null;
    }
  }

  /**
   * Schedule a tweet for later
   */
  async scheduleTweet(
    userId: number,
    content: string,
    scheduledFor: Date,
    mediaUrls: string[] = [],
    storage: MemStorage
  ): Promise<TwitterPost | null> {
    if (!this.enabled) {
      throw new Error('Twitter integration is not enabled');
    }
    
    try {
      // Check if user has an active Twitter token
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'twitter');
      
      if (!token || !token.isActive) {
        throw new Error('User does not have an active Twitter connection');
      }
      
      // In a real implementation, this would use the Twitter API to schedule a tweet
      // For demonstration purposes, we'll create a record of the scheduled tweet directly
      
      const tweetData: InsertTwitterPost = {
        userId,
        content,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        isScheduled: true,
        scheduledFor,
        isPosted: false
      };
      
      const tweet = await storage.createTwitterPost(tweetData);
      return tweet;
    } catch (error) {
      console.error('Error scheduling tweet:', error);
      return null;
    }
  }

  /**
   * Get user's tweets
   */
  async getUserTweets(userId: number, storage: MemStorage): Promise<TwitterPost[]> {
    try {
      return await storage.getTwitterPostsByUser(userId);
    } catch (error) {
      console.error('Error getting user tweets:', error);
      return [];
    }
  }

  /**
   * Share an achievement on Twitter
   */
  async shareAchievement(
    userId: number, 
    achievementId: number,
    storage: MemStorage
  ): Promise<TwitterPost | null> {
    try {
      // Get achievement details
      const achievement = await storage.getAthleteAchievementById(achievementId);
      
      if (!achievement) {
        throw new Error('Achievement not found');
      }
      
      // Prepare the tweet text based on the achievement
      const content = `🏆 I just unlocked the "${achievement.name}" achievement on GridIron LegacyAI! #FootballProgress #GridIronLegacy`;
      
      // Post the tweet
      return await this.postTweet(userId, content, [], storage);
    } catch (error) {
      console.error('Error sharing achievement on Twitter:', error);
      return null;
    }
  }

  /**
   * Share combine metrics on Twitter
   */
  async shareStats(
    userId: number, 
    metricsId: number,
    storage: MemStorage
  ): Promise<TwitterPost | null> {
    try {
      // Get metrics details
      const metrics = await storage.getCombineMetricsById(metricsId);
      
      if (!metrics) {
        throw new Error('Metrics not found');
      }
      
      // Prepare the tweet text based on the metrics
      let content = '💪 My latest football stats:\n';
      
      if (metrics.fortyYard) content += `40-yard dash: ${metrics.fortyYard}s\n`;
      if (metrics.verticalJump) content += `Vertical jump: ${metrics.verticalJump}"\n`;
      if (metrics.benchPress) content += `Bench press: ${metrics.benchPress} lbs\n`;
      
      content += '#FootballStats #GridIronLegacy';
      
      // Post the tweet
      return await this.postTweet(userId, content, [], storage);
    } catch (error) {
      console.error('Error sharing stats on Twitter:', error);
      return null;
    }
  }

  /**
   * Disconnect Twitter account
   */
  async disconnectTwitter(userId: number, storage: MemStorage): Promise<boolean> {
    try {
      // Find the user's Twitter token
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'twitter');
      
      if (!token) {
        // No token found to disconnect
        return true;
      }
      
      // In a real implementation, this might revoke the token on Twitter's side
      
      // Update the token to be inactive
      const updatedToken = await storage.updateExternalServiceToken(token.id, {
        isActive: false
      });
      
      return !!updatedToken;
    } catch (error) {
      console.error('Error disconnecting Twitter:', error);
      return false;
    }
  }
}

export const twitterService = new TwitterService();