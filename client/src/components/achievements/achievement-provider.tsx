import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAchievementProgress } from '@/hooks/use-achievement-progress';
import { Achievement, getAchievementById } from '@/lib/achievement-badges';
import { AchievementEarnedAnimation } from './achievement-earned-animation';

interface AchievementContextType {
  showUnlockedAchievement: (achievementId: string) => void;
  checkAndUpdateProgress: (type: string, action: string, value?: number) => void;
  isAchievementUnlocked: (achievementId: string) => boolean;
  getAchievementProgress: (achievementId: string) => number;
  totalPoints: number;
}

const AchievementContext = createContext<AchievementContextType | null>(null);

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { 
    updateProgress, 
    isCompleted, 
    getProgress,
    totalPoints 
  } = useAchievementProgress();
  
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  // Display a newly unlocked achievement with animation
  const showUnlockedAchievement = (achievementId: string) => {
    const achievement = getAchievementById(achievementId);
    if (achievement) {
      setNewlyUnlockedAchievement(achievement);
      setShowAnimation(true);
    }
  };

  // Check and update progress for achievements based on user actions
  const checkAndUpdateProgress = (type: string, action: string, value: number = 1) => {
    // Find achievements that match this action type
    const matchingAchievements = getMatchingAchievements(type, action);
    
    // Update progress for each matching achievement
    matchingAchievements.forEach(achievement => {
      if (!isCompleted(achievement.id)) {
        updateProgress(achievement.id, value, achievement);
        
        // Check if this update completes the achievement
        if (getProgress(achievement.id) + value >= achievement.progressMax) {
          // Show the achievement unlocked animation
          showUnlockedAchievement(achievement.id);
        }
      }
    });
  };

  // Helper to find achievements that match a specific action
  const getMatchingAchievements = (type: string, action: string): Achievement[] => {
    const achievements = getAllAchievements();
    
    // Map achievement categories to action types
    const categoryMap: Record<string, AchievementCategory> = {
      'performance': 'performance',
      'training': 'training',
      'nutrition': 'nutrition', 
      'profile': 'profile',
      'social': 'social',
      'recruiting': 'recruiting',
      'academic': 'academic'
    };
    
    // Map specific actions to achievement IDs
    const actionMap: Record<string, string[]> = {
      // Performance actions
      'record_metrics': ['performance-improvement-bronze', 'performance-improvement-silver', 'performance-improvement-gold'],
      'improve_forty': ['performance-improvement-bronze', 'performance-improvement-silver', 'performance-improvement-gold'],
      
      // Training actions
      'complete_workout': ['training-streak-bronze', 'training-streak-silver', 'training-streak-gold'],
      'create_plan': ['training-planner-bronze'],
      
      // Nutrition actions
      'log_meal': ['nutrition-tracking-bronze', 'nutrition-tracking-silver'],
      'create_nutrition_plan': ['nutrition-plan-bronze'],
      
      // Profile actions
      'update_profile': ['profile-complete-bronze', 'profile-complete-silver'],
      'upload_photo': ['profile-complete-silver'],
      
      // Social actions
      'join_team': ['social-network-bronze'],
      'attend_event': ['social-network-silver'],
      'create_post': ['social-activity-bronze'],
      
      // Recruiting actions
      'complete_recruiting_profile': ['recruiting-profile-bronze'],
      'add_highlight': ['recruiting-profile-silver'],
      'save_college': ['recruiting-research-bronze'],
      
      // Academic actions
      'update_academic': ['academic-progress-bronze', 'academic-progress-silver']
    };
    
    // Get achievement IDs for this action
    const achievementIds = actionMap[action] || [];
    
    // Filter achievements by type and IDs
    return achievements.filter(achievement => 
      (type === 'all' || achievement.category === categoryMap[type]) && 
      achievementIds.includes(achievement.id)
    );
  };

  // Check if an achievement is unlocked
  const isAchievementUnlocked = (achievementId: string): boolean => {
    return isCompleted(achievementId);
  };

  // Get progress for an achievement
  const getAchievementProgress = (achievementId: string): number => {
    return getProgress(achievementId);
  };

  return (
    <AchievementContext.Provider
      value={{
        showUnlockedAchievement,
        checkAndUpdateProgress,
        isAchievementUnlocked,
        getAchievementProgress,
        totalPoints,
      }}
    >
      {children}
      
      {/* Achievement unlocked animation */}
      {newlyUnlockedAchievement && (
        <AchievementEarnedAnimation
          achievement={newlyUnlockedAchievement}
          visible={showAnimation}
          onClose={() => setShowAnimation(false)}
        />
      )}
    </AchievementContext.Provider>
  );
}