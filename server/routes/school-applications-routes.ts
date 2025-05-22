import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

const router = Router();

// Middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// Get school applications
router.get('/', async (req, res, next) => {
  try {
    const athleteId = req.query.athleteId ? parseInt(req.query.athleteId as string) : null;
    
    // Return school applications data
    const mockApplications = [
      {
        id: 1,
        athleteId: athleteId || 1,
        schoolName: 'University of Michigan',
        division: 'D1',
        location: 'Ann Arbor, MI',
        deadline: '2025-01-15',
        applicationStatus: 'in_progress',
        notes: 'Need to complete essay section and get recommendation letter from Coach Smith',
        academicFit: 85,
        athleticFit: 75,
        priority: 'high',
        programsOfInterest: ['Business Administration', 'Sports Management'],
        submissionDate: null,
        decision: null,
        decisionDate: null,
        financialAidOffered: null
      },
      {
        id: 2,
        athleteId: athleteId || 1,
        schoolName: 'Ohio State University',
        division: 'D1',
        location: 'Columbus, OH',
        deadline: '2025-01-05',
        applicationStatus: 'submitted',
        notes: 'Application submitted on 11/20/2024. Waiting for decision.',
        academicFit: 80,
        athleticFit: 80,
        priority: 'high',
        programsOfInterest: ['Computer Science', 'Exercise Science'],
        submissionDate: '2024-11-20',
        decision: null,
        decisionDate: null,
        financialAidOffered: null
      },
      {
        id: 3,
        athleteId: athleteId || 1,
        schoolName: 'Stanford University',
        division: 'D1',
        location: 'Stanford, CA',
        deadline: '2024-12-01',
        applicationStatus: 'not_started',
        notes: 'Need to start application soon. Reach out to Coach Johnson for potential recruitment.',
        academicFit: 90,
        athleticFit: 65,
        priority: 'medium',
        programsOfInterest: ['Engineering', 'Economics'],
        submissionDate: null,
        decision: null,
        decisionDate: null,
        financialAidOffered: null
      },
      {
        id: 4,
        athleteId: athleteId || 1,
        schoolName: 'University of Notre Dame',
        division: 'D1',
        location: 'Notre Dame, IN',
        deadline: '2025-01-10',
        applicationStatus: 'in_progress',
        notes: 'Started application process. Scheduled campus visit for December 15.',
        academicFit: 85,
        athleticFit: 70,
        priority: 'high',
        programsOfInterest: ['Business', 'Psychology'],
        submissionDate: null,
        decision: null,
        decisionDate: null,
        financialAidOffered: null
      },
      {
        id: 5,
        athleteId: athleteId || 1,
        schoolName: 'Texas A&M University',
        division: 'D1',
        location: 'College Station, TX',
        deadline: '2025-02-01',
        applicationStatus: 'not_started',
        notes: 'Interested in their football program. Need to research more about academic offerings.',
        academicFit: 75,
        athleticFit: 85,
        priority: 'medium',
        programsOfInterest: ['Agriculture', 'Engineering'],
        submissionDate: null,
        decision: null,
        decisionDate: null,
        financialAidOffered: null
      }
    ];
    
    res.json(mockApplications);
  } catch (error) {
    next(error);
  }
});

// Future endpoints for application creation, update, delete would go here...

export default router;