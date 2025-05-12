import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Achievement } from '@/lib/achievement-badges';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AchievementProgress {
  id: number;
  userId: number;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt: string | null;
  earnedPoints: number;
}

export function useAchievementProgress() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalPoints, setTotalPoints] = useState(0);

  // Fetch achievement progress for the current user
  const { 
    data: progressData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/user/achievements'],
    queryFn: async () => {
      const response = await fetch('/api/user/achievements');
      if (!response.ok) {
        throw new Error('Failed to fetch achievement progress');
      }
      return response.json() as Promise<AchievementProgress[]>;
    },
    enabled: !!user,
  });

  // Update achievement progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      achievementId, 
      progress 
    }: { 
      achievementId: string; 
      progress: number 
    }) => {
      const response = await fetch(`/api/user/achievements/${achievementId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update achievement progress');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the achievements cache to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/user/achievements'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update achievement progress: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Calculate total points when progress data changes
  useEffect(() => {
    if (progressData) {
      const points = progressData.reduce((total, achievement) => {
        if (achievement.completed) {
          return total + achievement.earnedPoints;
        }
        return total;
      }, 0);
      
      setTotalPoints(points);
    }
  }, [progressData]);

  // Function to update progress for an achievement
  const updateProgress = async (
    achievementId: string, 
    progress: number,
    achievement?: Achievement
  ) => {
    try {
      const currentProgress = getProgress(achievementId);
      const newProgress = Math.min(achievement?.progressMax || 100, currentProgress + progress);
      
      // Only update if there's actual progress made
      if (newProgress > currentProgress) {
        await updateProgressMutation.mutateAsync({ achievementId, progress: newProgress });
        
        // Check if the achievement was just completed
        const wasCompleted = isCompleted(achievementId);
        const isNowCompleted = newProgress >= (achievement?.progressMax || 100);
        
        if (!wasCompleted && isNowCompleted && achievement) {
          // Show notification for newly completed achievement
          toast({
            title: 'Achievement Unlocked!',
            description: achievement.name,
            variant: 'default',
          });
        }
      }
    } catch (error) {
      console.error('Error updating achievement progress:', error);
    }
  };

  // Check if an achievement is completed
  const isCompleted = (achievementId: string): boolean => {
    if (!progressData) return false;
    const achievement = progressData.find(a => a.achievementId === achievementId);
    return achievement ? achievement.completed : false;
  };

  // Get progress for an achievement
  const getProgress = (achievementId: string): number => {
    if (!progressData) return 0;
    const achievement = progressData.find(a => a.achievementId === achievementId);
    return achievement ? achievement.progress : 0;
  };

  return {
    progressData,
    isLoading,
    error,
    updateProgress,
    isCompleted,
    getProgress,
    totalPoints,
  };
}