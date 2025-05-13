import { MemStorage } from './storage';
import { 
  FootballIqQuiz, InsertFootballIqQuiz,
  FootballIqQuestion, InsertFootballIqQuestion,
  FootballIqQuizAttempt, InsertFootballIqQuizAttempt,
  FootballIqProgress, InsertFootballIqProgress,
  calculateIqLevel
} from '../shared/football-iq-schema';

// Football IQ Quizzes
export async function getFootballIqQuizzes(this: MemStorage, filters?: {
  position?: string;
  difficulty?: string;
  category?: string;
  isActive?: boolean;
  createdBy?: number;
}): Promise<FootballIqQuiz[]> {
  const quizzes = this.getData<FootballIqQuiz>('footballIqQuizzes') || [];
  
  if (!filters) return quizzes;
  
  return quizzes.filter(quiz => {
    if (filters.position && quiz.position !== filters.position) return false;
    if (filters.difficulty && quiz.difficulty !== filters.difficulty) return false;
    if (filters.category && quiz.category !== filters.category) return false;
    if (filters.isActive !== undefined && quiz.isActive !== filters.isActive) return false;
    if (filters.createdBy && quiz.createdBy !== filters.createdBy) return false;
    return true;
  });
}

export async function getFootballIqQuiz(this: MemStorage, id: number): Promise<FootballIqQuiz | undefined> {
  const quizzes = this.getData<FootballIqQuiz>('footballIqQuizzes') || [];
  const quiz = quizzes.find(q => q.id === id);
  
  if (!quiz) return undefined;
  
  // Add questions to the quiz
  const questions = await this.getFootballIqQuestions(id);
  return { ...quiz, questions };
}

export async function createFootballIqQuiz(this: MemStorage, quiz: InsertFootballIqQuiz): Promise<FootballIqQuiz> {
  const quizzes = this.getData<FootballIqQuiz>('footballIqQuizzes') || [];
  
  const newQuiz: FootballIqQuiz = {
    id: this.getNextId('footballIqQuizzes'),
    ...quiz,
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [] // Will be populated later
  };
  
  quizzes.push(newQuiz);
  this.setData('footballIqQuizzes', quizzes);
  
  return { ...newQuiz };
}

export async function updateFootballIqQuiz(
  this: MemStorage,
  id: number,
  updates: Partial<InsertFootballIqQuiz>
): Promise<FootballIqQuiz | undefined> {
  const quizzes = this.getData<FootballIqQuiz>('footballIqQuizzes') || [];
  const index = quizzes.findIndex(q => q.id === id);
  
  if (index === -1) return undefined;
  
  const updatedQuiz: FootballIqQuiz = {
    ...quizzes[index],
    ...updates,
    updatedAt: new Date()
  };
  
  quizzes[index] = updatedQuiz;
  this.setData('footballIqQuizzes', quizzes);
  
  // Add questions to the quiz
  const questions = await this.getFootballIqQuestions(id);
  return { ...updatedQuiz, questions };
}

export async function deleteFootballIqQuiz(this: MemStorage, id: number): Promise<boolean> {
  const quizzes = this.getData<FootballIqQuiz>('footballIqQuizzes') || [];
  const filteredQuizzes = quizzes.filter(q => q.id !== id);
  
  if (filteredQuizzes.length === quizzes.length) return false;
  
  this.setData('footballIqQuizzes', filteredQuizzes);
  
  // Also delete associated questions
  const questions = this.getData<FootballIqQuestion>('footballIqQuestions') || [];
  const filteredQuestions = questions.filter(q => q.quizId !== id);
  this.setData('footballIqQuestions', filteredQuestions);
  
  return true;
}

