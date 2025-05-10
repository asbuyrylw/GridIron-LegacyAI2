import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAchievementProgress } from '@/hooks/use-achievement-progress';
import { getAchievementById, ACHIEVEMENT_BADGES } from '@/lib/achievement-badges';
import { useQuery } from '@tanstack/react-query';

// Define types for our data structures
interface AthleteData {
  id?: number;
  firstName?: string;
  lastName?: string;
  position?: string;
  school?: string;
  graduationYear?: number;
  height?: string | null;
  weight?: number | null;
  onboardingCompleted?: boolean;
  hasHighlightFilm?: boolean;
  gpa?: number | null;
  [key: string]: any;
}

interface CombineMetric {
  id: number;
  athleteId: number;
  dateRecorded: string;
  fortyYard: number | null;
  verticalJump: number | null;
  benchPress: number | null;
  [key: string]: any;
}

interface TrainingData {
  id?: number;
  athleteId?: number;
  completedWorkouts?: number;
  [key: string]: any;
}

interface NutritionData {
  id?: number;
  athleteId?: number;
  consecutiveDaysLogged?: number;
  [key: string]: any;
}

interface RecruitingData {
  id?: number;
  athleteId?: number;
  attendedCamps?: boolean;
  collegeInterest?: number;
  scholarshipOffers?: number;
  [key: string]: any;
}

/**
 * This hook automatically tracks an athlete's progress and
 * awards achievements based on their performance metrics,
 * training completion, profile completeness, etc.
 * 
 * It should be mounted in a layout component that's always present.
 */
