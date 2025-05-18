import { db } from '../db';
import { athletes, combineMetrics, users, recruitingPreferences, academicProfiles, nutritionInfo, strengthConditioning } from '@shared/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Service for generating comprehensive development plans for athletes
 */
export class DevelopmentPlanService {
  
  /**
   * Generate a complete development plan based on athlete's onboarding data
   * This includes long-term development, yearly goals, and quarterly breakdowns
   */
  async generateAthleteDevelopmentPlan(athleteId: number) {
    try {
      // 1. Gather all the athlete's profile data from onboarding
      const athleteProfile = await this.getAthleteCompleteProfile(athleteId);
      if (!athleteProfile) {
        throw new Error('Athlete profile not found');
      }
      
      // 2. Generate the long-term development plan
      const longTermPlan = await this.generateLongTermDevelopmentPlan(athleteProfile);
      
      // 3. Generate the current year plan with quarterly breakdown
      const currentYearPlan = await this.generateCurrentYearPlan(athleteProfile, longTermPlan);
      
      // 4. Structure the complete development plan
      const developmentPlan = {
        athleteId,
        longTermPlan,
        currentYearPlan,
        generatedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        nextUpdateDate: this.calculateNextUpdateDate(),
      };
      
      // 5. Save the plan to the database
      // In a production environment, you would have a developmentPlans table
      // For now, we'll return the generated plan
      
      return developmentPlan;
    } catch (error) {
      console.error('Error generating development plan:', error);
      throw error;
    }
  }
  
  /**
   * Gather all relevant athlete data from various database tables
   */
  async getAthleteCompleteProfile(athleteId: number) {
    try {
      // Get basic athlete info
      const [athlete] = await db
        .select()
        .from(athletes)
        .where(eq(athletes.id, athleteId));
      
      if (!athlete) {
        return null;
      }
      
      // Get user info
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, athlete.userId));
      
      // Get athlete metrics
      const [metrics] = await db
        .select()
        .from(combineMetrics)
        .where(eq(combineMetrics.athleteId, athleteId));
      
      // Get recruiting preferences
      const [recruiting] = await db
        .select()
        .from(recruitingPreferences)
        .where(eq(recruitingPreferences.athleteId, athleteId));
      
      // Get strength & conditioning info
      const [strengthCond] = await db
        .select()
        .from(strengthConditioning)
        .where(eq(strengthConditioning.athleteId, athleteId));
      
      // Get nutrition info
      const [nutrition] = await db
        .select()
        .from(nutritionInfo)
        .where(eq(nutritionInfo.athleteId, athleteId));
      
