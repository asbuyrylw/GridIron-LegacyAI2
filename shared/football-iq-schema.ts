import { pgTable, text, serial, integer, boolean, timestamp, json, real, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Football IQ quiz difficulty levels
export const quizDifficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
export type QuizDifficultyLevel = (typeof quizDifficultyLevels)[number];

// Football IQ level classifications
export const iqLevelClassifications = ['rookie', 'developing', 'proficient', 'veteran', 'elite'] as const;
export type IqLevelClassification = (typeof iqLevelClassifications)[number];

// Question types
export const questionTypes = ['multiple_choice', 'true_false', 'scenario_based', 'diagram'] as const;
export type QuestionType = (typeof questionTypes)[number];

// Football positions for position-specific quizzes
export const footballPositions = [
  'Quarterback (QB)', 
  'Running Back (RB)', 
  'Wide Receiver (WR)', 
  'Tight End (TE)', 
  'Offensive Line (OL)',
  'Defensive Line (DL)', 
  'Linebacker (LB)', 
  'Cornerback (CB)', 
  'Safety (S)', 
  'Special Teams'
] as const;
export type FootballPosition = (typeof footballPositions)[number];

// Quiz categories
export const quizCategories = [
  'rules',
  'strategy',
  'position_fundamentals',
  'situational_awareness',
  'play_recognition',
  'terminology',
  'game_management'
] as const;
export type QuizCategory = (typeof quizCategories)[number];

// Football IQ Quiz schema
export interface FootballIqQuiz {
  id: number;
  title: string;
  description: string;
  position: FootballPosition | null; // null means applicable to all positions
  difficulty: QuizDifficultyLevel;
  category: QuizCategory;
  timeLimit: number | null; // in seconds, null means no time limit
  passingScore: number; // minimum percentage to pass
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number; // userId of creator (coach or admin)
  questions: FootballIqQuestion[];
}

export const insertFootballIqQuizSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500),
  position: z.enum(footballPositions).nullable(),
  difficulty: z.enum(quizDifficultyLevels),
  category: z.enum(quizCategories),
  timeLimit: z.number().nullable(),
  passingScore: z.number().min(0).max(100),
  isActive: z.boolean().default(true),
  createdBy: z.number(),
});

export type InsertFootballIqQuiz = z.infer<typeof insertFootballIqQuizSchema>;

// Football IQ Question schema
export interface FootballIqQuestion {
  id: number;
  quizId: number; 
  questionText: string;
  questionType: QuestionType;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  points: number;
  imageUrl?: string | null;
  diagramData?: any | null; // For storing play diagrams or illustrations
  orderIndex: number; // For ordering questions
}

export const insertFootballIqQuestionSchema = z.object({
  quizId: z.number(),
  questionText: z.string().min(3).max(500),
  questionType: z.enum(questionTypes),
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
    isCorrect: z.boolean(),
    explanation: z.string().optional(),
  })).min(2),
  points: z.number().min(1).default(1),
  imageUrl: z.string().url().nullable().optional(),
  diagramData: z.any().nullable().optional(),
  orderIndex: z.number().default(0),
});

export type InsertFootballIqQuestion = z.infer<typeof insertFootballIqQuestionSchema>;

// Football IQ Quiz Attempt schema
export interface FootballIqQuizAttempt {
  id: number;
  athleteId: number;
  quizId: number;
  startedAt: Date;
  completedAt: Date | null;
  score: number | null; // Percentage score 0-100
  timeSpent: number | null; // in seconds
  iqLevel: IqLevelClassification | null; // Classification based on score
  isPassed: boolean | null;
  answers: {
    questionId: number;
    selectedOptionId: string;
    isCorrect: boolean;
    timeSpent?: number; // time spent on this question in seconds
  }[];
}

export const insertFootballIqQuizAttemptSchema = z.object({
  athleteId: z.number(),
  quizId: z.number(),
  startedAt: z.date().default(() => new Date()),
  completedAt: z.date().nullable().optional(),
  score: z.number().min(0).max(100).nullable().optional(),
  timeSpent: z.number().nullable().optional(),
  iqLevel: z.enum(iqLevelClassifications).nullable().optional(),
  isPassed: z.boolean().nullable().optional(),
  answers: z.array(z.object({
    questionId: z.number(),
    selectedOptionId: z.string(),
    isCorrect: z.boolean(),
    timeSpent: z.number().optional(),
  })).optional().default([]),
});

export type InsertFootballIqQuizAttempt = z.infer<typeof insertFootballIqQuizAttemptSchema>;

// Football IQ Progress schema
export interface FootballIqProgress {
  id: number;
  athleteId: number;
  position: FootballPosition;
  currentIqLevel: IqLevelClassification;
  quizzesCompleted: number;
  quizzesPassed: number;
  totalScore: number; // accumulated points
  averageScore: number; // average percentage score
  lastAttemptAt: Date | null;
  history: {
    date: string;
    quizId: number;
    quizTitle: string;
    score: number;
    iqLevel: IqLevelClassification;
  }[];
}

export const insertFootballIqProgressSchema = z.object({
  athleteId: z.number(),
  position: z.enum(footballPositions),
  currentIqLevel: z.enum(iqLevelClassifications).default('rookie'),
  quizzesCompleted: z.number().default(0),
  quizzesPassed: z.number().default(0),
  totalScore: z.number().default(0),
  averageScore: z.number().default(0),
  lastAttemptAt: z.date().nullable(),
  history: z.array(z.object({
    date: z.string(),
    quizId: z.number(),
    quizTitle: z.string(),
    score: z.number(),
    iqLevel: z.enum(iqLevelClassifications),
  })).optional().default([]),
});

export type InsertFootballIqProgress = z.infer<typeof insertFootballIqProgressSchema>;

// Helper functions
export function calculateIqLevel(score: number): IqLevelClassification {
  if (score >= 90) return 'elite';
  if (score >= 80) return 'veteran';
  if (score >= 70) return 'proficient';
  if (score >= 60) return 'developing';
  return 'rookie';
}