import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { 
  insertCoachEvaluationSchema, 
  insertEvaluationTemplateSchema,
  insertDepthChartSchema,
  insertDepthChartPositionSchema,
  insertDepthChartEntrySchema
} from '@shared/schema';

export const router = Router();

// Middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// Middleware to check if the user is a coach
const isCoach = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user as any).userType === 'coach') {
    return next();
  }
  res.status(403).json({ message: "Access denied. Coach permission required." });
};

// Middleware to check if the user is authenticated and is a coach
const coachGuard = [isAuthenticated, isCoach];

// ========== COACH EVALUATION ROUTES ==========

// Get all evaluation templates
router.get('/templates', isAuthenticated, async (req, res) => {
  try {
    const templates = await storage.getEvaluationTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching evaluation templates:', error);
    res.status(500).json({ message: 'Failed to fetch evaluation templates' });
  }
});

// Get evaluation template by position
router.get('/templates/:position', isAuthenticated, async (req, res) => {
  try {
    const position = req.params.position;
    const template = await storage.getEvaluationTemplateByPosition(position);
    
    if (!template) {
      return res.status(404).json({ message: 'Evaluation template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching evaluation template:', error);
    res.status(500).json({ message: 'Failed to fetch evaluation template' });
  }
});

// Create a new evaluation template (coach only)
router.post('/templates', coachGuard, async (req, res) => {
  try {
    const templateData = insertEvaluationTemplateSchema.parse(req.body);
    const newTemplate = await storage.createEvaluationTemplate(templateData);
    res.status(201).json(newTemplate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid template data', errors: error.errors });
    }
    console.error('Error creating evaluation template:', error);
    res.status(500).json({ message: 'Failed to create evaluation template' });
  }
});

// Update an existing evaluation template (coach only)
router.put('/templates/:id', coachGuard, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid template ID' });
    }
    
    const templateData = insertEvaluationTemplateSchema.partial().parse(req.body);
    const updatedTemplate = await storage.updateEvaluationTemplate(id, templateData);
    
    if (!updatedTemplate) {
      return res.status(404).json({ message: 'Evaluation template not found' });
    }
    
    res.json(updatedTemplate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid template data', errors: error.errors });
    }
    console.error('Error updating evaluation template:', error);
    res.status(500).json({ message: 'Failed to update evaluation template' });
  }
});

// Get evaluations with optional filters
router.get('/evaluations', isAuthenticated, async (req, res) => {
  try {
    const { athleteId, coachId, season, position } = req.query;
    
    const filters: {
      athleteId?: number;
      coachId?: number;
      season?: string;
      position?: string;
    } = {};
    
    if (athleteId) filters.athleteId = parseInt(athleteId as string);
    if (coachId) filters.coachId = parseInt(coachId as string);
    if (season) filters.season = season as string;
    if (position) filters.position = position as string;
    
    const evaluations = await storage.getCoachEvaluations(filters);
    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ message: 'Failed to fetch evaluations' });
  }
});

// Get a specific evaluation by ID
router.get('/evaluations/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid evaluation ID' });
    }
    
    const evaluation = await storage.getCoachEvaluationById(id);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    res.status(500).json({ message: 'Failed to fetch evaluation' });
  }
});

// Create a new evaluation (coach only)
router.post('/evaluations', coachGuard, async (req, res) => {
  try {
    // Add coach ID from authenticated user
    const coachId = (req.user as any).id;
    const evaluationData = insertCoachEvaluationSchema.parse({
      ...req.body,
      coachId
    });
    
    const newEvaluation = await storage.createCoachEvaluation(evaluationData);
    res.status(201).json(newEvaluation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid evaluation data', errors: error.errors });
    }
    console.error('Error creating evaluation:', error);
    res.status(500).json({ message: 'Failed to create evaluation' });
  }
});

