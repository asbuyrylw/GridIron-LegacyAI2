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
  parentIds: z.array(z.number()),
  reportType: z.enum(['full', 'summary']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  sections: z.array(z.string()),
  recurring: z.boolean(),
  recurringFrequency: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
});

// Schema for shopping list request
const shoppingListSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    quantity: z.string().optional(),
    selected: z.boolean(),
  })),
  parentIds: z.array(z.number()),
});

// Helper function to validate athlete access
async function validateAthleteAccess(req: Request, athleteId: number): Promise<boolean> {
  if (!req.session || !req.session.userId) return false;
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) return false;
    
    // If admin, grant access
    if (user.userType === 'admin') return true;
    
    // If athlete, check if it's their own data
    if (user.userType === 'athlete') {
      const athlete = await storage.getAthlete(athleteId);
      return athlete?.userId === user.id;
    }
    
    // If coach, check if athlete is on their team
    if (user.userType === 'coach') {
      const coach = await storage.getCoach(user.id);
      if (!coach) return false;
      
      const teams = await storage.getTeams({ coachId: coach.id });
      if (!teams.length) return false;
      
      // Check if athlete is on any of coach's teams
      for (const team of teams) {
        const members = await storage.getTeamMembers(team.id);
        if (members.some(member => member.athleteId === athleteId)) {
          return true;
        }
      }
    }
    
    // If parent, check if they have a relationship with the athlete
    if (user.userType === 'parent') {
      const parent = await storage.getParent(user.id);
      if (!parent) return false;
      
      const relationships = await storage.getParentAthleteRelationships(parent.id);
      return relationships.some((relationship: any) => relationship.athleteId === athleteId);
    }
    
    return false;
  } catch (error) {
    console.error('Error validating athlete access:', error);
    return false;
  }
}

// Helper function to get parents eligible to receive athlete information
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
    res.json({ parents: parentAccesses });
  } catch (error) {
    console.error('Error getting parent access list:', error);
    res.status(500).json({ message: 'Failed to retrieve parent access list' });
  }
});

// Route to create a parent invitation
router.post('/api/athlete/parent-invite', async (req: Request, res: Response) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { athleteId, email, name, relationship } = req.body;
    
    if (!athleteId || !email || !name || !relationship) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if user has access to this athlete
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to invite parents for this athlete' });
    }
    
    // Get athlete
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    
    // Check if parent already has access
    const existingAccess = await parentAccessService.getParentAccessByEmail(email, athleteId);
    if (existingAccess) {
      if (existingAccess.active) {
        return res.status(400).json({ message: 'This parent already has access' });
      } else {
        // Reactivate the existing access
        await parentAccessService.updateParentAccess(existingAccess.id, { active: true });
        return res.json({ success: true, message: 'Parent access has been reactivated' });
      }
    }
    
    // Create new parent access invitation
    const invite = {
      athleteId, 
      email, 
      name, 
      relationship,
      receiveUpdates: true, // default to true for receiving updates
      receiveNutritionInfo: true, // default to true for nutrition info
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
    };
    
    const parentAccess = await parentAccessService.inviteParent(invite);
    
    res.json({ 
      success: true, 
      message: 'Parent invitation sent successfully',
      parentAccess
    });
  } catch (error) {
    console.error('Error inviting parent:', error);
    res.status(500).json({ message: 'Failed to send parent invitation' });
  }
});

// Route to update parent access
router.patch('/api/athlete/:athleteId/parent-access/:id', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const accessId = parseInt(req.params.id);
    
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to modify parent access for this athlete' });
    }
    
    const updates = req.body;
    // Only allow certain fields to be updated
    const allowedUpdates = ['active', 'receiveUpdates', 'receiveNutritionInfo'];
    Object.keys(updates).forEach(key => {
      if (!allowedUpdates.includes(key)) {
        delete updates[key];
      }
    });
    
    const parentAccess = await parentAccessService.updateParentAccess(accessId, updates);
    if (!parentAccess) {
      return res.status(404).json({ message: 'Parent access record not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Parent access updated successfully',
      parentAccess
    });
  } catch (error) {
    console.error('Error updating parent access:', error);
    res.status(500).json({ message: 'Failed to update parent access' });
  }
});

// Route to delete/deactivate parent access
router.delete('/api/athlete/:athleteId/parent-access/:id', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const accessId = parseInt(req.params.id);
    
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to modify parent access for this athlete' });
    }
    
    const success = await parentAccessService.deactivateParentAccess(accessId);
    if (!success) {
      return res.status(404).json({ message: 'Parent access record not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Parent access revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking parent access:', error);
    res.status(500).json({ message: 'Failed to revoke parent access' });
  }
});

