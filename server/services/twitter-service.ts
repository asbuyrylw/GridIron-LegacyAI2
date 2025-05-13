import { MemStorage } from '../storage';
import { InsertTwitterPost, TwitterPost, ExternalServiceToken } from '../../shared/external-integrations';

class TwitterService {
  private readonly enabled: boolean;

  constructor() {
    // Only enable if we have Twitter API credentials
    this.enabled = !!process.env.TWITTER_API_KEY && 
                   !!process.env.TWITTER_API_SECRET && 
                   !!process.env.TWITTER_CALLBACK_URL;
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
      throw new Error('Twitter service is not enabled. Twitter API credentials are missing.');
    }
    
    // Implementation would use Twitter OAuth 2.0
    // This is a placeholder - actual implementation would require the Twitter API
    const callbackUrl = process.env.TWITTER_CALLBACK_URL || '';
    const authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${process.env.TWITTER_API_KEY}&redirect_uri=${callbackUrl}&response_type=code&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`;
    
    return authUrl;
  }

  /**
   * Process the OAuth callback
   */
  async processOAuthCallback(code: string, userId: number, storage: MemStorage): Promise<ExternalServiceToken | null> {
    if (!this.enabled) {
      throw new Error('Twitter service is not enabled. Twitter API credentials are missing.');
    }

    try {
      // In a real implementation, we would exchange the code for tokens
      // For now, we'll create a dummy token record
      const tokenData = {
        userId,
        service: 'twitter',
        accessToken: 'dummy_access_token', // Would be replaced with actual token
        refreshToken: 'dummy_refresh_token', // Would be replaced with actual token
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        scope: 'tweet.read tweet.write users.read',
        isActive: true,
      };

      // Store the tokens
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
      throw new Error('Twitter service is not enabled. Twitter API credentials are missing.');
    }

    try {
      // Find the user's Twitter token
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'twitter');
      
      if (!token || !token.isActive) {
        throw new Error('No active Twitter token found for this user');
      }

      // In a real implementation, we would use the Twitter API to post the tweet
      // For now, we'll create a record in our database
      const tweetData: InsertTwitterPost = {
        userId,
        content,
        mediaUrls,
        isPosted: true,
        postedAt: new Date(),
        tweetId: `dummy_${Date.now()}`, // Would be replaced with actual tweet ID
        engagementStats: { likes: 0, retweets: 0, replies: 0 },
      };

      // Save to database
      const tweet = await storage.createTwitterPost(tweetData);
      
      return tweet;
    } catch (error) {
      console.error('Error posting tweet:', error);
      
      // Save the error in our database
      const errorTweetData: InsertTwitterPost = {
        userId,
        content,
        mediaUrls,
        isPosted: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
      
      await storage.createTwitterPost(errorTweetData);
      
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
      throw new Error('Twitter service is not enabled. Twitter API credentials are missing.');
    }

    try {
      // Find the user's Twitter token
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'twitter');
      
      if (!token || !token.isActive) {
        throw new Error('No active Twitter token found for this user');
      }

      // In a real implementation, we might use a scheduled tweet API
      // For now, we'll create a record in our database
      const tweetData: InsertTwitterPost = {
        userId,
        content,
        mediaUrls,
        isScheduled: true,
        scheduledFor,
      };

      // Save to database
      const tweet = await storage.createTwitterPost(tweetData);
      
      return tweet;
    } catch (error) {
      console.error('Error scheduling tweet:', error);
      return null;
    }
  }

  /**
   * Get tweets for a user
   */
  async getUserTweets(userId: number, storage: MemStorage): Promise<TwitterPost[]> {
    try {
      const tweets = await storage.getTwitterPostsByUser(userId);
      return tweets;
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
      
      // Get athlete details
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (!achievement || !athlete) {
        throw new Error('Achievement or athlete not found');
      }
      
      // Create tweet content
      const achievementName = achievement.name || 'Unknown Achievement';
      const content = `I just earned the "${achievementName}" achievement on GridIron LegacyAI! 🏈 #FootballAchievement #GridIronLegacy`;
      
      // Post the tweet
      return await this.postTweet(userId, content, [], storage);
    } catch (error) {
      console.error('Error sharing achievement on Twitter:', error);
      return null;
    }
  }

  /**
   * Share stats on Twitter
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
      
      // Get athlete details
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (!athlete) {
        throw new Error('Athlete not found');
      }
      
      // Create tweet content with key metrics
      let content = `Just updated my combine metrics! 🏈\n`;
      
      if (metrics.fortyYard) content += `40-yard: ${metrics.fortyYard}s ⚡️\n`;
      if (metrics.verticalJump) content += `Vertical: ${metrics.verticalJump}″ 🦘\n`;
      if (metrics.benchPressReps) content += `Bench: ${metrics.benchPressReps} reps 💪\n`;
      
      content += `#GridIronLegacy #FootballRecruitment`;
      
      // Post the tweet
      return await this.postTweet(userId, content, [], storage);
    } catch (error) {
      console.error('Error sharing stats on Twitter:', error);
      return null;
    }
  }

  /**
   * Check and refresh token if needed
   */
  async checkAndRefreshToken(userId: number, storage: MemStorage): Promise<boolean> {
    try {
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'twitter');
      
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
          accessToken: 'new_dummy_access_token',
          tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        });
        
        return !!updatedToken;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking/refreshing Twitter token:', error);
      return false;
    }
  }

  /**
   * Disconnect Twitter for a user
   */
  async disconnectTwitter(userId: number, storage: MemStorage): Promise<boolean> {
    try {
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'twitter');
      
      if (!token) {
        return false;
      }
      
      // Set token as inactive
      const updatedToken = await storage.updateExternalServiceToken(token.id, {
        isActive: false,
      });
      
      return !!updatedToken;
    } catch (error) {
      console.error('Error disconnecting Twitter:', error);
      return false;
    }
  }
}

export const twitterService = new TwitterService();