// Update an existing evaluation (coach only)
router.put('/evaluations/:id', coachGuard, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid evaluation ID' });
    }
    
    const evaluationData = insertCoachEvaluationSchema.partial().parse(req.body);
    const updatedEvaluation = await storage.updateCoachEvaluation(id, evaluationData);
    
    if (!updatedEvaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    res.json(updatedEvaluation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid evaluation data', errors: error.errors });
    }
    console.error('Error updating evaluation:', error);
    res.status(500).json({ message: 'Failed to update evaluation' });
  }
});

// Delete an evaluation (coach only)
router.delete('/evaluations/:id', coachGuard, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid evaluation ID' });
    }
    
    const deleted = await storage.deleteCoachEvaluation(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    res.json({ message: 'Evaluation deleted successfully' });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    res.status(500).json({ message: 'Failed to delete evaluation' });
  }
});

// ========== DEPTH CHART ROUTES ==========

// Get all depth charts with optional filters
router.get('/depth-charts', isAuthenticated, async (req, res) => {
  try {
    const { teamId, createdBy, isActive } = req.query;
    
    const filters: {
      teamId?: number;
      createdBy?: number;
      isActive?: boolean;
    } = {};
    
    if (teamId) filters.teamId = parseInt(teamId as string);
    if (createdBy) filters.createdBy = parseInt(createdBy as string);
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    const depthCharts = await storage.getDepthCharts(filters);
    res.json(depthCharts);
  } catch (error) {
    console.error('Error fetching depth charts:', error);
    res.status(500).json({ message: 'Failed to fetch depth charts' });
  }
});

// Get a specific depth chart by ID
router.get('/depth-charts/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid depth chart ID' });
    }
    
    const depthChart = await storage.getDepthChartById(id);
    
    if (!depthChart) {
      return res.status(404).json({ message: 'Depth chart not found' });
    }
    
    res.json(depthChart);
  } catch (error) {
    console.error('Error fetching depth chart:', error);
    res.status(500).json({ message: 'Failed to fetch depth chart' });
  }
});

// Create a new depth chart (coach only)
router.post('/depth-charts', coachGuard, async (req, res) => {
  try {
    // Add created by from authenticated user
    const createdBy = (req.user as any).id;
    const depthChartData = insertDepthChartSchema.parse({
      ...req.body,
      createdBy
    });
    
    const newDepthChart = await storage.createDepthChart(depthChartData);
    res.status(201).json(newDepthChart);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid depth chart data', errors: error.errors });
    }
    console.error('Error creating depth chart:', error);
    res.status(500).json({ message: 'Failed to create depth chart' });
  }
});

// Update an existing depth chart (coach only)
router.put('/depth-charts/:id', coachGuard, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid depth chart ID' });
    }
    
    const depthChartData = insertDepthChartSchema.partial().parse(req.body);
    const updatedDepthChart = await storage.updateDepthChart(id, depthChartData);
    
    if (!updatedDepthChart) {
      return res.status(404).json({ message: 'Depth chart not found' });
    }
    
    res.json(updatedDepthChart);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid depth chart data', errors: error.errors });
    }
    console.error('Error updating depth chart:', error);
    res.status(500).json({ message: 'Failed to update depth chart' });
  }
});

// Delete a depth chart (coach only)
router.delete('/depth-charts/:id', coachGuard, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid depth chart ID' });
    }
    
    const deleted = await storage.deleteDepthChart(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Depth chart not found' });
    }
    
    res.json({ message: 'Depth chart deleted successfully' });
  } catch (error) {
    console.error('Error deleting depth chart:', error);
    res.status(500).json({ message: 'Failed to delete depth chart' });
  }
});

// Get positions for a depth chart
router.get('/depth-charts/:id/positions', isAuthenticated, async (req, res) => {
  try {
    const depthChartId = parseInt(req.params.id);
    if (isNaN(depthChartId)) {
      return res.status(400).json({ message: 'Invalid depth chart ID' });
    }
    
    const positions = await storage.getDepthChartPositions(depthChartId);
    res.json(positions);
  } catch (error) {
    console.error('Error fetching depth chart positions:', error);
    res.status(500).json({ message: 'Failed to fetch depth chart positions' });
  }
});

