import { z } from "zod";

// Parent Access (for read-only access)
export const parentAccessSchema = z.object({
  id: z.number(),
  athleteId: z.number(),
  email: z.string().email(),
  name: z.string(),
  relationship: z.string(),
  accessToken: z.string(), // Unique token for accessing the read-only dashboard
  createdAt: z.date(),
  lastEmailSent: z.date().nullable(),
  receiveUpdates: z.boolean().default(true),
  receiveNutritionInfo: z.boolean().default(true),
  active: z.boolean().default(true),
});

export const insertParentAccessSchema = parentAccessSchema
  .omit({ id: true, createdAt: true, lastEmailSent: true, accessToken: true });

export type ParentAccess = z.infer<typeof parentAccessSchema>;
export type InsertParentAccess = z.infer<typeof insertParentAccessSchema>;

// Email Notifications Types
export const emailNotificationTypeSchema = z.enum([
  "PERFORMANCE_UPDATE",
  "NUTRITION_PLAN",
  "WORKOUT_COMPLETED",
  "NEW_ACHIEVEMENT",
  "WEEKLY_SUMMARY"
]);

export type EmailNotificationType = z.infer<typeof emailNotificationTypeSchema>;

// Parent Invite Request
export const parentInviteSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  athleteId: z.number(), // The ID of the athlete sending the invite
  receiveUpdates: z.boolean().default(true),
  receiveNutritionInfo: z.boolean().default(true),
});

export type ParentInvite = z.infer<typeof parentInviteSchema>;