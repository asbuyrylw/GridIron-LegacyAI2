import { useState } from "react";
import { 
  Achievement, 
  getLevelColorClass 
} from "@/lib/achievement-badges";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  achievement: Achievement;
  isEarned?: boolean;
  earnedDate?: string;
  progress?: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  showDetails?: boolean;
}

export function AchievementBadge({
  achievement,
  isEarned = false,
  earnedDate,
  progress = 0,
  size = 'md',
  onClick,
  className,
  showDetails = true
}: AchievementBadgeProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (showDetails) {
      setIsDialogOpen(true);
    }
  };
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-24 h-24 text-xl'
  };
  
  const levelClass = getLevelColorClass(achievement.level);
  
  const formattedDate = earnedDate 
    ? new Date(earnedDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) 
    : undefined;
  
  const badgeContent = (
    <div 
      className={cn(
        "relative flex flex-col items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-105",
        sizeClasses[size],
        levelClass,
        isEarned ? "opacity-100" : "opacity-60",
        className
      )}
      onClick={handleClick}
    >
      <span className="text-2xl">{achievement.icon}</span>
      
      {/* Status indicator */}
      {isEarned && (
        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
          <CheckCircle2 className="h-4 w-4 text-white" />
        </div>
      )}
      
      {!isEarned && progress > 0 && progress < 100 && (
        <div className="absolute bottom-0 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {!isEarned && progress === 0 && (
        <div className="absolute -top-1 -right-1 bg-gray-500 rounded-full p-0.5">
          <Lock className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
  
  const tooltipContent = (
    <div className="max-w-xs">
      <p className="font-semibold">{achievement.name}</p>
      <p className="text-sm">{achievement.description}</p>
      {isEarned && formattedDate && (
        <p className="text-xs mt-1 text-green-500">Earned {formattedDate}</p>
      )}
      {!isEarned && progress > 0 && (
        <p className="text-xs mt-1">Progress: {progress}%</p>
      )}
    </div>
  );
  
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              {badgeContent}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showDetails && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <span className="mr-2 text-2xl">{achievement.icon}</span>
                {achievement.name}
              </DialogTitle>
              <DialogDescription>
                {achievement.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "flex items-center justify-center rounded-full w-16 h-16",
                  levelClass
                )}>
                  <span className="text-2xl">{achievement.icon}</span>
                </div>
                
                <div>
                  <p className="text-sm font-medium capitalize">
                    {achievement.level} Level • {achievement.type} Achievement
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isEarned ? (
                      <span className="text-green-500 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Earned {formattedDate}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Lock className="h-4 w-4 mr-1" />
                        Not earned yet
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
                <ul className="text-sm space-y-1">
                  {achievement.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start">
                      {isEarned ? (
                        <CheckCircle2 className="h-4 w-4 mr-1 text-green-500 mt-0.5" />
                      ) : (
                        <div className="h-4 w-4 mr-1 border border-gray-400 rounded-full mt-0.5" />
                      )}
                      {req.description}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-amber-600">
                  <Award className="h-5 w-5 mr-1" />
                  <span className="font-semibold">{achievement.points} Points</span>
                </div>
                
                {!isEarned && progress > 0 && (
                  <div className="text-sm text-right">
                    <span className="font-medium">{progress}%</span> Complete
                  </div>
                )}
              </div>
            </div>
            
            <DialogClose asChild>
              <Button className="mt-2">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}