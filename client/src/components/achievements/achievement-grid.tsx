import { useState, useMemo } from "react";
import { 
  Achievement, 
  AchievementType, 
  getAchievementsByType, 
  ACHIEVEMENT_BADGES
} from "@/lib/achievement-badges";
import { AchievementBadge } from "./achievement-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface AchievementWithProgress extends Achievement {
  isEarned: boolean;
  earnedDate?: string;
  progress: number;
}

interface AchievementGridProps {
  achievements: AchievementWithProgress[];
  className?: string;
  showFilters?: boolean;
  onAchievementClick?: (achievement: Achievement) => void;
}

export function AchievementGrid({
  achievements,
  className,
  showFilters = true,
  onAchievementClick
}: AchievementGridProps) {
  const [activeTab, setActiveTab] = useState<AchievementType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;
    
    // Filter by type
    if (activeTab !== 'all') {
      filtered = filtered.filter(achievement => achievement.type === activeTab);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        achievement => 
          achievement.name.toLowerCase().includes(query) ||
          achievement.description.toLowerCase().includes(query)
      );
    }
    
    // Sort with earned achievements first, then by name
    return filtered.sort((a, b) => {
      if (a.isEarned && !b.isEarned) return -1;
      if (!a.isEarned && b.isEarned) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [achievements, activeTab, searchQuery]);

  // Calculate achievement stats
  const earnedCount = achievements.filter(a => a.isEarned).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((earnedCount / totalCount) * 100);
  
  // Get unique achievement types
  const achievementTypes = useMemo(() => {
    const types = ['all'] as (AchievementType | 'all')[];
    ACHIEVEMENT_BADGES.forEach(achievement => {
      if (!types.includes(achievement.type)) {
        types.push(achievement.type);
      }
    });
    return types;
  }, []);
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Achievement stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Achievements</h3>
          <p className="text-sm text-muted-foreground">
            Earned {earnedCount} of {totalCount} achievements ({completionPercentage}% complete)
          </p>
        </div>
        
        {showFilters && (
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        )}
      </div>
      
      {/* Filters */}
      {showFilters && (
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={value => setActiveTab(value as AchievementType | 'all')}
        >
          <TabsList className="mb-4">
            {achievementTypes.map(type => (
              <TabsTrigger 
                key={type} 
                value={type}
                className="capitalize"
              >
                {type === 'all' ? 'All Types' : type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      
      {/* Achievement grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredAchievements.map((achievement) => (
          <div key={achievement.id} className="flex justify-center">
            <AchievementBadge
              achievement={achievement}
              isEarned={achievement.isEarned}
              earnedDate={achievement.earnedDate}
              progress={achievement.progress}
              onClick={() => onAchievementClick?.(achievement)}
            />
          </div>
        ))}
        
        {filteredAchievements.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No achievements found</p>
          </div>
        )}
      </div>
    </div>
  );
}