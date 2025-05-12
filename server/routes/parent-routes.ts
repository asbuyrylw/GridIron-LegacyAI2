import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { parentAccessService } from '../parent-access-service';
import { emailService } from '../email-service';
import { EmailNotificationType } from '../../shared/parent-access';
import { z } from 'zod';

// Create a router instance
const router = Router();

// Schema for parent report request
const parentReportSchema = z.object({
  athleteId: z.number(),
  frequency: z.enum(['once', 'weekly', 'biweekly', 'monthly']),
  period: z.enum(['week', 'month', 'season', 'year']),
  format: z.enum(['email', 'pdf', 'both']),
  includeMetrics: z.boolean(),
  includeAchievements: z.boolean(),
  includeTraining: z.boolean(),
  includeNutrition: z.boolean(),
  includeAcademic: z.boolean(),
  scheduler: z.object({
    startDate: z.date().optional(),
    specificDay: z.string().optional(),
  }),
});

// Schema for shopping list request
const shoppingListSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    quantity: z.string(),
    selected: z.boolean(),
  })),
});

// Helper function to validate user has access to athlete
async function validateAthleteAccess(req: Request, athleteId: number): Promise<boolean> {
  // Check if user is logged in
  if (!req.session.userId) {
    return false;
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return false;
  }
  
  // If user is the athlete, access is granted
  if (user.userType === 'athlete') {
    const athlete = await storage.getAthleteByUserId(req.session.userId);
    return athlete?.id === athleteId;
  }
  
  // If user is a coach, check if they coach this athlete
  if (user.userType === 'coach') {
    const coach = await storage.getCoachByUserId(req.session.userId);
    if (!coach) return false;
    
    // Get teams coached by this coach
    const teamIds = await storage.getTeamsByCoachId(coach.id);
    if (!teamIds.length) return false;
    
    // Check if athlete is on any of these teams
    for (const teamId of teamIds) {
      const members = await storage.getTeamMembers(teamId);
      if (members.some(member => member.athleteId === athleteId)) {
        return true;
      }
    }
    return false;
  }
  
  // If user is a parent, check if they have access to this athlete
  if (user.userType === 'parent') {
    const parent = await storage.getParentByUserId(req.session.userId);
    if (!parent) return false;
    
    const relationships = await storage.getParentAthleteRelationshipsByParentId(parent.id);
    return relationships.some(rel => rel.athleteId === athleteId);
  }
  
  return false;
}

// Helper function to get eligible parents for athlete communications
async function getEligibleParents(athleteId: number, requireNutritionAccess: boolean = false): Promise<any[]> {
  try {
    const parentAccesses = await parentAccessService.getParentAccessesByAthleteId(athleteId);
    return parentAccesses.filter(access => {
      return access.active && (!requireNutritionAccess || access.receiveNutritionInfo);
    });
  } catch (error) {
    console.error('Error getting eligible parents:', error);
    return [];
  }
}

// Route to get parent access list
router.get('/api/athlete/:athleteId/parent-access', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete\'s information' });
    }
    
    const parentAccesses = await parentAccessService.getParentAccessesByAthleteId(athleteId);
    res.json(parentAccesses);
  } catch (error) {
    console.error('Error getting parent access list:', error);
    res.status(500).json({ message: 'Failed to retrieve parent access list' });
  }
});

// Route to create a parent invitation
router.post('/api/athlete/parent-invite', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || user.userType !== 'athlete') {
      return res.status(403).json({ message: 'Only athletes can send parent invitations' });
    }
    
    const athlete = await storage.getAthleteByUserId(req.session.userId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete profile not found' });
    }
    
    const { name, email, relationship, receiveUpdates, receiveNutritionInfo } = req.body;
    
    const parentAccess = await parentAccessService.inviteParent({
      athleteId: athlete.id,
      name,
      email,
      relationship,
      receiveUpdates: !!receiveUpdates,
      receiveNutritionInfo: !!receiveNutritionInfo,
    });
    
    res.status(201).json(parentAccess);
  } catch (error) {
    console.error('Error creating parent invitation:', error);
    res.status(500).json({ message: 'Failed to create parent invitation' });
  }
});

