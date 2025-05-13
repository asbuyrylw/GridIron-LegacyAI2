import { MemStorage } from './storage';
import { 
  FootballIqQuiz,
  InsertFootballIqQuiz,
  FootballIqQuestion,
  InsertFootballIqQuestion,
  FootballIqQuizAttempt,
  InsertFootballIqQuizAttempt,
  FootballIqProgress,
  InsertFootballIqProgress,
  iqLevels,
  QuizAnswer
} from '../shared/football-iq-schema';

// Helper function to determine IQ level based on score
function calculateIqLevel(score: number): string {
  if (score <= 30) return 'novice';
  if (score <= 50) return 'developing';
  if (score <= 70) return 'competent';
  if (score <= 85) return 'proficient';
  if (score <= 95) return 'expert';
  return 'master';
}

// ===== QUIZ MANAGEMENT =====

/**
 * Get all football IQ quizzes with optional filters
 */
export async function getFootballIqQuizzes(this: MemStorage, filters?: {
  position?: string;
  difficulty?: string;
  category?: string;
  isActive?: boolean;
  createdBy?: number;
}): Promise<FootballIqQuiz[]> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize quizzes array if it doesn't exist
    if (!data.footballIqQuizzes) {
      data.footballIqQuizzes = [];
      return [];
    }
    
    // Apply filters if provided
    let quizzes = [...data.footballIqQuizzes];
    
    if (filters) {
      if (filters.position) {
        quizzes = quizzes.filter(q => q.position === filters.position);
      }
      
      if (filters.difficulty) {
        quizzes = quizzes.filter(q => q.difficulty === filters.difficulty);
      }
      
      if (filters.category) {
        quizzes = quizzes.filter(q => q.category === filters.category);
      }
      
      if (filters.isActive !== undefined) {
        quizzes = quizzes.filter(q => q.isActive === filters.isActive);
      }
      
      if (filters.createdBy !== undefined) {
        quizzes = quizzes.filter(q => q.createdBy === filters.createdBy);
      }
    }
    
    // For each quiz, get its questions
    for (const quiz of quizzes) {
      quiz.questions = await this.getFootballIqQuestions(quiz.id);
    }
    
    return quizzes;
  } catch (error) {
    console.error('Error getting football IQ quizzes:', error);
    return [];
  }
}

/**
 * Get a single football IQ quiz by ID
 */
export async function getFootballIqQuiz(this: MemStorage, id: number): Promise<FootballIqQuiz | undefined> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize quizzes array if it doesn't exist
    if (!data.footballIqQuizzes) {
      data.footballIqQuizzes = [];
      return undefined;
    }
    
    // Find the quiz
    const quiz = data.footballIqQuizzes.find(q => q.id === id);
    if (!quiz) {
      return undefined;
    }
    
    // Get the questions for this quiz
    const questions = await this.getFootballIqQuestions(id);
    
    // Return the quiz with questions
    return {
      ...quiz,
      questions: questions
    };
  } catch (error) {
    console.error('Error getting football IQ quiz:', error);
    return undefined;
  }
}

/**
 * Create a new football IQ quiz
 */
export async function createFootballIqQuiz(this: MemStorage, quiz: InsertFootballIqQuiz): Promise<FootballIqQuiz> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize quizzes array if it doesn't exist
    if (!data.footballIqQuizzes) {
      data.footballIqQuizzes = [];
    }
    
    // Get the next available ID
    const nextId = this.getNextId(data.footballIqQuizzes);
    
    // Create the new quiz
    const newQuiz: FootballIqQuiz = {
      ...quiz,
      id: nextId,
      questions: [],
      createdAt: new Date(),
      isActive: quiz.isActive ?? true,
      passingScore: quiz.passingScore ?? 70,
      tags: quiz.tags || []
    };
    
    // Add the quiz to storage
    data.footballIqQuizzes.push(newQuiz);
    this.setData(data);
    
    return newQuiz;
  } catch (error) {
    console.error('Error creating football IQ quiz:', error);
    throw error;
  }
}

/**
 * Update an existing football IQ quiz
 */
