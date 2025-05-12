import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Achievement, ACHIEVEMENT_BADGES, getAchievementById } from "@/lib/achievement-badges";
import { useToast } from "@/hooks/use-toast";

interface AthleteAchievement {
  id: number;
  athleteId: number;
  achievementId: number;
  progress: number;
  completed: boolean;
  earnedAt: string | null;
}

interface ServerAchievement {
  id: number;
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  type: 'performance' | 'training' | 'nutrition' | 'profile' | 'social' | 'recruiting' | 'academic';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  requirements: string;
  createdAt: string;
}

interface AchievementProgress {
  achievementId: string;
  progress: number;
  completed: boolean;
  earnedAt: string | null;
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
  
  // Get all available achievements
  const { data: serverAchievements = [] } = useQuery<ServerAchievement[]>({
    queryKey: ['/api/achievements'],
    enabled: !!user,
  });
  
  // Get current athlete achievements progress
  const { data: athleteAchievements = [], isLoading } = useQuery<AthleteAchievement[]>({
    queryKey: [`/api/athlete/${athleteId}/achievements`],
    enabled: !!athleteId,
  });
  
  // Map server achievements to client achievement progress format
  const achievements: AchievementProgress[] = athleteAchievements.map(achievement => {
    // Find the corresponding server achievement to get the string ID
    const serverAchievement = serverAchievements.find(a => a.id === achievement.achievementId);
    
    return {
      achievementId: serverAchievement?.achievementId || `server-${achievement.achievementId}`,
      progress: achievement.progress,
      completed: achievement.completed,
      earnedAt: achievement.earnedAt
    };
  });
  
  // Calculate total points
  const totalPoints = athleteAchievements.reduce((total, achievement) => {
    if (achievement.completed) {
      const serverAchievement = serverAchievements.find(a => a.id === achievement.achievementId);
      if (serverAchievement) {
        return total + serverAchievement.points;
      }
    }
    return total;
  }, 0);
  
  // Mutation to update achievement progress
  const progressMutation = useMutation({
    mutationFn: async ({ achievementId, progress }: UpdateProgressParams) => {
      // Find server achievement by string ID
      const serverAchievement = serverAchievements.find(a => a.achievementId === achievementId);
      if (!serverAchievement) {
        throw new Error("Achievement not found");
      }
      
      const url = `/api/athlete/${athleteId}/achievements/${serverAchievement.id}`;
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
    serverAchievements,
    updateProgress,
    isCompleted,
    getProgress,
    isLoading: progressMutation.isPending || isLoading,
    totalPoints,
  };
}