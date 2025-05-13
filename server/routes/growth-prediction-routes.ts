import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';

const router = Router();

// Schema for height prediction data
const heightPredictionSchema = z.object({
  predictedHeight: z.string(),
  predictedHeightCm: z.number(),
  percentComplete: z.number(),
  growthRemaining: z.number(),
  predictedRange: z.string(),
  recommendedPositions: z.array(z.string()),
  calculatedAt: z.string()
});

type HeightPredictionData = z.infer<typeof heightPredictionSchema>;

/**
 * Route to save height prediction data for an athlete
 * POST /api/athlete/:id/height-prediction
 */
router.post('/:id/height-prediction', async (req: Request, res: Response) => {
  try {
    // Verify authentication
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const athleteId = parseInt(req.params.id);
    if (isNaN(athleteId)) {
      return res.status(400).json({ message: 'Invalid athlete ID' });
    }

    // Validate request body
    const validationResult = heightPredictionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid height prediction data',
        errors: validationResult.error.errors 
      });
    }

    const predictionData: HeightPredictionData = validationResult.data;

    // If athlete exists, update their profile
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }

    // Check if user has permission (is the athlete or a coach/admin)
    if (req.user.id !== athlete.userId && req.user.userType !== 'coach' && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Update the athlete's growth prediction data
    await storage.updateAthlete(athleteId, {
      growthPrediction: {
        predictedHeight: predictionData.predictedHeight,
        predictedHeightCm: predictionData.predictedHeightCm,
        percentComplete: predictionData.percentComplete,
        growthRemaining: predictionData.growthRemaining,
        predictedRange: predictionData.predictedRange,
        recommendedPositions: predictionData.recommendedPositions,
        calculatedAt: new Date(predictionData.calculatedAt).toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

    res.status(200).json({ 
      message: 'Height prediction saved successfully',
      athleteId
    });
  } catch (error) {
    console.error('Error saving height prediction:', error);
    res.status(500).json({ message: 'Failed to save height prediction data' });
  }
});

/**
 * Route to get height prediction data for an athlete
 * GET /api/athlete/:id/height-prediction
 */
router.get('/:id/height-prediction', async (req: Request, res: Response) => {
  try {
    // Verify authentication
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const athleteId = parseInt(req.params.id);
    if (isNaN(athleteId)) {
      return res.status(400).json({ message: 'Invalid athlete ID' });
    }

    // Get athlete data
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }

    // Check if user has permission (is the athlete, a parent, or a coach/admin)
    if (req.user.id !== athlete.userId && req.user.userType !== 'coach' && req.user.userType !== 'admin') {
      // Check if user is a parent with access to this athlete
      if (req.user.userType === 'parent') {
        const isParent = await storage.getParentAthleteRelationshipsByAthleteId(athleteId)
          .then(relationships => relationships.some(r => r.parentId === req.user!.id));
        
        if (!isParent) {
          return res.status(403).json({ message: 'Permission denied' });
        }
      } else {
        return res.status(403).json({ message: 'Permission denied' });
      }
    }

    // Return the growth prediction data if it exists
    if (!athlete.growthPrediction) {
      return res.status(404).json({ message: 'No height prediction data found' });
    }

    res.status(200).json(athlete.growthPrediction);
  } catch (error) {
    console.error('Error retrieving height prediction:', error);
    res.status(500).json({ message: 'Failed to retrieve height prediction data' });
  }
});

export const growthPredictionRoutes = router;