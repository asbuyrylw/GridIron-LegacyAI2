import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { type Json } from 'drizzle-orm';

// ===== CONSTANTS =====

// Define the possible football positions for quizzes
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
  'Special Teams (ST)',
  'General Football Knowledge'
] as const;

// Define the difficulty levels for quizzes
export const quizDifficultyLevels = [
  'beginner',
  'intermediate',
  'advanced',
  'elite'
] as const;

// Define the categories for quizzes
export const quizCategories = [
  'rules',
  'strategy',
  'position-specific',
  'situational',
  'play-recognition',
  'football-history',
  'football-terminology',
  'team-concepts',
  'mental-toughness'
] as const;

// Define the types of questions
export const questionTypes = [
  'multiple-choice',
  'true-false',
  'diagram-based',
  'video-analysis',
  'play-recognition'
] as const;

// ===== QUIZ SCHEMAS =====

// Define the schema for a quiz option
export const footballIqQuizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
  explanation: z.string().optional()
});

// Define the schema for a quiz question
export const footballIqQuestionSchema = z.object({
  id: z.number(),
  quizId: z.number(),
  questionText: z.string().min(5, "Question text is too short"),
  questionType: z.enum(questionTypes),
  options: z.array(footballIqQuizOptionSchema),
  imageUrl: z.string().nullable().optional(),
  diagramData: z.any().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  explanation: z.string().nullable().optional(),
  orderIndex: z.number().optional(),
  points: z.number().default(1),
  difficulty: z.enum(quizDifficultyLevels).optional()
});

// Create an insert schema for questions
export const insertFootballIqQuestionSchema = footballIqQuestionSchema
  .omit({ id: true });

export type InsertFootballIqQuestion = z.infer<typeof insertFootballIqQuestionSchema>;
export type FootballIqQuestion = z.infer<typeof footballIqQuestionSchema>;
export type FootballIqQuizOption = z.infer<typeof footballIqQuizOptionSchema>;

// Define the schema for a quiz
export const footballIqQuizSchema = z.object({
  id: z.number(),
  title: z.string().min(3, "Title is too short"),
  description: z.string().optional().nullable(),
  position: z.enum(footballPositions),
  difficulty: z.enum(quizDifficultyLevels),
  category: z.enum(quizCategories),
  questions: z.array(footballIqQuestionSchema).default([]),
  timeLimit: z.number().optional().nullable(),
  passingScore: z.number().default(70),
  createdBy: z.number(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).optional().nullable()
});

// Create an insert schema for quizzes
export const insertFootballIqQuizSchema = footballIqQuizSchema
  .omit({ id: true, questions: true, createdAt: true, updatedAt: true })
  .extend({
    description: z.string().optional(),
    timeLimit: z.number().optional(),
    tags: z.array(z.string()).optional()
  });

export type InsertFootballIqQuiz = z.infer<typeof insertFootballIqQuizSchema>;
export type FootballIqQuiz = z.infer<typeof footballIqQuizSchema>;

// ===== QUIZ ATTEMPT SCHEMAS =====

// Define the schema for a quiz answer
export const footballIqAnswerSchema = z.object({
  questionId: z.number(),
  selectedOptionId: z.string(),
  isCorrect: z.boolean().optional(),
  timeSpent: z.number().optional()
});

export type FootballIqAnswer = z.infer<typeof footballIqAnswerSchema>;

// Define the schema for a quiz attempt
export const footballIqQuizAttemptSchema = z.object({
  id: z.number(),
  athleteId: z.number(),
  quizId: z.number(),
  startedAt: z.date(),
  completedAt: z.date().nullable().optional(),
  answers: z.array(footballIqAnswerSchema).default([]),
  score: z.number().nullable().optional(),
  timeSpent: z.number().nullable().optional(),
  isPassed: z.boolean().nullable().optional()
});

// Create an insert schema for quiz attempts
export const insertFootballIqQuizAttemptSchema = footballIqQuizAttemptSchema
  .omit({ id: true, answers: true, score: true, isPassed: true })
  .extend({
    completedAt: z.date().optional()
  });

export type InsertFootballIqQuizAttempt = z.infer<typeof insertFootballIqQuizAttemptSchema>;
export type FootballIqQuizAttempt = z.infer<typeof footballIqQuizAttemptSchema>;

// ===== PROGRESS SCHEMAS =====

// Define the IQ levels
export const iqLevels = [
  'novice',        // 0-30
  'developing',    // 31-50
  'competent',     // 51-70
  'proficient',    // 71-85
  'expert',        // 86-95
  'master'         // 96-100
] as const;

// Function to calculate IQ level based on score
export function calculateIqLevel(score: number): typeof iqLevels[number] {
  if (score <= 30) return 'novice';
  if (score <= 50) return 'developing';
  if (score <= 70) return 'competent';
  if (score <= 85) return 'proficient';
  if (score <= 95) return 'expert';
  return 'master';
}

// Define the schema for Football IQ progress
export const footballIqProgressSchema = z.object({
  id: z.number(),
  athleteId: z.number(),
  position: z.enum(footballPositions),
  score: z.number().min(0).max(100),
  level: z.enum(iqLevels),
  quizzesCompleted: z.number().default(0),
  quizzesPassed: z.number().default(0),
  lastQuizId: z.number().nullable().optional(),
  lastQuizScore: z.number().nullable().optional(),
  lastUpdated: z.date().default(() => new Date()),
  recommendations: z.string().array().optional().nullable(),
  strengthAreas: z.string().array().optional().nullable(),
  weaknessAreas: z.string().array().optional().nullable(),
  scoreHistory: z.array(
    z.object({
      date: z.date(),
      score: z.number(),
      quizId: z.number()
    })
  ).optional().nullable()
});

// Create an insert schema for progress
export const insertFootballIqProgressSchema = footballIqProgressSchema
  .omit({ id: true, lastUpdated: true });

export type InsertFootballIqProgress = z.infer<typeof insertFootballIqProgressSchema>;
export type FootballIqProgress = z.infer<typeof footballIqProgressSchema>;