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
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export function AchievementBadge({ 
  achievement, 
  showProgress = true,
  size = "md",
  onClick 
}: AchievementBadgeProps) {
  const { isCompleted, getProgress } = useAchievementProgress();
  const [showInfo, setShowInfo] = useState(false);
  
  const completed = isCompleted(achievement.id);
  const progress = getProgress(achievement.id);
  
  const sizeClasses = {
    sm: "w-16 h-16 text-2xl",
    md: "w-24 h-24 text-3xl",
    lg: "w-32 h-32 text-5xl"
  };
  
  const backgroundClass = completed 
    ? getLevelColorClass(achievement.level)
    : "bg-gray-200 dark:bg-gray-800 text-gray-400";
    
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-2">
        <div 
          className={`rounded-full flex items-center justify-center cursor-pointer ${sizeClasses[size]} ${backgroundClass} transition-all duration-300 ${onClick ? 'hover:scale-105' : ''}`}
          onClick={onClick}
        >
          <div className={`text-center ${completed ? '' : 'opacity-50'}`}>
            {achievement.icon}
          </div>
        </div>
        
        {/* Info Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="absolute -top-1 -right-1 bg-gray-100 dark:bg-gray-700 rounded-full p-1 border border-gray-300 dark:border-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(!showInfo);
                }}
              >
                <InfoIcon className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <h4 className="font-bold text-sm">{achievement.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.description}</p>
                <div className="mt-2">
                  <h5 className="text-xs font-semibold">Requirements:</h5>
                  <ul className="text-xs list-disc pl-4">
                    {achievement.requirements.map((req, i) => (
                      <li key={i}>{req.description}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 text-xs font-semibold text-amber-600">
                  +{achievement.points} Points
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Achievement Name */}
      <h3 className="text-sm font-medium text-center">
        {achievement.name}
      </h3>
      
      {/* Progress bar */}
      {showProgress && (
        <div className="w-full mt-1 px-1">
          <Progress 
            value={progress} 
            className="h-2"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
}