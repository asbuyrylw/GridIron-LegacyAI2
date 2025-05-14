import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import {
  insertApplicationChecklistSchema,
  insertApplicationDocumentSchema,
  insertSchoolApplicationSchema,
  insertAcademicAchievementSchema,
  insertAthleteCounselorSchema
} from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// Middleware to check if the user is an athlete
const isAthlete = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user as any).userType === 'athlete') {
    return next();
  }
  res.status(403).json({ message: "Access denied. Athlete permission required." });
};

// Middleware to check if the user is accessing their own data
const isOwnData = async (req: Request, res: Response, next: NextFunction) => {
  const athleteId = parseInt(req.params.athleteId);
  if ((req.user as any)?.userType === 'athlete' && (req.user as any)?.athlete?.id !== athleteId) {
    return res.status(403).json({ message: 'Unauthorized to access this data' });
  }
  next();
};

// Application Checklist Routes
router.get('/checklist/:athleteId', isAuthenticated, isOwnData, async (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const checklist = await storage.getApplicationChecklist(athleteId);
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch checklist items', error });
  }
});

router.post('/checklist', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const validatedData = insertApplicationChecklistSchema.parse(req.body);
    const item = await storage.createApplicationChecklistItem(validatedData);
    res.status(201).json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid checklist data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create checklist item', error });
  }
});

router.put('/checklist/:id', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await storage.getApplicationChecklistItem(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Checklist item not found' });
    }
    
    // Check if the user owns the checklist item
    if ((req.user as any)?.athlete?.id !== item.athleteId) {
      return res.status(403).json({ message: 'Unauthorized to update this item' });
    }
    
    const validatedData = insertApplicationChecklistSchema.partial().parse(req.body);
    const updatedItem = await storage.updateApplicationChecklistItem(id, validatedData);
    res.json(updatedItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid checklist data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to update checklist item', error });
  }
});

router.delete('/checklist/:id', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await storage.getApplicationChecklistItem(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Checklist item not found' });
    }
    
    // Check if the user owns the checklist item
    if ((req.user as any)?.athlete?.id !== item.athleteId) {
      return res.status(403).json({ message: 'Unauthorized to delete this item' });
    }
    
    const result = await storage.deleteApplicationChecklistItem(id);
    if (result) {
      res.json({ message: 'Checklist item deleted successfully' });
    } else {
      res.status(404).json({ message: 'Checklist item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete checklist item', error });
  }
});

router.patch('/checklist/:id/complete', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await storage.getApplicationChecklistItem(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Checklist item not found' });
    }
    
    // Check if the user owns the checklist item
    if ((req.user as any)?.athlete?.id !== item.athleteId) {
      return res.status(403).json({ message: 'Unauthorized to update this item' });
    }
    
    const { completed } = req.body;
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Completed status must be a boolean' });
    }
    
    const updatedItem = await storage.markChecklistItemComplete(id, completed);
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update checklist item completion status', error });
  }
});

router.get('/checklist/upcoming/:athleteId/:days', isAuthenticated, isOwnData, async (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const days = parseInt(req.params.days);
    
    if (isNaN(days) || days <= 0) {
      return res.status(400).json({ message: 'Days parameter must be a positive number' });
    }
    
    const upcomingDeadlines = await storage.getUpcomingDeadlines(athleteId, days);
    res.json(upcomingDeadlines);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch upcoming deadlines', error });
  }
});

// Document Upload Routes
router.get('/documents/:athleteId', isAuthenticated, isOwnData, async (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const fileType = req.query.fileType as string | undefined;
    const documents = await storage.getApplicationDocuments(athleteId, fileType);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error });
  }
});

router.post('/documents', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const validatedData = insertApplicationDocumentSchema.parse(req.body);
    const document = await storage.createApplicationDocument(validatedData);
    res.status(201).json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid document data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create document', error });
  }
});

router.put('/documents/:id', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const document = await storage.getApplicationDocument(id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if the user owns the document
    if ((req.user as any)?.athlete?.id !== document.athleteId) {
      return res.status(403).json({ message: 'Unauthorized to update this document' });
    }
    
    const validatedData = insertApplicationDocumentSchema.partial().parse(req.body);
    const updatedDocument = await storage.updateApplicationDocument(id, validatedData);
    res.json(updatedDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid document data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to update document', error });
  }
});

router.delete('/documents/:id', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const document = await storage.getApplicationDocument(id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if the user owns the document
    if ((req.user as any)?.athlete?.id !== document.athleteId) {
      return res.status(403).json({ message: 'Unauthorized to delete this document' });
    }
    
    const result = await storage.deleteApplicationDocument(id);
    if (result) {
      res.json({ message: 'Document deleted successfully' });
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete document', error });
  }
});

// School Applications Routes
router.get('/applications/:athleteId', isAuthenticated, isOwnData, async (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const applications = await storage.getSchoolApplications(athleteId);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications', error });
  }
});

