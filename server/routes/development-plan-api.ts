import { Router, Request, Response } from 'express';
import { developmentPlanService } from '../services/development-plan-service';

const router = Router();

// Declare session data interface 
declare module 'express-session' {
  interface SessionData {
    authenticated?: boolean;
    user?: {
      id: number;
      userType: string;
    };
  }
}

/**
 * Generate a complete development plan for an athlete based on their onboarding data
 */
router.post('/athlete/:athleteId/generate-development-plan', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated and has permission
    if (!req.session.authenticated) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Check if the user has permission to access this athlete's data
    if (req.session.user?.userType !== 'admin' && 
        req.session.user?.userType !== 'coach' && 
        (req.session.user?.userType !== 'athlete' || req.session.user?.id !== parseInt(req.params.athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    const athleteId = parseInt(req.params.athleteId);
    const plan = await developmentPlanService.generateAthleteDevelopmentPlan(athleteId);
    
    res.status(200).json(plan);
  } catch (error: any) {
    console.error("Error generating development plan:", error);
    res.status(500).json({ message: `Failed to generate development plan: ${error?.message || 'Unknown error'}` });
  }
});

/**
 * Get the current development plan for an athlete
 */
router.get('/athlete/:athleteId/development-plan', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated and has permission
    if (!req.session.authenticated) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Check if the user has permission to access this athlete's data
    if (req.session.user.userType !== 'admin' && 
        req.session.user.userType !== 'coach' && 
        (req.session.user.userType !== 'athlete' || req.session.user.id !== parseInt(req.params.athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    const athleteId = parseInt(req.params.athleteId);
    
    // For demonstration purposes, generate a new plan if one doesn't exist yet
    // In a real application, this would fetch from database
    const plan = await developmentPlanService.generateAthleteDevelopmentPlan(athleteId);
    
    res.status(200).json(plan);
  } catch (error) {
    console.error("Error fetching development plan:", error);
    res.status(500).json({ message: `Failed to fetch development plan: ${error.message}` });
  }
});

/**
 * Generate a progress report based on current metrics vs. development plan
 */
router.post('/athlete/:athleteId/generate-progress-report', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated and has permission
    if (!req.session.authenticated) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Check if the user has permission to access this athlete's data
    if (req.session.user.userType !== 'admin' && 
        req.session.user.userType !== 'coach' && 
        (req.session.user.userType !== 'athlete' || req.session.user.id !== parseInt(req.params.athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    const athleteId = parseInt(req.params.athleteId);
    const report = await developmentPlanService.generateProgressReport(athleteId);
    
    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating progress report:", error);
    res.status(500).json({ message: `Failed to generate progress report: ${error.message}` });
  }
});

/**
 * Generate an annual review and college football projection
 */
router.post('/athlete/:athleteId/generate-annual-review', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated and has permission
    if (!req.session.authenticated) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Check if the user has permission to access this athlete's data
    if (req.session.user.userType !== 'admin' && 
        req.session.user.userType !== 'coach' && 
        (req.session.user.userType !== 'athlete' || req.session.user.id !== parseInt(req.params.athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    const athleteId = parseInt(req.params.athleteId);
    const review = await developmentPlanService.generateAnnualReview(athleteId);
    
    res.status(200).json(review);
  } catch (error) {
    console.error("Error generating annual review:", error);
    res.status(500).json({ message: `Failed to generate annual review: ${error.message}` });
  }
});

export default router;