// Route to update parent access
router.patch('/api/athlete/:athleteId/parent-access/:id', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const accessId = parseInt(req.params.id);
    
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to modify this athlete\'s parent access' });
    }
    
    const updateData = req.body;
    const updatedAccess = await parentAccessService.updateParentAccess(accessId, updateData);
    
    if (!updatedAccess) {
      return res.status(404).json({ message: 'Parent access not found' });
    }
    
    res.json(updatedAccess);
  } catch (error) {
    console.error('Error updating parent access:', error);
    res.status(500).json({ message: 'Failed to update parent access' });
  }
});

// Route to deactivate parent access
router.delete('/api/athlete/:athleteId/parent-access/:id', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const accessId = parseInt(req.params.id);
    
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to modify this athlete\'s parent access' });
    }
    
    const success = await parentAccessService.deactivateParentAccess(accessId);
    
    if (!success) {
      return res.status(404).json({ message: 'Parent access not found' });
    }
    
    res.json({ success });
  } catch (error) {
    console.error('Error deactivating parent access:', error);
    res.status(500).json({ message: 'Failed to deactivate parent access' });
  }
});

// Route to generate parent reports
router.post('/api/athlete/:athleteId/parent-report', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to generate reports for this athlete' });
    }
    
    // Validate request body
    const validationResult = parentReportSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid report configuration', errors: validationResult.error.errors });
    }
    
    // Get eligible parents
    const eligibleParents = await getEligibleParents(athleteId);
    if (eligibleParents.length === 0) {
      return res.status(400).json({ message: 'No eligible parent recipients found' });
    }
    
    // Gather athlete data for the report
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    
    const user = await storage.getUser(athlete.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const athleteName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    
    // Generate reports based on configuration
    const config = validationResult.data;
    
    // Get metrics if requested
    let metricsData = null;
    if (config.includeMetrics) {
      const metrics = await storage.getAthleteMetrics(athleteId);
      if (metrics.length > 0) {
        metricsData = metrics[0]; // Most recent metrics
      }
    }
    
    // Get achievements if requested
    let achievementsData = null;
    if (config.includeAchievements) {
      achievementsData = await storage.getAthleteAchievements(athleteId);
    }
    
    // Get training data if requested
    let trainingData = null;
    if (config.includeTraining) {
      const workouts = await storage.getAthleteWorkoutSessions(athleteId);
      const plans = await storage.getAthleteTrainingPlans(athleteId);
      trainingData = { workouts, plans };
    }
    
    // Get nutrition data if requested
    let nutritionData = null;
    if (config.includeNutrition) {
      const plans = await storage.getAthleteNutritionPlans(athleteId);
      nutritionData = plans.find(plan => plan.active) || null;
    }
    
    // Compile report data
    const reportData = {
      athleteName,
      athleteInfo: {
        position: athlete.position,
        school: athlete.school,
        grade: athlete.grade,
      },
      metrics: metricsData,
      achievements: achievementsData,
      training: trainingData,
      nutrition: nutritionData,
      generatedAt: new Date(),
      period: config.period,
    };
    
    // For one-time reports, send immediately
    if (config.frequency === 'once') {
      // Send to all eligible parents
      const emailPromises = eligibleParents.map(parent => {
        return emailService.sendPerformanceUpdate(
          parent.email,
          parent.name,
          athleteName,
          reportData
        );
      });
      
      await Promise.all(emailPromises);
    } else {
      // For recurring reports, schedule them
      // In a production app, we would use a job scheduler like node-cron
      console.log(`Scheduled ${config.frequency} report starting on ${config.scheduler.startDate}`);
      // This is a placeholder for the scheduling logic
    }
    
    res.json({ 
      success: true, 
      message: 'Report generated successfully',
      recipientCount: eligibleParents.length
    });
  } catch (error) {
    console.error('Error generating parent report:', error);
    res.status(500).json({ message: 'Failed to generate parent report' });
  }
});

