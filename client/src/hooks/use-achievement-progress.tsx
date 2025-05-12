import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Achievement } from "@/lib/achievement-badges";
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from '@/hooks/use-toast';

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
}

interface AchievementContextType {
  progressData: AchievementProgress[];
  updateProgress: (achievementId: string, progress: number, achievement?: Achievement) => void;
  isCompleted: (achievementId: string) => boolean;
  getProgress: (achievementId: string) => number;
  isLoading: boolean;
  totalPoints: number;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  
  // Fetch user's achievement progress from the server
  const { data: progressData = [], isLoading, refetch } = useQuery<AchievementProgress[]>({
    queryKey: ['/api/achievements'],
    enabled: !!user,
  });
  
  // Import the achievement badges
  const { ACHIEVEMENT_BADGES } = require('@/lib/achievement-badges');

  // Calculate total points
  const totalPoints = progressData.reduce((total, achievement) => {
    if (achievement.completed) {
      // Find the achievement in the badges list to get the point value
      const achData = ACHIEVEMENT_BADGES.find(a => a.id === achievement.achievementId);
      if (achData) {
        return total + achData.pointValue;
      }
    }
    return total;
  }, 0);
  
  // Update achievement progress
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { achievementId: string; progress: number }) => {
      const response = await apiRequest('POST', '/api/achievements/progress', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      
      // Check if this update unlocked the achievement
      if (data.completed && !data.previouslyCompleted) {
        setNewlyUnlocked(prev => [...prev, data.achievementId]);
        
        // Show a toast notification
        toast({
          title: "Achievement Unlocked!",
          description: `You've unlocked a new achievement.`,
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update progress",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Check if an achievement is completed
  const isCompleted = (achievementId: string): boolean => {
    return progressData.some(a => a.achievementId === achievementId && a.completed);
  };
  
  // Get progress for an achievement
  const getProgress = (achievementId: string): number => {
    const achievement = progressData.find(a => a.achievementId === achievementId);
    return achievement ? achievement.progress : 0;
  };
  
  // Update progress and check for completion
  const updateProgress = (achievementId: string, progress: number, achievement?: Achievement) => {
    if (!user) return;
    
    updateProgressMutation.mutate({
      achievementId,
      progress
    });
  };
  
  // Value object for the context
  const contextValue: AchievementContextType = {
    progressData,
    updateProgress,
    isCompleted,
    getProgress,
    isLoading,
    totalPoints
  };
  
  return (
    <AchievementContext.Provider value={contextValue}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievementProgress() {
  const context = useContext(AchievementContext);
  
  if (context === undefined) {
    throw new Error('useAchievementProgress must be used within an AchievementProvider');
  }
  
  return context;
}