import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, athletes } from "./schema";

// Table for storing OAuth tokens for external services
export const externalServiceTokens = pgTable("external_service_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  service: text("service").notNull(), // 'twitter', 'hudl', 'maxpreps'
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  scope: text("scope"),
  isActive: boolean("is_active").default(true),
  lastSyncDate: timestamp("last_sync_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schema for external service tokens
export const insertExternalServiceTokenSchema = createInsertSchema(externalServiceTokens)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Type for external service tokens
export type ExternalServiceToken = typeof externalServiceTokens.$inferSelect;
export type InsertExternalServiceToken = z.infer<typeof insertExternalServiceTokenSchema>;

// Table for Hudl video data
export const hudlVideos = pgTable("hudl_videos", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  hudlId: text("hudl_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  uploadDate: timestamp("upload_date"),
  duration: integer("duration"), // Duration in seconds
  tags: json("tags").default('[]'), // Array of tags
  isHighlight: boolean("is_highlight").default(false),
  views: integer("views").default(0),
  isPublic: boolean("is_public").default(true),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
});

// Insert schema for Hudl videos
export const insertHudlVideoSchema = createInsertSchema(hudlVideos)
  .omit({ id: true, syncedAt: true });

// Type for Hudl videos
export type HudlVideo = typeof hudlVideos.$inferSelect;
export type InsertHudlVideo = z.infer<typeof insertHudlVideoSchema>;

// Table for MaxPreps stats
export const maxPrepsStats = pgTable("max_preps_stats", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  season: text("season").notNull(), // e.g. "Fall 2024"
  statsData: json("stats_data").notNull(), // JSON containing all statistics
  gameCount: integer("game_count").default(0),
  teamRecord: text("team_record"),
  position: text("position"),
  jerseyNumber: text("jersey_number"),
  teamName: text("team_name"),
  verified: boolean("verified").default(false),
  lastSynced: timestamp("last_synced").defaultNow().notNull(),
});

// Insert schema for MaxPreps stats
export const insertMaxPrepsStatsSchema = createInsertSchema(maxPrepsStats)
  .omit({ id: true, lastSynced: true });

// Type for MaxPreps stats
export type MaxPrepsStats = typeof maxPrepsStats.$inferSelect;
export type InsertMaxPrepsStats = z.infer<typeof insertMaxPrepsStatsSchema>;

// Table for Twitter posts
export const twitterPosts = pgTable("twitter_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  tweetId: text("tweet_id"),
  content: text("content").notNull(),
  mediaUrls: json("media_urls").default('[]'), // Array of media URLs
  postedAt: timestamp("posted_at"),
  isPosted: boolean("is_posted").default(false),
  isScheduled: boolean("is_scheduled").default(false),
  scheduledFor: timestamp("scheduled_for"),
  engagementStats: json("engagement_stats").default('{}'), // Likes, retweets, etc.
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schema for Twitter posts
export const insertTwitterPostSchema = createInsertSchema(twitterPosts)
  .omit({ id: true, createdAt: true });

// Type for Twitter posts
export type TwitterPost = typeof twitterPosts.$inferSelect;
export type InsertTwitterPost = z.infer<typeof insertTwitterPostSchema>;

// Interface for integrations configuration
export interface IntegrationsConfig {
  twitter: {
    enabled: boolean;
    autoShare: {
      achievements: boolean;
      stats: boolean;
      highlights: boolean;
      teamEvents: boolean;
    }
  };
  hudl: {
    enabled: boolean;
    autoSync: boolean;
    syncFrequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  };
  maxPreps: {
    enabled: boolean;
    autoSync: boolean;
    syncFrequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  };
}

// Default integrations configuration
export const defaultIntegrationsConfig: IntegrationsConfig = {
  twitter: {
    enabled: false,
    autoShare: {
      achievements: true,
      stats: true,
      highlights: true,
      teamEvents: false
    }
  },
  hudl: {
    enabled: false,
    autoSync: true,
    syncFrequency: 'weekly'
  },
  maxPreps: {
    enabled: false,
    autoSync: true,
    syncFrequency: 'weekly'
  }
};