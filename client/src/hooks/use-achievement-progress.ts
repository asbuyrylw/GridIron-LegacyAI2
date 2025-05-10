import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Achievement } from "@/lib/achievement-badges";
import { useToast } from "@/hooks/use-toast";

interface AchievementProgress {
  id: number;
  athleteId: number;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt: string | null;
}

interface UpdateProgressParams {
  achievementId: string;
  progress: number;
  achievement?: Achievement;
}

/**
 * This hook provides methods for updating and tracking an athlete's achievement progress
 */
export function useAchievementProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  
  // Get current achievements progress
  const { data: achievements = [] } = useQuery<AchievementProgress[]>({
    queryKey: [`/api/athlete/${athleteId}/achievements`],
    enabled: !!athleteId,
  });
  
  // Mutation to update achievement progress
  const progressMutation = useMutation({
    mutationFn: async ({ achievementId, progress }: UpdateProgressParams) => {
      const url = `/api/athlete/achievements/${achievementId}`;
      const res = await apiRequest("PATCH", url, { progress });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/athlete/${athleteId}/achievements`] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating achievement",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Helper method to update progress for a specific achievement
  const updateProgress = (
    achievementId: string, 
    progress: number,
    achievement?: Achievement
  ) => {
    if (!athleteId) return;
    
    // Find existing progress for this achievement
    const existingProgress = achievements.find(
      (a) => a.achievementId === achievementId
    );
    
    // Don't update if it's already completed or if new progress is less than current
    if (
      existingProgress?.completed || 
      (existingProgress && existingProgress.progress >= progress)
    ) {
      return;
    }
    
    // Update progress on the backend
    progressMutation.mutate({ achievementId, progress, achievement });
  };
  
  // Check if an achievement is completed
  const isCompleted = (achievementId: string) => {
    return achievements.some(
      (a) => a.achievementId === achievementId && a.completed
    );
  };
  
  // Get progress percentage for an achievement
  const getProgress = (achievementId: string) => {
    const achievement = achievements.find(
      (a) => a.achievementId === achievementId
    );
    return achievement?.progress || 0;
  };
  
  return {
    achievements,
    updateProgress,
    isCompleted,
    getProgress,
    isLoading: progressMutation.isPending,
  };
}