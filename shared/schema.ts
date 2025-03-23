import { pgTable, text, serial, integer, boolean, timestamp, json, real, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  position: text("position").notNull(),
  height: text("height"),
  weight: integer("weight"),
  bodyFat: real("body_fat"),
  school: text("school"),
  grade: text("grade"), // Freshman, Sophomore, Junior, Senior
  graduationYear: integer("graduation_year"),
  gpa: real("gpa"),
  actScore: integer("act_score"),
  targetDivision: text("target_division"), // D1, D2, D3, etc.
  profileImage: text("profile_image"),
  profileVisibility: boolean("profile_visibility").default(true),
  hudlLink: text("hudl_link"),
  maxPrepsLink: text("max_preps_link"),
  subscriptionTier: text("subscription_tier").default("free"), // free, starter, elite
  subscriptionRenewal: timestamp("subscription_renewal"),
});

export const combineMetrics = pgTable("combine_metrics", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  fortyYard: real("forty_yard"),
  shuttle: real("shuttle"),
  verticalJump: real("vertical_jump"),
  broadJump: real("broad_jump"),
  benchPress: integer("bench_press"),
  dateRecorded: timestamp("date_recorded").defaultNow().notNull(),
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
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(), // performance, training, nutrition, etc.
  threshold: integer("threshold").notNull(), // value needed to earn achievement
  points: integer("points").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const athleteAchievements = pgTable("athlete_achievements", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  progress: integer("progress").notNull().default(0),
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

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAthleteSchema = createInsertSchema(athletes).omit({ id: true });
export const insertCombineMetricsSchema = createInsertSchema(combineMetrics).omit({ id: true, dateRecorded: true });
export const insertTrainingPlanSchema = createInsertSchema(trainingPlans).omit({ id: true });
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

// Select Types
export type User = typeof users.$inferSelect;
export type Athlete = typeof athletes.$inferSelect;
export type CombineMetric = typeof combineMetrics.$inferSelect;
export type TrainingPlan = typeof trainingPlans.$inferSelect;
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

// Insert Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAthlete = z.infer<typeof insertAthleteSchema>;
export type InsertCombineMetric = z.infer<typeof insertCombineMetricsSchema>;
export type InsertTrainingPlan = z.infer<typeof insertTrainingPlanSchema>;
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
