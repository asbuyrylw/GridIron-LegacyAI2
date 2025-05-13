import { Express, Request, Response, Router } from "express";
import { MemStorage, storage } from "../storage";
import { GrowthPrediction } from "../../shared/schema";
import { emailService } from "../email-service";

// Create a router
export const growthPredictionRoutes = Router();

interface GrowthPredictionRoutesDeps {
  app: Express;
  storage: MemStorage;
}

// Initialize routes directly 
(function initializeRoutes() {
  // Get height prediction for an athlete
  growthPredictionRoutes.get("/:athleteId/height-prediction", async (req: Request, res: Response) => {
    try {
      const athleteId = parseInt(req.params.athleteId);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Check if the authenticated user has permission to access this athlete's data
      if (req.session.userId !== athlete.userId && req.session.userType !== "coach") {
        // Check if the requesting user is a parent with access to this athlete
        const isParent = req.session.userType === "parent";
        
        if (isParent) {
          const parentId = await storage.getParentByUserId(req.session.userId);
          
          if (!parentId) {
            return res.status(403).json({ message: "Unauthorized access" });
          }
          
          const relationships = await storage.getParentAthleteRelationshipsByParentId(parentId.id);
          const hasAccess = relationships.some(r => r.athleteId === athleteId && r.hasViewAccess);
          
          if (!hasAccess) {
            return res.status(403).json({ message: "Unauthorized access" });
          }
        } else {
          return res.status(403).json({ message: "Unauthorized access" });
        }
      }
      
      // Get the stored growth prediction data
      const growthPrediction = athlete.growthPrediction as GrowthPrediction | null;
      
      if (!growthPrediction) {
        return res.status(404).json({ message: "No growth prediction data found for this athlete" });
      }
      
      return res.status(200).json(growthPrediction);
    } catch (error) {
      console.error("Error getting height prediction:", error);
      return res.status(500).json({ message: "Server error retrieving growth prediction data" });
    }
  });
  
  // Create or update height prediction for an athlete
  app.post("/api/athlete/:athleteId/height-prediction", async (req: Request, res: Response) => {
    try {
      const athleteId = parseInt(req.params.athleteId);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Check if the authenticated user has permission to update this athlete's data
      if (req.session.userId !== athlete.userId && req.session.userType !== "coach") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      // Save the growth prediction data
      const updatedAthlete = await storage.updateAthlete(athleteId, {
        growthPrediction: req.body
      });
      
      if (!updatedAthlete) {
        return res.status(500).json({ message: "Failed to update athlete data" });
      }
      
      // Notify parents about the updated growth prediction if the athlete has parents
      try {
        const relationships = await storage.getParentAthleteRelationshipsByAthleteId(athleteId);
        
        for (const relationship of relationships) {
          const parent = await storage.getParent(relationship.parentId);
          
          if (parent && relationship.hasViewAccess) {
            // Only send the email if the parent has view access
            const growthPrediction = req.body as GrowthPrediction;
            
            await emailService.sendNotification(
              "growth-update",
              parent.userId.toString(),
              `${parent.firstName} ${parent.lastName}`,
              `${athlete.firstName} ${athlete.lastName}`,
              {
                athleteName: `${athlete.firstName} ${athlete.lastName}`,
                predictedHeight: growthPrediction.predictedHeight,
                percentComplete: growthPrediction.percentComplete,
                recommendedPositions: growthPrediction.recommendedPositions,
                growthRemaining: growthPrediction.growthRemaining
              }
            );
          }
        }
      } catch (emailError) {
        console.error("Failed to send parent notification emails:", emailError);
        // Continue execution - don't fail the request just because emails failed
      }
      
      return res.status(200).json({
        message: "Growth prediction data saved successfully",
        growthPrediction: updatedAthlete.growthPrediction
      });
    } catch (error) {
      console.error("Error saving height prediction:", error);
      return res.status(500).json({ message: "Server error saving growth prediction data" });
    }
  });
  
  // Generate a PDF report of athlete growth predictions
  app.get("/api/athlete/:athleteId/height-prediction/report", async (req: Request, res: Response) => {
    try {
      const athleteId = parseInt(req.params.athleteId);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Check if the authenticated user has permission to access this athlete's data
      if (req.session.userId !== athlete.userId && req.session.userType !== "coach") {
        // Check if the requesting user is a parent with access to this athlete
        const isParent = req.session.userType === "parent";
        
        if (isParent) {
          const parentId = await storage.getParentByUserId(req.session.userId);
          
          if (!parentId) {
            return res.status(403).json({ message: "Unauthorized access" });
          }
          
          const relationships = await storage.getParentAthleteRelationshipsByParentId(parentId.id);
          const hasAccess = relationships.some(r => r.athleteId === athleteId && r.hasViewAccess);
          
          if (!hasAccess) {
            return res.status(403).json({ message: "Unauthorized access" });
          }
        } else {
          return res.status(403).json({ message: "Unauthorized access" });
        }
      }
      
      // Get the stored growth prediction data
      const growthPrediction = athlete.growthPrediction as GrowthPrediction | null;
      
      if (!growthPrediction) {
        return res.status(404).json({ message: "No growth prediction data found for this athlete" });
      }
      
      // Here you would generate a PDF report
      // For now, just return the data in a format that could be used for a PDF
      const reportData = {
        athleteName: `${athlete.firstName} ${athlete.lastName}`,
        age: calcAge(athlete.dateOfBirth),
        currentHeight: athlete.height,
        predictedAdultHeight: growthPrediction.predictedHeight,
        percentComplete: `${growthPrediction.percentComplete}%`,
        growthRemaining: `${growthPrediction.growthRemaining.toFixed(1)} inches`,
        recommendedPositions: growthPrediction.recommendedPositions.join(", "),
        calculatedAt: new Date(growthPrediction.calculatedAt).toLocaleDateString(),
        predictedRange: growthPrediction.predictedRange
      };
      
      return res.status(200).json({
        message: "Growth prediction report generated",
        reportData
      });
    } catch (error) {
      console.error("Error generating growth prediction report:", error);
      return res.status(500).json({ message: "Server error generating growth prediction report" });
    }
  });
  
  // Helper function to calculate age from date of birth
  function calcAge(dob: string | null): number {
    if (!dob) return 0;
    
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}