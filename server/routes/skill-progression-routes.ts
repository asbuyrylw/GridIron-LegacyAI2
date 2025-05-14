import { Express } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertAthleteSkillSchema, insertSkillActivityLogSchema } from "@shared/schema";

// Session type definition
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export function setupSkillProgressionRoutes(app: Express) {
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };
  
  // Get all skills (optionally filtered by category and position)
  app.get("/api/skills", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const position = req.query.position as string | undefined;
      
      const skills = await storage.getSkills({ category, position });
      res.json(skills);
    } catch (error) {
      console.error("Error getting skills:", error);
      res.status(500).json({ message: "Failed to get skills" });
    }
  });
  
  // Get a specific skill by ID
  app.get("/api/skills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid skill ID" });
      }
      
      const skill = await storage.getSkillById(id);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(skill);
    } catch (error) {
      console.error("Error getting skill:", error);
      res.status(500).json({ message: "Failed to get skill" });
    }
  });
  
  // Get all skills for the authenticated athlete
  app.get("/api/athlete/skills", isAuthenticated, async (req, res) => {
    try {
      // Get the athlete ID from the logged-in user
      const userId = req.user!.id;
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      const athleteSkills = await storage.getAthleteSkills(athlete.id);
      res.json(athleteSkills);
    } catch (error) {
      console.error("Error getting athlete skills:", error);
      res.status(500).json({ message: "Failed to get athlete skills" });
    }
  });
  
  // Get all skills for a specific athlete (e.g., for coaches to view)
  app.get("/api/athlete/:id/skills", isAuthenticated, async (req, res) => {
    try {
      const athleteId = parseInt(req.params.id);
      if (isNaN(athleteId)) {
        return res.status(400).json({ message: "Invalid athlete ID" });
      }
      
      // Check if athlete exists
      const athlete = await storage.getAthlete(athleteId);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      const athleteSkills = await storage.getAthleteSkills(athleteId);
      res.json(athleteSkills);
    } catch (error) {
      console.error("Error getting athlete skills:", error);
      res.status(500).json({ message: "Failed to get athlete skills" });
    }
  });
  
  // Get summary stats for the authenticated athlete
  app.get("/api/athlete/skills/summary", isAuthenticated, async (req, res) => {
    try {
      // Get the athlete ID from the logged-in user
      const userId = req.user!.id;
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      const summary = await storage.getAthleteSkillSummary(athlete.id);
      res.json(summary);
    } catch (error) {
      console.error("Error getting athlete skill summary:", error);
      res.status(500).json({ message: "Failed to get athlete skill summary" });
    }
  });
  
  // Get summary stats for a specific athlete
  app.get("/api/athlete/:id/skills/summary", isAuthenticated, async (req, res) => {
    try {
      const athleteId = parseInt(req.params.id);
      if (isNaN(athleteId)) {
        return res.status(400).json({ message: "Invalid athlete ID" });
      }
      
      // Check if athlete exists
      const athlete = await storage.getAthlete(athleteId);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      const summary = await storage.getAthleteSkillSummary(athleteId);
      res.json(summary);
    } catch (error) {
      console.error("Error getting athlete skill summary:", error);
      res.status(500).json({ message: "Failed to get athlete skill summary" });
    }
  });
  
  // Unlock a new skill for the authenticated athlete
  app.post("/api/athlete/skills/unlock", isAuthenticated, async (req, res) => {
    try {
      // Schema validation
      const schema = z.object({
        skillId: z.number(),
      });
      
      // Validate request body
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validationResult.error.errors });
      }
      
      const { skillId } = validationResult.data;
      
      // Get the athlete ID from the logged-in user
      const userId = req.user!.id;
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      // Check if the skill exists
      const skill = await storage.getSkillById(skillId);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Unlock the skill
      const result = await storage.unlockAthleteSkill(athlete.id, skillId);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error unlocking skill:", error);
      res.status(500).json({ message: "Failed to unlock skill" });
    }
  });
  
  // Add XP to a skill for the authenticated athlete
  app.post("/api/athlete/skills/add-xp", isAuthenticated, async (req, res) => {
    try {
      // Schema validation
      const schema = z.object({
        skillId: z.number(),
        xp: z.number().min(1),
        activityType: z.string(),
        description: z.string()
      });
      
      // Validate request body
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validationResult.error.errors });
      }
      
      const { skillId, xp, activityType, description } = validationResult.data;
      
      // Get the athlete ID from the logged-in user
      const userId = req.user!.id;
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      // Add XP to the skill
      const result = await storage.addSkillXP(athlete.id, skillId, xp, activityType, description);
      res.json(result);
    } catch (error) {
      console.error("Error adding skill XP:", error);
      res.status(500).json({ message: "Failed to add skill XP" });
    }
  });
  
  // Get activity logs for a skill
  app.get("/api/athlete/skills/:skillId/activity", isAuthenticated, async (req, res) => {
    try {
      const skillId = parseInt(req.params.skillId);
      if (isNaN(skillId)) {
        return res.status(400).json({ message: "Invalid skill ID" });
      }
      
      // Optional limit parameter
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Get the athlete ID from the logged-in user
      const userId = req.user!.id;
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      const logs = await storage.getSkillActivityLogs(athlete.id, skillId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error getting activity logs:", error);
      res.status(500).json({ message: "Failed to get activity logs" });
    }
  });
  
  // Get all activity logs for an athlete (across all skills)
  app.get("/api/athlete/skills/activity", isAuthenticated, async (req, res) => {
    try {
      // Optional limit parameter
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Get the athlete ID from the logged-in user
      const userId = req.user!.id;
      const athlete = await storage.getAthleteByUserId(userId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      const logs = await storage.getSkillActivityLogs(athlete.id, undefined, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error getting activity logs:", error);
      res.status(500).json({ message: "Failed to get activity logs" });
    }
  });
  
  // Coach routes - for creating and managing skills
  // These would typically have additional authorization to ensure only coaches or admins can access them
  
  // Create a new skill (coach/admin only - additional authorization would be required)
  app.post("/api/skills", isAuthenticated, async (req, res) => {
    try {
      // Check if user is coach/admin (simplified version - would need proper role-based auth)
      const user = req.user!;
      if (user.userType !== 'coach' && user.userType !== 'admin') {
        return res.status(403).json({ message: "Unauthorized - requires coach or admin access" });
      }
      
      // Schema validation would go here
      const skill = req.body;
      
      // Create the skill
      const newSkill = await storage.createSkill(skill);
      res.status(201).json(newSkill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });
  
  // Update a skill (coach/admin only)
  app.patch("/api/skills/:id", isAuthenticated, async (req, res) => {
    try {
      // Check if user is coach/admin
      const user = req.user!;
      if (user.userType !== 'coach' && user.userType !== 'admin') {
        return res.status(403).json({ message: "Unauthorized - requires coach or admin access" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid skill ID" });
      }
      
      // Schema validation would go here
      const updates = req.body;
      
      // Update the skill
      const updatedSkill = await storage.updateSkill(id, updates);
      
      if (!updatedSkill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(updatedSkill);
    } catch (error) {
      console.error("Error updating skill:", error);
      res.status(500).json({ message: "Failed to update skill" });
    }
  });
  
  // Delete a skill (coach/admin only)
  app.delete("/api/skills/:id", isAuthenticated, async (req, res) => {
    try {
      // Check if user is coach/admin
      const user = req.user!;
      if (user.userType !== 'coach' && user.userType !== 'admin') {
        return res.status(403).json({ message: "Unauthorized - requires coach or admin access" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid skill ID" });
      }
      
      // Delete the skill
      const success = await storage.deleteSkill(id);
      
      if (!success) {
        return res.status(400).json({ message: "Skill is in use by athletes and cannot be deleted" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });
  
  // Coach route to add XP to an athlete's skill (coach/admin only)
  app.post("/api/athlete/:id/skills/add-xp", isAuthenticated, async (req, res) => {
    try {
      // Check if user is coach/admin
      const user = req.user!;
      if (user.userType !== 'coach' && user.userType !== 'admin') {
        return res.status(403).json({ message: "Unauthorized - requires coach or admin access" });
      }
      
      const athleteId = parseInt(req.params.id);
      if (isNaN(athleteId)) {
        return res.status(400).json({ message: "Invalid athlete ID" });
      }
      
      // Schema validation
      const schema = z.object({
        skillId: z.number(),
        xp: z.number().min(1),
        activityType: z.string(),
        description: z.string()
      });
      
      // Validate request body
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validationResult.error.errors });
      }
      
      const { skillId, xp, activityType, description } = validationResult.data;
      
      // Check if athlete exists
      const athlete = await storage.getAthlete(athleteId);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Add XP to the skill
      const result = await storage.addSkillXP(athleteId, skillId, xp, activityType, description);
      res.json(result);
    } catch (error) {
      console.error("Error adding skill XP:", error);
      res.status(500).json({ message: "Failed to add skill XP" });
    }
  });
}