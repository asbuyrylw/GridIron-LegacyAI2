import { pgTable, text, serial, integer, boolean, timestamp, json, real, date, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Leaderboard types
export type LeaderboardPeriod = 'all-time' | 'yearly' | 'monthly' | 'weekly' | 'daily' | 'event';

// Growth prediction types
export interface GrowthPrediction {
  predictedHeight: string;
  predictedHeightCm: number;
  predictedHeightInches: number;
  percentComplete: number;
  growthRemaining: number;
  predictedRange: string;
  recommendedPositions: string[];
  calculatedAt: string;
}

// Schema for height prediction form inputs
export interface GrowthPrediction {
  predictedHeight: string;
  predictedHeightCm: number;
  predictedHeightInches: number;
  percentComplete: number;
  growthRemaining: number;
  predictedRange: string;
  recommendedPositions: string[];
  calculatedAt: string;
}

export const heightPredictionSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().min(5).max(18),
  currentHeight: z.number().min(36).max(84), // Height in inches or cm
  currentHeightUnit: z.enum(["in", "cm"]).default("in"),
  currentWeight: z.number().min(40).max(350), // Weight in pounds or kg
  currentWeightUnit: z.enum(["lb", "kg"]).default("lb"),
  motherHeight: z.number().min(48).max(78), // Height in inches or cm
  motherHeightUnit: z.enum(["in", "cm"]).default("in"),
  fatherHeight: z.number().min(60).max(84), // Height in inches or cm
  fatherHeightUnit: z.enum(["in", "cm"]).default("in"),
  birthMonth: z.number().min(1).max(12),
  birthDay: z.number().min(1).max(31),
  birthYear: z.number().min(2000).max(new Date().getFullYear() - 5),
});

// Type for college match results from the College Matcher tool
export interface MatchedCollege {
  id: number;
  name: string;
  division: string;
  conference?: string;
  region: string;
  state: string;
  city: string;
  isPublic: boolean;
  enrollment: number;
  admissionRate?: number;
  averageGPA?: number;
  athleticRanking?: number;
  programs: string[];
  tuition?: {
    inState: number;
    outOfState: number;
  };
  athleticScholarships?: boolean;
  sportOfferings?: string[];
  academicMatch: number;
  athleticMatch: number;
  overallMatch: number;
  financialFit?: number;
  locationFit?: number;
  scholarshipPotential?: string;
  admissionChance?: string;
  campusSize?: string;
  matchingReasons?: string[];
  athleticFacilities?: string[];
  academicSupport?: string[];
  recruitingProfile?: {
    activelyRecruiting: string[];
    offensiveStyle?: string;
    defensiveStyle?: string;
    recentSuccess?: string;
  };
  website?: string;
  imageUrl?: string;
  notes?: string;
}

// Achievement types and levels
export const achievementTypeEnum = pgEnum('achievement_type', [
  'performance',
  'training',
  'nutrition',
  'profile',
  'social',
  'recruiting',
  'academic'
]);

export const achievementLevelEnum = pgEnum('achievement_level', [
  'bronze',
  'silver',
  'gold',
  'platinum'
]);

// Skill categories and levels
export const skillCategoryEnum = pgEnum('skill_category', [
  'athleticism',
  'technique',
  'gameIQ',
  'leadership',
  'positionSpecific'
]);

export const skillLevelEnum = pgEnum('skill_level', [
  'beginner',
  'intermediate',
  'advanced',
  'elite'
]);