router.get('/applications/details/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const application = await storage.getSchoolApplication(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if the user owns the application
    if ((req.user as any)?.userType === 'athlete' && (req.user as any)?.athlete?.id !== application.athleteId) {
      return res.status(403).json({ message: 'Unauthorized to view this application' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch application details', error });
  }
});

router.post('/applications', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const validatedData = insertSchoolApplicationSchema.parse(req.body);
    const application = await storage.createSchoolApplication(validatedData);
    res.status(201).json(application);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid application data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create application', error });
  }
});

router.put('/applications/:id', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const application = await storage.getSchoolApplication(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if the user owns the application
    if ((req.user as any)?.athlete?.id !== application.athleteId) {
      return res.status(403).json({ message: 'Unauthorized to update this application' });
    }
    
    const validatedData = insertSchoolApplicationSchema.partial().parse(req.body);
    const updatedApplication = await storage.updateSchoolApplication(id, validatedData);
    res.json(updatedApplication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid application data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to update application', error });
  }
});

router.delete('/applications/:id', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const application = await storage.getSchoolApplication(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if the user owns the application
    if ((req.user as any)?.athlete?.id !== application.athleteId) {
      return res.status(403).json({ message: 'Unauthorized to delete this application' });
    }
    
    const result = await storage.deleteSchoolApplication(id);
    if (result) {
      res.json({ message: 'Application deleted successfully' });
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete application', error });
  }
});

// Academic Achievements Routes
router.get('/achievements/:athleteId', isAuthenticated, isOwnData, async (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const achievements = await storage.getAcademicAchievements(athleteId);
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch academic achievements', error });
  }
});

router.get('/achievements/public/:athleteId', async (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const achievements = await storage.getPublicAcademicAchievements(athleteId);
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch public academic achievements', error });
  }
});

router.post('/achievements', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const validatedData = insertAcademicAchievementSchema.parse(req.body);
    const achievement = await storage.createAcademicAchievement(validatedData);
    res.status(201).json(achievement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid achievement data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create academic achievement', error });
  }
});

router.put('/achievements/:id', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const achievement = await storage.getAcademicAchievement(id);
    
    if (!achievement) {
      return res.status(404).json({ message: 'Academic achievement not found' });
    }
    
    // Check if the user owns the achievement
    if ((req.user as any)?.athlete?.id !== achievement.athleteId) {
      return res.status(403).json({ message: 'Unauthorized to update this achievement' });
    }
    
    const validatedData = insertAcademicAchievementSchema.partial().parse(req.body);
    const updatedAchievement = await storage.updateAcademicAchievement(id, validatedData);
    res.json(updatedAchievement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid achievement data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to update academic achievement', error });
  }
});

router.delete('/achievements/:id', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const achievement = await storage.getAcademicAchievement(id);
    
    if (!achievement) {
      return res.status(404).json({ message: 'Academic achievement not found' });
    }
    
    // Check if the user owns the achievement
    if ((req.user as any)?.athlete?.id !== achievement.athleteId) {
      return res.status(403).json({ message: 'Unauthorized to delete this achievement' });
    }
    
    const result = await storage.deleteAcademicAchievement(id);
    if (result) {
      res.json({ message: 'Academic achievement deleted successfully' });
    } else {
      res.status(404).json({ message: 'Academic achievement not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete academic achievement', error });
  }
});

// Counselor Routes
router.get('/counselors', isAuthenticated, async (req, res) => {
  try {
    const counselors = await storage.getCounselors();
    res.json(counselors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch counselors', error });
  }
});

router.get('/athlete-counselors/:athleteId', isAuthenticated, isOwnData, async (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const relationships = await storage.getAthleteCounselors(athleteId);
    res.json(relationships);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch athlete-counselor relationships', error });
  }
});

router.post('/athlete-counselors', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const validatedData = insertAthleteCounselorSchema.parse(req.body);
    
    // Verify the athlete ID matches the current user
    if ((req.user as any)?.athlete?.id !== validatedData.athleteId) {
      return res.status(403).json({ message: 'Unauthorized to create this relationship' });
    }
    
    const relationship = await storage.createAthleteCounselor(validatedData);
    res.status(201).json(relationship);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create athlete-counselor relationship', error });
  }
});

router.delete('/athlete-counselors/:id', isAuthenticated, isAthlete, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get all athlete-counselor relationships for the current athlete
    const relationships = await storage.getAthleteCounselors((req.user as any).athlete?.id);
    const relationship = relationships.find(r => r.id === id);
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    // Check if the user is the athlete in the relationship
    if ((req.user as any).athlete?.id !== relationship.athleteId) {
      return res.status(403).json({ message: 'Unauthorized to delete this relationship' });
    }
    
    const result = await storage.deleteAthleteCounselor(id);
    if (result) {
      res.json({ message: 'Athlete-counselor relationship removed successfully' });
    } else {
      res.status(404).json({ message: 'Relationship not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove athlete-counselor relationship', error });
  }
});

export default router;