// Football IQ Questions
export async function getFootballIqQuestions(
  this: MemStorage, 
  quizId: number
): Promise<FootballIqQuestion[]> {
  const questions = this.getData<FootballIqQuestion>('footballIqQuestions') || [];
  return questions
    .filter(q => q.quizId === quizId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function getFootballIqQuestion(
  this: MemStorage, 
  id: number
): Promise<FootballIqQuestion | undefined> {
  const questions = this.getData<FootballIqQuestion>('footballIqQuestions') || [];
  return questions.find(q => q.id === id);
}

export async function createFootballIqQuestion(
  this: MemStorage, 
  question: InsertFootballIqQuestion
): Promise<FootballIqQuestion> {
  const questions = this.getData<FootballIqQuestion>('footballIqQuestions') || [];
  
  const newQuestion: FootballIqQuestion = {
    id: this.getNextId('footballIqQuestions'),
    ...question,
  };
  
  questions.push(newQuestion);
  this.setData('footballIqQuestions', questions);
  
  return newQuestion;
}

export async function updateFootballIqQuestion(
  this: MemStorage,
  id: number,
  updates: Partial<InsertFootballIqQuestion>
): Promise<FootballIqQuestion | undefined> {
  const questions = this.getData<FootballIqQuestion>('footballIqQuestions') || [];
  const index = questions.findIndex(q => q.id === id);
  
  if (index === -1) return undefined;
  
  const updatedQuestion: FootballIqQuestion = {
    ...questions[index],
    ...updates,
  };
  
  questions[index] = updatedQuestion;
  this.setData('footballIqQuestions', questions);
  
  return updatedQuestion;
}

export async function deleteFootballIqQuestion(this: MemStorage, id: number): Promise<boolean> {
  const questions = this.getData<FootballIqQuestion>('footballIqQuestions') || [];
  const filteredQuestions = questions.filter(q => q.id !== id);
  
  if (filteredQuestions.length === questions.length) return false;
  
  this.setData('footballIqQuestions', filteredQuestions);
  return true;
}

// Football IQ Quiz Attempts
export async function getFootballIqQuizAttempts(
  this: MemStorage, 
  filters?: {
    athleteId?: number;
    quizId?: number;
    isPassed?: boolean;
    recent?: boolean;
    limit?: number;
  }
): Promise<FootballIqQuizAttempt[]> {
  const attempts = this.getData<FootballIqQuizAttempt>('footballIqQuizAttempts') || [];
  
  let filteredAttempts = attempts;
  
  if (filters) {
    filteredAttempts = filteredAttempts.filter(attempt => {
      if (filters.athleteId && attempt.athleteId !== filters.athleteId) return false;
      if (filters.quizId && attempt.quizId !== filters.quizId) return false;
      if (filters.isPassed !== undefined && attempt.isPassed !== filters.isPassed) return false;
      return true;
    });
    
    if (filters.recent) {
      filteredAttempts.sort((a, b) => {
        return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
      });
    }
    
    if (filters.limit) {
      filteredAttempts = filteredAttempts.slice(0, filters.limit);
    }
  }
  
  return filteredAttempts;
}

export async function getFootballIqQuizAttempt(
  this: MemStorage, 
  id: number
): Promise<FootballIqQuizAttempt | undefined> {
  const attempts = this.getData<FootballIqQuizAttempt>('footballIqQuizAttempts') || [];
  return attempts.find(a => a.id === id);
}

export async function createFootballIqQuizAttempt(
  this: MemStorage, 
  attempt: InsertFootballIqQuizAttempt
): Promise<FootballIqQuizAttempt> {
  const attempts = this.getData<FootballIqQuizAttempt>('footballIqQuizAttempts') || [];
  
  const newAttempt: FootballIqQuizAttempt = {
    id: this.getNextId('footballIqQuizAttempts'),
    ...attempt,
    completedAt: attempt.completedAt || null,
    score: attempt.score || null,
    timeSpent: attempt.timeSpent || null,
    iqLevel: attempt.iqLevel || null,
    isPassed: attempt.isPassed || null,
    answers: attempt.answers || []
  };
  
  attempts.push(newAttempt);
  this.setData('footballIqQuizAttempts', attempts);
  
  return newAttempt;
}

export async function updateFootballIqQuizAttempt(
  this: MemStorage,
  id: number,
  updates: Partial<InsertFootballIqQuizAttempt>
): Promise<FootballIqQuizAttempt | undefined> {
  const attempts = this.getData<FootballIqQuizAttempt>('footballIqQuizAttempts') || [];
  const index = attempts.findIndex(a => a.id === id);
  
  if (index === -1) return undefined;
  
  const updatedAttempt: FootballIqQuizAttempt = {
    ...attempts[index],
    ...updates,
  };
  
  attempts[index] = updatedAttempt;
  this.setData('footballIqQuizAttempts', attempts);
  
  return updatedAttempt;
}

export async function completeFootballIqQuizAttempt(
  this: MemStorage,
  id: number,
  answers: {
    questionId: number;
    selectedOptionId: string;
    isCorrect: boolean;
    timeSpent?: number;
  }[],
  timeSpent: number
): Promise<FootballIqQuizAttempt | undefined> {
  const attempts = this.getData<FootballIqQuizAttempt>('footballIqQuizAttempts') || [];
  const index = attempts.findIndex(a => a.id === id);
  
  if (index === -1) return undefined;
  
  const attempt = attempts[index];
  
  // Calculate score (percentage of correct answers)
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const totalQuestions = answers.length;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  // Get the quiz to check the passing score
  const quiz = await this.getFootballIqQuiz(attempt.quizId);
  const isPassed = quiz ? score >= quiz.passingScore : false;
  
  // Determine IQ level based on score
  const iqLevel = calculateIqLevel(score);
  
  const updatedAttempt: FootballIqQuizAttempt = {
    ...attempt,
    completedAt: new Date(),
    score,
    timeSpent,
    iqLevel,
    isPassed,
    answers,
  };
  
  attempts[index] = updatedAttempt;
  this.setData('footballIqQuizAttempts', attempts);
  
  // Update the athlete's Football IQ progress
  if (quiz) {
    await this.updateFootballIqProgress(attempt.athleteId, quiz.position || 'Quarterback (QB)', {
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      iqLevel,
      isPassed,
    });
  }
  
  return updatedAttempt;
}

// Football IQ Progress
export async function getFootballIqProgress(
  this: MemStorage,
  athleteId: number,
  position?: string
): Promise<FootballIqProgress[]> {
  const progressRecords = this.getData<FootballIqProgress>('footballIqProgress') || [];
  
  if (position) {
    return progressRecords.filter(p => p.athleteId === athleteId && p.position === position);
  }
  
  return progressRecords.filter(p => p.athleteId === athleteId);
}

export async function getFootballIqProgressById(
  this: MemStorage,
  id: number
): Promise<FootballIqProgress | undefined> {
  const progressRecords = this.getData<FootballIqProgress>('footballIqProgress') || [];
  return progressRecords.find(p => p.id === id);
}

export async function updateFootballIqProgress(
  this: MemStorage,
  athleteId: number,
  position: string,
  quizResult: {
    quizId: number;
    quizTitle: string;
    score: number;
    iqLevel: string;
    isPassed: boolean;
  }
): Promise<FootballIqProgress> {
  const progressRecords = this.getData<FootballIqProgress>('footballIqProgress') || [];
  
  // Find existing progress record for this athlete and position
  let progressRecord = progressRecords.find(p => p.athleteId === athleteId && p.position === position);
  
  if (!progressRecord) {
    // Create new progress record if none exists
    progressRecord = {
      id: this.getNextId('footballIqProgress'),
      athleteId,
      position: position as any,
      currentIqLevel: 'rookie',
      quizzesCompleted: 0,
      quizzesPassed: 0,
      totalScore: 0,
      averageScore: 0,
      lastAttemptAt: null,
      history: []
    };
    progressRecords.push(progressRecord);
  }
  
  // Update progress record
  progressRecord.quizzesCompleted += 1;
  if (quizResult.isPassed) {
    progressRecord.quizzesPassed += 1;
  }
  
  progressRecord.totalScore += quizResult.score;
  progressRecord.averageScore = Math.round(progressRecord.totalScore / progressRecord.quizzesCompleted);
  progressRecord.lastAttemptAt = new Date();
  
  // Calculate new IQ level based on average score
  progressRecord.currentIqLevel = calculateIqLevel(progressRecord.averageScore) as any;
  
  // Add to history
  progressRecord.history.push({
    date: new Date().toISOString(),
    quizId: quizResult.quizId,
    quizTitle: quizResult.quizTitle,
    score: quizResult.score,
    iqLevel: quizResult.iqLevel as any
  });
  
  // Sort history from newest to oldest
  progressRecord.history.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Limit history to most recent 10 entries
  if (progressRecord.history.length > 10) {
    progressRecord.history = progressRecord.history.slice(0, 10);
  }
  
  this.setData('footballIqProgress', progressRecords);
  
  return progressRecord;
}

// Extension method for MemStorage
export function extendMemStorageWithFootballIq(storage: MemStorage): void {
  storage.getFootballIqQuizzes = getFootballIqQuizzes;
  storage.getFootballIqQuiz = getFootballIqQuiz;
  storage.createFootballIqQuiz = createFootballIqQuiz;
  storage.updateFootballIqQuiz = updateFootballIqQuiz;
  storage.deleteFootballIqQuiz = deleteFootballIqQuiz;
  
  storage.getFootballIqQuestions = getFootballIqQuestions;
  storage.getFootballIqQuestion = getFootballIqQuestion;
  storage.createFootballIqQuestion = createFootballIqQuestion;
  storage.updateFootballIqQuestion = updateFootballIqQuestion;
  storage.deleteFootballIqQuestion = deleteFootballIqQuestion;
  
  storage.getFootballIqQuizAttempts = getFootballIqQuizAttempts;
  storage.getFootballIqQuizAttempt = getFootballIqQuizAttempt;
  storage.createFootballIqQuizAttempt = createFootballIqQuizAttempt;
  storage.updateFootballIqQuizAttempt = updateFootballIqQuizAttempt;
  storage.completeFootballIqQuizAttempt = completeFootballIqQuizAttempt;
  
  storage.getFootballIqProgress = getFootballIqProgress;
  storage.getFootballIqProgressById = getFootballIqProgressById;
  storage.updateFootballIqProgress = updateFootballIqProgress;
}