export async function updateFootballIqQuiz(
  this: MemStorage,
  id: number,
  updates: Partial<InsertFootballIqQuiz>
): Promise<FootballIqQuiz | undefined> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize quizzes array if it doesn't exist
    if (!data.footballIqQuizzes) {
      data.footballIqQuizzes = [];
      return undefined;
    }
    
    // Find the quiz index
    const quizIndex = data.footballIqQuizzes.findIndex(q => q.id === id);
    if (quizIndex === -1) {
      return undefined;
    }
    
    // Get the original quiz
    const originalQuiz = data.footballIqQuizzes[quizIndex];
    
    // Create the updated quiz
    const updatedQuiz: FootballIqQuiz = {
      ...originalQuiz,
      ...updates,
      id: originalQuiz.id,
      createdAt: originalQuiz.createdAt,
      updatedAt: new Date()
    };
    
    // Update the quiz in storage
    data.footballIqQuizzes[quizIndex] = updatedQuiz;
    this.setData(data);
    
    // Get the questions for this quiz
    const questions = await this.getFootballIqQuestions(id);
    
    // Return the updated quiz with questions
    return {
      ...updatedQuiz,
      questions
    };
  } catch (error) {
    console.error('Error updating football IQ quiz:', error);
    return undefined;
  }
}

/**
 * Delete a football IQ quiz
 */
export async function deleteFootballIqQuiz(this: MemStorage, id: number): Promise<boolean> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize quizzes array if it doesn't exist
    if (!data.footballIqQuizzes) {
      data.footballIqQuizzes = [];
      return false;
    }
    
    // Find the quiz index
    const quizIndex = data.footballIqQuizzes.findIndex(q => q.id === id);
    if (quizIndex === -1) {
      return false;
    }
    
    // Remove the quiz from storage
    data.footballIqQuizzes.splice(quizIndex, 1);
    
    // Also remove all questions associated with this quiz
    if (data.footballIqQuestions) {
      data.footballIqQuestions = data.footballIqQuestions.filter(q => q.quizId !== id);
    }
    
    // Also remove all attempts associated with this quiz
    if (data.footballIqQuizAttempts) {
      data.footballIqQuizAttempts = data.footballIqQuizAttempts.filter(a => a.quizId !== id);
    }
    
    this.setData(data);
    
    return true;
  } catch (error) {
    console.error('Error deleting football IQ quiz:', error);
    return false;
  }
}

// ===== QUESTION MANAGEMENT =====

/**
 * Get all questions for a football IQ quiz
 */
export async function getFootballIqQuestions(
  this: MemStorage, 
  quizId: number
): Promise<FootballIqQuestion[]> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize questions array if it doesn't exist
    if (!data.footballIqQuestions) {
      data.footballIqQuestions = [];
      return [];
    }
    
    // Filter questions by quiz ID
    const questions = data.footballIqQuestions.filter(q => q.quizId === quizId);
    
    // Sort by order index
    return questions.sort((a, b) => 
      (a.orderIndex || 0) - (b.orderIndex || 0)
    );
  } catch (error) {
    console.error('Error getting football IQ questions:', error);
    return [];
  }
}

/**
 * Get a single football IQ question by ID
 */
export async function getFootballIqQuestion(
  this: MemStorage, 
  id: number
): Promise<FootballIqQuestion | undefined> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize questions array if it doesn't exist
    if (!data.footballIqQuestions) {
      data.footballIqQuestions = [];
      return undefined;
    }
    
    // Find the question
    const question = data.footballIqQuestions.find(q => q.id === id);
    
    return question;
  } catch (error) {
    console.error('Error getting football IQ question:', error);
    return undefined;
  }
}

/**
 * Create a new football IQ question
 */
export async function createFootballIqQuestion(
  this: MemStorage, 
  question: InsertFootballIqQuestion
): Promise<FootballIqQuestion> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize questions array if it doesn't exist
    if (!data.footballIqQuestions) {
      data.footballIqQuestions = [];
    }
    
    // Get the next available ID
    const nextId = this.getNextId(data.footballIqQuestions);
    
    // Create the new question
    const newQuestion: FootballIqQuestion = {
      ...question,
      id: nextId
    };
    
    // Add the question to storage
    data.footballIqQuestions.push(newQuestion);
    this.setData(data);
    
    return newQuestion;
  } catch (error) {
    console.error('Error creating football IQ question:', error);
    throw error;
  }
}

/**
 * Update an existing football IQ question
 */
