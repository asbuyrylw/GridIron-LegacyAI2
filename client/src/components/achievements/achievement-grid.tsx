import React, { useState, useMemo } from 'react';
import { AchievementBadge } from '@/components/achievements/achievement-badge';
import { useAchievementProgress } from '@/hooks/use-achievement-progress';
import { getAllAchievements, AchievementCategory, TierType, Achievement, getTierValue } from '@/lib/achievement-badges';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'performance', label: 'Performance' },
  { value: 'training', label: 'Training' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'profile', label: 'Profile' },
  { value: 'social', label: 'Social' },
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'academic', label: 'Academic' },
];

const TIER_OPTIONS = [
  { value: 'all', label: 'All Tiers' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'platinum', label: 'Platinum' },
];

type AchievementGridProps = {
  className?: string;
  showFilters?: boolean;
  categoryFilter?: AchievementCategory | null;
  tierFilter?: TierType | null;
};

export function AchievementGrid({ 
  className, 
  showFilters = true,
  categoryFilter: externalCategoryFilter = null,
  tierFilter: externalTierFilter = null
}: AchievementGridProps) {
  const { progressData, isLoading, getProgress, isCompleted } = useAchievementProgress();
  const achievements = useMemo(() => getAllAchievements(), []);
  
  const [internalCategoryFilter, setInternalCategoryFilter] = useState<string>('all');
  const [internalTierFilter, setInternalTierFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // Use external filters if provided, otherwise use internal state
  const categoryFilter = externalCategoryFilter || internalCategoryFilter;
  const tierFilter = externalTierFilter || internalTierFilter;
  
  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      // Handle external category filter or internal filter
      const matchesCategory = 
        (externalCategoryFilter ? 
          achievement.category === externalCategoryFilter : 
          categoryFilter === 'all' || achievement.category === categoryFilter);
      
      // Handle external tier filter or internal filter
      const matchesTier = 
        (externalTierFilter ? 
          achievement.tier === externalTierFilter : 
          tierFilter === 'all' || achievement.tier === tierFilter);
      
      const matchesActive = activeTab === 'all' || 
                           (activeTab === 'completed' && isCompleted(achievement.id)) || 
                           (activeTab === 'in-progress' && !isCompleted(achievement.id) && getProgress(achievement.id) > 0);
      
      return matchesCategory && matchesTier && matchesActive;
    });
  }, [achievements, categoryFilter, tierFilter, externalCategoryFilter, externalTierFilter, activeTab, isCompleted, getProgress]);
  
  // Calculate total progress metrics
  const progressMetrics = useMemo(() => {
    if (!progressData) return { totalEarned: 0, totalAvailable: 0, totalCompleted: 0, totalInProgress: 0 };
    
    const totalEarned = progressData.reduce((total, item) => item.completed ? total + item.earnedPoints : total, 0);
    const totalAvailable = achievements.reduce((total, a) => total + a.pointValue, 0);
    const totalCompleted = progressData.filter(a => a.completed).length;
    const totalInProgress = progressData.filter(a => !a.completed && a.progress > 0).length;
    
    return { totalEarned, totalAvailable, totalCompleted, totalInProgress };
  }, [progressData, achievements]);
  
  const handleCategoryChange = (value: string) => {
    if (externalCategoryFilter === null) {
      setInternalCategoryFilter(value);
    }
  };
  
  const handleTierChange = (value: string) => {
    if (externalTierFilter === null) {
      setInternalTierFilter(value);
    }
  };
  
  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
  };
  
  const resetFilters = () => {
    if (externalCategoryFilter === null) {
      setInternalCategoryFilter('all');
    }
    if (externalTierFilter === null) {
      setInternalTierFilter('all');
    }
    setActiveTab('all');
  };

  if (isLoading) {
    return <AchievementGridSkeleton />;
  }

  return (
    <div className={className}>
      {/* Summary Card */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between">
            <span>Your Achievements</span>
            <Badge variant="outline" className="ml-auto">
              {progressMetrics.totalEarned} / {progressMetrics.totalAvailable} points
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-2xl font-bold">{progressMetrics.totalCompleted}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{progressMetrics.totalInProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{achievements.length - progressMetrics.totalCompleted - progressMetrics.totalInProgress}</div>
              <div className="text-sm text-muted-foreground">Locked</div>
            </div>
          </div>
          
          <Progress 
            value={(progressMetrics.totalEarned / progressMetrics.totalAvailable) * 100} 
            className="h-2" 
          />
        </CardContent>
      </Card>
      
      {/* Filters */}
      {showFilters && (
        <div className="mb-4 flex flex-col space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={tierFilter} onValueChange={handleTierChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                {TIER_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={resetFilters} className="sm:w-auto">
              Reset
            </Button>
          </div>
        </div>
      )}
      
      {/* Achievement Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAchievements.map(achievement => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              progress={getProgress(achievement.id)}
              isCompleted={isCompleted(achievement.id)}
              onClick={() => handleAchievementClick(achievement)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No achievements found matching your filters.</p>
          <Button variant="outline" onClick={resetFilters} className="mt-2">
            Reset Filters
          </Button>
        </div>
      )}
      
      {/* Achievement Detail Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={(open) => !open && setSelectedAchievement(null)}>
        {selectedAchievement && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name={selectedAchievement.icon} className="h-5 w-5" />
                {selectedAchievement.name}
                <Badge className="ml-1 capitalize">{selectedAchievement.tier}</Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedAchievement.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <AchievementBadge
                  achievement={selectedAchievement}
                  progress={getProgress(selectedAchievement.id)}
                  isCompleted={isCompleted(selectedAchievement.id)}
                  size="lg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Category:</span> 
                  <Badge variant="outline" className="ml-2 capitalize">
                    {selectedAchievement.category}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Points:</span> 
                  <Badge variant="secondary" className="ml-2">
                    {selectedAchievement.pointValue}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Progress:</span> 
                  <span className="ml-2">
                    {getProgress(selectedAchievement.id)} / {selectedAchievement.progressMax}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge 
                    variant={isCompleted(selectedAchievement.id) ? "default" : "outline"} 
                    className={`ml-2 ${isCompleted(selectedAchievement.id) ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
                  >
                    {isCompleted(selectedAchievement.id) ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>
              
              {!isCompleted(selectedAchievement.id) && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.round((getProgress(selectedAchievement.id) / selectedAchievement.progressMax) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(getProgress(selectedAchievement.id) / selectedAchievement.progressMax) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function AchievementGridSkeleton() {
  return (
    <div>
      {/* Summary Card Skeleton */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
      
      {/* Filters Skeleton */}
      <div className="mb-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      
      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array(10).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}