import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { 
  insertFootballIqQuizSchema, 
  insertFootballIqQuestionSchema, 
  insertFootballIqQuizAttemptSchema,
  footballPositions,
  quizDifficultyLevels,
  quizCategories,
  calculateIqLevel
} from '../../shared/football-iq-schema';
import { z } from 'zod';

const router = Router();

// Helper function to validate coach or admin access
async function validateCoachOrAdminAccess(req: Request): Promise<boolean> {
  if (!req.session || !req.session.userId) return false;
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) return false;
    
    return user.userType === 'admin' || user.userType === 'coach';
  } catch (error) {
    console.error('Error validating coach/admin access:', error);
    return false;
  }
}

// Helper function to validate athlete access (or coach/admin)
async function validateAthleteAccess(req: Request, athleteId: number): Promise<boolean> {
  if (!req.session || !req.session.userId) return false;
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) return false;
    
    // If admin or coach, grant access
    if (user.userType === 'admin' || user.userType === 'coach') return true;
    
    // If athlete, check if it's their own data
    if (user.userType === 'athlete') {
      const athlete = await storage.getAthleteByUserId(user.id);
      return athlete?.id === athleteId;
    }
    
    return false;
  } catch (error) {
    console.error('Error validating athlete access:', error);
    return false;
  }
}

// ===== QUIZ MANAGEMENT ENDPOINTS =====

// Get all quizzes (with optional filters)
router.get('/api/football-iq/quizzes', async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const position = req.query.position as string | undefined;
    const difficulty = req.query.difficulty as string | undefined;
    const category = req.query.category as string | undefined;
    const isActive = req.query.isActive !== undefined 
      ? req.query.isActive === 'true'
      : undefined;
    const createdBy = req.query.createdBy !== undefined
      ? parseInt(req.query.createdBy as string)
      : undefined;
    
    // Validate position if provided
    if (position && !footballPositions.includes(position as any)) {
      return res.status(400).json({ message: 'Invalid position filter' });
    }
    
    // Validate difficulty if provided
    if (difficulty && !quizDifficultyLevels.includes(difficulty as any)) {
      return res.status(400).json({ message: 'Invalid difficulty filter' });
    }
    
    // Validate category if provided
    if (category && !quizCategories.includes(category as any)) {
      return res.status(400).json({ message: 'Invalid category filter' });
    }
    
    const quizzes = await storage.getFootballIqQuizzes({
      position,
      difficulty,
      category,
      isActive,
      createdBy
    });
    
    // Don't include the full questions in the list view
    const quizzesWithoutQuestions = quizzes.map(quiz => {
      const { questions, ...quizWithoutQuestions } = quiz;
      return {
        ...quizWithoutQuestions,
        questionCount: questions?.length || 0
      };
    });
    
    res.json(quizzesWithoutQuestions);
  } catch (error) {
    console.error('Error getting football IQ quizzes:', error);
    res.status(500).json({ message: 'Failed to retrieve football IQ quizzes' });
  }
});

// Get a single quiz by ID (including questions)
router.get('/api/football-iq/quizzes/:id', async (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.id);
    if (isNaN(quizId)) {
      return res.status(400).json({ message: 'Invalid quiz ID' });
    }
    
    const quiz = await storage.getFootballIqQuiz(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if this is for taking the quiz or just viewing
    const forTaking = req.query.for_taking === 'true';
    
    // If this is for taking the quiz, remove the correct answers
    if (forTaking) {
      const quizForTaking = {
        ...quiz,
        questions: quiz.questions.map(question => ({
          ...question,
          options: question.options.map(option => ({
            id: option.id,
            text: option.text
          }))
        }))
      };
      return res.json(quizForTaking);
    }
    
    res.json(quiz);
  } catch (error) {
    console.error('Error getting football IQ quiz:', error);
    res.status(500).json({ message: 'Failed to retrieve football IQ quiz' });
  }
});

