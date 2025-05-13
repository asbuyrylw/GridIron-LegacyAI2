import { z } from "zod";

// Parent Access (for read-only access)
export const parentAccessSchema = z.object({
  id: z.number(),
  athleteId: z.number(),
  email: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  accessToken: z.string(), // Access token for verification (not used for dashboard access - email-only approach)
  createdAt: z.date(),
  lastEmailSent: z.date().nullable(),
  receiveUpdates: z.boolean().default(true),
  receiveNutritionInfo: z.boolean().default(true),
  active: z.boolean().default(true),
});

export const insertParentAccessSchema = parentAccessSchema
  .omit({ id: true, createdAt: true, lastEmailSent: true, accessToken: true })
  .required({ active: true });

export type ParentAccess = z.infer<typeof parentAccessSchema>;
export type InsertParentAccess = z.infer<typeof insertParentAccessSchema>;

// Parent Invite Request
export const parentInviteSchema = z.object({
  athleteId: z.number(), // The ID of the athlete sending the invite
  email: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  receiveUpdates: z.boolean().default(true),
  receiveNutritionInfo: z.boolean().default(true),
});

export type ParentInvite = z.infer<typeof parentInviteSchema>;

// Types of email notifications that can be sent to parents
export enum EmailNotificationType {
  INVITE = 'invite',
  PERFORMANCE_UPDATE = 'performance_update',
  NUTRITION_SHOPPING_LIST = 'nutrition_shopping_list',
  ACHIEVEMENT_NOTIFICATION = 'achievement_notification',
  EVENT_REMINDER = 'event_reminder',
  WEEKLY_SUMMARY = 'weekly_summary',
  TRAINING_PROGRESS = 'training_progress',
  ACADEMIC_UPDATE = 'academic_update'
}