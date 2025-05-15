/**
 * Profile Image Routes
 * Endpoints for uploading and managing profile and background images
 */
import { Request, Response, Express } from "express";
import { z } from "zod";
import { storage } from "../storage";

// Schema for image upload validation
const imageUploadSchema = z.object({
  imageUrl: z.string(),
  imageType: z.enum(['background', 'profile'])
});

/**
 * Register profile image routes
 */
export function setupProfileImageRoutes(app: Express) {
  
  /**
   * Upload/update profile or background image for athlete
   */
  app.post("/api/athlete/image", async (req: Request, res: Response) => {
    // Check authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Validate the request data
      const validatedData = imageUploadSchema.parse(req.body);
      const { imageUrl, imageType } = validatedData;
      
      // Get current user
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Find the athlete associated with the user
      const athlete = await storage.getAthleteByUserId(userId);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      // Update the appropriate image field
      if (imageType === "background") {
        await storage.updateAthlete(athlete.id, { backgroundImage: imageUrl });
      } else {
        await storage.updateAthlete(athlete.id, { profileImage: imageUrl });
      }
      
      console.log(`Updated ${imageType} image for athlete ID ${athlete.id}`);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res.status(400).json({ 
        message: "Invalid request data", 
        error: errorMessage
      });
    }
  });

  /**
   * Get athlete's profile or background image
   */
  app.get("/api/athlete/image/:type", async (req: Request, res: Response) => {
    // Check authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const imageType = req.params.type;
      if (imageType !== "background" && imageType !== "profile") {
        return res.status(400).json({ message: "Invalid image type" });
      }
      
      // Get current user
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Find the athlete associated with the user
      const athlete = await storage.getAthleteByUserId(userId);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      // Return the requested image URL
      const imageUrl = imageType === "background" ? 
        athlete.backgroundImage : athlete.profileImage;
        
      return res.json({ imageUrl });
    } catch (error) {
      console.error(`Error getting ${req.params.type} image:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ 
        message: "Error retrieving image", 
        error: errorMessage
      });
    }
  });

  console.log("Profile image routes registered");
}