// Create a new quiz
router.post('/api/football-iq/quizzes', async (req: Request, res: Response) => {
  try {
    // Verify user is a coach or admin
    if (!(await validateCoachOrAdminAccess(req))) {
      return res.status(403).json({ message: 'Only coaches and admins can create quizzes' });
    }
    
    // Validate request body
    const validationResult = insertFootballIqQuizSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid quiz data', 
        errors: validationResult.error.errors 
      });
    }
    
    const quizData = validationResult.data;
    
    // Set the creator ID to the current user
    quizData.createdBy = req.session!.userId!;
    
    // Create the quiz
    const quiz = await storage.createFootballIqQuiz(quizData);
    
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error creating football IQ quiz:', error);
    res.status(500).json({ message: 'Failed to create football IQ quiz' });
  }
});

// Update a quiz
router.patch('/api/football-iq/quizzes/:id', async (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.id);
    if (isNaN(quizId)) {
      return res.status(400).json({ message: 'Invalid quiz ID' });
    }
    
    // Verify user is a coach or admin
    if (!(await validateCoachOrAdminAccess(req))) {
      return res.status(403).json({ message: 'Only coaches and admins can update quizzes' });
    }
    
    // Get the existing quiz
    const existingQuiz = await storage.getFootballIqQuiz(quizId);
    if (!existingQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if the user is the creator or an admin
    const user = await storage.getUser(req.session!.userId!);
    if (user?.userType !== 'admin' && existingQuiz.createdBy !== req.session!.userId!) {
      return res.status(403).json({ message: 'You can only update quizzes you created' });
    }
    
    // Validate request body (partial validation)
    const partialQuizSchema = insertFootballIqQuizSchema.partial();
    const validationResult = partialQuizSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid quiz data', 
        errors: validationResult.error.errors 
      });
    }
    
    const quizUpdates = validationResult.data;
    
    // Update the quiz
    const updatedQuiz = await storage.updateFootballIqQuiz(quizId, quizUpdates);
    
    res.json(updatedQuiz);
  } catch (error) {
    console.error('Error updating football IQ quiz:', error);
    res.status(500).json({ message: 'Failed to update football IQ quiz' });
  }
});

// Delete a quiz
router.delete('/api/football-iq/quizzes/:id', async (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.id);
    if (isNaN(quizId)) {
      return res.status(400).json({ message: 'Invalid quiz ID' });
    }
    
    // Verify user is a coach or admin
    if (!(await validateCoachOrAdminAccess(req))) {
      return res.status(403).json({ message: 'Only coaches and admins can delete quizzes' });
    }
    
    // Get the existing quiz
    const existingQuiz = await storage.getFootballIqQuiz(quizId);
    if (!existingQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if the user is the creator or an admin
    const user = await storage.getUser(req.session!.userId!);
    if (user?.userType !== 'admin' && existingQuiz.createdBy !== req.session!.userId!) {
      return res.status(403).json({ message: 'You can only delete quizzes you created' });
    }
    
    // Delete the quiz
    const success = await storage.deleteFootballIqQuiz(quizId);
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete quiz' });
    }
    
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting football IQ quiz:', error);
    res.status(500).json({ message: 'Failed to delete football IQ quiz' });
  }
});

// ===== QUIZ QUESTIONS ENDPOINTS =====

// Get questions for a quiz
router.get('/api/football-iq/quizzes/:quizId/questions', async (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.quizId);
    if (isNaN(quizId)) {
      return res.status(400).json({ message: 'Invalid quiz ID' });
    }
    
    // Check if quiz exists
    const quiz = await storage.getFootballIqQuiz(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    const questions = await storage.getFootballIqQuestions(quizId);
    
    // Check if this is for taking the quiz
    const forTaking = req.query.for_taking === 'true';
    
    // If this is for taking the quiz, remove the correct answers
    if (forTaking) {
      const questionsForTaking = questions.map(question => ({
        ...question,
        options: question.options.map(option => ({
          id: option.id,
          text: option.text
        }))
      }));
      return res.json(questionsForTaking);
    }
    
    res.json(questions);
  } catch (error) {
    console.error('Error getting quiz questions:', error);
    res.status(500).json({ message: 'Failed to retrieve quiz questions' });
  }
});

