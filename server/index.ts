import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createTestUser } from "./create-test-user";
import { createTestUsers } from "./create-test-users";
import { seedAchievements } from "./seed-achievements";
import { seedLeaderboards } from "./leaderboard-storage";
import { storage } from "./storage";
import { extendMemStorageWithFootballIq } from "./football-iq-storage";
import { extendMemStorageWithCoachEvaluations, seedEvaluationTemplates } from "./coach-evaluation-storage";
import { extendMemStorageWithSkillProgression } from "./skill-progression-storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Create test user for easy testing
  await createTestUser().catch(err => {
    console.error('Error creating test user:', err);
  });
  
  // Create additional test users (parents and coaches)
  await createTestUsers().catch(err => {
    console.error('Error creating additional test users:', err);
  });
  
  // Seed default achievements
  await seedAchievements(storage).catch(err => {
    console.error('Error seeding achievements:', err);
  });
  
  // Seed default leaderboards
  await seedLeaderboards(storage).catch(err => {
    console.error('Error seeding leaderboards:', err);
  });
  
  // Initialize Football IQ storage methods
  extendMemStorageWithFootballIq(storage);
  console.log('Football IQ assessment system initialized');
  
  // Initialize Coach Evaluations storage methods
  extendMemStorageWithCoachEvaluations(storage);
  await seedEvaluationTemplates(storage);
  console.log('Coach Evaluations system initialized');
  
  // Initialize Skill Progression system
  extendMemStorageWithSkillProgression(storage);
  console.log('Skill Progression system initialized');
  
  // Initialize external integration services
  try {
    // Import the services to trigger their initialization
    await Promise.all([
      import('./services/twitter-service'),
      import('./services/hudl-service'),
      import('./services/maxpreps-service')
    ]);
  } catch (error) {
    console.error('Error initializing external integration services:', error);
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
