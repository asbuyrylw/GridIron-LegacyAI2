import { db } from '../db';
import { athletes, combineMetrics, users, nutritionPlans, trainingPlans, performanceInsights, recruitingAdvice } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { 
  generateTrainingPlan, 
  generateMealSuggestion, 
  analyzeAthleteMetrics,
  generateRecruitingInsights 
} from '../openai';

/**
 * Service for generating personalized content based on athlete profile data
 */
export class PersonalizationService {
  
  /**
   * Generate a complete personalized plan for an athlete based on their profile
   * This includes training, nutrition, and recruiting recommendations
   */
  async generatePersonalizedPlan(athleteId: number) {
    try {
      // 1. Gather all relevant athlete data
      const athleteData = await this.getAthleteCompleteProfile(athleteId);
      if (!athleteData) {
        throw new Error('Athlete not found');
      }

      // 2. Generate the different components of the plan in parallel
      const [trainingPlan, nutritionPlan, performanceInsights, recruitingAdvice] = await Promise.all([
        this.generateTrainingPlanForAthlete(athleteId),
        this.generateNutritionPlanForAthlete(athleteId),
        this.generatePerformanceInsightsForAthlete(athleteId),
        this.generateRecruitingPlanForAthlete(athleteId)
      ]);

      // 3. Return the complete personalized plan
      return {
        trainingPlan,
        nutritionPlan,
        performanceInsights,
        recruitingAdvice,
        generatedAt: new Date().toISOString(),
        athleteId
      };
    } catch (error) {
      console.error('Error generating personalized plan:', error);
      throw error;
    }
  }

  /**
   * Get all relevant information about an athlete from various tables
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

      // Return the complete athlete profile
      return {
        ...athlete,
        user,
        metrics
      };
    } catch (error) {
      console.error('Error getting athlete profile:', error);
      return null;
    }
  }

  /**
   * Generate a personalized training plan based on athlete data
   */
  async generateTrainingPlanForAthlete(athleteId: number) {
    try {
      const athleteProfile = await this.getAthleteCompleteProfile(athleteId);
      if (!athleteProfile) {
        throw new Error('Athlete profile not found');
      }

      // Determine focus based on position and metrics
      let focus = 'overall athletic development';
      
      if (athleteProfile.position) {
        // Position-specific focus areas
        const positionFocusMap: Record<string, string> = {
          'Quarterback (QB)': 'arm strength and accuracy',
          'Running Back (RB)': 'speed and agility',
          'Wide Receiver (WR)': 'route running and catching',
          'Tight End (TE)': 'blocking and receiving',
          'Offensive Line': 'strength and footwork',
          'Defensive Line': 'explosive power and tackling',
          'Linebacker (LB)': 'tackling and coverage skills',
          'Cornerback (CB)': 'coverage and backpedal technique',
          'Safety': 'coverage and tackling'
        };
        
        focus = positionFocusMap[athleteProfile.position] || focus;
      }

      // Generate the training plan using OpenAI
      const plan = await generateTrainingPlan({
        position: athleteProfile.position,
        metrics: athleteProfile.metrics,
        focus
      });

      // Add athlete-specific information to the plan
      return {
        ...plan,
        athleteId,
        date: new Date().toISOString().split('T')[0],
        active: true,
        completed: false,
        difficultyLevel: this.calculateDifficultyLevel(athleteProfile)
      };
    } catch (error) {
      console.error('Error generating training plan:', error);
      throw error;
    }
  }

  /**
   * Generate a personalized nutrition plan based on athlete data
   */
  async generateNutritionPlanForAthlete(athleteId: number) {
    try {
      const athleteProfile = await this.getAthleteCompleteProfile(athleteId);
      if (!athleteProfile) {
        throw new Error('Athlete profile not found');
      }
      
      // Calculate basic nutritional needs based on weight, height, and position
      const weight = athleteProfile.weight || 170; // Default weight if missing
      const dailyCalories = this.calculateDailyCalories(athleteProfile);
      
      // Position-based nutritional focus
      let nutritionGoal = 'performance';
      
      const powerPositions = ['Offensive Line', 'Defensive Line', 'Tight End (TE)'];
      const speedPositions = ['Wide Receiver (WR)', 'Cornerback (CB)', 'Running Back (RB)'];
      
      if (athleteProfile.position) {
        if (powerPositions.includes(athleteProfile.position)) {
          nutritionGoal = 'muscle_gain';
        } else if (speedPositions.includes(athleteProfile.position)) {
          nutritionGoal = 'speed_and_agility';
        }
      }
      
      // Calculate macro splits
      const proteinTarget = Math.round(weight * 1.8); // 1.8g/lb body weight
      const fatTarget = Math.round((dailyCalories * 0.25) / 9); // 25% of calories from fat
      const carbTarget = Math.round((dailyCalories - (proteinTarget * 4) - (fatTarget * 9)) / 4);
      
      // Base nutrition plan
      const nutritionPlan = {
        dailyCalories,
        proteinTarget,
        carbTarget,
        fatTarget,
        goal: nutritionGoal,
        athleteId,
        waterTarget: Math.round(weight * 0.5), // oz of water
        meals: []
      };
      
      // Generate sample meals for the plan
      const [breakfast, lunch, dinner, snack] = await Promise.all([
        generateMealSuggestion(nutritionPlan, 'breakfast', nutritionGoal),
        generateMealSuggestion(nutritionPlan, 'lunch', nutritionGoal),
        generateMealSuggestion(nutritionPlan, 'dinner', nutritionGoal),
        generateMealSuggestion(nutritionPlan, 'snack', nutritionGoal)
      ]);
      
      nutritionPlan.meals = [breakfast, lunch, dinner, snack];
      
      return nutritionPlan;
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
      throw error;
    }
  }

