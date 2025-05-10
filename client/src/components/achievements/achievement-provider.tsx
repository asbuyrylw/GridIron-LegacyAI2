import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AchievementNotifications } from "./achievement-notifications";
import { useAchievementTracker } from "@/hooks/use-achievement-tracker";

interface AchievementProviderProps {
  children: ReactNode;
}

/**
 * This component sets up achievement tracking and notifications
 * for the entire application.
 */
export function AchievementProvider({ children }: AchievementProviderProps) {
  const { user } = useAuth();
  
  // Only activate when user is logged in and has an athlete profile
  const isAthlete = !!user?.athlete?.id;
  
  // Temporarily disabled achievement tracker to prevent API errors
  // useAchievementTracker();
  
  return (
    <>
      {children}
      {isAthlete && <AchievementNotifications />}
    </>
  );
}