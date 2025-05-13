import { Express, Request, Response } from 'express';
import { loginStreakService } from '../login-streak-service';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export function setupLoginStreakRoutes(app: Express) {
  // Get user's login streak
  app.get('/api/user/login-streak', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const userId = req.session.userId;
      let streak = await loginStreakService.getLoginStreak(userId);

      if (!streak) {
        // Create a new streak for first-time users
        streak = await loginStreakService.createLoginStreak({
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastLoginDate: null,
          streakHistory: []
        });
      }

      return res.status(200).json(streak);
    } catch (error) {
      console.error('Error getting login streak:', error);
      return res.status(500).json({ message: 'Failed to get login streak' });
    }
  });

  // Update login streak (process daily login)
  app.post('/api/user/login-streak', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const userId = req.session.userId;
      const streak = await loginStreakService.processLogin(userId);

      // Send back updated streak data
      return res.status(200).json(streak);
    } catch (error) {
      console.error('Error updating login streak:', error);
      return res.status(500).json({ message: 'Failed to update login streak' });
    }
  });

  console.log('Login streak routes loaded successfully');
}