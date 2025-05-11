import { generateCoachingResponse, generateTrainingPlan, analyzeAthleteMetrics, generateMealSuggestion } from "./openai";
import { generatePerformanceInsights } from "./performance-insights";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import session from "express-session";

// Extend the Express Session type to include our onboarding progress
declare module "express-session" {
  interface SessionData {
    onboardingProgress?: {
      [athleteId: number]: {
        step: number;
        data: any;
        timestamp: string;
      };
    };
  }
}
import { 
  insertCombineMetricsSchema, 
  insertTrainingPlanSchema, 
  insertCoachMessageSchema,
  insertNutritionPlanSchema,
  insertMealLogSchema,
  insertAiMealSuggestionSchema,
  insertSocialConnectionSchema,
  insertSocialPostSchema,
  insertAchievementSchema,
  insertAthleteAchievementSchema,
  insertLeaderboardSchema,
  insertLeaderboardEntrySchema,
  insertStrengthConditioningSchema,
  insertNutritionInfoSchema,
  insertRecruitingPreferencesSchema,
  insertExerciseLibrarySchema,
  insertWorkoutSessionSchema,
  insertTeamSchema,
  insertTeamMemberSchema,
  insertTeamEventSchema,
  insertTeamAnnouncementSchema,
  insertTeamEventAttendanceSchema,
  onboardingSchema,
  type InsertAthleteAchievement,
  type InsertTeam,
  type InsertTeamMember,
  type InsertTeamEvent,
  type InsertTeamAnnouncement
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
  
  // -- Exercise Library Routes --
  // Get all exercises with optional filters
  app.get("/api/exercises", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { category, difficulty, position } = req.query;
      
      const exercises = await storage.getExercises(
        category as string | undefined,
        difficulty as string | undefined,
        position as string | undefined
      );
      
      res.json(exercises);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific exercise
  app.get("/api/exercises/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const exerciseId = parseInt(req.params.id);
      const exercise = await storage.getExerciseById(exerciseId);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new exercise (admin only)
  app.post("/api/exercises", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // In a real app, you'd check if user is admin
      // For now, we'll allow any authenticated user to create exercises
      
      // Validate the exercise data
      const validated = insertExerciseLibrarySchema.parse(req.body);
      
      const exercise = await storage.createExercise(validated);
      res.status(201).json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  // Update an exercise (admin only)
  app.patch("/api/exercises/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // In a real app, you'd check if user is admin
      
      const exerciseId = parseInt(req.params.id);
      const exercise = await storage.getExerciseById(exerciseId);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      // Validate the update data
      const validated = insertExerciseLibrarySchema.partial().parse(req.body);
      
      const updatedExercise = await storage.updateExercise(exerciseId, validated);
      res.json(updatedExercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  // -- Workout Session Routes --
  // Get workout sessions for an athlete
  app.get("/api/athlete/:id/workouts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own workout sessions
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const workouts = await storage.getWorkoutSessions(athleteId);
      res.json(workouts);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific workout session
  app.get("/api/athlete/:athleteId/workouts/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.athleteId);
      const workoutId = parseInt(req.params.id);
      
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own workout sessions
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const workout = await storage.getWorkoutSessionById(workoutId);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      
      if (workout.athleteId !== athleteId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(workout);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a workout session
  app.post("/api/athlete/:id/workouts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow creating sessions for own profile
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate the workout data
      const validated = insertWorkoutSessionSchema.parse({
        ...req.body,
        athleteId
      });
      
      const workout = await storage.createWorkoutSession(validated);
      res.status(201).json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  // Update a workout session
  app.patch("/api/athlete/:athleteId/workouts/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.athleteId);
      const workoutId = parseInt(req.params.id);
      
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow updating own workout sessions
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const workout = await storage.getWorkoutSessionById(workoutId);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      
      if (workout.athleteId !== athleteId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate the update data
      const validated = insertWorkoutSessionSchema.partial().parse(req.body);
      
      const updatedWorkout = await storage.updateWorkoutSession(workoutId, validated);
      res.json(updatedWorkout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
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
  
  // Get Performance Insights
  app.get("/api/athlete/:id/performance-insights", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own insights
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const insights = await storage.getPerformanceInsights(athleteId);
      
      if (!insights) {
        return res.status(404).json({ message: "Performance insights not found" });
      }
      
      res.json(insights);
    } catch (error) {
      next(error);
    }
  });
  
  // Get athlete metrics
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
      
      // Only allow access to own metrics
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const metrics = await storage.getAthleteMetrics(athleteId);
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  });
  
  // Update or create performance insights
  app.post("/api/athlete/:id/performance-insights", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow updating own insights
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Update or create insights with all the new fields
      const updatedInsights = await storage.updatePerformanceInsights(athleteId, {
        ...req.body,
        lastUpdated: new Date()
      });
      res.status(200).json(updatedInsights);
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
  
  // Get performance progress over time
  app.get("/api/athlete/:id/progress/:metric", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const metricType = req.params.metric; // Can be 'combine', 'training', or 'both'
      const { period } = req.query; // Can be 'week', 'month', 'year', 'all'
      
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own progress data
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Determine the start date based on the requested period
      const startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      } else {
        // 'all' or not specified - no date filtering
        startDate.setFullYear(2000); // Set to far in the past to get all records
      }
      
      // Get data based on the requested metric type
      let combineData: any[] = [];
      let trainingData: any[] = [];
      
      if (metricType === 'combine' || metricType === 'both') {
        // Get combine metrics history
        const allMetrics = await storage.getCombineMetrics(athleteId);
        
        // Filter by date if needed
        combineData = allMetrics.filter(metric => {
          return new Date(metric.dateRecorded) >= startDate;
        }).map(metric => ({
          id: metric.id,
          date: metric.dateRecorded.toISOString().split('T')[0],
          fortyYard: metric.fortyYard,
          shuttle: metric.shuttle,
          verticalJump: metric.verticalJump,
          broadJump: metric.broadJump,
          benchPress: metric.benchPress
        }));
      }
      
      if (metricType === 'training' || metricType === 'both') {
        // Get training plans history
        const allPlans = await storage.getTrainingPlans(athleteId);
        
        // Filter by date and track completion status
        trainingData = allPlans.filter(plan => {
          return new Date(plan.date) >= startDate;
        }).map(plan => ({
          id: plan.id,
          date: plan.date,
          title: plan.title,
          focus: plan.focus,
          completed: plan.completed
        }));
      }
      
      // Prepare response based on the requested metric type
      let response: any = {
        athleteId,
        period: period || 'all',
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      };
      
      if (metricType === 'combine') {
        response.data = combineData;
      } else if (metricType === 'training') {
        response.data = trainingData;
      } else {
        // 'both'
        response.combineData = combineData;
        response.trainingData = trainingData;
      }
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  });
  
  // Get dashboard data for an athlete
  app.get("/api/athlete/:id/dashboard", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own dashboard
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get latest metrics, all metrics history, and recent training plans
      const latestMetrics = await storage.getLatestCombineMetrics(athleteId);
      const metricsHistory = await storage.getCombineMetrics(athleteId);
      const recentTrainingPlans = await storage.getTrainingPlans(athleteId);
      const messages = await storage.getCoachMessages(athleteId);
      
      // Calculate training completion rate (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentPlans = recentTrainingPlans.filter(plan => {
        const planDate = new Date(plan.date);
        return planDate >= oneWeekAgo;
      });
      
      const completedPlans = recentPlans.filter(plan => plan.completed);
      const completionRate = recentPlans.length > 0 
        ? (completedPlans.length / recentPlans.length) * 100 
        : 0;
      
      // Calculate metric improvements (if there are at least 2 metrics recorded)
      const improvements: Record<string, { value: string, percentage: string | number }> = {};
      if (metricsHistory.length >= 2) {
        const oldest = metricsHistory[metricsHistory.length - 1];
        const latest = metricsHistory[0];
        
        if (oldest.fortyYard !== null && latest.fortyYard !== null) {
          improvements['fortyYard'] = {
            value: (oldest.fortyYard - latest.fortyYard).toFixed(2),
            percentage: oldest.fortyYard > 0 
              ? (((oldest.fortyYard - latest.fortyYard) / oldest.fortyYard) * 100).toFixed(1) 
              : 0
          };
        }
        
        // Add improvements for other metrics
        const metricKeys = ['shuttle', 'verticalJump', 'broadJump', 'benchPress'] as const;
        metricKeys.forEach(metric => {
          const oldMetricValue = oldest[metric];
          const newMetricValue = latest[metric];
          
          if (oldMetricValue !== null && newMetricValue !== null) {
            const isSpeed = ['shuttle'].includes(metric);
            const oldValue = oldMetricValue;
            const newValue = newMetricValue;
            
            // For speed metrics, smaller is better (negative value means improvement)
            // For power metrics, larger is better (positive value means improvement)
            const rawImprovement = isSpeed ? oldValue - newValue : newValue - oldValue;
            const improvementPercentage = oldValue > 0 
              ? ((rawImprovement / oldValue) * 100).toFixed(1)
              : 0;
              
            improvements[metric] = {
              value: rawImprovement.toFixed(2),
              percentage: improvementPercentage
            };
          }
        });
      }
      
      // Get unread coach message count
      const unreadMessages = messages.filter(msg => !msg.read && msg.role === "assistant").length;
      
      // Compile dashboard data
      const dashboardData = {
        athleteInfo: {
          id: athlete.id,
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          position: athlete.position,
          grade: athlete.grade,
          school: athlete.school
        },
        trainingStats: {
          completionRate,
          plansCompleted: completedPlans.length,
          totalPlans: recentTrainingPlans.length,
          upcomingPlan: recentTrainingPlans.length > 0 
            ? recentTrainingPlans.find(plan => !plan.completed) || null 
            : null
        },
        metrics: latestMetrics || null,
        improvements,
        unreadMessages
      };
      
      res.json(dashboardData);
    } catch (error) {
      next(error);
    }
  });

  // -- Nutrition Plan Routes --
  // Get all nutrition plans for an athlete
  app.get("/api/athlete/:id/nutrition", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own nutrition plans
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const plans = await storage.getNutritionPlans(athleteId);
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });

  // Get active nutrition plan for an athlete
  app.get("/api/athlete/:id/nutrition/active", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own nutrition plan
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const plan = await storage.getActiveNutritionPlan(athleteId);
      
      if (!plan) {
        return res.status(404).json({ message: "No active nutrition plan found" });
      }
      
      res.json(plan);
    } catch (error) {
      next(error);
    }
  });

  // Create a nutrition plan
  app.post("/api/athlete/:id/nutrition", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow creating nutrition plans for own profile
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate the nutrition plan data
      const validated = insertNutritionPlanSchema.parse({
        ...req.body,
        athleteId
      });
      
      const plan = await storage.createNutritionPlan(validated);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Update a nutrition plan active status
  app.patch("/api/athlete/:athleteId/nutrition/:planId", async (req, res, next) => {
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
      
      // Only allow updating own nutrition plans
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { active } = req.body;
      if (typeof active !== 'boolean') {
        return res.status(400).json({ message: "Active status must be a boolean" });
      }
      
      const updatedPlan = await storage.updateNutritionPlan(planId, active);
      
      if (!updatedPlan) {
        return res.status(404).json({ message: "Nutrition plan not found" });
      }
      
      res.json(updatedPlan);
    } catch (error) {
      next(error);
    }
  });

  // -- Meal Log Routes --
  // Get meal logs for an athlete (optionally filtered by date)
  app.get("/api/athlete/:id/meals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const dateParam = req.query.date as string;
      let date: Date | undefined;
      
      if (dateParam) {
        date = new Date(dateParam);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }
      
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own meal logs
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const meals = await storage.getMealLogs(athleteId, date);
      res.json(meals);
    } catch (error) {
      next(error);
    }
  });

  // Create a meal log
  app.post("/api/athlete/:id/meals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow creating meal logs for own profile
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate the meal log data
      const validated = insertMealLogSchema.parse({
        ...req.body,
        athleteId
      });
      
      const meal = await storage.createMealLog(validated);
      res.status(201).json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // -- AI Meal Suggestion Routes --
  // Get AI meal suggestions for an athlete
  app.get("/api/athlete/:id/meal-suggestions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const mealType = req.query.mealType as string;
      const goal = req.query.goal as string;
      
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own meal suggestions
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const suggestions = await storage.getAiMealSuggestions(athleteId, mealType, goal);
      res.json(suggestions);
    } catch (error) {
      next(error);
    }
  });

  // Generate and store AI meal suggestion
  app.post("/api/athlete/:id/meal-suggestions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow generating meal suggestions for own profile
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { mealType, goal, restrictions } = req.body;
      
      if (!mealType || !goal) {
        return res.status(400).json({ message: "Meal type and goal are required" });
      }
      
      try {
        // Get athlete's active nutrition plan
        const nutritionPlan = await storage.getActiveNutritionPlan(athleteId);
        
        if (!nutritionPlan) {
          return res.status(404).json({ message: "No active nutrition plan found. Please create a nutrition plan first." });
        }
        
        // Generate a personalized meal suggestion using OpenAI
        const suggestion = await generateMealSuggestion(
          nutritionPlan, 
          mealType, 
          goal,
          restrictions || (nutritionPlan as any).restrictions || ""
        );
        
        // Store the suggestion
        const mealSuggestion = await storage.createAiMealSuggestion({
          athleteId,
          mealType,
          goal,
          suggestion
        });
        
        res.status(201).json(mealSuggestion);
      } catch (error) {
        console.error("Error generating meal suggestion:", error);
        return res.status(500).json({ 
          message: "Failed to generate meal suggestion. Please try again later."
        });
      }
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
  // -- Social Media Routes --
  // Get user's social connections
  app.get("/api/user/social-connections", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const connections = await storage.getSocialConnections(req.user.id);
      res.json(connections);
    } catch (error) {
      next(error);
    }
  });

  // Get social connection by platform
  app.get("/api/user/social-connections/:platform", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const platform = req.params.platform;
      const connection = await storage.getSocialConnectionByPlatform(req.user.id, platform);
      
      if (!connection) {
        return res.status(404).json({ message: `No connection found for ${platform}` });
      }
      
      res.json(connection);
    } catch (error) {
      next(error);
    }
  });

  // Create/update social connection
  app.post("/api/user/social-connections", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Validate the connection data
      const validated = insertSocialConnectionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const connection = await storage.createSocialConnection(validated);
      res.status(201).json(connection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Disconnect from platform
  app.delete("/api/user/social-connections/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const connectionId = parseInt(req.params.id);
      const connection = await storage.disconnectSocialConnection(connectionId);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      res.json(connection);
    } catch (error) {
      next(error);
    }
  });

  // Get user's social posts
  app.get("/api/user/social-posts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const posts = await storage.getSocialPosts(req.user.id);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  // Create a social post
  app.post("/api/user/social-posts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Validate the post data
      const validated = insertSocialPostSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const post = await storage.createSocialPost(validated);
      
      // In a real app, we would have a background job to publish posts
      // to social media platforms, but for demo purposes, we'll just mark it as posted
      setTimeout(async () => {
        try {
          // Simulating a successful post
          await storage.updateSocialPostStatus(post.id, "posted", new Date());
        } catch (error) {
          console.error("Error posting to social media:", error);
          await storage.updateSocialPostStatus(
            post.id, 
            "failed", 
            undefined, 
            "Error connecting to social media platform"
          );
        }
      }, 2000);
      
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // -- Achievements & Leaderboards Routes --
  // Get all achievements
  app.get("/api/achievements", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const category = req.query.category as string | undefined;
      const achievements = await storage.getAchievements(category);
      res.json(achievements);
    } catch (error) {
      next(error);
    }
  });

  // Get athlete's achievements
  app.get("/api/athlete/:id/achievements", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own achievements or if profile is public
      if (athlete.userId !== req.user.id && !athlete.profileVisibility) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const achievements = await storage.getAthleteAchievements(athleteId);
      res.json(achievements);
    } catch (error) {
      next(error);
    }
  });
  
  // Create athlete achievement (award an achievement to an athlete)
  app.post("/api/athlete/:id/achievements", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      if (isNaN(athleteId)) {
        return res.status(400).json({ message: "Invalid athlete ID" });
      }
      
      // Verify the athlete exists
      const athlete = await storage.getAthlete(athleteId);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only coaches or admins can award achievements or athletes for themselves
      const isOwnAthlete = athlete.userId === req.user.id;
      const isAdminOrCoach = req.user.role === 'admin' || req.user.role === 'coach';
      
      if (!isOwnAthlete && !isAdminOrCoach) {
        return res.status(403).json({ message: "Not authorized to award achievements for this athlete" });
      }
      
      // Validate request body
      const achievementId = parseInt(req.body.achievementId);
      if (isNaN(achievementId)) {
        return res.status(400).json({ message: "Invalid achievement ID" });
      }
      
      // Check if the achievement exists
      const achievement = await storage.getAchievement(achievementId);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      // Check if the athlete already has this achievement
      const existingAchievement = await storage.getAthleteAchievement(athleteId, achievementId);
      if (existingAchievement) {
        return res.status(409).json({ message: "Athlete already has this achievement" });
      }
      
      // Create new athlete achievement
      const newAthleteAchievement = await storage.createAthleteAchievement({
        athleteId,
        achievementId,
        progress: req.body.progress || 0,
        completed: req.body.completed || false,
        earnedAt: req.body.completed ? new Date() : null
      });
      
      res.status(201).json(newAthleteAchievement);
    } catch (error) {
      next(error);
    }
  });

  // Update achievement progress
  app.patch("/api/athlete/achievements/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Support string IDs too
      const achievementId = req.params.id;
      
      const { progress, completed } = req.body;
      const updates: Partial<InsertAthleteAchievement> = {};
      
      // Validate and add progress if provided
      if (progress !== undefined) {
        if (typeof progress !== "number" || progress < 0 || progress > 100) {
          return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
        }
        updates.progress = progress;
      }
      
      // Add completed if provided
      if (completed !== undefined) {
        updates.completed = completed;
      }
      
      // Get the athlete achievement to verify ownership
      const athlete = await storage.getAthleteByUserId(req.user.id);
      if (!athlete) {
        return res.status(403).json({ message: "Not authorized to update this achievement" });
      }
      
      // Verify this achievement belongs to the authenticated athlete
      const achievementToUpdate = await storage.getAthleteAchievement(athlete.id, achievementId);
      if (!achievementToUpdate) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      const updatedAchievement = await storage.updateAthleteAchievement(
        achievementToUpdate.id,
        updates
      );
      
      if (!updatedAchievement) {
        return res.status(404).json({ message: "Failed to update achievement" });
      }
      
      res.json(updatedAchievement);
    } catch (error) {
      next(error);
    }
  });

  // Get all active leaderboards
  app.get("/api/leaderboards", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const activeOnly = req.query.active === "true";
      const leaderboards = await storage.getLeaderboards(activeOnly);
      res.json(leaderboards);
    } catch (error) {
      next(error);
    }
  });

  // Get leaderboard entries
  app.get("/api/leaderboards/:id/entries", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const leaderboardId = parseInt(req.params.id);
      const leaderboard = await storage.getLeaderboardById(leaderboardId);
      
      if (!leaderboard) {
        return res.status(404).json({ message: "Leaderboard not found" });
      }
      
      const entries = await storage.getLeaderboardEntries(leaderboardId);
      res.json(entries);
    } catch (error) {
      next(error);
    }
  });

  // Submit score to leaderboard
  app.post("/api/leaderboards/:id/entries", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const leaderboardId = parseInt(req.params.id);
      const leaderboard = await storage.getLeaderboardById(leaderboardId);
      
      if (!leaderboard) {
        return res.status(404).json({ message: "Leaderboard not found" });
      }
      
      if (!leaderboard.active) {
        return res.status(400).json({ message: "This leaderboard is currently inactive" });
      }
      
      const athlete = await storage.getAthleteByUserId(req.user.id);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      const { value } = req.body;
      
      if (typeof value !== "number") {
        return res.status(400).json({ message: "Value must be a number" });
      }
      
      // Create or update the leaderboard entry
      const entry = await storage.createLeaderboardEntry({
        leaderboardId,
        athleteId: athlete.id,
        value
      });
      
      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  });

  // Save athlete onboarding progress
  app.post("/api/athlete/:id/onboarding/progress", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow saving progress for own profile
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { step, data } = req.body;
      
      // Save progress in session for now since we don't have a dedicated table
      if (!req.session.onboardingProgress) {
        req.session.onboardingProgress = {};
      }
      
      req.session.onboardingProgress[athleteId] = {
        step,
        data,
        timestamp: new Date().toISOString()
      };
      
      await new Promise<void>((resolve) => {
        req.session.save(() => resolve());
      });
      
      res.status(200).json({ 
        message: "Onboarding progress saved",
        step,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Get athlete onboarding progress
  app.get("/api/athlete/:id/onboarding/progress", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own profile progress
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get progress from session
      const progress = req.session.onboardingProgress?.[athleteId];
      
      if (!progress) {
        return res.status(200).json({ 
          exists: false,
          message: "No saved progress found"
        });
      }
      
      res.status(200).json({ 
        exists: true,
        step: progress.step,
        data: progress.data,
        timestamp: progress.timestamp
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Complete athlete onboarding
  app.post("/api/athlete/:id/onboarding", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow completing onboarding for own profile
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate the onboarding data
      try {
        const data = onboardingSchema.parse(req.body);
        
        // 1. Update athlete profile with personal info - Convert Date objects to ISO strings
        const personalInfo = {
          ...data.personalInfo,
          onboardingCompleted: true
        };
        
        // Convert Date objects to strings for database compatibility
        if (personalInfo.dateOfBirth instanceof Date) {
          personalInfo.dateOfBirth = personalInfo.dateOfBirth.toISOString().split('T')[0];
        }
        
        await storage.updateAthlete(athleteId, personalInfo);
        
        // 2. Update or create football info (positions, etc.)
        await storage.updateAthlete(athleteId, {
          ...data.footballInfo
        });
        
        // 3. Create athletic metrics (combine stats)
        if (data.athleticMetrics) {
          await storage.createCombineMetrics({
            ...data.athleticMetrics,
            athleteId
          });
        }
        
        // 4. Create strength & conditioning profile
        if (data.strengthConditioning) {
          await storage.createStrengthConditioning({
            ...data.strengthConditioning,
            athleteId
          });
        }
        
        // 5. Create nutrition profile
        if (data.nutrition) {
          await storage.createNutritionInfo({
            ...data.nutrition,
            athleteId
          });
          
          // Also create a basic nutrition plan with target values
          const currentWeight = data.nutrition.currentWeight;
          if (currentWeight) {
            // Calculate a basic nutrition plan based on current weight
            // These are approximate values that would be refined by the AI later
            const dailyCalories = Math.round(currentWeight * 15); // 15 calories per lb as baseline
            const proteinTarget = Math.round(currentWeight * 0.8); // 0.8g per lb
            const carbTarget = Math.round((dailyCalories * 0.5) / 4); // 50% of calories from carbs
            const fatTarget = Math.round((dailyCalories * 0.25) / 9); // 25% of calories from fat
            
            await storage.createNutritionPlan({
              athleteId,
              goal: "maintenance", // Default goal
              dailyCalories,
              proteinTarget,
              carbTarget,
              fatTarget,
              hydrationTarget: 100, // Basic 100oz recommendation
              restrictions: data.nutrition.dietaryRestrictions || ""
            });
          }
        }
        
        // 6. Create recruiting preferences - Convert Date objects to ISO strings
        if (data.recruitingGoals) {
          const recruitingGoals = { ...data.recruitingGoals };
          
          // Convert Date objects to strings for database compatibility
          if (recruitingGoals.footballSeasonStart instanceof Date) {
            recruitingGoals.footballSeasonStart = recruitingGoals.footballSeasonStart.toISOString().split('T')[0];
          }
          
          if (recruitingGoals.footballSeasonEnd instanceof Date) {
            recruitingGoals.footballSeasonEnd = recruitingGoals.footballSeasonEnd.toISOString().split('T')[0];
          }
          
          await storage.createRecruitingPreferences({
            ...recruitingGoals,
            athleteId
          });
        }
        
        // 7. Create an initial welcome coach message
        await storage.createCoachMessage({
          athleteId,
          message: `Welcome to GridIron LegacyAI, ${athlete.firstName}! I'm your AI Coach and I'll be helping you achieve your football goals. Your profile is now set up and we're ready to start building your personalized training program. Check back here anytime you have questions about your training, nutrition, or football development.`,
          role: "assistant",
          read: false
        });
        
        // 8. Create an initial training plan based on athlete position and strength/conditioning data
        try {
          const { generateInitialTrainingPlan } = require('./training-generator');
          
          // Get position from football info or default
          const position = data.footballInfo?.position || "Unknown";
          
          // Get focus areas from strength & conditioning form if available
          const focusAreas = data.strengthConditioning?.focusAreas || [];
          
          // Generate and create the initial training plan
          const trainingPlan = generateInitialTrainingPlan(athleteId, position, focusAreas);
          await storage.createTrainingPlan(trainingPlan);
          
          console.log(`Created initial training plan for athlete ${athleteId}`);
        } catch (err) {
          console.error("Error creating initial training plan:", err);
          // Continue with onboarding completion even if plan creation fails
        }
        
        res.status(200).json({ 
          message: "Onboarding completed successfully",
          athleteId
        });
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }
      
    } catch (error) {
      next(error);
    }
  });

  // -- Performance Insights Routes --
  
  // Get current performance insights for an athlete
  app.get("/api/athlete/:id/performance-insights", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own insights unless profile is public
      if (athlete.userId !== req.user.id && !athlete.profileVisibility) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const insights = await storage.getPerformanceInsights(athleteId);
      
      if (!insights) {
        return res.status(404).json({ message: "No insights found" });
      }
      
      res.json(insights);
    } catch (error) {
      next(error);
    }
  });
  
  // Generate new performance insights for an athlete
  app.post("/api/athlete/:id/generate-insights", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow generating insights for own profile
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get the athlete's metrics
      const metrics = await storage.getAthleteMetrics(athleteId);
      
      if (!metrics || metrics.length === 0) {
        return res.status(400).json({ message: "No metrics available for analysis" });
      }
      
      // Use OpenAI to analyze the metrics
      const { position } = req.body;
      
      try {
        const analysisResult = await analyzeAthleteMetrics(metrics, position);
        
        // Store the insights in the database with our updated fields
        const updatedInsights = await storage.updatePerformanceInsights(athleteId, {
          strengths: analysisResult.strengths,
          weaknesses: analysisResult.weaknesses,
          recommendations: analysisResult.recommendations,
          performanceTrend: analysisResult.performanceTrend || "stable",
          positionRanking: analysisResult.positionRanking || `Average ${position} with potential to improve`,
          improvementAreas: analysisResult.improvementAreas || [],
          recentAchievements: analysisResult.recentAchievements || [],
          lastUpdated: new Date()
        });
        
        res.json(updatedInsights);
      } catch (error) {
        console.error("Error generating insights:", error);
        return res.status(500).json({ message: "Failed to generate insights" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // -- Team Management Routes --
  
  // Get all teams
  app.get("/api/teams", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      next(error);
    }
  });
  
  // Get teams for an athlete
  app.get("/api/athlete/:id/teams", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      
      // Check if user has access to this athlete's data
      if (req.user?.id !== athleteId && req.user?.userType !== "admin" && req.user?.userType !== "coach") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const teams = await storage.getAthleteTeams(athleteId);
      res.json(teams);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific team
  app.get("/api/teams/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new team
  app.post("/api/teams", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Set the current user as the coach if not specified
      if (!req.body.coachId) {
        req.body.coachId = req.user.id;
      }
      
      // Coaches and admins can create teams
      const isCoachOrAdmin = req.user.userType === "coach" || req.user.userType === "admin";
      
      // Athletes can also create their own teams
      if (!isCoachOrAdmin && req.body.coachId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to create a team" });
      }
      
      const team = await storage.createTeam(req.body);
      res.status(201).json(team);
    } catch (error) {
      next(error);
    }
  });
  
  // Update a team
  app.patch("/api/teams/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only team coach or admin can update the team
      if (team.coachId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this team" });
      }
      
      const updatedTeam = await storage.updateTeam(teamId, req.body);
      res.json(updatedTeam);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete a team (set to inactive)
  app.delete("/api/teams/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only team coach or admin can delete the team
      if (team.coachId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this team" });
      }
      
      // Don't actually delete, just mark as inactive
      const updatedTeam = await storage.updateTeam(teamId, { isActive: false });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  // Get team members
  app.get("/api/teams/:id/members", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const members = await storage.getTeamMembers(teamId);
      
      // Enhance member data with athlete info
      const enhancedMembers = await Promise.all(
        members.map(async (member) => {
          const athlete = await storage.getAthlete(member.athleteId);
          if (athlete) {
            return {
              ...member,
              firstName: athlete.firstName,
              lastName: athlete.lastName
            };
          }
          return member;
        })
      );
      
      res.json(enhancedMembers);
    } catch (error) {
      next(error);
    }
  });
  
  // Add member to team
  app.post("/api/teams/:id/members", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const athleteId = req.body.athleteId;
      
      // Check if athlete exists
      const athlete = await storage.getAthlete(athleteId);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Check if athlete is already on the team
      const existingMember = await storage.getTeamMember(teamId, athleteId);
      if (existingMember) {
        return res.status(409).json({ message: "Athlete is already a member of this team" });
      }
      
      // Add athlete to team
      const member = await storage.createTeamMember({
        teamId,
        athleteId,
        role: req.body.role || "player",
        position: req.body.position || null,
        jerseyNumber: req.body.jerseyNumber || null,
        isActive: true,
        status: "active"
      });
      
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  });
  
  // Remove member from team
  app.delete("/api/teams/:teamId/members/:athleteId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.teamId);
      const athleteId = parseInt(req.params.athleteId);
      
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach, admin, or the athlete themselves can remove the athlete
      if (team.coachId !== req.user.id && req.user.userType !== "admin" && 
          req.user.athlete?.id !== athleteId) {
        return res.status(403).json({ message: "Not authorized to remove this member" });
      }
      
      // Get the team member
      const member = await storage.getTeamMember(teamId, athleteId);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      // Remove member
      await storage.removeTeamMember(member.id);
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  // Get team events
  app.get("/api/teams/:id/events", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const events = await storage.getTeamEvents(teamId);
      res.json(events);
    } catch (error) {
      next(error);
    }
  });
  
  // Create team event
  app.post("/api/teams/:id/events", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only team coach or admin can create events
      if (team.coachId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ message: "Not authorized to create events for this team" });
      }
      
      // Create the event
      const event = await storage.createTeamEvent({
        ...req.body,
        teamId,
        createdBy: req.user.id
      });
      
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  });
  
  // Get attendance for an event
  app.get("/api/teams/:teamId/events/:eventId/attendance", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.teamId);
      const eventId = parseInt(req.params.eventId);
      
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const event = await storage.getTeamEvent(eventId);
      
      if (!event || event.teamId !== teamId) {
        return res.status(404).json({ message: "Event not found for this team" });
      }
      
      const attendance = await storage.getTeamEventAttendance(eventId);
      res.json(attendance);
    } catch (error) {
      next(error);
    }
  });
  
  // Update attendance for an event
  app.post("/api/teams/:teamId/events/:eventId/attendance", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.teamId);
      const eventId = parseInt(req.params.eventId);
      const athleteId = req.body.athleteId;
      const status = req.body.status;
      
      if (!athleteId || !status) {
        return res.status(400).json({ message: "Athlete ID and status are required" });
      }
      
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const event = await storage.getTeamEvent(eventId);
      
      if (!event || event.teamId !== teamId) {
        return res.status(404).json({ message: "Event not found for this team" });
      }
      
      // Check if the user is authorized (is the athlete, coach, or admin)
      const isAuthorized = req.user.athlete?.id === athleteId || 
                           team.coachId === req.user.id || 
                           req.user.userType === "admin";
                           
      if (!isAuthorized) {
        return res.status(403).json({ message: "Not authorized to update this attendance" });
      }
      
      // Check if the athlete is on the team
      const member = await storage.getTeamMember(teamId, athleteId);
      
      if (!member) {
        return res.status(404).json({ message: "Athlete is not a member of this team" });
      }
      
      // Check if attendance record exists already
      let attendance = await storage.getAthleteTeamEventAttendance(eventId, athleteId);
      
      if (attendance) {
        // Update existing record
        attendance = await storage.updateTeamEventAttendance(attendance.id, { status });
      } else {
        // Create new record
        attendance = await storage.createTeamEventAttendance({
          eventId,
          athleteId,
          status,
          notes: req.body.notes || null
        });
      }
      
      res.json(attendance);
    } catch (error) {
      next(error);
    }
  });
  
  // Get team announcements
  app.get("/api/teams/:id/announcements", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const announcements = await storage.getTeamAnnouncements(teamId);
      res.json(announcements);
    } catch (error) {
      next(error);
    }
  });
  
  // Create team announcement
  app.post("/api/teams/:id/announcements", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only team coach or admin can create announcements
      if (team.coachId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ message: "Not authorized to create announcements for this team" });
      }
      
      // Create the announcement
      const announcement = await storage.createTeamAnnouncement({
        ...req.body,
        teamId,
        publishedBy: req.user.id,
        importance: req.body.importance || "normal"
      });
      
      res.status(201).json(announcement);
    } catch (error) {
      next(error);
    }
  });
  
  // Get teams for a specific athlete
  app.get("/api/athlete/:id/teams", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own teams unless profile is public
      if (athlete.userId !== req.user.id && !athlete.profileVisibility) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const teams = await storage.getTeamsByAthlete(athleteId);
      res.json(teams);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific team by ID
  app.get("/api/teams/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new team
  app.post("/api/teams", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // For now, only users with isCoach flag can create teams
      const user = await storage.getUser(req.user.id);
      
      if (!user.isCoach) {
        return res.status(403).json({ message: "Only coaches can create teams" });
      }
      
      // Validate the team data
      try {
        const validated = insertTeamSchema.parse({
          ...req.body,
          coachId: req.user.id
        });
        
        const team = await storage.createTeam(validated);
        res.status(201).json(team);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Update a team
  app.patch("/api/teams/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach or admin can update team
      if (team.coachId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Only the coach can update this team" });
      }
      
      const updatedTeam = await storage.updateTeam(teamId, req.body);
      res.json(updatedTeam);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete a team
  app.delete("/api/teams/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach or admin can delete team
      if (team.coachId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Only the coach can delete this team" });
      }
      
      await storage.deleteTeam(teamId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // -- Team Members Routes --
  
  // Get all members of a team
  app.get("/api/teams/:id/members", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const members = await storage.getTeamMembers(teamId);
      res.json(members);
    } catch (error) {
      next(error);
    }
  });
  
  // Add member to a team
  app.post("/api/teams/:id/members", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach can add members
      if (team.coachId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Only the coach can add members" });
      }
      
      try {
        const validated = insertTeamMemberSchema.parse({
          ...req.body,
          teamId
        });
        
        // Check if member already exists
        const existingMember = await storage.getTeamMemberByAthlete(teamId, validated.athleteId);
        
        if (existingMember) {
          return res.status(400).json({ message: "Athlete is already a member of this team" });
        }
        
        const member = await storage.addTeamMember(validated);
        res.status(201).json(member);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Update a team member
  app.patch("/api/teams/:teamId/members/:memberId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.teamId);
      const memberId = parseInt(req.params.memberId);
      
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach can update members
      if (team.coachId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Only the coach can update members" });
      }
      
      const updatedMember = await storage.updateTeamMember(memberId, req.body);
      
      if (!updatedMember) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json(updatedMember);
    } catch (error) {
      next(error);
    }
  });
  
  // Remove member from team
  app.delete("/api/teams/:teamId/members/:memberId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.teamId);
      const memberId = parseInt(req.params.memberId);
      
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach can remove members
      if (team.coachId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Only the coach can remove members" });
      }
      
      await storage.removeTeamMember(memberId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // -- Team Events Routes --
  
  // Get all events for a team
  app.get("/api/teams/:id/events", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const events = await storage.getTeamEvents(teamId);
      res.json(events);
    } catch (error) {
      next(error);
    }
  });
  
  // Create an event for a team
  app.post("/api/teams/:id/events", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach can create events
      if (team.coachId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Only the coach can create events" });
      }
      
      try {
        const validated = insertTeamEventSchema.parse({
          ...req.body,
          teamId,
          createdBy: req.user.id
        });
        
        const event = await storage.createTeamEvent(validated);
        res.status(201).json(event);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Update a team event
  app.patch("/api/teams/:teamId/events/:eventId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.teamId);
      const eventId = parseInt(req.params.eventId);
      
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach can update events
      if (team.coachId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Only the coach can update events" });
      }
      
      const updatedEvent = await storage.updateTeamEvent(eventId, req.body);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete a team event
  app.delete("/api/teams/:teamId/events/:eventId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.teamId);
      const eventId = parseInt(req.params.eventId);
      
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach can delete events
      if (team.coachId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Only the coach can delete events" });
      }
      
      await storage.deleteTeamEvent(eventId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Record attendance for an event
  app.post("/api/teams/:teamId/events/:eventId/attendance", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.teamId);
      const eventId = parseInt(req.params.eventId);
      
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach can record attendance
      if (team.coachId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Only the coach can record attendance" });
      }
      
      try {
        const { memberId, status } = req.body;
        
        const attendance = await storage.recordEventAttendance({
          eventId,
          memberId,
          status,
          recordedBy: req.user.id
        });
        
        res.status(201).json(attendance);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Get attendance for an event
  app.get("/api/teams/:teamId/events/:eventId/attendance", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.teamId);
      const eventId = parseInt(req.params.eventId);
      
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const attendance = await storage.getEventAttendance(eventId);
      res.json(attendance);
    } catch (error) {
      next(error);
    }
  });
  
  // -- Team Announcements Routes --
  
  // Get all announcements for a team
  app.get("/api/teams/:id/announcements", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const announcements = await storage.getTeamAnnouncements(teamId);
      res.json(announcements);
    } catch (error) {
      next(error);
    }
  });
  
  // Create an announcement for a team
  app.post("/api/teams/:id/announcements", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach can create announcements
      if (team.coachId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Only the coach can create announcements" });
      }
      
      try {
        const validated = insertTeamAnnouncementSchema.parse({
          ...req.body,
          teamId,
          publishedBy: req.user.id
        });
        
        const announcement = await storage.createTeamAnnouncement(validated);
        res.status(201).json(announcement);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Update a team announcement
  app.patch("/api/teams/:teamId/announcements/:announcementId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.teamId);
      const announcementId = parseInt(req.params.announcementId);
      
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach can update announcements
      if (team.coachId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Only the coach can update announcements" });
      }
      
      const updatedAnnouncement = await storage.updateTeamAnnouncement(announcementId, req.body);
      
      if (!updatedAnnouncement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      res.json(updatedAnnouncement);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete a team announcement
  app.delete("/api/teams/:teamId/announcements/:announcementId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const teamId = parseInt(req.params.teamId);
      const announcementId = parseInt(req.params.announcementId);
      
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Only coach can delete announcements
      if (team.coachId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Only the coach can delete announcements" });
      }
      
      await storage.deleteTeamAnnouncement(announcementId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // -- Recruiting Routes --
  
  // Get recruiting analytics
  app.get("/api/athlete/:id/recruiting/analytics", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Increment profile views if accessed by someone other than the athlete
      if (athlete.userId !== req.user.id) {
        await storage.incrementProfileViews(athleteId);
      }
      
      // Get analytics data
      let analytics = await storage.getRecruitingAnalytics(athleteId);
      
      // Create analytics if doesn't exist yet
      if (!analytics) {
        analytics = await storage.createRecruitingAnalytics({
          athleteId,
          profileViews: 0,
          uniqueViewers: 0,
          interestLevel: 0,
          bookmarksCount: 0,
          messagesSent: 0,
          connectionsCount: 0,
          viewsOverTime: [],
          interestBySchoolType: [],
          interestByPosition: [],
          interestByRegion: [],
          topSchools: []
        });
      }
      
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  });
  
  // Get recruiting messages
  app.get("/api/athlete/:id/recruiting/messages", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.id);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Check if user is authorized to view messages
      if (athlete.userId !== req.user.id && req.user.userType !== "coach" && req.user.userType !== "admin") {
        return res.status(403).json({ message: "Not authorized to view messages" });
      }
      
      // Get messages
      const messages = await storage.getRecruitingMessages(req.user.id);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });
  
  // Send recruiting message
  app.post("/api/athlete/:id/recruiting/messages", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const recipientAthleteId = parseInt(req.params.id);
      const recipientAthlete = await storage.getAthlete(recipientAthleteId);
      
      if (!recipientAthlete) {
        return res.status(404).json({ message: "Recipient athlete not found" });
      }
      
      // Create the message
      const message = await storage.createRecruitingMessage({
        senderId: req.user.id,
        recipientId: recipientAthlete.userId,
        subject: req.body.subject,
        content: req.body.content,
        attachments: req.body.attachments || [],
        read: false
      });
      
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  });
  
  // Mark message as read
  app.patch("/api/recruiting/messages/:id/read", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const messageId = parseInt(req.params.id);
      const message = await storage.getRecruitingMessageById(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Check if user is authorized to mark as read
      if (message.recipientId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to mark this message as read" });
      }
      
      const updatedMessage = await storage.markRecruitingMessageAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      next(error);
    }
  });

  // -- Recruiting Analytics Routes --
  app.get("/api/recruiting/analytics/:athleteId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.athleteId);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own analytics
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Increment profile views when the analytics are viewed
      await storage.incrementProfileViews(athleteId);
      
      // Get the analytics data
      let analytics = await storage.getRecruitingAnalytics(athleteId);
      
      // If no analytics exist, create initial analytics
      if (!analytics) {
        analytics = await storage.createRecruitingAnalytics({
          athleteId,
          profileViews: 1,
          uniqueViewers: 1,
          interestLevel: 10,
          bookmarksCount: 0,
          messagesSent: 0,
          connectionsCount: 0,
          viewsOverTime: JSON.stringify([
            { date: new Date().toISOString().split('T')[0], count: 1 }
          ]),
          interestBySchoolType: JSON.stringify([
            { name: 'Division I', value: 3 },
            { name: 'Division II', value: 5 },
            { name: 'Division III', value: 8 }
          ]),
          interestByPosition: JSON.stringify([
            { name: athlete.position, value: 12 }
          ]),
          interestByRegion: JSON.stringify([
            { name: 'Northeast', value: 4 },
            { name: 'Southeast', value: 6 },
            { name: 'Midwest', value: 3 },
            { name: 'West', value: 2 }
          ]),
          topSchools: JSON.stringify([])
        });
      }
      
      // Parse JSON fields for client
      const parsedAnalytics = {
        ...analytics,
        viewsOverTime: JSON.parse(analytics.viewsOverTime as string),
        interestBySchoolType: JSON.parse(analytics.interestBySchoolType as string),
        interestByPosition: JSON.parse(analytics.interestByPosition as string),
        interestByRegion: JSON.parse(analytics.interestByRegion as string),
        topSchools: JSON.parse(analytics.topSchools as string)
      };
      
      res.json(parsedAnalytics);
    } catch (error) {
      next(error);
    }
  });

  // -- Recruiting Messages Routes --
  app.get("/api/recruiting/messages/:athleteId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.athleteId);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow access to own messages
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getRecruitingMessages(athleteId);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/recruiting/messages/detail/:messageId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const messageId = parseInt(req.params.messageId);
      const message = await storage.getRecruitingMessageById(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Verify access
      const recipientUser = await storage.getUser(message.recipientId);
      if (!recipientUser) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      if (recipientUser.id !== req.user.id && message.senderId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(message);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/recruiting/messages/:athleteId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.athleteId);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow sending messages from own account
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate and create the message
      const { schoolId, subject, content } = req.body;
      
      if (!schoolId || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // For demo purposes, we're creating a mock school coach as recipient
      // In a real app, this would be an actual coach's user ID
      const coachId = 999; // Example school coach ID
      const schoolName = "Sample University"; // This would be fetched from a schools table
      
      const message = await storage.createRecruitingMessage({
        senderId: req.user.id,
        recipientId: coachId,
        message: content,
        schoolName,
        subject: subject || "Recruiting Inquiry",
        attachment: req.body.attachment || null,
        isReply: false,
        parentMessageId: null
      });
      
      // Update message count in analytics
      const analytics = await storage.getRecruitingAnalytics(athleteId);
      if (analytics) {
        await storage.updateRecruitingAnalytics(analytics.id, {
          messagesSent: analytics.messagesSent + 1
        });
      }
      
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/recruiting/messages/:messageId/read", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const messageId = parseInt(req.params.messageId);
      const message = await storage.getRecruitingMessageById(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only recipient can mark as read
      if (message.recipientId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedMessage = await storage.markRecruitingMessageAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      next(error);
    }
  });

  // -- Profile Sharing Route --
  app.post("/api/recruiting/share/:athleteId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const athleteId = parseInt(req.params.athleteId);
      const athlete = await storage.getAthlete(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Only allow sharing own profile
      if (athlete.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { platform, message } = req.body;
      
      if (!platform) {
        return res.status(400).json({ message: "Platform is required" });
      }
      
      // Update analytics to reflect the share
      const analytics = await storage.getRecruitingAnalytics(athleteId);
      if (analytics) {
        await storage.updateRecruitingAnalytics(analytics.id, {
          interestLevel: Math.min(100, analytics.interestLevel + 5)
        });
      }
      
      // In a real app, we would implement actual sharing functionality here
      // For now, we just return a success message
      
      res.json({ 
        success: true, 
        message: `Profile shared via ${platform}`,
        shareUrl: `https://gridiron.app/athlete/${athleteId}` 
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
