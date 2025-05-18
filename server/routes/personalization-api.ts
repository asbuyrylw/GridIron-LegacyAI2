import { Router } from 'express';
import { personalizationService } from '../services/personalization-service';
import { db } from '../db';
import { trainingPlans, nutritionPlans, performanceInsights, recruitingAdvice } from '@shared/schema';
import { Request, Response } from 'express';

const router = Router();

/**
 * Generate a complete personalized plan for an athlete
 * This is the main endpoint that will call all the personalization services
 */
router.post('/athlete/:athleteId/generate-plan', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    // Check if the authenticated user has access to this athlete's data
    if (!req.session.user || 
       (req.session.user.userType === 'athlete' && req.session.user.id !== athleteId)) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    const plan = await personalizationService.generatePersonalizedPlan(athleteId);
    
    // Return the generated plan
    res.json(plan);
  } catch (error) {
    console.error('Error generating personalized plan:', error);
    res.status(500).json({ message: 'Failed to generate personalized plan' });
  }
});

/**
 * Generate only a training plan for an athlete
 */
router.post('/athlete/:athleteId/generate-training', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    // Check if the authenticated user has access to this athlete's data
    if (!req.session.user || 
       (req.session.user.userType === 'athlete' && req.session.user.id !== athleteId)) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    const trainingPlan = await personalizationService.generateTrainingPlanForAthlete(athleteId);
    
    // Store the training plan in the database
    const [savedPlan] = await db.insert(trainingPlans).values({
      athleteId,
      date: trainingPlan.date,
      title: trainingPlan.title,
      focus: trainingPlan.focus,
      exercises: trainingPlan.exercises,
      coachTip: trainingPlan.coachTip,
      active: true,
      completed: false,
      difficultyLevel: trainingPlan.difficultyLevel
    }).returning();
    
    // Return the generated and saved plan
    res.json(savedPlan);
  } catch (error) {
    console.error('Error generating training plan:', error);
    res.status(500).json({ message: 'Failed to generate training plan' });
  }
});

/**
 * Generate only a nutrition plan for an athlete
 */
router.post('/athlete/:athleteId/generate-nutrition', async (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    // Check if the authenticated user has access to this athlete's data
    if (!req.session.authenticated || 
       (req.session.user.type === 'athlete' && req.session.user.id !== athleteId)) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    const nutritionPlan = await personalizationService.generateNutritionPlanForAthlete(athleteId);
    
    // Store the nutrition plan in the database
    // Note: You would need to have a nutritionPlans table defined in your schema
    const [savedPlan] = await db.insert(nutritionPlans).values({
      athleteId,
      dailyCalories: nutritionPlan.dailyCalories,
      proteinTarget: nutritionPlan.proteinTarget,
      carbTarget: nutritionPlan.carbTarget,
      fatTarget: nutritionPlan.fatTarget,
      waterTarget: nutritionPlan.waterTarget,
      goal: nutritionPlan.goal,
      recommendedMeals: nutritionPlan.meals
    }).returning();
    
    // Return the generated and saved plan
    res.json(savedPlan);
  } catch (error) {
    console.error('Error generating nutrition plan:', error);
    res.status(500).json({ message: 'Failed to generate nutrition plan' });
  }
});

/**
 * Generate performance insights for an athlete
 */
router.post('/athlete/:athleteId/generate-insights', async (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    // Check if the authenticated user has access to this athlete's data
    if (!req.session.authenticated || 
       (req.session.user.type === 'athlete' && req.session.user.id !== athleteId)) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    const insights = await personalizationService.generatePerformanceInsightsForAthlete(athleteId);
    
    // Store the insights in the database
    const [savedInsights] = await db.insert(performanceInsights).values({
      athleteId,
      strengths: insights.strengths,
      weaknesses: insights.weaknesses,
      recommendations: insights.recommendations,
      performanceTrend: insights.performanceTrend,
      positionRanking: insights.positionRanking,
      improvementAreas: insights.improvementAreas,
      recentAchievements: insights.recentAchievements,
      generatedDate: new Date()
    }).returning();
    
    // Return the generated insights
    res.json(savedInsights);
  } catch (error) {
    console.error('Error generating performance insights:', error);
    res.status(500).json({ message: 'Failed to generate performance insights' });
  }
});

/**
 * Generate recruiting recommendations for an athlete
 */
router.post('/athlete/:athleteId/generate-recruiting', async (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    // Check if the authenticated user has access to this athlete's data
    if (!req.session.authenticated || 
       (req.session.user.type === 'athlete' && req.session.user.id !== athleteId)) {
      return res.status(403).json({ message: 'Not authorized to access this athlete data' });
    }
    
    const recommendations = await personalizationService.generateRecruitingPlanForAthlete(athleteId);
    
    // Store the recommendations in the database
    const [savedRecommendations] = await db.insert(recruitingAdvice).values({
      athleteId,
      recommendations: recommendations.insights,
      nextSteps: recommendations.nextSteps,
      generatedDate: new Date()
    }).returning();
    
    // Return the generated recommendations
    res.json(savedRecommendations);
  } catch (error) {
    console.error('Error generating recruiting recommendations:', error);
    res.status(500).json({ message: 'Failed to generate recruiting recommendations' });
  }
});

export default router;