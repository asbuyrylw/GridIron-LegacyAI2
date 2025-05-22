import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { insertAcademicAchievementSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// Get academic achievements
router.get('/', async (req, res, next) => {
  try {
    const athleteId = req.query.athleteId ? parseInt(req.query.athleteId as string) : null;
    
    if (!athleteId) {
      return res.status(400).json({ message: "Athlete ID is required" });
    }
    
    // For now, let's return mock academic achievements
    // In a production environment, this would fetch from a database
    const mockAchievements = [
      {
        id: 1,
        athleteId,
        title: 'Honor Roll',
        description: 'Achieved Honor Roll status for the Fall 2024 semester',
        date: '2024-12-15',
        type: 'honor',
        institution: 'Central High School',
        gpa: 3.8,
        isPublic: true,
      },
      {
        id: 2,
        athleteId,
        title: 'Academic Excellence Award',
        description: 'Recognized for outstanding achievement in Mathematics',
        date: '2024-11-10',
        type: 'award',
        institution: 'Central High School',
        isPublic: true,
      },
      {
        id: 3,
        athleteId,
        title: 'National Honor Society',
        description: 'Inducted into the National Honor Society',
        date: '2024-10-05',
        type: 'honor',
        institution: 'National Honor Society',
        isPublic: true,
      },
      {
        id: 4,
        athleteId,
        title: 'AP Scholar with Distinction',
        description: 'Earned an average score of 3.5 on all AP exams taken, and scores of 3 or higher on five or more of these exams',
        date: '2024-09-20',
        type: 'award',
        institution: 'College Board',
        isPublic: true,
      },
      {
        id: 5,
        athleteId,
        title: 'Student Leadership Award',
        description: 'Recognized for exceptional leadership in the classroom and school community',
        date: '2024-08-15',
        type: 'award',
        institution: 'Central High School',
        isPublic: true,
      }
    ];
    
    res.json(mockAchievements);
  } catch (error) {
    next(error);
  }
});

export default router;