// Create a question for a quiz
router.post('/api/football-iq/quizzes/:quizId/questions', async (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.quizId);
    if (isNaN(quizId)) {
      return res.status(400).json({ message: 'Invalid quiz ID' });
    }
    
    // Verify user is a coach or admin
    if (!(await validateCoachOrAdminAccess(req))) {
      return res.status(403).json({ message: 'Only coaches and admins can create questions' });
    }
    
    // Check if quiz exists
    const quiz = await storage.getFootballIqQuiz(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if the user is the creator of the quiz or an admin
    const user = await storage.getUser(req.session!.userId!);
    if (user?.userType !== 'admin' && quiz.createdBy !== req.session!.userId!) {
      return res.status(403).json({ message: 'You can only add questions to quizzes you created' });
    }
    
    // Validate request body
    const validationResult = insertFootballIqQuestionSchema.safeParse({
      ...req.body,
      quizId
    });
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid question data', 
        errors: validationResult.error.errors 
      });
    }
    
    const questionData = validationResult.data;
    
    // Validate that at least one option is marked as correct
    const hasCorrectOption = questionData.options.some(option => option.isCorrect);
    if (!hasCorrectOption) {
      return res.status(400).json({ message: 'At least one option must be marked as correct' });
    }
    
    // Get existing questions to determine order index
    const existingQuestions = await storage.getFootballIqQuestions(quizId);
    if (!questionData.orderIndex || questionData.orderIndex === 0) {
      questionData.orderIndex = existingQuestions.length + 1;
    }
    
    // Create the question
    const question = await storage.createFootballIqQuestion(questionData);
    
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating quiz question:', error);
    res.status(500).json({ message: 'Failed to create quiz question' });
  }
});

// Update a question
router.patch('/api/football-iq/questions/:id', async (req: Request, res: Response) => {
  try {
    const questionId = parseInt(req.params.id);
    if (isNaN(questionId)) {
      return res.status(400).json({ message: 'Invalid question ID' });
    }
    
    // Verify user is a coach or admin
    if (!(await validateCoachOrAdminAccess(req))) {
      return res.status(403).json({ message: 'Only coaches and admins can update questions' });
    }
    
    // Get the existing question
    const existingQuestion = await storage.getFootballIqQuestion(questionId);
    if (!existingQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Get the quiz to check ownership
    const quiz = await storage.getFootballIqQuiz(existingQuestion.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Associated quiz not found' });
    }
    
    // Check if the user is the creator of the quiz or an admin
    const user = await storage.getUser(req.session!.userId!);
    if (user?.userType !== 'admin' && quiz.createdBy !== req.session!.userId!) {
      return res.status(403).json({ message: 'You can only update questions for quizzes you created' });
    }
    
    // Validate request body (partial validation)
    const partialQuestionSchema = insertFootballIqQuestionSchema
      .omit({ quizId: true })
      .partial();
    
    const validationResult = partialQuestionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid question data', 
        errors: validationResult.error.errors 
      });
    }
    
    const questionUpdates = validationResult.data;
    
    // If options are provided, validate that at least one option is marked as correct
    if (questionUpdates.options) {
      const hasCorrectOption = questionUpdates.options.some(option => option.isCorrect);
      if (!hasCorrectOption) {
        return res.status(400).json({ message: 'At least one option must be marked as correct' });
      }
    }
    
    // Update the question
    const updatedQuestion = await storage.updateFootballIqQuestion(questionId, questionUpdates);
    
    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating quiz question:', error);
    res.status(500).json({ message: 'Failed to update quiz question' });
  }
});

// Delete a question
router.delete('/api/football-iq/questions/:id', async (req: Request, res: Response) => {
  try {
    const questionId = parseInt(req.params.id);
    if (isNaN(questionId)) {
      return res.status(400).json({ message: 'Invalid question ID' });
    }
    
    // Verify user is a coach or admin
    if (!(await validateCoachOrAdminAccess(req))) {
      return res.status(403).json({ message: 'Only coaches and admins can delete questions' });
    }
    
    // Get the existing question
    const existingQuestion = await storage.getFootballIqQuestion(questionId);
    if (!existingQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Get the quiz to check ownership
    const quiz = await storage.getFootballIqQuiz(existingQuestion.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Associated quiz not found' });
    }
    
    // Check if the user is the creator of the quiz or an admin
    const user = await storage.getUser(req.session!.userId!);
    if (user?.userType !== 'admin' && quiz.createdBy !== req.session!.userId!) {
      return res.status(403).json({ message: 'You can only delete questions for quizzes you created' });
    }
    
    // Delete the question
    const success = await storage.deleteFootballIqQuestion(questionId);
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete question' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz question:', error);
    res.status(500).json({ message: 'Failed to delete quiz question' });
  }
});

