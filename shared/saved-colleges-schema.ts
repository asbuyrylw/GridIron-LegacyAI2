import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { athletes, users } from "./schema";

export const savedColleges = pgTable("saved_colleges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  collegeId: integer("college_id").notNull(), // Reference to college in the database
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertSavedCollegeSchema = createInsertSchema(savedColleges).omit({
  id: true,
  createdAt: true,
});

// Types
export type SavedCollege = typeof savedColleges.$inferSelect;
export type InsertSavedCollege = typeof insertSavedCollegeSchema._type;