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
  
  // Get current athlete (for logged-in user)
  app.get("/api/athlete/me", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athlete = await storage.getAthleteByUserId(req.user.id);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      res.json(athlete);
    } catch (error) {
      next(error);
    }
  });
  
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
      
      // Generate AI coach response using OpenAI
      const athleteUser = await storage.getAthleteByUserId(req.user.id);
      
      // Process asynchronously so we don't block the user response
      setTimeout(async () => {
        try {
          const aiResponse = await generateCoachingResponse(validated.message, {
            position: athleteUser?.position,
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            metrics: await storage.getLatestCombineMetrics(athleteId)
          });
          
          await storage.createCoachMessage({
            athleteId,
            message: aiResponse,
            role: "assistant",
            read: false
          });
        } catch (error) {
          console.error("Error generating coach response:", error);
          // Save a fallback message if OpenAI fails
          await storage.createCoachMessage({
            athleteId,
            message: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
            role: "assistant",
            read: false
          });
        }
      }, 100);
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  // Generate AI training plan
  app.post("/api/athlete/:id/generate-plan", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow generating plans for own profile
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { focus } = req.body;
      
      try {
        // Get latest metrics for this athlete
        const metrics = await storage.getLatestCombineMetrics(athleteId);
        
        // Generate plan with OpenAI
        const generatedPlan = await generateTrainingPlan({
          position: athlete.position,
          metrics,
          focus
        });
        
        // Save the generated plan
        const plan = await storage.createTrainingPlan({
          athleteId,
          date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
          title: generatedPlan.title,
          focus: generatedPlan.focus,
          exercises: generatedPlan.exercises,
          completed: false,
          coachTip: generatedPlan.coachTip
        });
        
        res.status(201).json(plan);
      } catch (error) {
        console.error("Error generating training plan:", error);
        return res.status(500).json({ 
          message: "Failed to generate training plan. Please try again later."
        });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Analyze athlete metrics with AI
  app.get("/api/athlete/:id/analyze-metrics", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow analyzing own metrics
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get latest metrics for analysis
      const metrics = await storage.getLatestCombineMetrics(athleteId);
      
      if (!metrics) {
        return res.status(404).json({ message: "No metrics found to analyze" });
      }
      
      try {
        // Analyze metrics with OpenAI
        const analysis = await analyzeAthleteMetrics(metrics, athlete.position);
        res.json(analysis);
      } catch (error) {
        console.error("Error analyzing metrics:", error);
        return res.status(500).json({ 
          message: "Failed to analyze metrics. Please try again later."
        });
      }
    } catch (error) {
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
  
  // Get unread coach messages count for current user
  app.get("/api/athlete/me/unread-messages", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athlete = await storage.getAthleteByUserId(req.user.id);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      const messages = await storage.getCoachMessages(athlete.id);
      const unreadCount = messages.filter(msg => !msg.read && msg.role === "assistant").length;
      
      res.json({ count: unreadCount });
    } catch (error) {
      next(error);
    }
  });
  
  // Search athletes (for recruiters)
  app.get("/api/search/athletes", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow users with coach/recruiter roles to search
      if (req.user.userType !== "coach" && req.user.userType !== "recruiter") {
        return res.status(403).json({ message: "Only coaches and recruiters can search athletes" });
      }
      
      const { position, school, graduationYear, targetDivision } = req.query;
      
      // Get all athletes with public profiles
      const allAthletes = await storage.getAllAthletes();
      const athletes = allAthletes.filter(athlete => athlete.profileVisibility);
      
      // Apply filters if provided
      let filteredAthletes = athletes;
      
      if (position) {
        filteredAthletes = filteredAthletes.filter(
          athlete => athlete.position?.toLowerCase().includes(String(position).toLowerCase())
        );
      }
      
      if (school) {
        filteredAthletes = filteredAthletes.filter(
          athlete => athlete.school?.toLowerCase().includes(String(school).toLowerCase())
        );
      }
      
      if (graduationYear) {
        filteredAthletes = filteredAthletes.filter(
          athlete => athlete.graduationYear === parseInt(String(graduationYear))
        );
      }
      
      if (targetDivision) {
        filteredAthletes = filteredAthletes.filter(
          athlete => athlete.targetDivision?.toLowerCase().includes(String(targetDivision).toLowerCase())
        );
      }
      
      // Get metrics for each athlete to include in response
      const results = await Promise.all(filteredAthletes.map(async (athlete) => {
        const metrics = await storage.getLatestCombineMetrics(athlete.id);
        
        // Return athlete data with metrics but remove sensitive data
        return {
          id: athlete.id,
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          position: athlete.position,
          school: athlete.school,
          grade: athlete.grade,
          graduationYear: athlete.graduationYear,
          height: athlete.height,
          weight: athlete.weight,
          targetDivision: athlete.targetDivision,
          metrics: metrics || null
        };
      }));
      
      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
