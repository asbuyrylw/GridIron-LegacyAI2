import { generateCoachingResponse, generateTrainingPlan, analyzeAthleteMetrics, generateMealSuggestion } from "./openai";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
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
  insertLeaderboardEntrySchema
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
          restrictions || nutritionPlan.restrictions || ""
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

  // Update achievement progress
  app.patch("/api/athlete/achievements/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const achievementId = parseInt(req.params.id);
      const { progress, completed } = req.body;
      
      // Validate progress is a number between 0-100
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
      }
      
      const updatedAchievement = await storage.updateAthleteAchievementProgress(
        achievementId,
        progress,
        completed
      );
      
      if (!updatedAchievement) {
        return res.status(404).json({ message: "Achievement not found" });
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

  const httpServer = createServer(app);
  return httpServer;
}