export const userTypeEnum = pgEnum('user_type', [
  'athlete',
  'parent',
  'coach',
  'admin'
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  userType: text("user_type", { enum: ['athlete', 'parent', 'coach', 'admin'] }).notNull().default("athlete"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const athletes = pgTable("athletes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  phoneNumber: text("phone_number"),
  zipCode: text("zip_code"),
  
  // Parent/Guardian Info
  parentGuardianName: text("parent_guardian_name"),
  parentGuardianEmail: text("parent_guardian_email"),
  parentGuardianPhone: text("parent_guardian_phone"),
  parentGuardianRelationship: text("parent_guardian_relationship"),
  
  // School Info
  school: text("school"),
  graduationYear: integer("graduation_year"),
  
  // Football Info
  jerseyNumber: text("jersey_number"),
  position: text("position").notNull(),
  secondaryPositions: json("secondary_positions"), // Array of positions
  yearsPlayed: integer("years_played"),
  teamLevel: text("team_level"), // Varsity Starter, JV, etc.
  captainLeadershipRoles: text("captain_leadership_roles"),
  coachName: text("coach_name"),
  
  // Physical Metrics
  height: text("height"),
  weight: integer("weight"),
  projectedHeight: text("projected_height"),
  bodyFat: real("body_fat"),
  fatherHeight: integer("father_height"),
  motherHeight: integer("mother_height"),
  growthPrediction: json("growth_prediction"),
  
  // Academic Info
  gpa: real("gpa"),
  weightedGpa: real("weighted_gpa"),
  actScore: integer("act_score"),
  satScore: integer("sat_score"),
  ncaaEligibility: boolean("ncaa_eligibility"),
  coreGpa: real("core_gpa"),
  apHonorsClasses: text("ap_honors_classes"),
  volunteerWork: text("volunteer_work"),
  intendedMajors: text("intended_majors"),
  preferredMajor: text("preferred_major"),
  
  // Location Info
  state: text("state"),
  region: text("region"), // Northeast, Southeast, South, Midwest, West, Northwest, Southwest
  
  // Recruiting Preferences
  targetDivision: text("target_division"), // D1, D2, D3, NAIA, JUCO
  preferredRegions: json("preferred_regions"), // Array of preferred regions
  preferredStates: json("preferred_states"), // Array of preferred states
  academicPriority: integer("academic_priority"), // 1-10 scale of importance
  athleticPriority: integer("athletic_priority"), // 1-10 scale of importance
  distancePriority: integer("distance_priority"), // 1-10 scale of importance
  financialAidImportance: integer("financial_aid_importance"), // 1-10 scale of importance
  schoolsOfInterest: json("schools_of_interest"), // Array of school names
  
  // Social/Recruiting Links
  hudlLink: text("hudl_link"),
  twitterLink: text("twitter_link"),
  maxPrepsLink: text("max_preps_link"),
  hasHighlightFilm: boolean("has_highlight_film").default(false),
  attendedCamps: boolean("attended_camps").default(false),
  
  // Profile Settings
  profileImage: text("profile_image"),
  backgroundImage: text("background_image"),
  profileVisibility: boolean("profile_visibility").default(true),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  
  // Subscription
  subscriptionTier: text("subscription_tier").default("free"), // free, starter, elite
  subscriptionRenewal: timestamp("subscription_renewal"),
});

// Separate table for player's strength & conditioning info
export const strengthConditioning = pgTable("strength_conditioning", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  yearsTraining: integer("years_training"),
  daysPerWeek: integer("days_per_week"),
  trainingFocus: json("training_focus"), // Array of focuses
  areasToImprove: json("areas_to_improve"), // Array of areas
  gymAccess: text("gym_access"),
  sleepHours: integer("sleep_hours"),
  recoveryMethods: json("recovery_methods"), // Array of methods
  injuriesSurgeries: text("injuries_surgeries"), // Legacy field
  
  // Enhanced injury tracking
  currentInjuries: json("current_injuries").default('[]'), // Array of injury objects
  pastSurgeries: json("past_surgeries").default('[]'), // Array of surgery objects
  concussionHistory: json("concussion_history").default('[]'), // Array of concussion objects
  medicalClearance: boolean("medical_clearance").default(false),
  medicalNotes: text("medical_notes"),
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Separate table for player's nutrition info
export const nutritionInfo = pgTable("nutrition_info", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  currentWeight: integer("current_weight"),
  targetWeight: integer("target_weight"), // Set by AI
  currentCalories: integer("current_calories"),
  targetCalories: integer("target_calories"), // Set by AI
  mealFrequency: integer("meal_frequency"),
  waterIntake: integer("water_intake"),
  dietaryRestrictions: text("dietary_restrictions"),
  supplementsUsed: text("supplements_used"),
  foodAllergies: text("food_allergies"),
  breakfastRoutine: text("breakfast_routine"),
  cookingAccess: json("cooking_access"), // Array of options
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Separate table for player's recruiting preferences
export const recruitingPreferences = pgTable("recruiting_preferences", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  desiredDivision: text("desired_division"),
  schoolsOfInterest: json("schools_of_interest"), // Array of schools
  personalStatement: text("personal_statement"),
  hasHighlightFilm: boolean("has_highlight_film").default(false),
  attendedCamps: boolean("attended_camps").default(false),
  footballSeasonStart: date("football_season_start"),
  footballSeasonEnd: date("football_season_end"),
  preferredTrainingDays: json("preferred_training_days"), // Array of days
  recruitingGoals: text("recruiting_goals"),
  collegePreferences: json("college_preferences"), // Academic programs, locations, school size
  collegeRecruiterContacts: json("college_recruiter_contacts").default('[]'), // Array of recruiter contacts
  topSeasonGoal: text("top_season_goal"),
  preferMotivationalMessages: boolean("prefer_motivational_messages").default(false),
  motivationalMessageTypes: json("motivational_message_types").default('[]'), // Array of motivation types
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Recruiting profile table for extended information
export const recruitingProfiles = pgTable("recruiting_profiles", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull().unique(),
  city: text("city"),
  state: text("state"),
  achievements: json("achievements").default('[]'), // Array of achievements/awards
  personalStatement: text("personal_statement"),
  coachReferenceName: text("coach_reference_name"),
  coachReferenceEmail: text("coach_reference_email"),
  highlightVideoUrl: text("highlight_video_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Parent profiles for tracking parent/guardian information
export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  relationship: text("relationship").notNull(), // Father, Mother, Guardian, etc.
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  occupation: text("occupation"),
  emergencyContact: boolean("emergency_contact").default(true),
  secondaryEmail: text("secondary_email"),
  receivesNotifications: boolean("receives_notifications").default(true),
  preferredContactMethod: text("preferred_contact_method").default("email"), // email, phone, text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Parent-Athlete relationships table to allow parents to manage multiple athletes
export const parentAthleteRelationships = pgTable("parent_athlete_relationships", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => parents.id).notNull(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  isPrimary: boolean("is_primary").default(false), // Is this the primary parent/guardian
  relationship: text("relationship").notNull(), // Father, Mother, Guardian, etc.
  hasViewAccess: boolean("has_view_access").default(true),
  hasEditAccess: boolean("has_edit_access").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Coach profiles for tracking coach information
export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  title: text("title"), // Head Coach, Assistant Coach, Position Coach, etc.
  bio: text("bio"),
  yearsExperience: integer("years_experience"),
  certifications: json("certifications").default('[]'), // Array of coaching certifications
  specialties: json("specialties").default('[]'), // Array of coaching specialties (e.g., Offense, Defense, QBs, etc.)
  profileImage: text("profile_image"),
  philosophy: text("philosophy"),
  achievements: json("achievements").default('[]'), // Array of coaching achievements
  education: text("education"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expanded combine metrics table to include more athletic tests
export const combineMetrics = pgTable("combine_metrics", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  fortyYard: real("forty_yard"),
  tenYardSplit: real("ten_yard_split"),
  shuttle: real("shuttle"), // 5-10-5 shuttle
  threeCone: real("three_cone"),
  verticalJump: real("vertical_jump"),
  broadJump: real("broad_jump"),
  benchPress: integer("bench_press"), // Max weight
  benchPressReps: integer("bench_press_reps"), // Reps at 225 lbs
  squatMax: integer("squat_max"),
  powerClean: integer("power_clean"),
  deadlift: integer("deadlift"),
  pullUps: integer("pull_ups"),
  dateRecorded: timestamp("date_recorded").defaultNow().notNull(),
});

// Table for tracking game stats by year and position
export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  season: integer("season").notNull(), // Year, e.g., 2025
  position: text("position").notNull(), // QB, WR, RB, etc.
  
  // General stats (apply to all positions)
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesStarted: integer("games_started").notNull().default(0),
  
  // Offensive stats
  passingYards: integer("passing_yards").default(0),
  passingTouchdowns: integer("passing_touchdowns").default(0),
  passingCompletions: integer("passing_completions").default(0),
  passingAttempts: integer("passing_attempts").default(0),
  passingInterceptions: integer("passing_interceptions").default(0),
  
  rushingYards: integer("rushing_yards").default(0),
  rushingAttempts: integer("rushing_attempts").default(0),
  rushingTouchdowns: integer("rushing_touchdowns").default(0),
  
  receivingYards: integer("receiving_yards").default(0),
  receivingReceptions: integer("receiving_receptions").default(0),
  receivingTouchdowns: integer("receiving_touchdowns").default(0),
  receivingTargets: integer("receiving_targets").default(0),
  
  // Defensive stats
  tackles: integer("tackles").default(0),
  soloTackles: integer("solo_tackles").default(0),
  assistedTackles: integer("assisted_tackles").default(0),
  tacklesForLoss: integer("tackles_for_loss").default(0),
  sacks: integer("sacks").default(0),
  interceptions: integer("interceptions").default(0),
  passesDefended: integer("passes_defended").default(0),
  forcedFumbles: integer("forced_fumbles").default(0),
  fumbleRecoveries: integer("fumble_recoveries").default(0),
  
  // Special teams
  fieldGoalsMade: integer("field_goals_made").default(0),
  fieldGoalsAttempted: integer("field_goals_attempted").default(0),
  extraPointsMade: integer("extra_points_made").default(0),
  extraPointsAttempted: integer("extra_points_attempted").default(0),
  puntingYards: integer("punting_yards").default(0),
  puntingAttempts: integer("punting_attempts").default(0),
  
  notes: text("notes"),
  verified: boolean("verified").default(false),
  verifiedBy: integer("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Exercise library table with categorized football-specific exercises
export const exerciseLibrary = pgTable("exercise_library", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Speed, Strength, Agility, Position-Specific, Recovery, etc.
  difficulty: text("difficulty").notNull(), // Beginner, Intermediate, Advanced
  muscleGroups: json("muscle_groups").notNull(), // Array of targeted muscle groups
  equipmentNeeded: json("equipment_needed").default('[]'), // Array of required equipment
  videoUrl: text("video_url"), // Optional demonstration video
  imageUrl: text("image_url"), // Optional image demonstration
  instructions: json("instructions").notNull(), // Array of step-by-step instructions
  tips: json("tips").default('[]'), // Array of coaching tips
  positionSpecific: boolean("position_specific").default(false),
  positions: json("positions").default('[]'), // Array of football positions this exercise is good for
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trainingPlans = pgTable("training_plans", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  date: date("date").notNull(),
  title: text("title").notNull(),
  focus: text("focus").notNull(), // Speed, Strength, Agility, etc.
  exercises: json("exercises").notNull(),
  completed: boolean("completed").default(false),
  coachTip: text("coach_tip"),
  active: boolean("active").default(true), // Whether this plan is currently active
  duration: integer("duration"), // Estimated duration in minutes
  difficultyLevel: text("difficulty_level"), // Easy, Medium, Hard
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table to track individual workout sessions
export const workoutSessions = pgTable("workout_sessions", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  trainingPlanId: integer("training_plan_id").references(() => trainingPlans.id),
  date: date("date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // In minutes
  rating: integer("rating"), // Athlete's 1-5 rating of the workout
  perceivedExertion: integer("perceived_exertion"), // 1-10 scale
  notes: text("notes"),
  location: text("location"),
  completed: boolean("completed").default(false),
  exercisesCompleted: json("exercises_completed").default('[]'), // Array of completed exercise details
  energyLevel: integer("energy_level"), // 1-10 scale
  weatherConditions: text("weather_conditions"),
});

export const performanceInsights = pgTable("performance_insights", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  strengths: json("strengths").notNull(), // Array of strings
  weaknesses: json("weaknesses").notNull(), // Array of strings
  recommendations: json("recommendations").notNull(), // Array of strings
  performanceTrend: text("performance_trend").default("stable"), // improving, stable, declining
  positionRanking: text("position_ranking"), // e.g., "Top 15% of QBs in your region"
  improvementAreas: json("improvement_areas").default('[]'), // Array of strings with specific areas
  recentAchievements: json("recent_achievements").default('[]'), // Array of recent notable performances
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const coachMessages = pgTable("coach_messages", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  message: text("message").notNull(),
  role: text("role").notNull().default("assistant"), // assistant or user
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nutritionPlans = pgTable("nutrition_plans", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  goal: text("goal").notNull(), // bulking, cutting, maintenance
  dailyCalories: integer("daily_calories").notNull(),
  proteinTarget: integer("protein_target").notNull(), // in grams
  carbTarget: integer("carb_target").notNull(), // in grams
  fatTarget: integer("fat_target").notNull(), // in grams
  hydrationTarget: integer("hydration_target").notNull(), // in oz
  restrictions: text("restrictions"), // allergies, intolerances, dietary preferences
  createdAt: timestamp("created_at").defaultNow().notNull(),
  active: boolean("active").default(true),
});

export const mealLogs = pgTable("meal_logs", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  date: date("date").notNull(),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein"), // in grams
  carbs: integer("carbs"), // in grams
  fat: integer("fat"), // in grams
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  notes: text("notes"),
});

export const recruitingAdvice = pgTable("recruiting_advice", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  recommendations: json("recommendations").notNull(),
  nextSteps: json("next_steps").notNull(),
  generatedDate: timestamp("generated_date").defaultNow().notNull(),
  viewed: boolean("viewed").default(false),
  archived: boolean("archived").default(false),
});

export const aiMealSuggestions = pgTable("ai_meal_suggestions", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  goal: text("goal").notNull(), // bulking, cutting, maintenance
  suggestion: jsonb("suggestion").notNull(), // contains meal name, ingredients, macros, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const socialConnections = pgTable("social_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(), // twitter, instagram, facebook, etc.
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  username: text("username"),
  connected: boolean("connected").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  platforms: json("platforms").notNull(), // array of platform IDs to post to
  status: text("status").notNull().default("pending"), // pending, posted, failed
  scheduledFor: timestamp("scheduled_for"),
  postedAt: timestamp("posted_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  achievementId: text("achievement_id").notNull().unique(), // Matches with front-end ID
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  type: achievementTypeEnum("type").notNull(), // performance, training, nutrition, etc.
  level: achievementLevelEnum("level").notNull(), // bronze, silver, gold, platinum
  points: integer("points").notNull(),
  requirements: jsonb("requirements").notNull(), // Array of requirement objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const athleteAchievements = pgTable("athlete_achievements", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  progress: integer("progress").notNull().default(0), // 0-100
  earnedAt: timestamp("earned_at"), // null if not earned yet
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completed: boolean("completed").default(false),
});

export const leaderboards = pgTable("leaderboards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  metric: text("metric").notNull(), // Points, seconds, reps, inches, etc.
  period: text("period").notNull(), // all-time, yearly, monthly, weekly, daily, event
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  active: boolean("active").default(true),
  lowerIsBetter: boolean("lower_is_better").default(false), // For metrics like time where lower is better
  rules: text("rules"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  leaderboardId: integer("leaderboard_id").references(() => leaderboards.id).notNull(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  value: real("value").notNull(),
  rank: integer("rank"), // Calculated rank, can be null until processed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Skills
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: skillCategoryEnum("category").notNull(),
  icon: text("icon").notNull(),
  positionTags: json("position_tags").default('[]').notNull(), // Positions this skill applies to
  milestones: json("milestones").notNull(), // Array of milestone objects with requirements
  exerciseRecommendations: json("exercise_recommendations").default('[]'), // Exercises that improve this skill
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Athlete Skill Progression
export const athleteSkills = pgTable("athlete_skills", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  skillId: integer("skill_id").references(() => skills.id).notNull(),
  level: skillLevelEnum("level").default("beginner").notNull(),
  xp: integer("xp").default(0).notNull(), // Experience points accumulated for this skill
  currentMilestone: integer("current_milestone").default(0).notNull(), // Current milestone index
  nextMilestoneXP: integer("next_milestone_xp").default(100).notNull(), // XP needed for next milestone
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  unlockDate: timestamp("unlock_date").defaultNow().notNull(), // When the athlete started training this skill
});

// Skill Activity Logs
export const skillActivityLogs = pgTable("skill_activity_logs", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  skillId: integer("skill_id").references(() => skills.id).notNull(),
  activityType: text("activity_type").notNull(), // e.g., 'practice', 'game', 'drill', 'workout'
  xpGained: integer("xp_gained").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recruiting analytics to track profile views, interest, and activities
export const recruitingAnalytics = pgTable("recruiting_analytics", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  profileViews: integer("profile_views").default(0),
  uniqueViewers: integer("unique_viewers").default(0),
  interestLevel: integer("interest_level").default(0), // 0-100 calculated score
  bookmarksCount: integer("bookmarks_count").default(0),
  messagesSent: integer("messages_sent").default(0),
  connectionsCount: integer("connections_count").default(0),
  viewsOverTime: json("views_over_time").default('[]'), // Array of dated view counts
  interestBySchoolType: json("interest_by_school_type").default('[]'), // Distribution of interest
  interestByPosition: json("interest_by_position").default('[]'), // Position interest metrics
  interestByRegion: json("interest_by_region").default('[]'), // Geographic interest data
  topSchools: json("top_schools").default('[]'), // Array of most interested schools
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Recruiting messages - self-referencing table for messages
export const recruitingMessages = pgTable("recruiting_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  recipientId: integer("recipient_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  schoolName: text("school_name"), // If sender is a coach, their school name
  attachment: text("attachment"), // URL to any attachment
  isReply: boolean("is_reply").default(false),
  parentMessageId: integer("parent_message_id"), // Self-reference without explicit foreign key constraint
});

// Team Management Tables
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  schoolId: integer("school_id"),
  level: text("level").notNull(), // Varsity, JV, Freshman
  season: text("season").notNull(), // "Fall 2024"
  sport: text("sport").notNull().default("football"),
  coachId: integer("coach_id").references(() => users.id),
  logoUrl: text("logo_url"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  bannerImage: text("banner_image"),
  logoImage: text("logo_image"),
  website: text("website"),
  location: text("location"),
  homeField: text("home_field"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  role: text("role").notNull().default("player"), // player, captain, coach, assistant_coach
  position: text("position"),
  jerseyNumber: text("jersey_number"),
  isActive: boolean("is_active").default(true),
  status: text("status").default("active"), // active, inactive, injured
  number: text("number"), // alias for jerseyNumber for compatibility
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const teamEvents = pgTable("team_events", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(), // practice, game, meeting, etc.
  location: text("location"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isRequired: boolean("is_required").default(true),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  eventDate: timestamp("event_date"), // alias for startDate for compatibility
  opponent: text("opponent"),
  requiredEquipment: text("required_equipment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamEventAttendance = pgTable("team_event_attendance", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => teamEvents.id).notNull(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, attending, excused, absent
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teamAnnouncements = pgTable("team_announcements", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  importance: text("importance").default("normal"), // low, normal, high, urgent
  publishedBy: integer("published_by").references(() => users.id).notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  image: text("image"),
  attachmentLink: text("attachment_link"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAthleteSchema = createInsertSchema(athletes).omit({ id: true });
export const insertParentSchema = createInsertSchema(parents).omit({ id: true, createdAt: true });
export const insertCoachSchema = createInsertSchema(coaches).omit({ id: true, createdAt: true });
export const insertParentAthleteRelationshipSchema = createInsertSchema(parentAthleteRelationships).omit({ id: true, createdAt: true });

export type Parent = typeof parents.$inferSelect;
export type InsertParent = z.infer<typeof insertParentSchema>;
export type Coach = typeof coaches.$inferSelect;
export type InsertCoach = z.infer<typeof insertCoachSchema>;
export type ParentAthleteRelationship = typeof parentAthleteRelationships.$inferSelect;
export type InsertParentAthleteRelationship = z.infer<typeof insertParentAthleteRelationshipSchema>;
export const insertCombineMetricsSchema = createInsertSchema(combineMetrics).omit({ id: true, dateRecorded: true });
export const insertExerciseLibrarySchema = createInsertSchema(exerciseLibrary).omit({ id: true, createdAt: true });
export const insertTrainingPlanSchema = createInsertSchema(trainingPlans).omit({ id: true, createdAt: true });
export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({ id: true });
export const insertPerformanceInsightsSchema = createInsertSchema(performanceInsights, {
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  improvementAreas: z.array(z.string()).optional(),
  recentAchievements: z.array(z.string()).optional(),
}).omit({ id: true, lastUpdated: true });
export const insertCoachMessageSchema = createInsertSchema(coachMessages).omit({ id: true, createdAt: true });
export const insertNutritionPlanSchema = createInsertSchema(nutritionPlans).omit({ id: true, createdAt: true });
export const insertMealLogSchema = createInsertSchema(mealLogs).omit({ id: true });
export const insertAiMealSuggestionSchema = createInsertSchema(aiMealSuggestions).omit({ id: true, createdAt: true });
export const insertSocialConnectionSchema = createInsertSchema(socialConnections).omit({ id: true, createdAt: true });
export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({ id: true, postedAt: true, createdAt: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, createdAt: true });
export const insertAthleteAchievementSchema = createInsertSchema(athleteAchievements).omit({ id: true });
export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({ id: true });
export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({ id: true, updatedAt: true });
export const insertStrengthConditioningSchema = createInsertSchema(strengthConditioning).omit({ id: true, updatedAt: true });
export const insertNutritionInfoSchema = createInsertSchema(nutritionInfo).omit({ id: true, updatedAt: true });
export const insertRecruitingPreferencesSchema = createInsertSchema(recruitingPreferences).omit({ id: true, updatedAt: true });
export const insertRecruitingProfileSchema = createInsertSchema(recruitingProfiles).omit({ id: true, createdAt: true, updatedAt: true });

// Insert schemas for recruiting
export const insertRecruitingAnalyticsSchema = createInsertSchema(recruitingAnalytics).omit({ id: true, lastUpdated: true });
export const insertRecruitingMessagesSchema = createInsertSchema(recruitingMessages).omit({ id: true, sentAt: true });

// Types
export type RecruitingAnalytics = typeof recruitingAnalytics.$inferSelect;
export type InsertRecruitingAnalytics = z.infer<typeof insertRecruitingAnalyticsSchema>;

export type RecruitingMessage = typeof recruitingMessages.$inferSelect;
export type InsertRecruitingMessage = z.infer<typeof insertRecruitingMessagesSchema>;

// Team Management Insert Schemas
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true });
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, joinedAt: true });
export const insertTeamEventSchema = createInsertSchema(teamEvents).omit({ id: true, createdAt: true });
export const insertTeamEventAttendanceSchema = createInsertSchema(teamEventAttendance).omit({ id: true, updatedAt: true });
export const insertTeamAnnouncementSchema = createInsertSchema(teamAnnouncements).omit({ id: true, publishedAt: true });

// Select Types
export type User = typeof users.$inferSelect & {
  // Extended properties for auth/API responses
  firstName?: string;
  lastName?: string;
  athlete?: Athlete;
};
export type Athlete = typeof athletes.$inferSelect;
export type CombineMetric = typeof combineMetrics.$inferSelect;
export type ExerciseLibrary = typeof exerciseLibrary.$inferSelect;
export type TrainingPlan = typeof trainingPlans.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type CoachMessage = typeof coachMessages.$inferSelect;
export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type MealLog = typeof mealLogs.$inferSelect;
export type AiMealSuggestion = typeof aiMealSuggestions.$inferSelect;
export type SocialConnection = typeof socialConnections.$inferSelect;
export type SocialPost = typeof socialPosts.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type AthleteAchievement = typeof athleteAchievements.$inferSelect;
export type Leaderboard = typeof leaderboards.$inferSelect;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type StrengthConditioning = typeof strengthConditioning.$inferSelect;
export type NutritionInfo = typeof nutritionInfo.$inferSelect;
export type RecruitingPreferences = typeof recruitingPreferences.$inferSelect;
export type RecruitingProfile = typeof recruitingProfiles.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type TeamEvent = typeof teamEvents.$inferSelect;
export type TeamEventAttendance = typeof teamEventAttendance.$inferSelect;
export type TeamAnnouncement = typeof teamAnnouncements.$inferSelect;
export type PerformanceInsights = typeof performanceInsights.$inferSelect;

// Insert Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAthlete = z.infer<typeof insertAthleteSchema>;
export type InsertCombineMetric = z.infer<typeof insertCombineMetricsSchema>;
export type InsertExerciseLibrary = z.infer<typeof insertExerciseLibrarySchema>;
export type InsertTrainingPlan = z.infer<typeof insertTrainingPlanSchema>;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
export type InsertPerformanceInsights = z.infer<typeof insertPerformanceInsightsSchema>;
export type InsertCoachMessage = z.infer<typeof insertCoachMessageSchema>;
export type InsertNutritionPlan = z.infer<typeof insertNutritionPlanSchema>;
export type InsertMealLog = z.infer<typeof insertMealLogSchema>;
export type InsertAiMealSuggestion = z.infer<typeof insertAiMealSuggestionSchema>;
export type InsertSocialConnection = z.infer<typeof insertSocialConnectionSchema>;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertAthleteAchievement = z.infer<typeof insertAthleteAchievementSchema>;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type InsertStrengthConditioning = z.infer<typeof insertStrengthConditioningSchema>;
export type InsertNutritionInfo = z.infer<typeof insertNutritionInfoSchema>;
export type InsertRecruitingPreferences = z.infer<typeof insertRecruitingPreferencesSchema>;
export type InsertRecruitingProfile = z.infer<typeof insertRecruitingProfileSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type InsertTeamEvent = z.infer<typeof insertTeamEventSchema>;
export type InsertTeamEventAttendance = z.infer<typeof insertTeamEventAttendanceSchema>;
export type InsertTeamAnnouncement = z.infer<typeof insertTeamAnnouncementSchema>;

// Extended Schemas for Registration
export const athleteRegistrationSchema = insertUserSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  position: z.string().min(1, "Position is required"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type AthleteRegistration = z.infer<typeof athleteRegistrationSchema>;

// Parent Registration Schema
export const parentRegistrationSchema = insertUserSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phone: z.string().optional(),
  childAthleteId: z.number().optional(), // If connecting to existing athlete
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ParentRegistration = z.infer<typeof parentRegistrationSchema>;

// Coach Registration Schema
export const coachRegistrationSchema = insertUserSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().min(1, "Title is required"),
  phone: z.string().optional(),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type CoachRegistration = z.infer<typeof coachRegistrationSchema>;

// Login Schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;

// Onboarding Schema
// Personal Information Form
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  
  // Parent/Guardian Information
  parentGuardianName: z.string().optional(),
  parentGuardianEmail: z.string().email("Invalid email address").optional(),
  parentGuardianPhone: z.string().optional(),
  parentGuardianRelationship: z.string().optional(),
  
  // School Information
  school: z.string().min(1, "School name is required"),
  graduationYear: z.number().int().min(2024).max(2035),
  
  // Football Information
  jerseyNumber: z.string().optional(),
  coachName: z.string().optional(),
  
  // Height prediction data points
  fatherHeight: z.number().optional().describe("Father's height in inches for growth prediction"),
  motherHeight: z.number().optional().describe("Mother's height in inches for growth prediction"),
  
  // Growth projection information
  recentGrowthSpurt: z.string().optional().describe("Recent growth spurt status"),
  expectedGrowth: z.string().optional().describe("Expected additional growth"),
});

// Football Information Form
export const footballInfoSchema = z.object({
  yearsPlayed: z.number().int().min(0),
  position: z.string().min(1, "Primary position is required"),
  secondaryPositions: z.array(z.string()).optional(),
  teamLevel: z.string().min(1, "Current team level is required"),
  captainLeadershipRoles: z.string().optional(),
  varsityExperience: z.number().int().min(0).optional(),
  starterStatus: z.boolean().optional(),
  positionStrengths: z.array(z.string()).optional(),
  positionWeaknesses: z.array(z.string()).optional(),
  coachDescription: z.string().optional(),
  motivationFactors: z.array(z.string()).optional(),
  seasonGoals: z.array(z.string()).optional(),
});

// Athletic Metrics Form
export const athleticMetricsSchema = z.object({
  height: z.string().min(1, "Height is required"),
  weight: z.number().int().min(50, "Valid weight is required"),
  projectedHeight: z.string().optional(),
  
  // Core combine metrics
  fortyYard: z.number().positive().optional(),
  tenYardSplit: z.number().positive().optional(),
  shuttle: z.number().positive().optional(),
  threeCone: z.number().positive().optional(),
  verticalJump: z.number().positive().optional(),
  broadJump: z.number().positive().optional(),
  benchPress: z.number().int().positive().optional(),
  benchPressReps: z.number().int().positive().optional(),
  squatMax: z.number().int().positive().optional(),
  powerClean: z.number().int().positive().optional(),
  deadlift: z.number().int().positive().optional(),
  
  // Expanded metrics
  bodyFat: z.number().min(0).max(40).optional(),
  wingspanInches: z.number().int().positive().optional(),
  handSize: z.number().positive().optional(),
  chestSize: z.number().positive().optional(),
  waistSize: z.number().positive().optional(),
  neckSize: z.number().positive().optional(),
  
  // Position-specific metrics
  positionSpecificMetrics: z.array(z.object({
    name: z.string(),
    value: z.number().or(z.string()),
    unit: z.string().optional(),
    notes: z.string().optional()
  })).optional().default([]),
  
  // Verification
  isVerified: z.boolean().optional().default(false),
  verifiedBy: z.string().optional(),
  verificationDate: z.string().optional(), // ISO date string
  combineEventId: z.number().int().positive().optional(),
  pullUps: z.number().int().min(0).optional(),
});

// Academic Profile Form
export const academicProfileSchema = z.object({
  gpa: z.number().min(0).max(4).optional(),
  weightedGpa: z.number().min(0).max(5).optional(),
  satScore: z.number().int().min(400).max(1600).optional(),
  actScore: z.number().int().min(1).max(36).optional(),
  ncaaEligibility: z.boolean().optional(),
  coreGpa: z.number().min(0).max(4).optional(),
  apHonorsClasses: z.string().optional(),
  volunteerWork: z.string().optional(),
  intendedMajors: z.string().optional(),
  
  // Enhanced academic info
  currentSchedule: z.string().optional().describe("Current class schedule"),
  transcriptUploaded: z.boolean().default(false),
  academicAwards: z.string().optional().describe("Academic awards and honors"),
  schoolActivities: z.string().optional().describe("School clubs and activities"),
  counselorName: z.string().optional(),
  counselorEmail: z.string().email("Invalid email address").optional(),
  counselorPhone: z.string().optional(),
  preferredLearningStyle: z.string().optional(),
  studyHoursPerWeek: z.number().int().min(0).max(100).optional(),
});

// Strength and Conditioning Form
export const strengthConditioningSchema = z.object({
  yearsTraining: z.number().int().min(0).optional(),
  daysPerWeek: z.number().int().min(0).max(7).optional(),
  trainingFocus: z.array(z.string()).optional(),
  areasToImprove: z.array(z.string()).optional(),
  gymAccess: z.string().optional(),
  sleepHours: z.number().int().min(0).max(24).optional(),
  recoveryMethods: z.array(z.string()).optional(),
  
  // Personal trainer and structured training plan
  personalTrainer: z.string().optional(),
  structuredTrainingPlan: z.boolean().optional(),
  
  // Recovery and energy metrics
  postPracticeRecovery: z.string().optional(),
  energyLevels: z.string().optional(),
  
  // Basic injuries field (to maintain compatibility with existing data)
  injuriesSurgeries: z.string().optional(),
  
  // Enhanced injury tracking
  currentInjuries: z.array(z.object({
    type: z.string(),
    location: z.string(),
    date: z.string(), // ISO date string
    fullyRecovered: z.boolean(),
    treatmentNotes: z.string().optional()
  })).optional().default([]),
  pastSurgeries: z.array(z.object({
    type: z.string(),
    date: z.string(), // ISO date string
    notes: z.string().optional()
  })).optional().default([]),
  concussionHistory: z.array(z.object({
    date: z.string(), // ISO date string
    severity: z.string(),
    returnToPlayDays: z.number().optional(),
    notes: z.string().optional()
  })).optional().default([]),
  medicalClearance: z.boolean().optional(),
  medicalNotes: z.string().optional(),
  trainingBehavior: z.string().optional().describe("Training behavior intake responses"),
});

// Nutrition Form
export const nutritionFormSchema = z.object({
  currentWeight: z.number().int().positive().optional(),
  currentCalories: z.number().int().positive().optional(),
  mealFrequency: z.number().int().min(1).max(10).optional(),
  waterIntake: z.number().int().positive().optional(),
  dietaryRestrictions: z.string().optional(),
  supplementsUsed: z.string().optional(),
  foodAllergies: z.string().optional(),
  breakfastRoutine: z.string().optional(),
  cookingAccess: z.array(z.string()).optional(),
});

// Recruiting Goals Form
export const recruitingGoalsSchema = z.object({
  desiredDivision: z.string().optional(),
  schoolsOfInterest: z.array(z.string()).optional(),
  hasHighlightFilm: z.boolean().default(false),
  attendedCamps: z.boolean().default(false),
  footballSeasonStart: z.date().optional(),
  footballSeasonEnd: z.date().optional(),
  preferredTrainingDays: z.array(z.string()).optional(),
  collegeRecruiterContacts: z.array(z.object({
    name: z.string(),
    school: z.string(),
    role: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  })).optional().default([]),
  topSeasonGoal: z.string().optional(),
  preferMotivationalMessages: z.boolean().optional(),
  motivationalMessageTypes: z.array(z.string()).optional(),
});

// Height prediction schema already defined at the top of the file

// Complete onboarding schema
export const onboardingSchema = z.object({
  personalInfo: personalInfoSchema,
  footballInfo: footballInfoSchema,
  athleticMetrics: athleticMetricsSchema,
  academicProfile: academicProfileSchema,
  strengthConditioning: strengthConditioningSchema,
  nutrition: nutritionFormSchema,
  recruitingGoals: recruitingGoalsSchema,
});

// Coach Evaluations - Position-specific evaluation templates
export const coachEvaluations = pgTable("coach_evaluations", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  position: text("position").notNull(), // QB, OL, DB, etc.
  evaluationDate: timestamp("evaluation_date").defaultNow().notNull(),
  season: text("season").notNull(), // "Fall 2025", "Spring 2026", etc.
  isShared: boolean("is_shared").default(false), // Whether evaluation is shared with athlete
  notes: text("notes"),
  
  // Common metrics for all positions (1-10 scale)
  athleticism: integer("athleticism"),
  technique: integer("technique"),
  football_iq: integer("football_iq"),
  leadership: integer("leadership"),
  coachability: integer("coachability"),
  work_ethic: integer("work_ethic"),
  competitiveness: integer("competitiveness"),
  
  // Position-specific metrics stored as JSON to handle different positions
  position_metrics: json("position_metrics").default('{}'),
  
  // Overall evaluation score (calculated average)
  overall_rating: real("overall_rating"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Position-specific evaluation templates
export const evaluationTemplates = pgTable("evaluation_templates", {
  id: serial("id").primaryKey(),
  position: text("position").notNull().unique(), // QB, OL, DB, etc.
  metrics: json("metrics").notNull(), // Array of metrics specific to the position
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Depth Chart - Track player positions within team hierarchy
export const depthCharts = pgTable("depth_charts", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  name: text("name").notNull(), // e.g. "Fall 2025 Depth Chart", "Offense Depth Chart"
  createdBy: integer("created_by").references(() => coaches.id).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Depth Chart Positions - Individual position entries within a depth chart
export const depthChartPositions = pgTable("depth_chart_positions", {
  id: serial("id").primaryKey(),
  depthChartId: integer("depth_chart_id").references(() => depthCharts.id).notNull(),
  positionName: text("position_name").notNull(), // e.g. "QB", "Left Tackle", "Free Safety"
  positionGroup: text("position_group").notNull(), // e.g. "Offense", "Defense", "Special Teams"
  order: integer("order").notNull(), // Order of display
});

// Depth Chart Entries - Individual player entries within positions
export const depthChartEntries = pgTable("depth_chart_entries", {
  id: serial("id").primaryKey(),
  positionId: integer("position_id").references(() => depthChartPositions.id).notNull(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  depth: integer("depth").notNull(), // 1 = starter, 2 = backup, etc.
  status: text("status").default("active"), // active, injured, developmental, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create Zod schemas for inserting data
export const insertCoachEvaluationSchema = createInsertSchema(coachEvaluations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEvaluationTemplateSchema = createInsertSchema(evaluationTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDepthChartSchema = createInsertSchema(depthCharts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDepthChartPositionSchema = createInsertSchema(depthChartPositions).omit({ id: true });
export const insertDepthChartEntrySchema = createInsertSchema(depthChartEntries).omit({ id: true, createdAt: true, updatedAt: true });

// Define types
export type CoachEvaluation = typeof coachEvaluations.$inferSelect;
export type InsertCoachEvaluation = z.infer<typeof insertCoachEvaluationSchema>;

export type EvaluationTemplate = typeof evaluationTemplates.$inferSelect;
export type InsertEvaluationTemplate = z.infer<typeof insertEvaluationTemplateSchema>;

export type DepthChart = typeof depthCharts.$inferSelect;
export type InsertDepthChart = z.infer<typeof insertDepthChartSchema>;

export type DepthChartPosition = typeof depthChartPositions.$inferSelect;
export type InsertDepthChartPosition = z.infer<typeof insertDepthChartPositionSchema>;

export type DepthChartEntry = typeof depthChartEntries.$inferSelect;
export type InsertDepthChartEntry = z.infer<typeof insertDepthChartEntrySchema>;

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type FootballInfo = z.infer<typeof footballInfoSchema>;
export type AthleticMetrics = z.infer<typeof athleticMetricsSchema>;
export type AcademicProfile = z.infer<typeof academicProfileSchema>;
export type StrengthConditioningForm = z.infer<typeof strengthConditioningSchema>;
export type NutritionForm = z.infer<typeof nutritionFormSchema>;
export type RecruitingGoals = z.infer<typeof recruitingGoalsSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;

// College Application Hub schema

// Application Checklist Items
export const applicationChecklist = pgTable('application_checklist', {
  id: serial('id').primaryKey(),
  athleteId: integer('athlete_id').notNull().references(() => athletes.id),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'FAFSA', 'NCAA', 'Common App', 'School Specific', 'Custom'
  description: text('description'),
  dueDate: timestamp('due_date'),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
  importance: text('importance').default('medium'), // 'high', 'medium', 'low'
  notifyDaysBefore: integer('notify_days_before').default(7),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertApplicationChecklistSchema = createInsertSchema(applicationChecklist)
  .omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });

// Document Uploads
export const applicationDocuments = pgTable('application_documents', {
  id: serial('id').primaryKey(),
  athleteId: integer('athlete_id').notNull().references(() => athletes.id),
  title: text('title').notNull(),
  description: text('description'),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(), // 'transcript', 'recommendation', 'test_score', 'essay', 'other'
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isPublic: boolean('is_public').default(false), // Whether to include in recruiting profile
  relatedSchoolId: integer('related_school_id'), // Optional related school
});

export const insertApplicationDocumentSchema = createInsertSchema(applicationDocuments)
  .omit({ id: true, uploadedAt: true, updatedAt: true });

// School Applications
export const schoolApplications = pgTable('school_applications', {
  id: serial('id').primaryKey(),
  athleteId: integer('athlete_id').notNull().references(() => athletes.id),
  schoolName: text('school_name').notNull(),
  status: text('status').notNull().default('planning'), // 'planning', 'in_progress', 'submitted', 'accepted', 'rejected', 'waitlisted', 'deferred'
  applicationDeadline: timestamp('application_deadline'),
  appliedDate: timestamp('applied_date'),
  decisionDate: timestamp('decision_date'),
  notes: text('notes'),
  isTopChoice: boolean('is_top_choice').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertSchoolApplicationSchema = createInsertSchema(schoolApplications)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Academic Achievements
export const academicAchievements = pgTable('academic_achievements', {
  id: serial('id').primaryKey(),
  athleteId: integer('athlete_id').notNull().references(() => athletes.id),
  title: text('title').notNull(),
  description: text('description'),
  achievementType: text('achievement_type').notNull(), // 'honor_roll', 'ap_class', 'certification', 'award', 'other'
  date: timestamp('date'),
  issuingOrganization: text('issuing_organization'),
  isPublic: boolean('is_public').default(true), // Whether to include in recruiting profile
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  proofDocumentId: integer('proof_document_id'), // Optional reference to upload
});

export const insertAcademicAchievementSchema = createInsertSchema(academicAchievements)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Counselor Accounts (if we implement this part)
export const counselors = pgTable('counselors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id).unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  title: text('title'),
  organization: text('organization'),
  email: text('email').notNull(),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertCounselorSchema = createInsertSchema(counselors)
  .omit({ id: true, createdAt: true });

// Athlete-Counselor relationship
export const athleteCounselors = pgTable('athlete_counselors', {
  id: serial('id').primaryKey(),
  athleteId: integer('athlete_id').notNull().references(() => athletes.id),
  counselorId: integer('counselor_id').notNull().references(() => counselors.id),
  canViewChecklist: boolean('can_view_checklist').default(true),
  canViewAcademics: boolean('can_view_academics').default(true),
  canUploadDocuments: boolean('can_upload_documents').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertAthleteCounselorSchema = createInsertSchema(athleteCounselors)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type ApplicationChecklist = typeof applicationChecklist.$inferSelect;
export type InsertApplicationChecklist = z.infer<typeof insertApplicationChecklistSchema>;

export type ApplicationDocument = typeof applicationDocuments.$inferSelect;
export type InsertApplicationDocument = z.infer<typeof insertApplicationDocumentSchema>;

export type SchoolApplication = typeof schoolApplications.$inferSelect;
export type InsertSchoolApplication = z.infer<typeof insertSchoolApplicationSchema>;

export type AcademicAchievement = typeof academicAchievements.$inferSelect;
export type InsertAcademicAchievement = z.infer<typeof insertAcademicAchievementSchema>;

export type Counselor = typeof counselors.$inferSelect;
export type InsertCounselor = z.infer<typeof insertCounselorSchema>;

export type AthleteCounselor = typeof athleteCounselors.$inferSelect;
export type InsertAthleteCounselor = z.infer<typeof insertAthleteCounselorSchema>;

// Insert schemas for skills
export const insertSkillSchema = createInsertSchema(skills)
  .omit({ id: true, createdAt: true });

export const insertAthleteSkillSchema = createInsertSchema(athleteSkills)
  .omit({ id: true, lastUpdated: true, unlockDate: true });

export const insertSkillActivityLogSchema = createInsertSchema(skillActivityLogs)
  .omit({ id: true, createdAt: true });

// Types for skills
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type AthleteSkill = typeof athleteSkills.$inferSelect;
export type InsertAthleteSkill = z.infer<typeof insertAthleteSkillSchema>;

export type SkillActivityLog = typeof skillActivityLogs.$inferSelect;
export type InsertSkillActivityLog = z.infer<typeof insertSkillActivityLogSchema>;
