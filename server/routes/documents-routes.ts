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

// Get documents
router.get('/', async (req, res, next) => {
  try {
    const athleteId = req.query.athleteId ? parseInt(req.query.athleteId as string) : null;
    
    // For now, let's return mock documents
    // In a production environment, this would fetch from a database
    const mockDocuments = [
      {
        id: 1,
        athleteId: athleteId || 1,
        title: 'Official Transcript',
        filename: 'official_transcript_2025.pdf',
        fileType: 'application/pdf',
        uploadDate: '2024-10-15',
        fileSize: 1240000,
        url: '/documents/transcript.pdf',
        category: 'transcript'
      },
      {
        id: 2,
        athleteId: athleteId || 1,
        title: 'SAT Score Report',
        filename: 'sat_score_2025.pdf',
        fileType: 'application/pdf',
        uploadDate: '2024-09-20',
        fileSize: 890000,
        url: '/documents/sat_score.pdf',
        category: 'test_scores'
      },
      {
        id: 3,
        athleteId: athleteId || 1,
        title: 'Recommendation Letter - Coach Smith',
        filename: 'coach_recommendation.pdf',
        fileType: 'application/pdf',
        uploadDate: '2024-11-05',
        fileSize: 780000,
        url: '/documents/rec_letter_coach.pdf',
        category: 'letters'
      },
      {
        id: 4,
        athleteId: athleteId || 1,
        title: 'Game Highlights Screenshot',
        filename: 'game_highlights.png',
        fileType: 'image/png',
        uploadDate: '2024-10-30',
        fileSize: 2450000,
        url: '/documents/game_highlights.png',
        category: 'athletics'
      },
      {
        id: 5,
        athleteId: athleteId || 1,
        title: 'College Essay Draft',
        filename: 'college_essay_draft.docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadDate: '2024-11-10',
        fileSize: 350000,
        url: '/documents/essay_draft.docx',
        category: 'essays'
      }
    ];
    
    res.json(mockDocuments);
  } catch (error) {
    next(error);
  }
});

// Future endpoints for document upload, update, delete would go here...

export default router;