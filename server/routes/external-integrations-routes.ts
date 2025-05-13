import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { twitterService } from '../services/twitter-service';
import { hudlService } from '../services/hudl-service';
import { maxPrepsService } from '../services/maxpreps-service';
import { insertExternalServiceTokenSchema } from '../../shared/external-integrations';

/**
 * Register all external integration routes
 */
export function registerExternalIntegrationsRoutes(app: Express): void {
  // Twitter Integration Routes
  app.get('/api/twitter/auth', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      if (!twitterService.isEnabled()) {
        return res.status(400).json({
          message: 'Twitter integration is not enabled. Check API credentials.'
        });
      }

      const authUrl = twitterService.getAuthorizationUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error('Error getting Twitter auth URL:', error);
      res.status(500).json({ message: 'Failed to generate Twitter authorization URL' });
    }
  });

  app.get('/api/twitter/callback', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: 'Missing authorization code' });
      }

      const token = await twitterService.processOAuthCallback(code, req.session.userId, storage);
      
      if (!token) {
        return res.status(500).json({ message: 'Failed to authenticate with Twitter' });
      }

      res.json({ success: true, message: 'Successfully connected Twitter account' });
    } catch (error) {
      console.error('Error processing Twitter callback:', error);
      res.status(500).json({ message: 'Failed to process Twitter callback' });
    }
  });

  app.post('/api/twitter/post', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const schema = z.object({
        content: z.string().min(1).max(280),
        mediaUrls: z.array(z.string().url()).optional(),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid request body', errors: result.error.errors });
      }

      const { content, mediaUrls = [] } = result.data;
      const tweet = await twitterService.postTweet(req.session.userId, content, mediaUrls, storage);
      
      if (!tweet) {
        return res.status(500).json({ message: 'Failed to post to Twitter' });
      }

      res.json({ success: true, tweet });
    } catch (error) {
      console.error('Error posting to Twitter:', error);
      res.status(500).json({ message: 'Failed to post to Twitter' });
    }
  });

  app.post('/api/twitter/schedule', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const schema = z.object({
        content: z.string().min(1).max(280),
        scheduledFor: z.string().datetime(),
        mediaUrls: z.array(z.string().url()).optional(),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid request body', errors: result.error.errors });
      }

      const { content, scheduledFor, mediaUrls = [] } = result.data;
      const tweet = await twitterService.scheduleTweet(
        req.session.userId, 
        content, 
        new Date(scheduledFor), 
        mediaUrls, 
        storage
      );
      
      if (!tweet) {
        return res.status(500).json({ message: 'Failed to schedule tweet' });
      }

      res.json({ success: true, tweet });
    } catch (error) {
      console.error('Error scheduling tweet:', error);
      res.status(500).json({ message: 'Failed to schedule tweet' });
    }
  });

  app.get('/api/twitter/posts', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const tweets = await twitterService.getUserTweets(req.session.userId, storage);
      res.json(tweets);
    } catch (error) {
      console.error('Error getting tweets:', error);
      res.status(500).json({ message: 'Failed to get tweets' });
    }
  });

  app.post('/api/twitter/share/achievement/:id', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const achievementId = parseInt(id, 10);
      
      if (isNaN(achievementId)) {
        return res.status(400).json({ message: 'Invalid achievement ID' });
      }

      const tweet = await twitterService.shareAchievement(req.session.userId, achievementId, storage);
      
      if (!tweet) {
        return res.status(500).json({ message: 'Failed to share achievement on Twitter' });
      }

      res.json({ success: true, tweet });
    } catch (error) {
      console.error('Error sharing achievement on Twitter:', error);
      res.status(500).json({ message: 'Failed to share achievement on Twitter' });
    }
  });

  app.post('/api/twitter/share/stats/:id', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const metricsId = parseInt(id, 10);
      
      if (isNaN(metricsId)) {
        return res.status(400).json({ message: 'Invalid metrics ID' });
      }

      const tweet = await twitterService.shareStats(req.session.userId, metricsId, storage);
      
      if (!tweet) {
        return res.status(500).json({ message: 'Failed to share stats on Twitter' });
      }

      res.json({ success: true, tweet });
    } catch (error) {
      console.error('Error sharing stats on Twitter:', error);
      res.status(500).json({ message: 'Failed to share stats on Twitter' });
    }
  });

  app.delete('/api/twitter/disconnect', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const success = await twitterService.disconnectTwitter(req.session.userId, storage);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to disconnect Twitter account' });
      }

      res.json({ success: true, message: 'Successfully disconnected Twitter account' });
    } catch (error) {
      console.error('Error disconnecting Twitter account:', error);
      res.status(500).json({ message: 'Failed to disconnect Twitter account' });
    }
  });

  // Hudl Integration Routes
  app.get('/api/hudl/auth', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      if (!hudlService.isEnabled()) {
        return res.status(400).json({
          message: 'Hudl integration is not enabled. Check API credentials.'
        });
      }

      const authUrl = hudlService.getAuthorizationUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error('Error getting Hudl auth URL:', error);
      res.status(500).json({ message: 'Failed to generate Hudl authorization URL' });
    }
  });

  app.get('/api/hudl/callback', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: 'Missing authorization code' });
      }

      const token = await hudlService.processOAuthCallback(code, req.session.userId, storage);
      
      if (!token) {
        return res.status(500).json({ message: 'Failed to authenticate with Hudl' });
      }

      res.json({ success: true, message: 'Successfully connected Hudl account' });
    } catch (error) {
      console.error('Error processing Hudl callback:', error);
      res.status(500).json({ message: 'Failed to process Hudl callback' });
    }
  });

  app.post('/api/hudl/sync', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const videos = await hudlService.syncVideos(req.session.userId, storage);
      
      if (!videos || videos.length === 0) {
        return res.status(500).json({ message: 'Failed to sync Hudl videos' });
      }

      res.json({ success: true, videos, count: videos.length });
    } catch (error) {
      console.error('Error syncing Hudl videos:', error);
      res.status(500).json({ message: 'Failed to sync Hudl videos' });
    }
  });

  app.get('/api/hudl/videos', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const athlete = await storage.getAthleteByUserId(req.session.userId);
      
      if (!athlete) {
        return res.status(404).json({ message: 'Athlete not found' });
      }

      const videos = await hudlService.getAthleteVideos(athlete.id, storage);
      res.json(videos);
    } catch (error) {
      console.error('Error getting Hudl videos:', error);
      res.status(500).json({ message: 'Failed to get Hudl videos' });
    }
  });

  app.get('/api/hudl/highlights', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const athlete = await storage.getAthleteByUserId(req.session.userId);
      
      if (!athlete) {
        return res.status(404).json({ message: 'Athlete not found' });
      }

      const highlights = await hudlService.getAthleteHighlights(athlete.id, storage);
      res.json(highlights);
    } catch (error) {
      console.error('Error getting Hudl highlights:', error);
      res.status(500).json({ message: 'Failed to get Hudl highlights' });
    }
  });

  app.put('/api/hudl/link', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const schema = z.object({
        hudlLink: z.string().min(1),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid request body', errors: result.error.errors });
      }

      const { hudlLink } = result.data;
      const athlete = await storage.getAthleteByUserId(req.session.userId);
      
      if (!athlete) {
        return res.status(404).json({ message: 'Athlete not found' });
      }

      const success = await hudlService.updateHudlLink(athlete.id, hudlLink, storage);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to update Hudl link' });
      }

      res.json({ success: true, message: 'Successfully updated Hudl link' });
    } catch (error) {
      console.error('Error updating Hudl link:', error);
      res.status(500).json({ message: 'Failed to update Hudl link' });
    }
  });

  app.delete('/api/hudl/disconnect', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const success = await hudlService.disconnectHudl(req.session.userId, storage);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to disconnect Hudl account' });
      }

      res.json({ success: true, message: 'Successfully disconnected Hudl account' });
    } catch (error) {
      console.error('Error disconnecting Hudl account:', error);
      res.status(500).json({ message: 'Failed to disconnect Hudl account' });
    }
  });

  // MaxPreps Integration Routes
  app.post('/api/maxpreps/authorize', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const schema = z.object({
        maxPrepsId: z.string().min(1),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid request body', errors: result.error.errors });
      }

      const { maxPrepsId } = result.data;
      const token = await maxPrepsService.authorizeMaxPreps(req.session.userId, maxPrepsId, storage);
      
      if (!token) {
        return res.status(500).json({ message: 'Failed to authorize MaxPreps' });
      }

      res.json({ success: true, message: 'Successfully authorized MaxPreps' });
    } catch (error) {
      console.error('Error authorizing MaxPreps:', error);
      res.status(500).json({ message: 'Failed to authorize MaxPreps' });
    }
  });

  app.post('/api/maxpreps/sync', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const stats = await maxPrepsService.syncStats(req.session.userId, storage);
      
      if (!stats || stats.length === 0) {
        return res.status(500).json({ message: 'Failed to sync MaxPreps stats' });
      }

      res.json({ success: true, stats, count: stats.length });
    } catch (error) {
      console.error('Error syncing MaxPreps stats:', error);
      res.status(500).json({ message: 'Failed to sync MaxPreps stats' });
    }
  });

  app.get('/api/maxpreps/stats', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const athlete = await storage.getAthleteByUserId(req.session.userId);
      
      if (!athlete) {
        return res.status(404).json({ message: 'Athlete not found' });
      }

      const stats = await maxPrepsService.getAthleteStats(athlete.id, storage);
      res.json(stats);
    } catch (error) {
      console.error('Error getting MaxPreps stats:', error);
      res.status(500).json({ message: 'Failed to get MaxPreps stats' });
    }
  });

  app.get('/api/maxpreps/stats/:season', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { season } = req.params;
      
      if (!season) {
        return res.status(400).json({ message: 'Missing season parameter' });
      }

      const athlete = await storage.getAthleteByUserId(req.session.userId);
      
      if (!athlete) {
        return res.status(404).json({ message: 'Athlete not found' });
      }

      const stats = await maxPrepsService.getAthleteStatsBySeason(athlete.id, season, storage);
      
      if (!stats) {
        return res.status(404).json({ message: 'Stats not found for the specified season' });
      }

      res.json(stats);
    } catch (error) {
      console.error('Error getting MaxPreps stats for season:', error);
      res.status(500).json({ message: 'Failed to get MaxPreps stats for season' });
    }
  });

  app.put('/api/maxpreps/link', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const schema = z.object({
        maxPrepsLink: z.string().min(1),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid request body', errors: result.error.errors });
      }

      const { maxPrepsLink } = result.data;
      const athlete = await storage.getAthleteByUserId(req.session.userId);
      
      if (!athlete) {
        return res.status(404).json({ message: 'Athlete not found' });
      }

      const success = await maxPrepsService.updateMaxPrepsLink(athlete.id, maxPrepsLink, storage);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to update MaxPreps link' });
      }

      res.json({ success: true, message: 'Successfully updated MaxPreps link' });
    } catch (error) {
      console.error('Error updating MaxPreps link:', error);
      res.status(500).json({ message: 'Failed to update MaxPreps link' });
    }
  });

  app.delete('/api/maxpreps/disconnect', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const success = await maxPrepsService.disconnectMaxPreps(req.session.userId, storage);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to disconnect MaxPreps account' });
      }

      res.json({ success: true, message: 'Successfully disconnected MaxPreps account' });
    } catch (error) {
      console.error('Error disconnecting MaxPreps account:', error);
      res.status(500).json({ message: 'Failed to disconnect MaxPreps account' });
    }
  });

  // General Integration Status
  app.get('/api/integrations/status', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const twitterToken = await storage.getExternalServiceTokenByUserAndService(req.session.userId, 'twitter');
      const hudlToken = await storage.getExternalServiceTokenByUserAndService(req.session.userId, 'hudl');
      const maxPrepsToken = await storage.getExternalServiceTokenByUserAndService(req.session.userId, 'maxpreps');

      const athlete = await storage.getAthleteByUserId(req.session.userId);
      const status = {
        twitter: {
          connected: !!twitterToken && twitterToken.isActive,
          lastSynced: twitterToken?.lastSyncDate || null
        },
        hudl: {
          connected: !!hudlToken && hudlToken.isActive,
          lastSynced: hudlToken?.lastSyncDate || null,
          profileUrl: athlete ? hudlService.getProfileUrl(athlete.hudlLink) : null
        },
        maxPreps: {
          connected: !!maxPrepsToken && maxPrepsToken.isActive,
          lastSynced: maxPrepsToken?.lastSyncDate || null,
          profileUrl: athlete ? maxPrepsService.getProfileUrl(athlete.maxPrepsLink) : null
        }
      };

      res.json(status);
    } catch (error) {
      console.error('Error getting integration status:', error);
      res.status(500).json({ message: 'Failed to get integration status' });
    }
  });
}