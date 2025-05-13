import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { heightPredictionSchema, type GrowthPrediction } from "@shared/schema";
import { z } from "zod";
import { emailService } from "../email-service";
import { fromZodError } from "zod-validation-error";

const router = Router();

/**
 * Height prediction type from form input
 */
type HeightPredictionData = z.infer<typeof heightPredictionSchema>;

/**
 * Route to save height prediction data for an athlete
 * POST /api/athlete/:id/height-prediction
 */
router.post('/:id/height-prediction', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const athleteId = parseInt(req.params.id);
    
    // Check if user has permission to update this athlete's data
    const isOwnProfile = req.user?.id === athleteId;
    const isCoach = req.user?.userType === 'coach';
    const isParent = req.user?.userType === 'parent';
    
    // Get athlete by ID for athletes parented by this parent
    let hasPermission = isOwnProfile || isCoach;
    
    if (isParent) {
      // Check if parent has relationship with this athlete
      const parentId = req.user.id;
      const relationships = await storage.getParentAthleteRelationships({ parentId });
      const athleteIds = relationships.map(r => r.athleteId);
      
      hasPermission = athleteIds.includes(athleteId);
    }
    
    if (!hasPermission) {
      return res.status(403).json({ message: "Not authorized to update this athlete's data" });
    }
    
    // Validate the request body
    const validationResult = heightPredictionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid height prediction data",
        errors: fromZodError(validationResult.error).message
      });
    }
    
    const predictionData: HeightPredictionData = validationResult.data;
    
    // Get athlete to update
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: "Athlete not found" });
    }
    
    // Create growth prediction object
    const growthPrediction: GrowthPrediction = {
      predictedHeight: req.body.predictedHeight,
      predictedHeightCm: req.body.predictedHeightCm,
      percentComplete: req.body.percentComplete,
      growthRemaining: req.body.growthRemaining,
      predictedRange: req.body.predictedRange,
      recommendedPositions: req.body.recommendedPositions,
      calculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update athlete with growth prediction
    await storage.updateAthlete(athleteId, {
      growthPrediction: growthPrediction
    });
    
    // Get updated athlete
    const updatedAthlete = await storage.getAthlete(athleteId);
    
    // If user is an athlete, check if they have parents who should be notified
    if (isOwnProfile) {
      try {
        const relationships = await storage.getParentAthleteRelationships({ athleteId });
        const parentsToNotify = relationships.map(r => r.parentId);
        
        for (const parentId of parentsToNotify) {
          const parent = await storage.getParent(parentId);
          const parentUser = await storage.getUser(parent.userId);
          
          if (parent && parentUser && parentUser.email) {
            // Notify parent about the updated growth prediction
            await emailService.sendEmail({
              to: parentUser.email,
              from: "notifications@gridironlegacyai.com",
              subject: `${athlete.firstName}'s Growth Prediction Updated`,
              text: `
                Hello ${parent.firstName},
                
                ${athlete.firstName} has updated their growth prediction information in GridIron LegacyAI.
                
                Current stats:
                - Current Height: ${req.body.currentHeight} inches
                - Current Weight: ${req.body.currentWeight} pounds
                
                Prediction results:
                - Predicted Adult Height: ${athlete.growthPrediction?.predictedHeight}
                - Growth Progress: ${athlete.growthPrediction?.percentComplete}% complete
                - Recommended Positions: ${athlete.growthPrediction?.recommendedPositions.join(', ')}
                
                You can view more details by logging into your parent dashboard.
                
                Best,
                GridIron LegacyAI Team
              `,
              html: `
                <h2>Growth Prediction Update</h2>
                <p>Hello ${parent.firstName},</p>
                <p>${athlete.firstName} has updated their growth prediction information in GridIron LegacyAI.</p>
                
                <h3>Current Stats:</h3>
                <ul>
                  <li><strong>Current Height:</strong> ${req.body.currentHeight} inches</li>
                  <li><strong>Current Weight:</strong> ${req.body.currentWeight} pounds</li>
                </ul>
                
                <h3>Prediction Results:</h3>
                <ul>
                  <li><strong>Predicted Adult Height:</strong> ${athlete.growthPrediction?.predictedHeight}</li>
                  <li><strong>Growth Progress:</strong> ${athlete.growthPrediction?.percentComplete}% complete</li>
                  <li><strong>Recommended Positions:</strong> ${athlete.growthPrediction?.recommendedPositions.join(', ')}</li>
                </ul>
                
                <p>You can view more details by logging into your parent dashboard.</p>
                
                <p>Best,<br>GridIron LegacyAI Team</p>
              `
            });
          }
        }
      } catch (error) {
        console.error("Error notifying parents about growth prediction update:", error);
        // Continue with the response even if notifications fail
      }
    }
    
    res.status(200).json({
      message: "Growth prediction saved successfully",
      data: updatedAthlete
    });
  } catch (error) {
    console.error("Error saving growth prediction:", error);
    res.status(500).json({ message: "Failed to save growth prediction data" });
  }
});

/**
 * Route to get height prediction data for an athlete
 * GET /api/athlete/:id/height-prediction
 */
router.get('/:id/height-prediction', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const athleteId = parseInt(req.params.id);
    
    // Check if user has permission to view this athlete's data
    const isOwnProfile = req.user?.id === athleteId;
    const isCoach = req.user?.userType === 'coach';
    const isParent = req.user?.userType === 'parent';
    
    // Get athlete by ID for athletes parented by this parent
    let hasPermission = isOwnProfile || isCoach;
    
    if (isParent) {
      // Check if parent has relationship with this athlete
      const parentId = req.user.id;
      const relationships = await storage.getParentAthleteRelationships({ parentId });
      const athleteIds = relationships.map(r => r.athleteId);
      
      hasPermission = athleteIds.includes(athleteId);
    }
    
    if (!hasPermission) {
      return res.status(403).json({ message: "Not authorized to view this athlete's data" });
    }
    
    // Get athlete
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: "Athlete not found" });
    }
    
    if (!athlete.growthPrediction) {
      return res.status(404).json({ 
        message: "No growth prediction found for this athlete",
        athleteData: {
          id: athlete.id,
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          height: athlete.height,
          weight: athlete.weight,
          motherHeight: athlete.motherHeight,
          fatherHeight: athlete.fatherHeight,
          dateOfBirth: athlete.dateOfBirth
        }
      });
    }
    
    res.status(200).json({
      growthPrediction: athlete.growthPrediction,
      athleteData: {
        id: athlete.id,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        height: athlete.height,
        weight: athlete.weight,
        motherHeight: athlete.motherHeight,
        fatherHeight: athlete.fatherHeight,
        dateOfBirth: athlete.dateOfBirth
      }
    });
  } catch (error) {
    console.error("Error retrieving growth prediction:", error);
    res.status(500).json({ message: "Failed to retrieve growth prediction data" });
  }
});

export const growthPredictionRoutes = router;