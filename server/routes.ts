import { generateCoachingResponse, generateTrainingPlan, analyzeAthleteMetrics } from "./openai";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertCombineMetricsSchema, 
  insertTrainingPlanSchema, 
  insertCoachMessageSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // -- Athlete Routes --
  // GET athlete profile
  app.get("/api/athlete/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own profile unless profile is public
      if (athlete.userId !== req.user.id && !athlete.profileVisibility) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(athlete);
    } catch (error) {
      next(error);
    }
  });
  
  // Update athlete profile
  app.patch("/api/athlete/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow update of own profile
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedAthlete = await storage.updateAthlete(athleteId, req.body);
      res.json(updatedAthlete);
    } catch (error) {
      next(error);
    }
  });
  
  // -- Combine Metrics Routes --
  // Get all combine metrics for an athlete
  app.get("/api/athlete/:id/metrics", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own metrics or if profile is public
      if (athlete.userId !== req.user.id && !athlete.profileVisibility) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const metrics = await storage.getCombineMetrics(athleteId);
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  });
  
  // Add new combine metrics
  app.post("/api/athlete/:id/metrics", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow adding metrics to own profile
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate the metrics data
      const validated = insertCombineMetricsSchema.parse({
        ...req.body,
        athleteId
      });
      
      const metrics = await storage.createCombineMetrics(validated);
      res.status(201).json(metrics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  // -- Training Plan Routes --
  // Get training plans for an athlete
  app.get("/api/athlete/:id/plans", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own plans
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const plans = await storage.getTrainingPlans(athleteId);
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });
  
  // Get training plan for specific date
  app.get("/api/athlete/:id/plans/date/:date", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const dateParam = req.params.date;
      const date = new Date(dateParam);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own plans
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const plan = await storage.getTrainingPlanByDate(athleteId, date);
      
      if (!plan) {
        return res.status(404).json({ message: "Training plan not found for this date" });
      }
      
      res.json(plan);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a training plan
  app.post("/api/athlete/:id/plans", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow creating plans for own profile
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate the plan data
      const validated = insertTrainingPlanSchema.parse({
        ...req.body,
        athleteId
      });
      
      const plan = await storage.createTrainingPlan(validated);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  // Update a training plan
  app.patch("/api/athlete/:athleteId/plans/:planId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.athleteId);
      const planId = parseInt(req.params.planId);
      
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow updating own plans
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedPlan = await storage.updateTrainingPlan(planId, req.body);
      
      if (!updatedPlan) {
        return res.status(404).json({ message: "Training plan not found" });
      }
      
      res.json(updatedPlan);
    } catch (error) {
      next(error);
    }
  });
  
  // -- Coach Messages Routes --
  // Get coach messages for an athlete
  app.get("/api/athlete/:id/messages", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own messages
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getCoachMessages(athleteId);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });
  
  // Send a message to coach
  app.post("/api/athlete/:id/messages", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow sending messages from own account
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate the message data
      const validated = insertCoachMessageSchema.parse({
        ...req.body,
        athleteId,
        role: "user" // Set role to user for messages from the athlete
      });
      
      const message = await storage.createCoachMessage(validated);
      
      // Simulate Coach AI response (would connect to OpenAI in production)
      setTimeout(async () => {
        const aiResponse = {
          athleteId,
          message: "Thanks for your message! I'll analyze your progress and get back to you with specific recommendations.",
          role: "assistant",
          read: false
        };
        await storage.createCoachMessage(aiResponse);
      }, 2000);
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  // Mark a message as read
  app.patch("/api/messages/:id/read", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const messageId = parseInt(req.params.id);
      const updatedMessage = await storage.markMessageAsRead(messageId);
      
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(updatedMessage);
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
