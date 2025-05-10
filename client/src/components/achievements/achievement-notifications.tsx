import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { AchievementEarnedAnimation } from "./achievement-earned-animation";
import { Achievement, getAchievementById } from "@/lib/achievement-badges";

/**
 * This component listens for newly earned achievements and displays a celebration animation
 * It should be placed in the main layout to be available throughout the app
 */
export function AchievementNotifications() {
  const { user } = useAuth();
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [earnedAchievements, setEarnedAchievements] = useState<number[]>([]);
  const [processedAchievements, setProcessedAchievements] = useState<number[]>([]);
  
  // Only query if user is logged in and has an athlete profile
  const athleteId = user?.athlete?.id;
  
  // Query for getting athlete's achievement progress
  const { data: athleteAchievements = [] } = useQuery<any[]>({
    queryKey: [`/api/athlete/${athleteId}/achievements`],
    enabled: !!athleteId,
    refetchInterval: 30000, // Refetch every 30 seconds to check for new achievements
  });
  
  // On athleteAchievements change, check for newly earned achievements
  useEffect(() => {
    if (!athleteAchievements?.length) return;
    
    // Find newly completed achievements that haven't been processed yet
    const newlyEarned = athleteAchievements
      .filter((a: any) => a.completed && !processedAchievements.includes(a.achievementId))
      .map((a: any) => a.achievementId);
    
    if (newlyEarned.length > 0) {
      // Add to earned achievements queue
      setEarnedAchievements(prev => [...prev, ...newlyEarned]);
    }
  }, [athleteAchievements, processedAchievements]);
  
  // Process the earned achievements queue
  useEffect(() => {
    if (earnedAchievements.length === 0 || showAnimation) return;
    
    // Get the next achievement to display
    const nextAchievementId = earnedAchievements[0];
    
    // Find the frontend achievement data
    const achievementId = nextAchievementId.toString();
    const frontendAchievement = getAchievementById(achievementId);
    
    if (frontendAchievement) {
      // Show the animation
      setCurrentAchievement(frontendAchievement);
      setShowAnimation(true);
      
      // Remove this achievement from the queue
      setEarnedAchievements(prev => prev.slice(1));
      
      // Mark as processed
      setProcessedAchievements(prev => [...prev, nextAchievementId]);
    } else {
      // If achievement not found, just remove it from the queue
      setEarnedAchievements(prev => prev.slice(1));
      setProcessedAchievements(prev => [...prev, nextAchievementId]);
    }
  }, [earnedAchievements, showAnimation]);
  
  const handleCloseAnimation = () => {
    setShowAnimation(false);
    setCurrentAchievement(null);
  };
  
  // If no animation to show, render nothing
  if (!showAnimation || !currentAchievement) {
    return null;
  }
  
  return (
    <AchievementEarnedAnimation
      achievement={currentAchievement}
      onClose={handleCloseAnimation}
    />
  );
}