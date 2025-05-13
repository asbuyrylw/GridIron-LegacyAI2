import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Achievement, TierType } from '@/lib/achievement-badges';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type AchievementBadgeProps = {
  achievement: Achievement;
  progress?: number;
  isCompleted?: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
};

function getTierColor(tier: TierType): string {
  switch (tier) {
    case 'bronze':
      return 'bg-amber-700';
    case 'silver':
      return 'bg-slate-400';
    case 'gold':
      return 'bg-amber-400';
    case 'platinum':
      return 'bg-sky-300';
    default:
      return 'bg-gray-300';
  }
}

function getTierTextColor(tier: TierType): string {
  switch (tier) {
    case 'bronze':
      return 'text-amber-700';
    case 'silver':
      return 'text-slate-400';
    case 'gold':
      return 'text-amber-400';
    case 'platinum':
      return 'text-sky-300';
    default:
      return 'text-gray-300';
  }
}

export function AchievementBadge({
  achievement,
  progress = 0,
  isCompleted = false,
  showProgress = true,
  size = 'md',
  onClick,
  className,
}: AchievementBadgeProps) {
  const tierColor = getTierColor(achievement.tier);
  const tierTextColor = getTierTextColor(achievement.tier);
  const percentComplete = Math.min(100, Math.max(0, (progress / achievement.progressMax) * 100));
  
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };
  
  const iconSizes = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };
  
  const fontSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={cn(
              'flex flex-col items-center justify-center p-2 cursor-pointer transform transition-transform hover:scale-105',
              sizeClasses[size],
              isCompleted ? 'border-2' : 'border opacity-70 hover:opacity-100',
              isCompleted ? tierColor : 'border-gray-300',
              className
            )}
            onClick={onClick}
          >
            <CardContent className="p-2 flex flex-col items-center justify-center space-y-1 text-center">
              <div className={cn(
                'rounded-full p-1 flex items-center justify-center',
                isCompleted ? tierColor : 'bg-gray-100'
              )}>
                {isCompleted ? (
                // If completed, attempt to show the SVG badge image
                <div className="relative">
                  <img 
                    src={`/badges/${achievement.id}.svg`} 
                    alt={achievement.name}
                    className={cn(iconSizes[size])}
                    onError={(e) => {
                      // Fallback to the icon if image doesn't exist
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                      }
                    }}
                  />
                  <Icon 
                    name={achievement.icon} 
                    className={cn(
                      iconSizes[size],
                      'text-white absolute inset-0',
                      'hidden' // Hidden by default, shown if image fails to load
                    )}
                  />
                </div>
              ) : (
                // If not completed, just show the icon
                <Icon 
                  name={achievement.icon} 
                  className={cn(
                    iconSizes[size],
                    'text-gray-400'
                  )}
                />
              )}
              </div>
              
              <div className={cn('font-medium mt-1 truncate w-full', fontSizes[size], isCompleted ? tierTextColor : 'text-gray-500')}>
                {achievement.name}
              </div>
              
              {achievement.coachOnly && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 rounded-sm">
                  COACH ONLY
                </Badge>
              )}
              
              {showProgress && !isCompleted && (
                <Progress 
                  value={percentComplete} 
                  className="h-1 w-full mt-1" 
                />
              )}
              
              {isCompleted && (
                <Badge variant="secondary" className={cn(
                  'text-[8px] px-1 rounded-sm mt-1', 
                  fontSizes[size] === 'text-xs' ? 'hidden' : ''
                )}>
                  COMPLETED
                </Badge>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2 max-w-xs">
            <div className="font-bold flex items-center gap-2 flex-wrap">
              <Icon name={achievement.icon} className="h-4 w-4" />
              {achievement.name}
              <Badge className="ml-1 capitalize">{achievement.tier}</Badge>
              {achievement.coachOnly && (
                <Badge variant="outline" className="ml-1 text-xs">Coach Only</Badge>
              )}
            </div>
            <p className="text-sm">{achievement.description}</p>
            {achievement.unlockMessage && isCompleted && (
              <div className="bg-sky-50 dark:bg-sky-950 p-2 rounded-md border border-sky-200 dark:border-sky-800 text-xs">
                <span className="font-semibold">🎁 Reward:</span> {achievement.unlockMessage}
              </div>
            )}
            <div className="text-xs flex justify-between">
              <span>Progress: {progress} / {achievement.progressMax}</span>
              <span className="font-semibold">{achievement.pointValue} pts</span>
            </div>
            {!isCompleted && percentComplete > 0 && (
              <Progress value={percentComplete} className="h-1 w-full" />
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}