export function useAchievementTracker() {
  const { user } = useAuth();
  const { updateProgress } = useAchievementProgress();
  const athleteId = user?.athlete?.id;
  
  // Query athlete data
  const { data: athleteData = {} as AthleteData } = useQuery<AthleteData>({
    queryKey: [`/api/athlete/${athleteId}`],
    enabled: !!athleteId,
  });
  
  // Query combine metrics
  const { data: combineMetrics = [] as CombineMetric[] } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${athleteId}/combine-metrics`],
    enabled: !!athleteId,
  });
  
  // Query training data
  const { data: trainingData = {} as TrainingData } = useQuery<TrainingData>({
    queryKey: [`/api/athlete/${athleteId}/training-profile`],
    enabled: !!athleteId,
  });
  
  // Query nutrition data
  const { data: nutritionData = {} as NutritionData } = useQuery<NutritionData>({
    queryKey: [`/api/athlete/${athleteId}/nutrition-profile`],
    enabled: !!athleteId,
  });
  
  // Query recruiting data
  const { data: recruitingData = {} as RecruitingData } = useQuery<RecruitingData>({
    queryKey: [`/api/athlete/${athleteId}/recruiting-profile`],
    enabled: !!athleteId,
  });

  // Check performance achievements based on combine metrics
  useEffect(() => {
    if (!athleteId || !combineMetrics || !combineMetrics.length) return;
    
    // Get the most recent combine metrics
    const latestMetrics = combineMetrics.reduce((latest: any, metric: any) => {
      if (!latest || new Date(metric.dateRecorded) > new Date(latest.dateRecorded)) {
        return metric;
      }
      return latest;
    }, null);
    
    if (!latestMetrics) return;
    
    // Check Speed Demon achievements
    if (latestMetrics.fortyYard !== null) {
      const fortyYardDash = latestMetrics.fortyYard;
      
      // Speed Demon achievements (lower is better)
      if (fortyYardDash <= 5.0) {
        updateProgress('speed_demon_bronze', 100, getAchievementById('speed_demon_bronze'));
      }
      if (fortyYardDash <= 4.8) {
        updateProgress('speed_demon_silver', 100, getAchievementById('speed_demon_silver'));
      }
      if (fortyYardDash <= 4.6) {
        updateProgress('speed_demon_gold', 100, getAchievementById('speed_demon_gold'));
      }
      if (fortyYardDash <= 4.4) {
        updateProgress('speed_demon_platinum', 100, getAchievementById('speed_demon_platinum'));
      }
    }
    
    // Check High Flyer achievements
    if (latestMetrics.verticalJump !== null) {
      const verticalJump = latestMetrics.verticalJump;
      
      // High Flyer achievements (higher is better)
      if (verticalJump >= 24) {
        updateProgress('high_flyer_bronze', 100, getAchievementById('high_flyer_bronze'));
      }
      if (verticalJump >= 28) {
        updateProgress('high_flyer_silver', 100, getAchievementById('high_flyer_silver'));
      }
      if (verticalJump >= 32) {
        updateProgress('high_flyer_gold', 100, getAchievementById('high_flyer_gold'));
      }
      if (verticalJump >= 36) {
        updateProgress('high_flyer_platinum', 100, getAchievementById('high_flyer_platinum'));
      }
    }
    
    // Check Iron Pumper achievements
    if (latestMetrics.benchPress !== null) {
      const benchPressReps = latestMetrics.benchPress;
      
      // Iron Pumper achievements (higher is better)
      if (benchPressReps >= 10) {
        updateProgress('iron_pumper_bronze', 100, getAchievementById('iron_pumper_bronze'));
      }
      if (benchPressReps >= 15) {
        updateProgress('iron_pumper_silver', 100, getAchievementById('iron_pumper_silver'));
      }
      if (benchPressReps >= 20) {
        updateProgress('iron_pumper_gold', 100, getAchievementById('iron_pumper_gold'));
      }
      if (benchPressReps >= 25) {
        updateProgress('iron_pumper_platinum', 100, getAchievementById('iron_pumper_platinum'));
      }
    }
  }, [athleteId, combineMetrics, updateProgress]);
  
  // Check profile achievements
  useEffect(() => {
    if (!athleteId || !athleteData) return;
    
    // Profile Starter achievement - basic profile info is completed
    const hasBasicProfile = athleteData.firstName && 
                             athleteData.lastName && 
                             athleteData.position;
    
    if (hasBasicProfile) {
      updateProgress('profile_starter', 100, getAchievementById('profile_starter'));
    }
    
    // Profile Builder achievement - all profile sections completed
    const hasCompleteProfile = hasBasicProfile && 
                               athleteData.school && 
                               athleteData.graduationYear && 
                               athleteData.height && 
                               athleteData.weight &&
                               athleteData.onboardingCompleted;
                         
    if (hasCompleteProfile) {
      updateProgress('profile_builder', 100, getAchievementById('profile_builder'));
    }
    
    // Highlight Hero achievement - has highlight film
    if (athleteData.hasHighlightFilm) {
      updateProgress('highlight_hero', 100, getAchievementById('highlight_hero'));
    }
  }, [athleteId, athleteData, updateProgress]);
  
  // Check training achievements
  useEffect(() => {
    if (!athleteId || !trainingData) return;
    
    // Training Starter achievement - completed first weekly training plan
    if (trainingData.completedWorkouts && trainingData.completedWorkouts >= 1) {
      updateProgress('training_starter', 100, getAchievementById('training_starter'));
    }
    
    // Training Consistent achievement - completed 4 weekly training plans
    if (trainingData.completedWorkouts && trainingData.completedWorkouts >= 4) {
      updateProgress('training_consistent', 100, getAchievementById('training_consistent'));
    }
    
    // Training Dedicated achievement - completed 12 weekly training plans
    if (trainingData.completedWorkouts && trainingData.completedWorkouts >= 12) {
      updateProgress('training_dedicated', 100, getAchievementById('training_dedicated'));
    }
  }, [athleteId, trainingData, updateProgress]);
  
  // Check nutrition achievements
  useEffect(() => {
    if (!athleteId || !nutritionData) return;
    
    // Nutrition Tracker achievement - logged meals for 7 consecutive days
    if (nutritionData.consecutiveDaysLogged && nutritionData.consecutiveDaysLogged >= 7) {
      updateProgress('nutrition_tracker', 100, getAchievementById('nutrition_tracker'));
    }
    
    // Nutrition Master achievement - logged meals for 30 consecutive days
    if (nutritionData.consecutiveDaysLogged && nutritionData.consecutiveDaysLogged >= 30) {
      updateProgress('nutrition_master', 100, getAchievementById('nutrition_master'));
    }
  }, [athleteId, nutritionData, updateProgress]);
  
  // Check academic achievements
  useEffect(() => {
    if (!athleteId || !athleteData) return;
    
    // Academic Achiever achievement - GPA of 3.0 or higher
    if (athleteData.gpa && athleteData.gpa >= 3.0) {
      updateProgress('academic_achiever', 100, getAchievementById('academic_achiever'));
    }
    
    // Academic Star achievement - GPA of 3.5 or higher
    if (athleteData.gpa && athleteData.gpa >= 3.5) {
      updateProgress('academic_star', 100, getAchievementById('academic_star'));
    }
  }, [athleteId, athleteData, updateProgress]);
  
  // Check recruiting achievements
  useEffect(() => {
    if (!athleteId || !recruitingData) return;
    
    // Camp Participant achievement - attended football camp or combine
    if (recruitingData.attendedCamps) {
      updateProgress('camp_participant', 100, getAchievementById('camp_participant'));
    }
    
    // College Interest achievement - received interest from college program
    if (recruitingData.collegeInterest && recruitingData.collegeInterest > 0) {
      updateProgress('college_interest', 100, getAchievementById('college_interest'));
    }
    
    // Scholarship Offer achievement - received scholarship offer
    if (recruitingData.scholarshipOffers && recruitingData.scholarshipOffers > 0) {
      updateProgress('scholarship_offer', 100, getAchievementById('scholarship_offer'));
    }
  }, [athleteId, recruitingData, updateProgress]);
  
  // Return nothing as this hook is used for its side effects
  return;
}