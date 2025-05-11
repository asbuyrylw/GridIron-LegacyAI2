import { pgTable, text, serial, integer, boolean, timestamp, json, real, date, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  userType: text("user_type").notNull().default("athlete"), // athlete, parent, coach
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
  school: text("school"),
  graduationYear: integer("graduation_year"),
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
  
  // Social/Recruiting Links
  hudlLink: text("hudl_link"),
  twitterLink: text("twitter_link"),
  maxPrepsLink: text("max_preps_link"),
  hasHighlightFilm: boolean("has_highlight_film").default(false),
  attendedCamps: boolean("attended_camps").default(false),
  
  // Profile Settings
  profileImage: text("profile_image"),
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
  injuriesSurgeries: text("injuries_surgeries"),
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  metric: text("metric").notNull(), // fortyYard, benchPress, totalWorkouts, etc.
  period: text("period").notNull(), // weekly, monthly, allTime
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  active: boolean("active").default(true),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  leaderboardId: integer("leaderboard_id").references(() => leaderboards.id).notNull(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  value: real("value").notNull(),
  rank: integer("rank"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Recruiting messages between athletes and coaches/schools
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
  parentMessageId: integer("parent_message_id").references(() => recruitingMessages.id),
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
export const insertCombineMetricsSchema = createInsertSchema(combineMetrics).omit({ id: true, dateRecorded: true });
export const insertExerciseLibrarySchema = createInsertSchema(exerciseLibrary).omit({ id: true, createdAt: true });
export const insertTrainingPlanSchema = createInsertSchema(trainingPlans).omit({ id: true, createdAt: true });
export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({ id: true });
export const insertPerformanceInsightsSchema = createInsertSchema(performanceInsights).omit({ id: true, lastUpdated: true });
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
export type PerformanceInsights = typeof performanceInsights.$inferSelect;
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
export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type TeamEvent = typeof teamEvents.$inferSelect;
export type TeamEventAttendance = typeof teamEventAttendance.$inferSelect;
export type TeamAnnouncement = typeof teamAnnouncements.$inferSelect;

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
  zipCode: z.string().optional(),
  school: z.string().min(1, "School name is required"),
  graduationYear: z.number().int().min(2024).max(2035),
  jerseyNumber: z.string().optional(),
  coachName: z.string().optional(),
});

// Football Information Form
export const footballInfoSchema = z.object({
  yearsPlayed: z.number().int().min(0),
  position: z.string().min(1, "Primary position is required"),
  secondaryPositions: z.array(z.string()).optional(),
  teamLevel: z.string().min(1, "Current team level is required"),
  captainLeadershipRoles: z.string().optional(),
});

// Athletic Metrics Form
export const athleticMetricsSchema = z.object({
  height: z.string().min(1, "Height is required"),
  weight: z.number().int().min(50, "Valid weight is required"),
  projectedHeight: z.string().optional(),
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
  injuriesSurgeries: z.string().optional(),
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
});

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

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type FootballInfo = z.infer<typeof footballInfoSchema>;
export type AthleticMetrics = z.infer<typeof athleticMetricsSchema>;
export type AcademicProfile = z.infer<typeof academicProfileSchema>;
export type StrengthConditioningForm = z.infer<typeof strengthConditioningSchema>;
export type NutritionForm = z.infer<typeof nutritionFormSchema>;
export type RecruitingGoals = z.infer<typeof recruitingGoalsSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;
