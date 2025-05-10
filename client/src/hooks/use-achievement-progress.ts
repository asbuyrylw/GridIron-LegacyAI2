import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Achievement } from "@/lib/achievement-badges";

type AchievementProgressOptions = {
  showToasts?: boolean;
};

export function useAchievementProgress(options: AchievementProgressOptions = {}) {
  const { showToasts = true } = options;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [recentlyEarnedAchievements, setRecentlyEarnedAchievements] = useState<Achievement[]>([]);
  
  // If no athlete ID, we can't update achievements
  if (!user?.athlete?.id) {
    return {
      updateProgress: () => Promise.resolve(),
      recentlyEarnedAchievements,
      clearRecentlyEarnedAchievements: () => setRecentlyEarnedAchievements([]),
    };
  }
  
  // Mutation to update an achievement's progress
  const updateAchievementMutation = useMutation({
    mutationFn: async ({ 
      achievementId, 
      progress, 
      completed 
    }: { 
      achievementId: number; 
      progress: number;
      completed?: boolean;
    }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/athlete/${user.athlete.id}/achievements/${achievementId}`,
        { progress, completed }
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the athlete achievements query to refetch
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${user.athlete.id}/achievements`],
      });
    },
    onError: (error: Error) => {
      if (showToasts) {
        toast({
          title: "Failed to update achievement",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Mutation to create a new achievement for an athlete
  const createAchievementMutation = useMutation({
    mutationFn: async ({
      achievementId,
      progress = 0,
      completed = false,
    }: {
      achievementId: number;
      progress?: number;
      completed?: boolean;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/athlete/${user.athlete.id}/achievements`,
        { achievementId, progress, completed }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${user.athlete.id}/achievements`],
      });
    },
    onError: (error: Error) => {
      if (showToasts) {
        toast({
          title: "Failed to create achievement",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });
  
  // Function to update achievement progress
  // This will create the achievement if it doesn't exist
  const updateProgress = async (
    achievementIds: string | string[],
    progressUpdate: number | ((current: number) => number),
    frontendAchievement?: Achievement
  ) => {
    const ids = Array.isArray(achievementIds) ? achievementIds : [achievementIds];
    
    // Get current achievements
    const currentAchievementsResponse = await apiRequest(
      "GET",
      `/api/athlete/${user.athlete.id}/achievements`
    );
    const currentAchievements = await currentAchievementsResponse.json();
    
    // Process each achievement
    for (const idString of ids) {
      const id = parseInt(idString);
      
      // Find if the achievement already exists
      const existingAchievement = currentAchievements.find(
        (a: any) => a.achievementId === id
      );
      
      if (existingAchievement) {
        // If it's already completed, skip it
        if (existingAchievement.completed) continue;
        
        // Calculate new progress
        const currentProgress = existingAchievement.progress || 0;
        const newProgress = typeof progressUpdate === 'function' 
          ? progressUpdate(currentProgress)
          : Math.min(100, currentProgress + progressUpdate);
        
        // If progress is 100, mark it as completed
        const completed = newProgress >= 100;
        
        // Update the achievement
        await updateAchievementMutation.mutateAsync({
          achievementId: id,
          progress: newProgress,
          completed
        });
        
        // If newly completed and we have the frontend achievement details, 
        // add it to the recently earned list
        if (completed && !existingAchievement.completed && frontendAchievement) {
          setRecentlyEarnedAchievements(prev => [...prev, frontendAchievement]);
          
          if (showToasts) {
            toast({
              title: "Achievement Unlocked!",
              description: `You've earned the "${frontendAchievement.name}" achievement!`,
              variant: "default",
            });
          }
        }
      } else {
        // If it doesn't exist, create it with initial progress
        const initialProgress = typeof progressUpdate === 'number' 
          ? Math.min(100, progressUpdate) 
          : 0;
        
        // If progress is 100, mark it as completed
        const completed = initialProgress >= 100;
        
        await createAchievementMutation.mutateAsync({
          achievementId: id,
          progress: initialProgress,
          completed
        });
        
        // If completed and we have the frontend achievement details,
        // add it to the recently earned list
        if (completed && frontendAchievement) {
          setRecentlyEarnedAchievements(prev => [...prev, frontendAchievement]);
          
          if (showToasts) {
            toast({
              title: "Achievement Unlocked!",
              description: `You've earned the "${frontendAchievement.name}" achievement!`,
              variant: "default",
            });
          }
        }
      }
    }
  };
  
  return {
    updateProgress,
    recentlyEarnedAchievements,
    clearRecentlyEarnedAchievements: () => setRecentlyEarnedAchievements([]),
  };
}