// Add a position to a depth chart (coach only)
router.post('/depth-charts/:id/positions', coachGuard, async (req, res) => {
  try {
    const depthChartId = parseInt(req.params.id);
    if (isNaN(depthChartId)) {
      return res.status(400).json({ message: 'Invalid depth chart ID' });
    }
    
    const positionData = insertDepthChartPositionSchema.parse({
      ...req.body,
      depthChartId
    });
    
    const newPosition = await storage.createDepthChartPosition(positionData);
    res.status(201).json(newPosition);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid position data', errors: error.errors });
    }
    console.error('Error adding position to depth chart:', error);
    res.status(500).json({ message: 'Failed to add position to depth chart' });
  }
});

// Update a position (coach only)
router.put('/positions/:id', coachGuard, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid position ID' });
    }
    
    const positionData = insertDepthChartPositionSchema.partial().parse(req.body);
    const updatedPosition = await storage.updateDepthChartPosition(id, positionData);
    
    if (!updatedPosition) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.json(updatedPosition);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid position data', errors: error.errors });
    }
    console.error('Error updating position:', error);
    res.status(500).json({ message: 'Failed to update position' });
  }
});

// Delete a position (coach only)
router.delete('/positions/:id', coachGuard, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid position ID' });
    }
    
    const deleted = await storage.deleteDepthChartPosition(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.json({ message: 'Position and associated entries deleted successfully' });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ message: 'Failed to delete position' });
  }
});

// Get entries for a position
router.get('/positions/:id/entries', isAuthenticated, async (req, res) => {
  try {
    const positionId = parseInt(req.params.id);
    if (isNaN(positionId)) {
      return res.status(400).json({ message: 'Invalid position ID' });
    }
    
    const entries = await storage.getDepthChartEntries(positionId);
    res.json(entries);
  } catch (error) {
    console.error('Error fetching depth chart entries:', error);
    res.status(500).json({ message: 'Failed to fetch depth chart entries' });
  }
});

// Get all depth chart entries for an athlete
router.get('/athletes/:id/depth-chart-entries', isAuthenticated, async (req, res) => {
  try {
    const athleteId = parseInt(req.params.id);
    if (isNaN(athleteId)) {
      return res.status(400).json({ message: 'Invalid athlete ID' });
    }
    
    const entries = await storage.getDepthChartEntriesByAthlete(athleteId);
    res.json(entries);
  } catch (error) {
    console.error('Error fetching athlete depth chart entries:', error);
    res.status(500).json({ message: 'Failed to fetch athlete depth chart entries' });
  }
});

// Add an entry to a position (coach only)
router.post('/positions/:id/entries', coachGuard, async (req, res) => {
  try {
    const positionId = parseInt(req.params.id);
    if (isNaN(positionId)) {
      return res.status(400).json({ message: 'Invalid position ID' });
    }
    
    const entryData = insertDepthChartEntrySchema.parse({
      ...req.body,
      positionId
    });
    
    const newEntry = await storage.createDepthChartEntry(entryData);
    res.status(201).json(newEntry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid entry data', errors: error.errors });
    }
    console.error('Error adding entry to position:', error);
    res.status(500).json({ message: 'Failed to add entry to position' });
  }
});

// Update an entry (coach only)
router.put('/entries/:id', coachGuard, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }
    
    const entryData = insertDepthChartEntrySchema.partial().parse(req.body);
    const updatedEntry = await storage.updateDepthChartEntry(id, entryData);
    
    if (!updatedEntry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    res.json(updatedEntry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid entry data', errors: error.errors });
    }
    console.error('Error updating entry:', error);
    res.status(500).json({ message: 'Failed to update entry' });
  }
});

// Delete an entry (coach only)
router.delete('/entries/:id', coachGuard, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }
    
    const deleted = await storage.deleteDepthChartEntry(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ message: 'Failed to delete entry' });
  }
});

export default router;