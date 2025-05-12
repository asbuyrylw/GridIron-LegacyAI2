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
      }
    });
  };

  // Helper to find achievements that match a specific action
  const getMatchingAchievements = (type: string, action: string): Achievement[] => {
    // This is a simplified example - in a real app, you'd have a more 
    // sophisticated mapping between actions and achievements
    return [];
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