export async function updateFootballIqQuestion(
  this: MemStorage,
  id: number,
  updates: Partial<InsertFootballIqQuestion>
): Promise<FootballIqQuestion | undefined> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize questions array if it doesn't exist
    if (!data.footballIqQuestions) {
      data.footballIqQuestions = [];
      return undefined;
    }
    
    // Find the question index
    const questionIndex = data.footballIqQuestions.findIndex(q => q.id === id);
    if (questionIndex === -1) {
      return undefined;
    }
    
    // Get the original question
    const originalQuestion = data.footballIqQuestions[questionIndex];
    
    // Create the updated question
    const updatedQuestion: FootballIqQuestion = {
      ...originalQuestion,
      ...updates,
      id: originalQuestion.id,
      quizId: originalQuestion.quizId
    };
    
    // Update the question in storage
    data.footballIqQuestions[questionIndex] = updatedQuestion;
    this.setData(data);
    
    return updatedQuestion;
  } catch (error) {
    console.error('Error updating football IQ question:', error);
    return undefined;
  }
}

/**
 * Delete a football IQ question
 */
export async function deleteFootballIqQuestion(this: MemStorage, id: number): Promise<boolean> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize questions array if it doesn't exist
    if (!data.footballIqQuestions) {
      data.footballIqQuestions = [];
      return false;
    }
    
    // Find the question index
    const questionIndex = data.footballIqQuestions.findIndex(q => q.id === id);
    if (questionIndex === -1) {
      return false;
    }
    
    // Remove the question from storage
    data.footballIqQuestions.splice(questionIndex, 1);
    this.setData(data);
    
    return true;
  } catch (error) {
    console.error('Error deleting football IQ question:', error);
    return false;
  }
}

// ===== QUIZ ATTEMPT MANAGEMENT =====

/**
 * Get quiz attempts for an athlete with optional filters
 */
export async function getFootballIqQuizAttempts(
  this: MemStorage, 
  filters: {
    athleteId: number;
    quizId?: number;
    isPassed?: boolean;
    recent?: boolean;
    limit?: number;
  }
): Promise<FootballIqQuizAttempt[]> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize attempts array if it doesn't exist
    if (!data.footballIqQuizAttempts) {
      data.footballIqQuizAttempts = [];
      return [];
    }
    
    // Apply filters
    let attempts = data.footballIqQuizAttempts.filter(attempt => 
      attempt.athleteId === filters.athleteId
    );
    
    if (filters.quizId !== undefined) {
      attempts = attempts.filter(attempt => attempt.quizId === filters.quizId);
    }
    
    if (filters.isPassed !== undefined) {
      attempts = attempts.filter(attempt => attempt.isPassed === filters.isPassed);
    }
    
    // Sort by date (most recent first) if requested
    if (filters.recent) {
      attempts.sort((a, b) => {
        const aDate = a.completedAt || a.startedAt;
        const bDate = b.completedAt || b.startedAt;
        return bDate.getTime() - aDate.getTime();
      });
    }
    
    // Apply limit if specified
    if (filters.limit && filters.limit > 0) {
      attempts = attempts.slice(0, filters.limit);
    }
    
    return attempts;
  } catch (error) {
    console.error('Error getting football IQ quiz attempts:', error);
    return [];
  }
}

/**
 * Get a specific quiz attempt by ID
 */
export async function getFootballIqQuizAttempt(
  this: MemStorage, 
  id: number
): Promise<FootballIqQuizAttempt | undefined> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize attempts array if it doesn't exist
    if (!data.footballIqQuizAttempts) {
      data.footballIqQuizAttempts = [];
      return undefined;
    }
    
    // Find the attempt
    const attempt = data.footballIqQuizAttempts.find(a => a.id === id);
    
    return attempt;
  } catch (error) {
    console.error('Error getting football IQ quiz attempt:', error);
    return undefined;
  }
}

/**
 * Create a new quiz attempt
 */
export async function createFootballIqQuizAttempt(
  this: MemStorage, 
  attempt: InsertFootballIqQuizAttempt
): Promise<FootballIqQuizAttempt> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize attempts array if it doesn't exist
    if (!data.footballIqQuizAttempts) {
      data.footballIqQuizAttempts = [];
    }
    
    // Get the next available ID
    const nextId = this.getNextId(data.footballIqQuizAttempts);
    
    // Create the new attempt
    const newAttempt: FootballIqQuizAttempt = {
      ...attempt,
      id: nextId,
      answers: [],
      score: null,
      isPassed: null,
      timeSpent: null
    };
    
    // Add the attempt to storage
    data.footballIqQuizAttempts.push(newAttempt);
    this.setData(data);
    
    return newAttempt;
  } catch (error) {
    console.error('Error creating football IQ quiz attempt:', error);
    throw error;
  }
}

/**
 * Update an existing quiz attempt
 */
