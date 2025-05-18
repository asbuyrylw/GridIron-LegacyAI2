import { Router } from 'express';
import { Request, Response } from 'express';
import { developmentPlanService } from '../services/development-plan-service';
import { db } from '../db';

const router = Router();

/**
 * Generate a complete development plan for an athlete based on their onboarding data
 */
router.post('/athlete/:athleteId/generate-development-plan', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    // Check if the authenticated user has access to this athlete's data
    if (!req.session.user || 
       (req.session.user.userType === 'athlete' && req.session.user.id !== athleteId)) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    const plan = await developmentPlanService.generateAthleteDevelopmentPlan(athleteId);
    
    // Return the generated plan
    res.json(plan);
  } catch (error) {
    console.error('Error generating development plan:', error);
    res.status(500).json({ message: 'Failed to generate development plan' });
  }
});

/**
 * Get the current development plan for an athlete
 */
router.get('/athlete/:athleteId/development-plan', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    // Check if the authenticated user has access to this athlete's data
    if (!req.session.user || 
       (req.session.user.userType === 'athlete' && req.session.user.id !== athleteId)) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    // In a production environment, you would fetch the saved plan from the database
    // For now, we'll generate it on demand if it doesn't exist
    const plan = await developmentPlanService.generateAthleteDevelopmentPlan(athleteId);
    
    // Return the plan
    res.json(plan);
  } catch (error) {
    console.error('Error fetching development plan:', error);
    res.status(500).json({ message: 'Failed to fetch development plan' });
  }
});

/**
 * Generate a progress report based on current metrics vs. development plan
 */
router.post('/athlete/:athleteId/generate-progress-report', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    // Check if the authenticated user has access to this athlete's data
    if (!req.session.user || 
       (req.session.user.userType === 'athlete' && req.session.user.id !== athleteId)) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    const report = await developmentPlanService.generateProgressReport(athleteId);
    
    // Return the progress report
    res.json(report);
  } catch (error) {
    console.error('Error generating progress report:', error);
    res.status(500).json({ message: 'Failed to generate progress report' });
  }
});

/**
 * Generate an annual review and college football projection
 */
router.post('/athlete/:athleteId/generate-annual-review', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    // Check if the authenticated user has access to this athlete's data
    if (!req.session.user || 
       (req.session.user.userType === 'athlete' && req.session.user.id !== athleteId)) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    const review = await developmentPlanService.generateAnnualReview(athleteId);
    
    // Return the annual review
    res.json(review);
  } catch (error) {
    console.error('Error generating annual review:', error);
    res.status(500).json({ message: 'Failed to generate annual review' });
  }
});

export default router;