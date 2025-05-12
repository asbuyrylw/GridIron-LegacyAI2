/**
 * College Matcher Routes
 * Provides endpoints for college matching and recommendations
 */

import { Express, Request, Response } from "express";
import { z } from "zod";
import { enhancedCollegeMatcher } from "../services/enhanced-college-matcher";

/**
 * Register college matcher routes
 */
export function registerCollegeMatcherRoutes(app: Express) {
  /**
   * Get college matches for the current authenticated athlete
   */
  app.get("/api/college-matcher/me", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get athlete ID from the authenticated user
      const athlete = await req.app.locals.storage.getAthleteByUserId(req.user.id);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }

      // Extract query parameters for options
      const options = {
        region: req.query.region as string | undefined,
        preferredMajor: req.query.preferredMajor as string | undefined,
        maxDistance: req.query.maxDistance ? parseInt(req.query.maxDistance as string) : undefined,
        preferredState: req.query.preferredState as string | undefined,
        financialAidImportance: req.query.financialAidImportance ? 
          parseInt(req.query.financialAidImportance as string) : undefined,
        athleticScholarshipRequired: req.query.athleticScholarshipRequired === 'true',
        minEnrollment: req.query.minEnrollment ? parseInt(req.query.minEnrollment as string) : undefined,
        maxEnrollment: req.query.maxEnrollment ? parseInt(req.query.maxEnrollment as string) : undefined,
        publicOnly: req.query.publicOnly === 'true',
        privateOnly: req.query.privateOnly === 'true',
        useAI: req.query.useAI === 'true'
      };

      const matches = await enhancedCollegeMatcher.generateCollegeMatches(athlete.id, options);
      res.json(matches);
    } catch (error: any) {
      console.error("Error in college matcher route:", error);
      res.status(500).json({ message: error.message || "Error generating college matches" });
    }
  });

  /**
   * Get college matches for a specific athlete
   */
  app.get("/api/college-matcher/:athleteId", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const athleteId = parseInt(req.params.athleteId);
      if (isNaN(athleteId)) {
        return res.status(400).json({ message: "Invalid athlete ID" });
      }

      // Extract query parameters for options
      const options = {
        region: req.query.region as string | undefined,
        preferredMajor: req.query.preferredMajor as string | undefined,
        maxDistance: req.query.maxDistance ? parseInt(req.query.maxDistance as string) : undefined,
        preferredState: req.query.preferredState as string | undefined,
        financialAidImportance: req.query.financialAidImportance ? 
          parseInt(req.query.financialAidImportance as string) : undefined,
        athleticScholarshipRequired: req.query.athleticScholarshipRequired === 'true',
        minEnrollment: req.query.minEnrollment ? parseInt(req.query.minEnrollment as string) : undefined,
        maxEnrollment: req.query.maxEnrollment ? parseInt(req.query.maxEnrollment as string) : undefined,
        publicOnly: req.query.publicOnly === 'true',
        privateOnly: req.query.privateOnly === 'true',
        useAI: req.query.useAI === 'true'
      };

      const matches = await enhancedCollegeMatcher.generateCollegeMatches(athleteId, options);
      res.json(matches);
    } catch (error: any) {
      console.error("Error in college matcher route:", error);
      res.status(500).json({ message: error.message || "Error generating college matches" });
    }
  });

  /**
   * Get a list of all colleges by division
   */
  app.get("/api/colleges/division/:division", async (req: Request, res: Response) => {
    try {
      const division = req.params.division;
      const colleges = await enhancedCollegeMatcher.getCollegesByDivision(division);
      res.json(colleges);
    } catch (error: any) {
      console.error("Error fetching colleges by division:", error);
      res.status(500).json({ message: error.message || "Error fetching colleges" });
    }
  });

  /**
   * Get details for a specific college by ID
   */
  app.get("/api/colleges/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid college ID" });
      }

      const college = await enhancedCollegeMatcher.getCollegeById(id);
      if (!college) {
        return res.status(404).json({ message: "College not found" });
      }

      res.json(college);
    } catch (error: any) {
      console.error("Error fetching college details:", error);
      res.status(500).json({ message: error.message || "Error fetching college details" });
    }
  });

  /**
   * Search colleges by query string (name, region, or state)
   */
  app.get("/api/colleges/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }

      const colleges = await enhancedCollegeMatcher.searchColleges(query);
      res.json(colleges);
    } catch (error: any) {
      console.error("Error searching colleges:", error);
      res.status(500).json({ message: error.message || "Error searching colleges" });
    }
  });

  /**
   * Save/update an athlete's recruiting preferences
   */
  app.post("/api/recruiting-preferences/:athleteId", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const athleteId = parseInt(req.params.athleteId);
      if (isNaN(athleteId)) {
        return res.status(400).json({ message: "Invalid athlete ID" });
      }

      // Validate the incoming data
      const preferencesSchema = z.object({
        targetDivision: z.string().optional(),
        preferredRegions: z.array(z.string()).optional(),
        preferredStates: z.array(z.string()).optional(),
        academicPriority: z.number().min(1).max(10).optional(),
        athleticPriority: z.number().min(1).max(10).optional(),
        distancePriority: z.number().min(1).max(10).optional(),
        financialAidImportance: z.number().min(1).max(10).optional(),
        schoolsOfInterest: z.array(z.string()).optional(),
        preferredMajor: z.string().optional(),
      });

      const validatedData = preferencesSchema.parse(req.body);

      // Update the athlete with the recruiting preferences
      const updatedAthlete = await req.app.locals.storage.updateAthlete(athleteId, validatedData);
      
      res.json(updatedAthlete);
    } catch (error: any) {
      console.error("Error updating recruiting preferences:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: error.message || "Error updating recruiting preferences" });
    }
  });

  /**
   * Get an athlete's recruiting preferences
   */
  app.get("/api/recruiting-preferences/:athleteId", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const athleteId = parseInt(req.params.athleteId);
      if (isNaN(athleteId)) {
        return res.status(400).json({ message: "Invalid athlete ID" });
      }

      const athlete = await req.app.locals.storage.getAthlete(athleteId);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }

      // Extract just the recruiting preferences fields
      const preferences = {
        targetDivision: athlete.targetDivision,
        preferredRegions: athlete.preferredRegions,
        preferredStates: athlete.preferredStates,
        academicPriority: athlete.academicPriority,
        athleticPriority: athlete.athleticPriority,
        distancePriority: athlete.distancePriority,
        financialAidImportance: athlete.financialAidImportance,
        schoolsOfInterest: athlete.schoolsOfInterest,
        preferredMajor: athlete.preferredMajor,
      };

      res.json(preferences);
    } catch (error: any) {
      console.error("Error fetching recruiting preferences:", error);
      res.status(500).json({ message: error.message || "Error fetching recruiting preferences" });
    }
  });
}