// ===== QUIZ ATTEMPT ENDPOINTS =====

// Start a quiz attempt
router.post('/api/athlete/:athleteId/football-iq/quizzes/:quizId/attempts', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const quizId = parseInt(req.params.quizId);
    
    if (isNaN(athleteId) || isNaN(quizId)) {
      return res.status(400).json({ message: 'Invalid athlete ID or quiz ID' });
    }
    
    // Verify user has access to this athlete
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete\'s data' });
    }
    
    // Check if athlete exists
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    
    // Check if quiz exists
    const quiz = await storage.getFootballIqQuiz(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if quiz is active
    if (!quiz.isActive) {
      return res.status(400).json({ message: 'This quiz is not currently active' });
    }
    
    // Create a new attempt
    const attempt = await storage.createFootballIqQuizAttempt({
      athleteId,
      quizId,
      startedAt: new Date()
    });
    
    res.status(201).json(attempt);
  } catch (error) {
    console.error('Error starting football IQ quiz attempt:', error);
    res.status(500).json({ message: 'Failed to start quiz attempt' });
  }
});

// Submit answers and complete a quiz attempt
router.post('/api/athlete/:athleteId/football-iq/attempts/:attemptId/complete', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const attemptId = parseInt(req.params.attemptId);
    
    if (isNaN(athleteId) || isNaN(attemptId)) {
      return res.status(400).json({ message: 'Invalid athlete ID or attempt ID' });
    }
    
    // Verify user has access to this athlete
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete\'s data' });
    }
    
    // Validate request body
    const completeAttemptSchema = z.object({
      answers: z.array(z.object({
        questionId: z.number(),
        selectedOptionId: z.string(),
        timeSpent: z.number().optional()
      })),
      timeSpent: z.number()
    });
    
    const validationResult = completeAttemptSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid completion data', 
        errors: validationResult.error.errors 
      });
    }
    
    const { answers, timeSpent } = validationResult.data;
    
    // Get the attempt
    const attempt = await storage.getFootballIqQuizAttempt(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    
    // Verify this attempt belongs to this athlete
    if (attempt.athleteId !== athleteId) {
      return res.status(403).json({ message: 'This attempt does not belong to the specified athlete' });
    }
    
    // Check if the attempt is already completed
    if (attempt.completedAt) {
      return res.status(400).json({ message: 'This attempt has already been completed' });
    }
    
    // Get the quiz
    const quiz = await storage.getFootballIqQuiz(attempt.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Associated quiz not found' });
    }
    
    // Get the questions for this quiz
    const questions = await storage.getFootballIqQuestions(attempt.quizId);
    
    // Validate that answers are provided for all questions
    if (answers.length !== questions.length) {
      return res.status(400).json({ 
        message: `Answers must be provided for all ${questions.length} questions in the quiz` 
      });
    }
    
    // Process each answer to determine correctness
    const processedAnswers = answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      
      if (!question) {
        return {
          ...answer,
          isCorrect: false
        };
      }
      
      const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId);
      const isCorrect = selectedOption?.isCorrect || false;
      
      return {
        ...answer,
        isCorrect
      };
    });
    
    // Complete the attempt
    const completedAttempt = await storage.completeFootballIqQuizAttempt(
      attemptId,
      processedAnswers,
      timeSpent
    );
    
    if (!completedAttempt) {
      return res.status(500).json({ message: 'Failed to complete quiz attempt' });
    }
    
    res.json(completedAttempt);
  } catch (error) {
    console.error('Error completing football IQ quiz attempt:', error);
    res.status(500).json({ message: 'Failed to complete quiz attempt' });
  }
});

