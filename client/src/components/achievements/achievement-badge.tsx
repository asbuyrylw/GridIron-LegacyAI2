import { useState } from "react";
import { 
  Achievement, 
  getLevelColorClass 
} from "@/lib/achievement-badges";
import { useAchievementProgress } from "@/hooks/use-achievement-progress";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  progress?: number;
  isCompleted?: boolean;
  earnedDate?: string;
  onClick?: () => void;
}

export function AchievementBadge({ 
  achievement, 
  progress = 0, 
  isCompleted = false, 
  earnedDate, 
  onClick 
}: AchievementBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get the appropriate color class based on level
  const colorClass = getLevelColorClass(achievement.level);
  
  // Determine opacity based on completion status
  const opacityClass = isCompleted ? 'opacity-100' : 'opacity-60';
  
  // Format date if available
  const formattedDate = earnedDate 
    ? new Date(earnedDate).toLocaleDateString() 
    : null;
  
  return (
    <div 
      className={`rounded-lg cursor-pointer transform transition-all duration-200 
        ${isHovered ? 'scale-105' : 'scale-100'} hover:shadow-md`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        {/* Badge Icon */}
        <div 
          className={`h-16 w-16 flex items-center justify-center rounded-full mb-2 ${colorClass} ${opacityClass}`}
        >
          <span className="text-2xl">{achievement.icon}</span>
        </div>
        
        {/* Badge Name */}
        <div className="text-center">
          <div className="font-medium text-sm truncate max-w-full">
            {achievement.name}
          </div>
          
          {/* Level indicator */}
          <div className="text-xs text-muted-foreground">
            {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
          </div>
          
          {/* Progress indicator */}
          {!isCompleted && (
            <div className="w-full mt-1">
              <Progress 
                value={progress} 
                className="h-1.5" 
              />
            </div>
          )}
          
          {/* Completed indicator */}
          {isCompleted && (
            <div className="text-xs text-green-600 font-medium mt-1">
              Completed {formattedDate ? `• ${formattedDate}` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}