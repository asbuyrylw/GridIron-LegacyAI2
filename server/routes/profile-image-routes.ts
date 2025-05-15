import { Express, Request, Response } from "express";
import { z } from "zod";
import { isAuthenticated } from "../middleware/auth-middleware";

// Validation schema for updating profile image
const updateImageSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageType: z.enum(["profile", "background"]),
});

// Add file handling if we were using actual file uploads
export function setupProfileImageRoutes(app: Express) {
  // Update profile or background image
  app.post("/api/athlete/image", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const { imageUrl, imageType } = updateImageSchema.parse(req.body);
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get the user's athlete profile
      const athlete = await req.storage.getAthleteByUserId(req.user.id);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      // Update the appropriate field based on image type
      if (imageType === "profile") {
        await req.storage.updateAthlete(athlete.id, { profileImage: imageUrl });
      } else if (imageType === "background") {
        await req.storage.updateAthlete(athlete.id, { backgroundImage: imageUrl });
      }
      
      // Get the updated athlete
      const updatedAthlete = await req.storage.getAthlete(athlete.id);
      
      res.json({ 
        success: true, 
        message: `${imageType} image updated successfully`,
        athlete: updatedAthlete
      });
    } catch (error) {
      console.error("Error updating profile image:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid image data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile image" });
    }
  });
}