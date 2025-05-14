import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, Athlete } from "@shared/schema";
import { athleteRegistrationSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    // Define the User interface (avoiding circular reference)
    interface User {
      id: number;
      username: string;
      password: string;
      email: string;
      userType: string;
      createdAt: Date;
      firstName?: string;
      lastName?: string;
      athlete?: Athlete;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "legacy-ai-football-dev-secret",
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        
        // Get athlete data if exists
        const athlete = await storage.getAthleteByUserId(user.id);
        const userWithAthlete = {
          ...user,
          athlete
        };
        
        return done(null, userWithAthlete);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      
      const athlete = await storage.getAthleteByUserId(user.id);
      const userWithAthlete = {
        ...user,
        athlete
      };
      
      done(null, userWithAthlete);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate the registration data
      const validatedData = athleteRegistrationSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create the user with hashed password
      const { firstName, lastName, position, confirmPassword, ...userData } = validatedData;
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });
      
      // Create the athlete profile
      const athlete = await storage.createAthlete({
        userId: user.id,
        firstName,
        lastName,
        position,
        subscriptionTier: "free",
        profileVisibility: true,
      });
      
      // Log the user in
      const userWithAthlete = { ...user, athlete };
      req.login(userWithAthlete, (err) => {
        if (err) return next(err);
        
        // Don't send password back to client
        const { password, ...userWithoutPassword } = userWithAthlete;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      // Validate the login data
      loginSchema.parse(req.body);
      
      passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        req.login(user, (err) => {
          if (err) return next(err);
          
          // Save the session explicitly to ensure it's stored before responding
          req.session.save((err) => {
            if (err) return next(err);
            
            // Don't send password back to client
            const { password, ...userWithoutPassword } = user;
            console.log("User authenticated, session saved:", req.sessionID);
            res.status(200).json(userWithoutPassword);
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("GET /api/user - Session:", {
      id: req.sessionID,
      authenticated: req.isAuthenticated(),
      cookie: req.session?.cookie,
      user: req.user ? `ID: ${req.user.id}, Type: ${req.user.userType}` : 'None'
    });
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Don't send password back to client
    const { password, ...userWithoutPassword } = req.user;
    
    // Refresh the session to extend its lifetime
    req.session.touch();
    
    res.json(userWithoutPassword);
  });
}
