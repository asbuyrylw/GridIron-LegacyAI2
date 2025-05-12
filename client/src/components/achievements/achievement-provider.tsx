import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAchievementProgress } from "@/hooks/use-achievement-progress";
import { Achievement, ACHIEVEMENT_BADGES } from "@/lib/achievement-badges";

// Define the achievement progress type here
interface AchievementProgress {
  id: number;
  athleteId: number;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

interface NewAchievementEvent {
  achievementId: string;
  title: string;
  description: string;
  points: number;
  type: string;
}

interface AchievementContextType {
  recentlyUnlocked: NewAchievementEvent[];
  clearRecentlyUnlocked: () => void;
  showAchievementUnlock: (achievement: NewAchievementEvent) => void;
}

export const AchievementContext = createContext<AchievementContextType | null>(null);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<NewAchievementEvent[]>([]);

  // Query for stored achievements
  const { data: achievementProgress = [] } = useQuery<AchievementProgress[]>({
    queryKey: [`/api/athlete/${user?.athlete?.id}/achievements`],
    enabled: !!user?.athlete?.id,
  });

  // Function to show achievement unlock notification
  const showAchievementUnlock = (achievement: NewAchievementEvent) => {
    setRecentlyUnlocked(prev => [...prev, achievement]);
    
    // Show toast notification
    toast({
      title: "🏆 Achievement Unlocked!",
      description: (
        <div className="space-y-1">
          <p className="font-medium">{achievement.title}</p>
          <p className="text-sm">{achievement.description}</p>
          <p className="text-sm font-semibold text-amber-600">+{achievement.points} points</p>
        </div>
      ),
      duration: 5000,
    });
  };

  // Clear recently unlocked achievements
  const clearRecentlyUnlocked = () => {
    setRecentlyUnlocked([]);
  };

  // Achievement context value
  const contextValue: AchievementContextType = {
    recentlyUnlocked,
    clearRecentlyUnlocked,
    showAchievementUnlock,
  };

  return (
    <AchievementContext.Provider value={contextValue}>
      {children}
    </AchievementContext.Provider>
  );
}

// Custom hook to use achievement context
export function useAchievementContext() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievementContext must be used within an AchievementProvider');
  }
  return context;
}