// Route to send nutrition shopping lists to parents
router.post('/api/athlete/:athleteId/nutrition/shopping-list', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to send shopping lists for this athlete' });
    }
    
    // Validate request body
    const validationResult = shoppingListSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid shopping list', errors: validationResult.error.errors });
    }
    
    // Get eligible parents (those who have opted in for nutrition info)
    const eligibleParents = await getEligibleParents(athleteId, true);
    if (eligibleParents.length === 0) {
      return res.status(400).json({ message: 'No eligible parent recipients found' });
    }
    
    // Get athlete info
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    
    const user = await storage.getUser(athlete.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const athleteName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    
    // Extract selected items from the shopping list
    const { items } = validationResult.data;
    const selectedItems = items
      .filter(item => item.selected)
      .map(item => `${item.name}${item.quantity ? ` (${item.quantity})` : ''}`);
    
    if (selectedItems.length === 0) {
      return res.status(400).json({ message: 'No items selected for the shopping list' });
    }
    
    // Send shopping list emails to parents
    const emailPromises = eligibleParents.map(parent => {
      return emailService.sendNutritionShoppingList(
        parent.email,
        parent.name,
        athleteName,
        selectedItems
      );
    });
    
    await Promise.all(emailPromises);
    
    res.json({ 
      success: true, 
      message: 'Shopping list sent successfully',
      recipientCount: eligibleParents.length,
      itemCount: selectedItems.length
    });
  } catch (error) {
    console.error('Error sending shopping list:', error);
    res.status(500).json({ message: 'Failed to send shopping list' });
  }
});

// Route to get nutrition recommendations
router.get('/api/athlete/:athleteId/nutrition/recommendations', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access nutrition data for this athlete' });
    }
    
    // Get active nutrition plan
    const plans = await storage.getAthleteNutritionPlans(athleteId);
    const activePlan = plans.find(plan => plan.active);
    
    if (!activePlan) {
      return res.status(404).json({ message: 'No active nutrition plan found' });
    }
    
    // Generate recommended shopping items based on nutrition plan
    // In a real app, this would probably use an AI model or a nutrition database
    const recommendedItems = [
      { name: 'Chicken Breast', category: 'Proteins', quantity: '2 lbs' },
      { name: 'Salmon', category: 'Proteins', quantity: '1 lb' },
      { name: 'Greek Yogurt', category: 'Dairy', quantity: '32 oz' },
      { name: 'Eggs', category: 'Proteins', quantity: '1 dozen' },
      { name: 'Spinach', category: 'Vegetables', quantity: '2 bunches' },
      { name: 'Broccoli', category: 'Vegetables', quantity: '1 head' },
      { name: 'Sweet Potatoes', category: 'Carbohydrates', quantity: '3 medium' },
      { name: 'Brown Rice', category: 'Carbohydrates', quantity: '1 bag' },
      { name: 'Quinoa', category: 'Carbohydrates', quantity: '1 box' },
      { name: 'Blueberries', category: 'Fruits', quantity: '1 pint' },
      { name: 'Bananas', category: 'Fruits', quantity: '1 bunch' },
      { name: 'Apples', category: 'Fruits', quantity: '5 medium' },
      { name: 'Avocados', category: 'Healthy Fats', quantity: '2 medium' },
      { name: 'Almonds', category: 'Snacks', quantity: '1 bag' },
      { name: 'Oatmeal', category: 'Carbohydrates', quantity: '1 container' },
      { name: 'Olive Oil', category: 'Healthy Fats', quantity: '1 bottle' },
      { name: 'Protein Powder', category: 'Supplements', quantity: '1 container' },
    ];
    
    // If there are dietary restrictions, filter the recommendations
    if (activePlan.restrictions) {
      // Logic to filter items based on restrictions would go here
      // For example, removing dairy products if lactose intolerant
    }
    
    res.json({
      plan: activePlan,
      items: recommendedItems
    });
  } catch (error) {
    console.error('Error getting nutrition recommendations:', error);
    res.status(500).json({ message: 'Failed to get nutrition recommendations' });
  }
});

// Route to access parent dashboard
router.get('/api/parent/access', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Access token is required' });
    }
    
    const parentAccess = await parentAccessService.getParentAccessByToken(token);
    
    if (!parentAccess || !parentAccess.active) {
      return res.status(403).json({ message: 'Invalid or expired access token' });
    }
    
    const athlete = await storage.getAthlete(parentAccess.athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    
    const user = await storage.getUser(athlete.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // For security, only send necessary athlete information
    const athleteData = {
      id: athlete.id,
      firstName: user.firstName,
      lastName: user.lastName,
      position: athlete.position,
      school: athlete.school,
      grade: athlete.grade,
      graduationYear: athlete.graduationYear,
    };
    
    res.json({
      parentAccess,
      athlete: athleteData,
    });
  } catch (error) {
    console.error('Error accessing parent dashboard:', error);
    res.status(500).json({ message: 'Failed to access parent dashboard' });
  }
});

export default router;