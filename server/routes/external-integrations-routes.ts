import { Router, Request, Response } from 'express';
import { storage } from '../storage';

export function registerExternalIntegrationsRoutes(router: Router) {
  /**
   * Get integration status for all external services
   */
  router.get('/api/integrations/status', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get Twitter integration status
      const twitterToken = await storage.getExternalServiceTokenByUserAndService(userId, 'twitter');
      
      // Get Hudl integration status
      const hudlToken = await storage.getExternalServiceTokenByUserAndService(userId, 'hudl');
      
      // Get MaxPreps integration status
      const maxPrepsToken = await storage.getExternalServiceTokenByUserAndService(userId, 'maxpreps');
      
      // Get athlete to check for profile URLs
      const athlete = await storage.getAthleteByUserId(userId);
      
      const status = {
        twitter: {
          connected: !!twitterToken && twitterToken.isActive,
          lastSynced: twitterToken?.lastSyncDate?.toISOString() || null
        },
        hudl: {
          connected: !!hudlToken && hudlToken.isActive,
          lastSynced: hudlToken?.lastSyncDate?.toISOString() || null,
          profileUrl: athlete?.hudlLink || null
        },
        maxPreps: {
          connected: !!maxPrepsToken && maxPrepsToken.isActive,
          lastSynced: maxPrepsToken?.lastSyncDate?.toISOString() || null,
          profileUrl: athlete?.maxPrepsLink || null
        }
      };
      
      return res.json(status);
    } catch (err) {
      console.error('Error getting integration status:', err);
      return res.status(500).json({ error: 'Failed to get integration status' });
    }
  });

  /**
   * Twitter Auth Routes
   */
  
  router.get('/api/twitter/auth', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // This would typically redirect to Twitter OAuth
      // For now, simulate the authorization flow
      return res.json({ 
        authUrl: 'https://api.twitter.com/oauth/authorize?oauth_token=mock_token'
      });
    } catch (err) {
      console.error('Error starting Twitter auth flow:', err);
      return res.status(500).json({ error: 'Failed to start Twitter authorization' });
    }
  });

  router.get('/api/twitter/callback', async (req: Request, res: Response) => {
    try {
      // This would process the callback from Twitter OAuth
      // For now, simulate successful auth and redirect to integration page
      return res.redirect('/external-integrations?auth=success&service=twitter');
    } catch (err) {
      console.error('Error processing Twitter callback:', err);
      return res.redirect('/external-integrations?auth=error&service=twitter');
    }
  });

  router.post('/api/twitter/sync', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Simulate syncing Twitter data
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'twitter');
      
      if (!token || !token.isActive) {
        return res.status(400).json({ error: 'Twitter account not connected' });
      }
      
      // Update last sync date
      await storage.updateExternalServiceToken(token.id, {
        lastSyncDate: new Date()
      });
      
      return res.json({ success: true, message: 'Twitter data synchronized successfully' });
    } catch (err) {
      console.error('Error syncing Twitter data:', err);
      return res.status(500).json({ error: 'Failed to sync Twitter data' });
    }
  });

  router.delete('/api/twitter/disconnect', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'twitter');
      
      if (!token) {
        return res.status(400).json({ error: 'Twitter account not connected' });
      }
      
      // Update token to inactive instead of deleting
      await storage.updateExternalServiceToken(token.id, {
        isActive: false
      });
      
      return res.json({ success: true, message: 'Twitter account disconnected successfully' });
    } catch (err) {
      console.error('Error disconnecting Twitter account:', err);
      return res.status(500).json({ error: 'Failed to disconnect Twitter account' });
    }
  });

  /**
   * Hudl Auth Routes
   */
  
  router.get('/api/hudl/auth', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // This would typically redirect to Hudl OAuth
      // For now, simulate the authorization flow
      return res.json({ 
        authUrl: 'https://www.hudl.com/oauth/authorize?client_id=mock_client_id'
      });
    } catch (err) {
      console.error('Error starting Hudl auth flow:', err);
      return res.status(500).json({ error: 'Failed to start Hudl authorization' });
    }
  });

  router.get('/api/hudl/callback', async (req: Request, res: Response) => {
    try {
      // This would process the callback from Hudl OAuth
      // For now, simulate successful auth and redirect to integration page
      return res.redirect('/external-integrations?auth=success&service=hudl');
    } catch (err) {
      console.error('Error processing Hudl callback:', err);
      return res.redirect('/external-integrations?auth=error&service=hudl');
    }
  });

  router.post('/api/hudl/sync', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Simulate syncing Hudl data
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'hudl');
      
      if (!token || !token.isActive) {
        return res.status(400).json({ error: 'Hudl account not connected' });
      }
      
      // Update last sync date
      await storage.updateExternalServiceToken(token.id, {
        lastSyncDate: new Date()
      });
      
      return res.json({ success: true, message: 'Hudl videos synchronized successfully' });
    } catch (err) {
      console.error('Error syncing Hudl data:', err);
      return res.status(500).json({ error: 'Failed to sync Hudl data' });
    }
  });

  router.delete('/api/hudl/disconnect', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'hudl');
      
      if (!token) {
        return res.status(400).json({ error: 'Hudl account not connected' });
      }
      
      // Update token to inactive instead of deleting
      await storage.updateExternalServiceToken(token.id, {
        isActive: false
      });
      
      // Remove Hudl link from athlete profile
      const athlete = await storage.getAthleteByUserId(userId);
      if (athlete) {
        await storage.updateAthlete(athlete.id, {
          hudlLink: null
        });
      }
      
      return res.json({ success: true, message: 'Hudl account disconnected successfully' });
    } catch (err) {
      console.error('Error disconnecting Hudl account:', err);
      return res.status(500).json({ error: 'Failed to disconnect Hudl account' });
    }
  });

  /**
   * MaxPreps Auth Routes
   */
  
  router.post('/api/maxpreps/authorize', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const { maxPrepsId } = req.body;
      
      if (!maxPrepsId) {
        return res.status(400).json({ error: 'MaxPreps ID is required' });
      }
      
      // Create or update token
      const existingToken = await storage.getExternalServiceTokenByUserAndService(userId, 'maxpreps');
      
      if (existingToken) {
        await storage.updateExternalServiceToken(existingToken.id, {
          accessToken: maxPrepsId, // Store the ID as a token for simplicity
          isActive: true,
          lastSyncDate: new Date()
        });
      } else {
        await storage.createExternalServiceToken({
          userId,
          service: 'maxpreps',
          accessToken: maxPrepsId, // Store the ID as a token for simplicity
          isActive: true,
          lastSyncDate: new Date()
        });
      }
      
      // Update athlete profile with MaxPreps link
      const athlete = await storage.getAthleteByUserId(userId);
      if (athlete) {
        await storage.updateAthlete(athlete.id, {
          maxPrepsLink: `https://www.maxpreps.com/athlete/${maxPrepsId}`
        });
      }
      
      return res.json({ success: true, message: 'MaxPreps account connected successfully' });
    } catch (err) {
      console.error('Error connecting MaxPreps account:', err);
      return res.status(500).json({ error: 'Failed to connect MaxPreps account' });
    }
  });

  router.post('/api/maxpreps/sync', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Simulate syncing MaxPreps data
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'maxpreps');
      
      if (!token || !token.isActive) {
        return res.status(400).json({ error: 'MaxPreps account not connected' });
      }
      
      // Update last sync date
      await storage.updateExternalServiceToken(token.id, {
        lastSyncDate: new Date()
      });
      
      return res.json({ success: true, message: 'MaxPreps stats synchronized successfully' });
    } catch (err) {
      console.error('Error syncing MaxPreps data:', err);
      return res.status(500).json({ error: 'Failed to sync MaxPreps data' });
    }
  });

  router.delete('/api/maxpreps/disconnect', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const token = await storage.getExternalServiceTokenByUserAndService(userId, 'maxpreps');
      
      if (!token) {
        return res.status(400).json({ error: 'MaxPreps account not connected' });
      }
      
      // Update token to inactive instead of deleting
      await storage.updateExternalServiceToken(token.id, {
        isActive: false
      });
      
      // Remove MaxPreps link from athlete profile
      const athlete = await storage.getAthleteByUserId(userId);
      if (athlete) {
        await storage.updateAthlete(athlete.id, {
          maxPrepsLink: null
        });
      }
      
      return res.json({ success: true, message: 'MaxPreps account disconnected successfully' });
    } catch (err) {
      console.error('Error disconnecting MaxPreps account:', err);
      return res.status(500).json({ error: 'Failed to disconnect MaxPreps account' });
    }
  });
}