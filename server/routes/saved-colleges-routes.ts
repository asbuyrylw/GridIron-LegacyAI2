/**
 * Saved Colleges Routes
 * Provides endpoints for saving and retrieving saved colleges
 */
import { Request, Response, Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";

/**
 * Register saved colleges routes
 */
export function registerSavedCollegesRoutes(app: Express) {
  /**
   * Get saved colleges for the authenticated user
   */
  app.get("/api/saved-colleges", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from session
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get saved colleges
      const savedColleges = await storage.getSavedColleges(userId);
      res.json(savedColleges);
    } catch (error) {
      console.error("Error getting saved colleges:", error);
      res.status(500).json({ message: "Error getting saved colleges" });
    }
  });

  /**
   * Save a college for the authenticated user
   */
  app.post("/api/saved-colleges/:collegeId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from session
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get college ID from path
      const collegeId = parseInt(req.params.collegeId);
      if (isNaN(collegeId)) {
        return res.status(400).json({ message: "Invalid college ID" });
      }

      // Save college
      await storage.saveCollege(userId, collegeId);
      res.json({ message: "College saved" });
    } catch (error) {
      console.error("Error saving college:", error);
      res.status(500).json({ message: "Error saving college" });
    }
  });

  /**
   * Delete a saved college for the authenticated user
   */
  app.delete("/api/saved-colleges/:collegeId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from session
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get college ID from path
      const collegeId = parseInt(req.params.collegeId);
      if (isNaN(collegeId)) {
        return res.status(400).json({ message: "Invalid college ID" });
      }

      // Delete saved college
      await storage.unsaveCollege(userId, collegeId);
      res.json({ message: "College unsaved" });
    } catch (error) {
      console.error("Error unsaving college:", error);
      res.status(500).json({ message: "Error unsaving college" });
    }
  });
}