      // Return the complete athlete profile by combining all data
      return {
        ...athlete,
        user,
        metrics,
        recruiting,
        strengthCond,
        nutrition,
      };
    } catch (error) {
      console.error('Error getting athlete profile:', error);
      return null;
    }
  }
  
  /**
   * Generate a long-term development plan from current year to senior year
   */
  async generateLongTermDevelopmentPlan(athleteProfile: any) {
    try {
      // Determine the current grade and years to graduation
      const currentGrade = athleteProfile.grade || 9; // Default to freshman if missing
      const yearsToGraduation = 12 - currentGrade;
      
      // Build prompt for the AI
      const prompt = `
You are a specialized AI performance and recruiting coach designed to guide high school football athletes (ages 13-18) toward playing college football at the level they aspire to (Power 5, D1, D2, D3, NAIA, JUCO).

Your role is to collect, analyze, and track a complete athletic, academic, and personal profile, then build a detailed, evolving development plan from their current grade to senior year—designed to maximize their strength, speed, combine metrics, football IQ, and recruiting visibility.

Based on the following athlete profile, generate a year-by-year development strategy from current grade (${currentGrade}) to senior year:

ATHLETE PROFILE:
- Name: ${athleteProfile.firstName} ${athleteProfile.lastName}
- Position: ${athleteProfile.position}
- Grade: ${currentGrade} (${yearsToGraduation} years until graduation)
- Height: ${athleteProfile.height || 'Not provided'}
- Weight: ${athleteProfile.weight || 'Not provided'} lbs
- Target College Level: ${athleteProfile.recruiting?.desiredDivision || athleteProfile.targetDivision || 'Not specified'}

PHYSICAL METRICS:
- 40-yard dash: ${athleteProfile.metrics?.fortyYard || 'Not measured'} seconds
- Bench Press: ${athleteProfile.metrics?.benchPress || 'Not measured'} lbs
- Squat: ${athleteProfile.metrics?.squatMax || 'Not measured'} lbs
- Vertical Jump: ${athleteProfile.metrics?.verticalJump || 'Not measured'} inches
- Shuttle: ${athleteProfile.metrics?.shuttle || 'Not measured'} seconds

ACADEMIC INFO:
- GPA: ${athleteProfile.gpa || 'Not provided'}
- ACT: ${athleteProfile.actScore || 'Not taken'}
- SAT: ${athleteProfile.satScore || 'Not taken'}

CURRENT TRAINING:
- Years Training: ${athleteProfile.strengthCond?.yearsTraining || '0'}
- Days Per Week: ${athleteProfile.strengthCond?.daysPerWeek || '0'}
- Training Focus: ${JSON.stringify(athleteProfile.strengthCond?.trainingFocus || [])}

NUTRITION INFO:
- Current Weight: ${athleteProfile.nutrition?.currentWeight || athleteProfile.weight || 'Not provided'} lbs
- Target Weight: ${athleteProfile.nutrition?.targetWeight || 'Not set'} lbs
- Current Calories: ${athleteProfile.nutrition?.currentCalories || 'Not tracked'} calories
- Meal Frequency: ${athleteProfile.nutrition?.mealFrequency || '3'} meals per day

RECRUITING GOALS:
- Desired Division: ${athleteProfile.recruiting?.desiredDivision || athleteProfile.targetDivision || 'Not specified'}
- Schools of Interest: ${JSON.stringify(athleteProfile.recruiting?.schoolsOfInterest || athleteProfile.schoolsOfInterest || [])}
- Season Start: ${athleteProfile.recruiting?.footballSeasonStart || 'Not provided'}
- Season End: ${athleteProfile.recruiting?.footballSeasonEnd || 'Not provided'}

Generate a comprehensive year-by-year development plan that includes:
1. Combine Metric Progressions (target improvements per year)
2. Body Development (height, weight, body fat %, position benchmarks)
3. Academic Goals (GPA, SAT/ACT, NCAA eligibility)
4. Nutrition Roadmap (macros, calories, body comp changes per year)
5. Recruiting Milestones (film, camps, contact strategy)

Format the response as JSON with the following structure:
{
  "overview": "Brief summary of the athlete's development potential and approach",
  "yearByYearPlan": [
    {
      "academicYear": "9th Grade (2025-2026)",
      "grade": 9,
      "bodyDevelopment": {
        "targetWeight": 170,
        "targetBodyFat": 15,
        "heightProjection": "5'10\"",
        "muscleGainGoal": "10-15 lbs lean mass"
      },
      "combineMetrics": {
        "fortyYard": "5.1 seconds",
        "benchPress": "185 lbs",
        "squat": "250 lbs",
        "verticalJump": "24 inches",
        "shuttle": "4.5 seconds"
      },
      "academicGoals": {
        "gpaTarget": 3.2,
        "courseRecommendations": ["Core NCAA courses", "Maintain strong freshman GPA"],
        "testPrep": "Begin SAT vocabulary building"
      },
      "nutritionPlan": {
        "dailyCalories": 3000,
        "proteinTarget": "160g",
        "carbTarget": "350g",
        "fatTarget": "85g",
        "mealFrequency": 4,
        "hydrationGoal": "1 gallon daily",
        "focusAreas": ["Building fundamental nutrition habits", "Protein with every meal"]
      },
      "recruitingMilestones": {
        "filmGoals": "Create freshman highlight reel (5-7 plays)",
        "campPlans": ["Attend local skills camp"],
        "exposureStrategy": "Begin building social media presence",
        "timeline": "Research schools of interest"
      }
    }
  ]
}

Include entries for EACH year remaining in high school based on the athlete's current grade (${currentGrade}).
`;

      // Generate the long-term plan using OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a specialized football athlete development AI that creates comprehensive development plans for high school athletes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      // Parse and return the generated plan
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error('Error generating long-term development plan:', error);
      // Return a basic structure in case of error
      return {
        overview: "Unable to generate a complete development plan. Please try again later.",
        yearByYearPlan: []
      };
    }
  }
  
  /**
   * Generate a detailed plan for the current year with quarterly breakdowns
   */
  async generateCurrentYearPlan(athleteProfile: any, longTermPlan: any) {
    try {
      // Get the current year's plan from the long-term plan
      const currentGrade = athleteProfile.grade || 9;
      const currentYearPlan = longTermPlan.yearByYearPlan.find((year: any) => year.grade === currentGrade);
      
      if (!currentYearPlan) {
        throw new Error('Current year plan not found in long-term development plan');
      }
      
      // Build prompt for generating the current year's detailed plan
      const prompt = `
You are a specialized AI performance and recruiting coach for high school football athletes.

Based on this athlete's profile and their current year development goals, create a detailed quarterly breakdown for the current academic year:

ATHLETE PROFILE:
- Name: ${athleteProfile.firstName} ${athleteProfile.lastName}
- Position: ${athleteProfile.position}
- Grade: ${currentGrade}
- Current Weight: ${athleteProfile.weight || 'Not provided'} lbs
- Target Weight: ${currentYearPlan.bodyDevelopment.targetWeight} lbs

CURRENT YEAR GOALS:
${JSON.stringify(currentYearPlan, null, 2)}

Create a detailed quarterly breakdown of the current year that includes:

A. Training & Lifting Program (Daily Level):
- Pre-season (May-July)
- In-season (Aug-Oct/Nov)
- Off-season (Nov/Dec-Apr)

For each season, provide:
- Weekly schedule with specific workout splits
- Daily exercises with sets, reps, and % of 1-rep max
- Rest intervals
- Movement purpose (tie each to combine metric improvement)
- Recovery and mobility work

B. Nutrition Program:
- Seasonal caloric and macronutrient targets
- Meal ideas and weekly templates for each phase
- Sample grocery lists
- Supplement recommendations if appropriate
- Macro/carb-cycling adjustments based on training intensity

C. Recruiting Tasks by Month:
- Film creation and updating schedule
- Social media and outreach calendar
- Templates for contacting schools
- Camp and combine participation recommendations
- Monthly check-ins with actionable recruiting goals

Format the response as JSON with the following structure:
{
  "overview": "Brief overview of the current year's focus areas",
  "quarterlyBreakdown": [
    {
      "period": "Summer (May-July): Pre-season",
      "focusAreas": ["List of 2-3 primary focus areas"],
      "trainingProgram": {
        "weeklySchedule": {
          "monday": { "focus": "Lower Body", "exercises": [{ "name": "Squat", "sets": 4, "reps": "5", "intensity": "80% 1RM", "rest": "3 min", "notes": "Focus on depth" }] },
          "tuesday": { "focus": "...", "exercises": [] },
          ...
        },
        "progressionModel": "Linear periodization focusing on strength building",
        "recoveryProtocol": "Description of recovery approach"
      },
      "nutritionPlan": {
        "dailyCalories": 3200,
        "macroBreakdown": { "protein": "180g", "carbs": "380g", "fat": "90g" },
        "mealPlan": {
          "breakfast": ["Option 1", "Option 2"],
          "lunch": ["Option 1", "Option 2"],
          "dinner": ["Option 1", "Option 2"],
          "snacks": ["Option 1", "Option 2"]
        },
        "groceryList": ["List of key items"],
        "supplements": ["Any appropriate supplements"]
      },
      "recruitingTasks": {
        "filmDevelopment": "What to focus on recording",
        "outreachStrategy": "Who to contact this period",
        "events": ["Camps or combines to attend"],
        "monthlyGoals": {
          "may": ["Task 1", "Task 2"],
          "june": ["Task 1", "Task 2"],
          "july": ["Task 1", "Task 2"]
        }
      }
    }
  ]
}

Include quarterly breakdowns for all phases of the year (summer/pre-season, fall/in-season, winter/off-season, spring/off-season).
`;
      
      // Generate the current year plan using OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a specialized football athlete development AI that creates detailed training, nutrition, and recruiting plans."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
      
      // Parse and return the generated current year plan
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error('Error generating current year plan:', error);
      // Return a basic structure in case of error
      return {
        overview: "Unable to generate a detailed current year plan. Please try again later.",
        quarterlyBreakdown: []
      };
    }
  }
  
  /**
   * Calculates the date for the next 12-week progress check
   */
  private calculateNextUpdateDate(): string {
    const today = new Date();
    const nextUpdate = new Date(today);
    nextUpdate.setDate(today.getDate() + 12 * 7); // 12 weeks ahead
    return nextUpdate.toISOString();
  }
  
  /**
   * Generate a progress report comparing current metrics to development plan goals
   */
  async generateProgressReport(athleteId: number) {
    // In a real implementation, this would:
    // 1. Fetch the current development plan
    // 2. Fetch the latest metrics
    // 3. Compare current metrics to planned targets
    // 4. Generate recommendations based on progress
    
    // This is a placeholder implementation
    return {
      athleteId,
      generatedDate: new Date().toISOString(),
      progressAssessment: "Detailed progress assessment would go here",
      achievements: [],
      shortfalls: [],
      updatedRecommendations: []
    };
  }
  
  /**
   * Generate an annual review and college football projection
   */
  async generateAnnualReview(athleteId: number) {
    // In a real implementation, this would:
    // 1. Fetch the development plan
    // 2. Review the entire year's progress
    // 3. Generate projections based on 3 scenarios
    // 4. Recommend updates to the overall plan
    
    // This is a placeholder implementation
    return {
      athleteId,
      generatedDate: new Date().toISOString(),
      yearInReview: "Summary of the past year's progress",
      projections: {
        high: "Best case scenario",
        medium: "Realistic scenario",
        low: "Below average progress scenario"
      },
      recommendedGoalAdjustments: {}
    };
  }
}

export const developmentPlanService = new DevelopmentPlanService();