export async function updateFootballIqQuizAttempt(
  this: MemStorage,
  id: number,
  updates: Partial<FootballIqQuizAttempt>
): Promise<FootballIqQuizAttempt | undefined> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize attempts array if it doesn't exist
    if (!data.footballIqQuizAttempts) {
      data.footballIqQuizAttempts = [];
      return undefined;
    }
    
    // Find the attempt index
    const attemptIndex = data.footballIqQuizAttempts.findIndex(a => a.id === id);
    if (attemptIndex === -1) {
      return undefined;
    }
    
    // Get the original attempt
    const originalAttempt = data.footballIqQuizAttempts[attemptIndex];
    
    // Create the updated attempt
    const updatedAttempt: FootballIqQuizAttempt = {
      ...originalAttempt,
      ...updates,
      id: originalAttempt.id,
      athleteId: originalAttempt.athleteId,
      quizId: originalAttempt.quizId,
      startedAt: originalAttempt.startedAt
    };
    
    // Update the attempt in storage
    data.footballIqQuizAttempts[attemptIndex] = updatedAttempt;
    this.setData(data);
    
    return updatedAttempt;
  } catch (error) {
    console.error('Error updating football IQ quiz attempt:', error);
    return undefined;
  }
}

/**
 * Complete a quiz attempt with answers and scoring
 */
export async function completeFootballIqQuizAttempt(
  this: MemStorage,
  attemptId: number,
  answers: (QuizAnswer & { isCorrect: boolean })[],
  timeSpent: number
): Promise<FootballIqQuizAttempt | undefined> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize attempts array if it doesn't exist
    if (!data.footballIqQuizAttempts) {
      data.footballIqQuizAttempts = [];
      return undefined;
    }
    
    // Find the attempt index
    const attemptIndex = data.footballIqQuizAttempts.findIndex(a => a.id === attemptId);
    if (attemptIndex === -1) {
      return undefined;
    }
    
    // Get the original attempt
    const originalAttempt = data.footballIqQuizAttempts[attemptIndex];
    
    // Get the quiz to determine passing score
    const quiz = await this.getFootballIqQuiz(originalAttempt.quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    // Calculate score
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const earnedPoints = answers.reduce((sum, a) => {
      if (a.isCorrect) {
        const question = quiz.questions.find(q => q.id === a.questionId);
        return sum + (question?.points || 1);
      }
      return sum;
    }, 0);
    
    const scorePercentage = totalPoints > 0 
      ? Math.round((earnedPoints / totalPoints) * 100) 
      : 0;
    
    // Determine if passed
    const isPassed = scorePercentage >= quiz.passingScore;
    
    // Create the updated attempt
    const updatedAttempt: FootballIqQuizAttempt = {
      ...originalAttempt,
      completedAt: new Date(),
      answers,
      score: scorePercentage,
      timeSpent,
      isPassed
    };
    
    // Update the attempt in storage
    data.footballIqQuizAttempts[attemptIndex] = updatedAttempt;
    this.setData(data);
    
    // Update Football IQ progress
    await this.updateFootballIqProgress(originalAttempt.athleteId, quiz.position, {
      quizId: quiz.id,
      score: scorePercentage,
      isPassed
    });
    
    return updatedAttempt;
  } catch (error) {
    console.error('Error completing football IQ quiz attempt:', error);
    return undefined;
  }
}

// ===== FOOTBALL IQ PROGRESS MANAGEMENT =====

/**
 * Get Football IQ progress for an athlete
 */
export async function getFootballIqProgress(
  this: MemStorage,
  athleteId: number,
  position?: string
): Promise<FootballIqProgress[]> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize progress array if it doesn't exist
    if (!data.footballIqProgress) {
      data.footballIqProgress = [];
      return [];
    }
    
    // Filter by athlete ID
    let progress = data.footballIqProgress.filter(p => p.athleteId === athleteId);
    
    // Filter by position if specified
    if (position) {
      progress = progress.filter(p => p.position === position);
    }
    
    return progress;
  } catch (error) {
    console.error('Error getting football IQ progress:', error);
    return [];
  }
}

/**
 * Get a specific Football IQ progress record by ID
 */
export async function getFootballIqProgressById(
  this: MemStorage,
  id: number
): Promise<FootballIqProgress | undefined> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize progress array if it doesn't exist
    if (!data.footballIqProgress) {
      data.footballIqProgress = [];
      return undefined;
    }
    
    // Find the progress record
    const progress = data.footballIqProgress.find(p => p.id === id);
    
    return progress;
  } catch (error) {
    console.error('Error getting football IQ progress by ID:', error);
    return undefined;
  }
}