  /**
   * Generate performance insights based on athlete metrics
   */
  async generatePerformanceInsightsForAthlete(athleteId: number) {
    try {
      const athleteProfile = await this.getAthleteCompleteProfile(athleteId);
      if (!athleteProfile || !athleteProfile.metrics) {
        throw new Error('Athlete metrics not found');
      }

      // Generate insights using OpenAI
      const insights = await analyzeAthleteMetrics(
        athleteProfile.metrics, 
        athleteProfile.position || 'Unknown'
      );

      return {
        athleteId,
        ...insights,
        generatedDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating performance insights:', error);
      throw error;
    }
  }

  /**
   * Generate recruiting recommendations based on athlete profile
   */
  async generateRecruitingPlanForAthlete(athleteId: number) {
    try {
      const athleteProfile = await this.getAthleteCompleteProfile(athleteId);
      if (!athleteProfile) {
        throw new Error('Athlete profile not found');
      }

      // Generate mock college matches for now
      // In a real implementation, this would come from your college matching service
      const mockCollegeMatches = [
        {
          name: "Central State University",
          division: "Division II",
          city: "Springfield",
          state: "IL",
          conference: "Midwest Conference",
          academicMatch: 85,
          athleticMatch: 78,
          overallMatch: 82,
          recruitingProfile: {
            activelyRecruiting: ["Quarterback", "Linebacker", "Defensive Back"]
          }
        },
        {
          name: "Eastern Technical College",
          division: "Division III",
          city: "Riverside",
          state: "OH",
          conference: "Eastern Conference",
          academicMatch: 92,
          athleticMatch: 73,
          overallMatch: 85,
          recruitingProfile: {
            activelyRecruiting: ["Wide Receiver", "Running Back", "Quarterback"]
          }
        }
      ];

      // Generate recruiting insights using OpenAI
      const insights = await generateRecruitingInsights(
        athleteProfile,
        athleteProfile.metrics || {},
        mockCollegeMatches
      );

      return {
        athleteId,
        insights,
        recommendations: insights, // For backwards compatibility
        generatedDate: new Date().toISOString(),
        nextSteps: this.generateRecruitingNextSteps(athleteProfile)
      };
    } catch (error) {
      console.error('Error generating recruiting plan:', error);
      throw error;
    }
  }

  /**
   * Calculate daily calorie needs based on athlete profile
   */
  private calculateDailyCalories(athleteProfile: any): number {
    // Default weight if missing
    const weight = athleteProfile.weight || 170; // in lbs
    
    // Convert to kg for formula
    const weightKg = weight * 0.453592;
    
    // Default height if missing (5'10" in cm)
    const heightCm = 177.8;
    
    // Estimate age based on grade
    const age = athleteProfile.grade ? (14 + athleteProfile.grade) : 16;
    
    // Harris-Benedict BMR formula
    const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    
    // Activity multiplier - football players have high activity level
    const activityMultiplier = 1.725; // Very active
    
    return Math.round(bmr * activityMultiplier);
  }
  
  /**
   * Calculate appropriate difficulty level based on athlete profile
   */
  private calculateDifficultyLevel(athleteProfile: any): string {
    // Default to intermediate
    let level = 'Intermediate';
    
    // If we have grade information, adjust based on experience
    if (athleteProfile.grade) {
      if (athleteProfile.grade === 9) {
        level = 'Beginner';
      } else if (athleteProfile.grade === 12) {
        level = 'Advanced';
      }
    }
    
    // Adjust based on metrics if available
    if (athleteProfile.metrics) {
      // Example: If they have very good speed and strength, increase difficulty
      const fortyYard = athleteProfile.metrics.fortyYard || 5.0;
      const benchPress = athleteProfile.metrics.benchPress || 150;
      
      // Position-specific adjustments
      if (athleteProfile.position === 'Quarterback (QB)' && fortyYard < 4.8) {
        level = 'Advanced';
      } else if (
        (athleteProfile.position === 'Offensive Line' || 
         athleteProfile.position === 'Defensive Line') && 
        benchPress > 250
      ) {
        level = 'Advanced';
      }
    }
    
    return level;
  }
  
  /**
   * Generate recruitment next steps based on athlete profile
   */
  private generateRecruitingNextSteps(athleteProfile: any): string[] {
    const nextSteps = [];
    
    // Base steps everyone should do
    nextSteps.push("Update your highlight reel with recent game footage");
    nextSteps.push("Research the academic programs at your top matched schools");
    
    // Grade-specific steps
    if (athleteProfile.grade) {
      if (athleteProfile.grade === 9 || athleteProfile.grade === 10) {
        nextSteps.push("Focus on improving your academic standing");
        nextSteps.push("Attend local football camps to gain exposure");
      } else if (athleteProfile.grade === 11) {
        nextSteps.push("Begin reaching out to coaches at target schools");
        nextSteps.push("Prepare for standardized tests (ACT/SAT)");
        nextSteps.push("Attend college showcases and camps");
      } else if (athleteProfile.grade === 12) {
        nextSteps.push("Submit applications to your top schools");
        nextSteps.push("Schedule campus visits with football program tours");
        nextSteps.push("Follow up with coaches who have shown interest");
      }
    }
    
    return nextSteps;
  }
}

export const personalizationService = new PersonalizationService();