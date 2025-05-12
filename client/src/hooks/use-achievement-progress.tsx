import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { Achievement, ACHIEVEMENT_BADGES } from "@/lib/achievement-badges";

export interface AchievementProgress {
  id: number;
  athleteId: number;
  achievementId: string;
  progress: number; // 0-100
  completed: boolean;
  completedAt?: string; // ISO date string
  createdAt: string; // ISO date string
}

export function useAchievementProgress() {
  const { user } = useAuth();
  const athleteId = user?.athlete?.id;
  
  const { data: achievements = [], isLoading, isError } = useQuery<AchievementProgress[]>({
    queryKey: [`/api/athlete/${athleteId}/achievements`],
    enabled: !!athleteId,
  });

  // Check if all achievements are completed
  const isCompleted = achievements.every(a => a.completed);
  
  // Helper function to get achievements by completion status
  const getAchievementsByStatus = (completed: boolean) => {
    return achievements.filter(a => a.completed === completed);
  };
  
  // Helper function to get achievements by type
  const getAchievementsByType = (type: string) => {
    const typeAchievementIds = ACHIEVEMENT_BADGES
      .filter(badge => badge.type === type)
      .map(badge => badge.id);
      
    return achievements.filter(a => typeAchievementIds.includes(a.achievementId));
  };
  
  // Get in-progress achievements (not completed but has some progress)
  const inProgressAchievements = achievements.filter(a => !a.completed && a.progress > 0);
  
  // Calculate total points earned
  const totalPoints = achievements
    .filter(a => a.completed)
    .reduce((sum, a) => {
      const achievement = ACHIEVEMENT_BADGES.find(badge => badge.id === a.achievementId);
      return sum + (achievement?.points || 0);
    }, 0);
  
  return {
    achievements,
    isLoading,
    isError,
    isCompleted,
    getAchievementsByStatus,
    getAchievementsByType,
    inProgressAchievements,
    totalPoints,
  };
}