// Route to send parent report
router.post('/api/athlete/:athleteId/parent-report', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to send reports for this athlete' });
    }
    
    // Validate request body
    const validationResult = parentReportSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid report data', 
        errors: validationResult.error.errors 
      });
    }
    
    const reportData = validationResult.data;
    
    // Fetch athlete data
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    
    // Generate report data
    const reportContent: any = {
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      dateRange: {
        start: new Date(reportData.startDate).toLocaleDateString(),
        end: new Date(reportData.endDate).toLocaleDateString(),
      },
      reportType: reportData.reportType,
      sections: {}
    };
    
    // Include sections based on selection
    if (reportData.sections.includes('performance')) {
      // Get performance metrics
      const metrics = await storage.getCombineMetrics(athleteId);
      
      reportContent.sections.performance = {
        title: 'Performance Metrics',
        metrics: metrics || {},
      };
    }
    
    if (reportData.sections.includes('training')) {
      // Get training data
      const sessions = await storage.getAthleteWorkoutSessions(athleteId);
      const plans = await storage.getAthleteTrainingPlans(athleteId);
      
      reportContent.sections.training = {
        title: 'Training Summary',
        sessions: sessions || [],
        plans: plans || [],
      };
    }
    
    if (reportData.sections.includes('nutrition')) {
      // Get nutrition data
      const nutritionPlans = await storage.getAthleteNutritionPlans(athleteId);
      
      reportContent.sections.nutrition = {
        title: 'Nutrition Overview',
        plans: nutritionPlans?.map(plan => ({
          title: plan.title,
          goals: plan.goals,
          startDate: plan.startDate,
        })) || [],
      };
    }
    
    if (reportData.sections.includes('academics')) {
      // Get academic data
      reportContent.sections.academics = {
        title: 'Academic Progress',
        school: athlete.school,
        grade: athlete.grade,
        gpa: athlete.gpa,
        actScore: athlete.actScore,
      };
    }
    
    if (reportData.sections.includes('achievements')) {
      // Get achievements data
      const achievements = await storage.getAthleteAchievements(athleteId);
      
      reportContent.sections.achievements = {
        title: 'Recent Achievements',
        achievements: achievements || [],
      };
    }
    
    if (reportData.sections.includes('upcoming')) {
      // Get upcoming events
      const athleteTeams = await storage.getTeamMembershipsByAthlete(athleteId);
      const upcomingEvents = [];
      
      for (const team of athleteTeams) {
        const events = await storage.getTeamEvents(team.teamId, { upcoming: true });
        upcomingEvents.push(...events);
      }
      
      reportContent.sections.upcoming = {
        title: 'Upcoming Events',
        events: upcomingEvents,
      };
    }
    
    if (reportData.sections.includes('recommendations')) {
      // Include coach recommendations
      reportContent.sections.recommendations = {
        title: 'Coach Recommendations',
        recommendations: [
          'Continue focusing on improving 40-yard dash time',
          'Work on catching technique during practice',
          'Maintain consistent sleep schedule for recovery',
        ],
      };
    }
    
    // Set up recurring reports if requested
    if (reportData.recurring) {
      // Store recurring report schedule in database
      // This is just a placeholder; actual implementation would depend on your scheduling system
      console.log(`Scheduled recurring ${reportData.recurringFrequency} report for athlete ${athleteId}`);
    }
    
    // Send reports to selected parents
    const successfulSends = [];
    const failedSends = [];
    
    for (const parentId of reportData.parentIds) {
      try {
        const parentAccess = await parentAccessService.getParentAccessById(parentId);
        if (!parentAccess || !parentAccess.active) {
          failedSends.push({
            parentId,
            reason: "Parent does not have active access"
          });
          continue;
        }
        
        // Send email with report
        const emailSuccess = await emailService.sendNotification(
          EmailNotificationType.PERFORMANCE_REPORT,
          parentAccess.email,
          parentAccess.name,
          `${athlete.firstName} ${athlete.lastName}`,
          reportContent
        );
        
        if (emailSuccess) {
          successfulSends.push(parentId);
        } else {
          failedSends.push({
            parentId,
            reason: "Email delivery failed"
          });
        }
      } catch (error) {
        console.error(`Error sending report to parent ${parentId}:`, error);
        failedSends.push({
          parentId,
          reason: "Error processing report"
        });
      }
    }
    
    res.json({
      success: true,
      message: `Report sent to ${successfulSends.length} parents`,
      successfulSends,
      failedSends,
      reportContent: reportData.reportType === 'summary' ? null : reportContent,
    });
  } catch (error) {
    console.error('Error generating parent report:', error);
    res.status(500).json({ message: 'Failed to generate and send parent report' });
  }
});