/**
 * Update Football IQ progress for an athlete when a quiz is completed
 */
export async function updateFootballIqProgress(
  this: MemStorage,
  athleteId: number,
  position: string,
  quizResult: {
    quizId: number;
    score: number;
    isPassed: boolean;
  }
): Promise<FootballIqProgress> {
  try {
    // Get the data from storage
    const data = this.getData();
    
    // Initialize progress array if it doesn't exist
    if (!data.footballIqProgress) {
      data.footballIqProgress = [];
    }
    
    // Find existing progress for this athlete and position
    let progressIndex = data.footballIqProgress.findIndex(p => 
      p.athleteId === athleteId && p.position === position
    );
    
    let progress: FootballIqProgress;
    const now = new Date();
    
    if (progressIndex === -1) {
      // Create new progress record
      const nextId = this.getNextId(data.footballIqProgress);
      
      progress = {
        id: nextId,
        athleteId,
        position,
        score: quizResult.score,
        level: calculateIqLevel(quizResult.score),
        quizzesCompleted: 1,
        quizzesPassed: quizResult.isPassed ? 1 : 0,
        lastQuizId: quizResult.quizId,
        lastQuizScore: quizResult.score,
        lastUpdated: now,
        strengthAreas: [],
        weaknessAreas: [],
        recommendations: [],
        scoreHistory: [{
          date: now,
          score: quizResult.score,
          quizId: quizResult.quizId
        }]
      };
      
      data.footballIqProgress.push(progress);
    } else {
      // Update existing progress record
      const existingProgress = data.footballIqProgress[progressIndex];
      
      // Calculate new average score
      const totalQuizzes = existingProgress.quizzesCompleted + 1;
      const totalScore = (existingProgress.score * existingProgress.quizzesCompleted) + quizResult.score;
      const newAverageScore = Math.round(totalScore / totalQuizzes);
      
      // Get previous score history or initialize it
      const scoreHistory = existingProgress.scoreHistory || [];
      
      // Add new score to history
      scoreHistory.push({
        date: now,
        score: quizResult.score,
        quizId: quizResult.quizId
      });
      
      // Sort by date (most recent first)
      scoreHistory.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      // Keep only the most recent 10 scores
      const trimmedHistory = scoreHistory.slice(0, 10);
      
      progress = {
        ...existingProgress,
        score: newAverageScore,
        level: calculateIqLevel(newAverageScore),
        quizzesCompleted: totalQuizzes,
        quizzesPassed: existingProgress.quizzesPassed + (quizResult.isPassed ? 1 : 0),
        lastQuizId: quizResult.quizId,
        lastQuizScore: quizResult.score,
        lastUpdated: now,
        scoreHistory: trimmedHistory
      };
      
      data.footballIqProgress[progressIndex] = progress;
    }
    
    this.setData(data);
    
    return progress;
  } catch (error) {
    console.error('Error updating football IQ progress:', error);
    throw error;
  }
}

// ===== EXTENSION METHOD =====

/**
 * Extend MemStorage with Football IQ methods
 */
export function extendMemStorageWithFootballIq(storage: MemStorage): void {
  // Quizzes
  storage.getFootballIqQuizzes = getFootballIqQuizzes;
  storage.getFootballIqQuiz = getFootballIqQuiz;
  storage.createFootballIqQuiz = createFootballIqQuiz;
  storage.updateFootballIqQuiz = updateFootballIqQuiz;
  storage.deleteFootballIqQuiz = deleteFootballIqQuiz;
  
  // Questions
  storage.getFootballIqQuestions = getFootballIqQuestions;
  storage.getFootballIqQuestion = getFootballIqQuestion;
  storage.createFootballIqQuestion = createFootballIqQuestion;
  storage.updateFootballIqQuestion = updateFootballIqQuestion;
  storage.deleteFootballIqQuestion = deleteFootballIqQuestion;
  
  // Attempts
  storage.getFootballIqQuizAttempts = getFootballIqQuizAttempts;
  storage.getFootballIqQuizAttempt = getFootballIqQuizAttempt;
  storage.createFootballIqQuizAttempt = createFootballIqQuizAttempt;
  storage.updateFootballIqQuizAttempt = updateFootballIqQuizAttempt;
  storage.completeFootballIqQuizAttempt = completeFootballIqQuizAttempt;
  
  // Progress
  storage.getFootballIqProgress = getFootballIqProgress;
  storage.getFootballIqProgressById = getFootballIqProgressById;
  storage.updateFootballIqProgress = updateFootballIqProgress;
}