// Get all attempts for an athlete
router.get('/api/athlete/:athleteId/football-iq/attempts', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    if (isNaN(athleteId)) {
      return res.status(400).json({ message: 'Invalid athlete ID' });
    }
    
    // Verify user has access to this athlete
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete\'s data' });
    }
    
    // Parse query parameters
    const quizId = req.query.quizId 
      ? parseInt(req.query.quizId as string) 
      : undefined;
    
    const isPassed = req.query.isPassed !== undefined
      ? req.query.isPassed === 'true'
      : undefined;
    
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;
    
    const attempts = await storage.getFootballIqQuizAttempts({
      athleteId,
      quizId,
      isPassed,
      recent: true,
      limit
    });
    
    // Get quiz information for each attempt
    const attemptsWithQuizInfo = await Promise.all(
      attempts.map(async attempt => {
        const quiz = await storage.getFootballIqQuiz(attempt.quizId);
        return {
          ...attempt,
          quizTitle: quiz?.title || 'Unknown Quiz',
          quizPosition: quiz?.position || null,
          quizDifficulty: quiz?.difficulty || 'beginner'
        };
      })
    );
    
    res.json(attemptsWithQuizInfo);
  } catch (error) {
    console.error('Error getting football IQ quiz attempts:', error);
    res.status(500).json({ message: 'Failed to retrieve quiz attempts' });
  }
});

// Get a specific attempt
router.get('/api/athlete/:athleteId/football-iq/attempts/:attemptId', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const attemptId = parseInt(req.params.attemptId);
    
    if (isNaN(athleteId) || isNaN(attemptId)) {
      return res.status(400).json({ message: 'Invalid athlete ID or attempt ID' });
    }
    
    // Verify user has access to this athlete
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete\'s data' });
    }
    
    // Get the attempt
    const attempt = await storage.getFootballIqQuizAttempt(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    
    // Verify this attempt belongs to this athlete
    if (attempt.athleteId !== athleteId) {
      return res.status(403).json({ message: 'This attempt does not belong to the specified athlete' });
    }
    
    // Get the quiz
    const quiz = await storage.getFootballIqQuiz(attempt.quizId);
    
    // Get the questions for this quiz
    const questions = await storage.getFootballIqQuestions(attempt.quizId);
    
    // Combine all data
    const result = {
      ...attempt,
      quiz: {
        id: quiz?.id,
        title: quiz?.title || 'Unknown Quiz',
        description: quiz?.description,
        position: quiz?.position,
        difficulty: quiz?.difficulty,
        category: quiz?.category,
        passingScore: quiz?.passingScore,
      },
      questions: questions.map(question => {
        // Find the answer for this question
        const answer = attempt.answers.find(a => a.questionId === question.id);
        
        return {
          id: question.id,
          questionText: question.questionText,
          questionType: question.questionType,
          imageUrl: question.imageUrl,
          diagramData: question.diagramData,
          options: question.options,
          points: question.points,
          selectedOptionId: answer?.selectedOptionId,
          isCorrect: answer?.isCorrect || false,
          timeSpent: answer?.timeSpent
        };
      })
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error getting football IQ quiz attempt:', error);
    res.status(500).json({ message: 'Failed to retrieve quiz attempt' });
  }
});

// ===== FOOTBALL IQ PROGRESS ENDPOINTS =====

// Get progress for an athlete
router.get('/api/athlete/:athleteId/football-iq/progress', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    if (isNaN(athleteId)) {
      return res.status(400).json({ message: 'Invalid athlete ID' });
    }
    
    // Verify user has access to this athlete
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete\'s data' });
    }
    
    // Get position if specified
    const position = req.query.position as string | undefined;
    
    // Get progress records
    const progressRecords = await storage.getFootballIqProgress(athleteId, position);
    
    res.json(progressRecords);
  } catch (error) {
    console.error('Error getting football IQ progress:', error);
    res.status(500).json({ message: 'Failed to retrieve football IQ progress' });
  }
});

// Get a specific progress record
router.get('/api/athlete/:athleteId/football-iq/progress/:id', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const progressId = parseInt(req.params.id);
    
    if (isNaN(athleteId) || isNaN(progressId)) {
      return res.status(400).json({ message: 'Invalid athlete ID or progress ID' });
    }
    
    // Verify user has access to this athlete
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete\'s data' });
    }
    
    // Get the progress record
    const progress = await storage.getFootballIqProgressById(progressId);
    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }
    
    // Verify this progress record belongs to this athlete
    if (progress.athleteId !== athleteId) {
      return res.status(403).json({ message: 'This progress record does not belong to the specified athlete' });
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Error getting football IQ progress record:', error);
    res.status(500).json({ message: 'Failed to retrieve football IQ progress record' });
  }
});

// Export the router
export default router;