// Route to send nutrition shopping list
router.post('/api/athlete/:athleteId/nutrition/shopping-list', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to send shopping lists for this athlete' });
    }
    
    // Validate request body
    const validationResult = shoppingListSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid shopping list data', 
        errors: validationResult.error.errors 
      });
    }
    
    const { items, parentIds } = validationResult.data;
    
    // Filter only selected items
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      return res.status(400).json({ message: 'No items selected for the shopping list' });
    }
    
    // Fetch athlete data
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    
    // Get active nutrition plan info
    const nutritionPlans = await storage.getAthleteNutritionPlans(athleteId);
    const activePlan = nutritionPlans?.find(plan => plan.active) || nutritionPlans?.[0];
    
    // Format shopping list
    const shoppingListData = {
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      planTitle: activePlan?.title || 'Nutrition Plan',
      date: new Date().toLocaleDateString(),
      categories: {} as Record<string, any[]>,
    };
    
    // Group items by category
    selectedItems.forEach(item => {
      if (!shoppingListData.categories[item.category]) {
        shoppingListData.categories[item.category] = [];
      }
      shoppingListData.categories[item.category].push({
        name: item.name,
        quantity: item.quantity || '',
      });
    });
    
    // Send shopping list to selected parents
    const successfulSends = [];
    const failedSends = [];
    
    for (const parentId of parentIds) {
      try {
        const parentAccess = await parentAccessService.getParentAccessById(parentId);
        if (!parentAccess || !parentAccess.active || !parentAccess.receiveNutritionInfo) {
          failedSends.push({
            parentId,
            reason: "Parent does not have active access or nutrition updates enabled"
          });
          continue;
        }
        
        // Format items list for email
        const itemsList = selectedItems.map(item => {
          return `${item.name}${item.quantity ? ` (${item.quantity})` : ''}`;
        });
        
        // Send email with shopping list
        const emailSuccess = await emailService.sendNutritionShoppingList(
          parentAccess.email,
          parentAccess.name,
          `${athlete.firstName} ${athlete.lastName}`,
          itemsList
        );
        
        if (emailSuccess) {
          successfulSends.push(parentId);
        } else {
          failedSends.push({
            parentId,
            reason: "Email delivery failed"
          });
        }
      } catch (error) {
        console.error(`Error sending shopping list to parent ${parentId}:`, error);
        failedSends.push({
          parentId,
          reason: "Error processing shopping list"
        });
      }
    }
    
    res.json({
      success: true,
      message: `Shopping list sent to ${successfulSends.length} parents`,
      successfulSends,
      failedSends,
    });
  } catch (error) {
    console.error('Error sending nutrition shopping list:', error);
    res.status(500).json({ message: 'Failed to send nutrition shopping list' });
  }
});

// Route to get nutrition recommendations
router.get('/api/athlete/:athleteId/nutrition/recommendations', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access nutrition data for this athlete' });
    }
    
    // Get athlete
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    
    // Generate sample recommendations based on athlete position
    const recommendations = {
      position: athlete.position,
      grade: athlete.grade,
      items: [
        { name: 'Chicken Breast', category: 'Proteins', quantity: '3 lbs' },
        { name: 'Salmon', category: 'Proteins', quantity: '1 lb' },
        { name: 'Greek Yogurt', category: 'Dairy', quantity: '32 oz container' },
        { name: 'Eggs', category: 'Proteins', quantity: '1 dozen' },
        { name: 'Spinach', category: 'Vegetables', quantity: '1 large bag' },
        { name: 'Broccoli', category: 'Vegetables', quantity: '2 bunches' },
        { name: 'Sweet Potatoes', category: 'Carbohydrates', quantity: '3 medium' },
        { name: 'Brown Rice', category: 'Carbohydrates', quantity: '2 lb bag' },
        { name: 'Quinoa', category: 'Carbohydrates', quantity: '1 lb bag' },
        { name: 'Bananas', category: 'Fruits', quantity: '1 bunch' },
        { name: 'Blueberries', category: 'Fruits', quantity: '1 pint' },
        { name: 'Avocados', category: 'Healthy Fats', quantity: '3 medium' },
        { name: 'Olive Oil', category: 'Healthy Fats', quantity: '1 bottle' },
        { name: 'Almonds', category: 'Nuts & Seeds', quantity: '1 bag' },
        { name: 'Protein Powder', category: 'Supplements', quantity: '1 container' }
      ]
    };
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting nutrition recommendations:', error);
    res.status(500).json({ message: 'Failed to get nutrition recommendations' });
  }
});

// Note: Parent dashboard token access endpoint has been removed.
// Parents now receive all updates exclusively via email, eliminating the need
// for a dashboard login or token-based access.

export { router };