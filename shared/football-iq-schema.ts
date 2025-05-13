import { z } from 'zod';

// Position options for Football IQ quizzes
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
  'Special Teams',
  'All Positions'
];

// Difficulty levels for quizzes and questions
export const quizDifficultyLevels = [
  'beginner',
  'intermediate', 
  'advanced',
  'expert'
];

// Types of questions that can be created
export const questionTypes = [
  'multiple-choice',
  'true-false',
  'match-diagram',
  'identify-play',
  'sequence-events'
];

// Categories of Football IQ quizzes
export const quizCategories = [
  'rules-regulations',
  'offensive-playbook',
  'defensive-schemes',
  'game-strategy',
  'position-specific',
  'situational-awareness',
  'football-history',
  'physical-training',
  'mental-preparation',
  'nutrition',
  'college-recruiting'
];

// IQ Levels based on score ranges
export const iqLevels = [
  'novice',       // 0-30%
  'developing',   // 31-50%
  'competent',    // 51-70%
  'proficient',   // 71-85%
  'expert',       // 86-95%
  'master'        // 96-100%
];

// Define option schema for quiz questions
export const quizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
  explanation: z.string().optional(),
});

export type QuizOption = z.infer<typeof quizOptionSchema>;

// Define Football IQ Quiz schema
export const footballIqQuizSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  position: z.string(),
  difficulty: z.string(),
  category: z.string(),
  questionCount: z.number(),
  passingScore: z.number(),
  isActive: z.boolean(),
  timeLimit: z.number().nullable(),
  createdAt: z.string().or(z.date()),
  createdBy: z.number(),
  tags: z.array(z.string()).nullable(),
});

export const insertFootballIqQuizSchema = footballIqQuizSchema.omit({
  id: true,
  createdAt: true,
  questionCount: true,
});

export type FootballIqQuiz = z.infer<typeof footballIqQuizSchema>;
export type InsertFootballIqQuiz = z.infer<typeof insertFootballIqQuizSchema>;

// Define Football IQ Question schema
export const footballIqQuestionSchema = z.object({
  id: z.number(),
  quizId: z.number(),
  questionText: z.string(),
  questionType: z.string(),
  options: z.array(quizOptionSchema),
  imageUrl: z.string().nullable(),
  diagramData: z.any().nullable(),
  videoUrl: z.string().nullable(),
  explanation: z.string().nullable(),
  orderIndex: z.number(),
  points: z.number(),
  difficulty: z.string().nullable(),
});

export const insertFootballIqQuestionSchema = footballIqQuestionSchema.omit({
  id: true,
});

export type FootballIqQuestion = z.infer<typeof footballIqQuestionSchema>;
export type InsertFootballIqQuestion = z.infer<typeof insertFootballIqQuestionSchema>;

// Define Football IQ Quiz Attempt schema
export const footballIqQuizAttemptSchema = z.object({
  id: z.number(),
  athleteId: z.number(),
  quizId: z.number(),
  startedAt: z.string().or(z.date()),
  completedAt: z.string().or(z.date()).nullable(),
  score: z.number().nullable(),
  isPassed: z.boolean().nullable(),
  timeSpent: z.number().nullable(), // in seconds
  answers: z.any().nullable(), // stored answers with question IDs and selected options
});

export const insertFootballIqQuizAttemptSchema = footballIqQuizAttemptSchema.omit({
  id: true,
  completedAt: true,
  score: true,
  isPassed: true,
  timeSpent: true,
  answers: true,
});

export type FootballIqQuizAttempt = z.infer<typeof footballIqQuizAttemptSchema>;
export type InsertFootballIqQuizAttempt = z.infer<typeof insertFootballIqQuizAttemptSchema>;

// Define Football IQ Progress schema
export const footballIqProgressSchema = z.object({
  id: z.number(),
  athleteId: z.number(),
  position: z.string(),
  score: z.number(), // Overall score from 0-100
  level: z.string(), // IQ level (novice, developing, competent, etc.)
  quizzesCompleted: z.number(),
  quizzesPassed: z.number(),
  lastQuizId: z.number().nullable(),
  lastQuizScore: z.number().nullable(),
  lastUpdated: z.string().or(z.date()),
  recommendations: z.array(z.string()).nullable(), // recommended focus areas
  strengthAreas: z.array(z.string()).nullable(), // categories with high scores
  weaknessAreas: z.array(z.string()).nullable(), // categories with low scores
  scoreHistory: z.array(
    z.object({
      date: z.string(),
      score: z.number(),
      quizId: z.number(),
    })
  ).nullable(), // history of quiz scores with dates
});

export const insertFootballIqProgressSchema = footballIqProgressSchema.omit({
  id: true,
});

export type FootballIqProgress = z.infer<typeof footballIqProgressSchema>;
export type InsertFootballIqProgress = z.infer<typeof insertFootballIqProgressSchema>;

// Define validation schema for quiz answers
export const quizAnswerSchema = z.object({
  questionId: z.number(),
  selectedOptionId: z.string(),
  timeSpent: z.number().optional(),
});

export type QuizAnswer = z.infer<typeof quizAnswerSchema>;

// Define schema for quiz completion payload
export const completeQuizSchema = z.object({
  answers: z.array(quizAnswerSchema),
  timeSpent: z.number().optional(),
});

export type CompleteQuizPayload = z.infer<typeof completeQuizSchema>;