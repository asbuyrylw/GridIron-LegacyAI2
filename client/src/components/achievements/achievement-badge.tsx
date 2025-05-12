import { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Achievement } from "@/lib/achievement-badges";
import { useAchievementProgress } from "@/hooks/use-achievement-progress";
import { useAuth } from "@/hooks/use-auth";
import { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AchievementBadgeProps {
  achievement: Achievement;
  progress: number;
  isCompleted: boolean;
  earnedDate?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showTooltip?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AchievementBadge({
  achievement,
  progress,
  isCompleted,
  earnedDate,
  size = 'md',
  showProgress = true,
  showTooltip = true,
  onClick,
  className = '',
}: AchievementBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useAuth();
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, (progress / achievement.progressMax) * 100);
  const isUnlocked = isCompleted;
  
  // Get icon from Lucide icons
  const IconComponent = LucideIcons[achievement.icon as keyof typeof LucideIcons] as LucideIcon;
  
  // Determine badge size
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };
  
  // Get color based on tier
  const tierColors = {
    bronze: { bg: 'bg-amber-700/10', border: 'border-amber-700', text: 'text-amber-700', progress: '#b45309' },
    silver: { bg: 'bg-slate-400/10', border: 'border-slate-400', text: 'text-slate-400', progress: '#94a3b8' },
    gold: { bg: 'bg-amber-400/10', border: 'border-amber-400', text: 'text-amber-400', progress: '#fbbf24' },
    platinum: { bg: 'bg-cyan-400/10', border: 'border-cyan-400', text: 'text-cyan-400', progress: '#22d3ee' }
  };
  
  const tierColor = tierColors[achievement.tier];
  
  // Check if badge is accessible to the user
  const isCoachOnly = achievement.coachOnly && user?.userType !== 'coach';
  const isLocked = !isUnlocked;
  const isDisabled = isCoachOnly;
  
  // Handle click
  const handleClick = () => {
    if (isDisabled) return;
    
    if (onClick) {
      onClick();
    } else {
      setShowDetails(true);
    }
  };
  
  return (
    <>
      <div 
        className={`relative group cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <div 
          className={`
            ${sizeClasses[size]} 
            rounded-full flex items-center justify-center 
            ${isLocked ? 'bg-gray-200 dark:bg-gray-800' : tierColor.bg}
            ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
            border-2 ${isLocked ? 'border-gray-300 dark:border-gray-700' : tierColor.border}
            transition-all duration-300 ease-in-out
            ${isUnlocked ? 'hover:scale-110' : 'hover:scale-105'}
          `}
        >
          {showProgress && !isUnlocked && !isDisabled ? (
            <CircularProgressbar
              value={progressPercentage}
              styles={buildStyles({
                pathColor: isLocked ? '#94a3b8' : tierColor.progress,
                trailColor: 'rgba(229, 231, 235, 0.2)',
                pathTransition: 'stroke-dashoffset 0.5s ease 0s',
              })}
              className="absolute inset-0"
            />
          ) : null}
          
          {IconComponent && (
            <IconComponent 
              className={`
                ${isLocked ? 'text-gray-400 dark:text-gray-600' : tierColor.text}
                ${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : 'w-10 h-10'}
              `} 
            />
          )}
          
          {isCoachOnly && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center">
              <LucideIcons.Star className="w-3 h-3" />
            </div>
          )}
        </div>
        
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 w-40 p-2 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 text-center">
            <p className="font-medium text-sm truncate">{achievement.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isUnlocked ? 'Unlocked!' : `Progress: ${Math.round(progressPercentage)}%`}
            </p>
          </div>
        )}
      </div>
      
      {/* Achievement Details Dialog */}
      {showDetails && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div 
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${isLocked ? 'bg-gray-200 dark:bg-gray-800' : tierColor.bg}
                    border-2 ${isLocked ? 'border-gray-300 dark:border-gray-700' : tierColor.border}
                  `}
                >
                  {IconComponent && (
                    <IconComponent 
                      className={`
                        ${isLocked ? 'text-gray-400 dark:text-gray-600' : tierColor.text}
                        w-6 h-6
                      `} 
                    />
                  )}
                </div>
                <div>
                  <DialogTitle>{achievement.name}</DialogTitle>
                  <div className="flex mt-1 gap-2">
                    <Badge variant={isUnlocked ? "default" : "outline"}>
                      {isUnlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {achievement.tier}
                    </Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-4 pt-2">
              <DialogDescription className="text-sm">
                {achievement.description}
              </DialogDescription>
              
              {!isUnlocked && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Progress</p>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {progress} / {achievement.progressMax}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Reward</p>
                <p className="text-sm">
                  <span className="text-amber-500 font-semibold">{achievement.pointsReward} points</span>
                </p>
                {achievement.videoUnlock && (
                  <p className="text-sm flex items-center gap-1 text-muted-foreground">
                    <LucideIcons.Video className="h-4 w-4" />
                    <span>Unlocks special video message</span>
                  </p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setShowDetails(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}