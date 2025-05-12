import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useAchievementProgress } from "@/hooks/use-achievement-progress";
import { ACHIEVEMENT_BADGES, Achievement } from "@/lib/achievement-badges";
import { AchievementBadge } from './achievement-badge';
import { AchievementEarnedAnimation } from './achievement-earned-animation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronDown, Trophy, Award, Medal } from "lucide-react";

type AchievementType = 'performance' | 'training' | 'nutrition' | 'profile' | 'social' | 'recruiting' | 'academic';

interface AchievementGridProps {
  title: string;
  description?: string;
  showTypeFilter?: boolean;
  filterType?: 'all' | 'completed' | 'in-progress';
}

export function AchievementGrid({
  title,
  description,
  showTypeFilter = true,
  filterType: initialFilterType = 'all',
}: AchievementGridProps) {
  const { user } = useAuth();
  const { achievements, isLoading } = useAchievementProgress();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<AchievementType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in-progress'>(initialFilterType);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // When an achievement badge is clicked
  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };
  
  // Get the user's achievement progress
  const getAchievementProgress = (achievementId: string) => {
    const achievementProgress = achievements.find(a => a.achievementId === achievementId);
    return {
      progress: achievementProgress?.progress || 0,
      isCompleted: achievementProgress?.completed || false,
      earnedDate: achievementProgress?.completedAt
    };
  };
  
  // Filter achievements based on search, type, and completion status
  const filteredAchievements = ACHIEVEMENT_BADGES.filter(achievement => {
    // Filter by type
    if (selectedType !== 'all' && achievement.type !== selectedType) {
      return false;
    }
    
    // Filter by status
    const { isCompleted } = getAchievementProgress(achievement.id);
    if (filterStatus === 'completed' && !isCompleted) {
      return false;
    } else if (filterStatus === 'in-progress' && isCompleted) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !achievement.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Hide coach-only achievements for non-coaches
    if (achievement.coachOnly && user?.userType !== 'coach') {
      return false;
    }
    
    return true;
  });
  
  // Count achievements by type
  const countByType = {
    all: filteredAchievements.length,
    performance: filteredAchievements.filter(a => a.type === 'performance').length,
    training: filteredAchievements.filter(a => a.type === 'training').length,
    nutrition: filteredAchievements.filter(a => a.type === 'nutrition').length,
    profile: filteredAchievements.filter(a => a.type === 'profile').length,
    social: filteredAchievements.filter(a => a.type === 'social').length,
    recruiting: filteredAchievements.filter(a => a.type === 'recruiting').length,
    academic: filteredAchievements.filter(a => a.type === 'academic').length,
  };
  
  // Count by status
  const completedCount = ACHIEVEMENT_BADGES.filter(achievement => {
    // Filter by type if needed
    if (selectedType !== 'all' && achievement.type !== selectedType) {
      return false;
    }
    
    const { isCompleted } = getAchievementProgress(achievement.id);
    return isCompleted;
  }).length;
  
  // Total points earned
  const totalPoints = ACHIEVEMENT_BADGES.reduce((total, achievement) => {
    const { isCompleted } = getAchievementProgress(achievement.id);
    if (isCompleted) {
      return total + achievement.pointsReward;
    }
    return total;
  }, 0);
  
  // Display achievement types with color-coded badges
  const achievementTypes = [
    { id: 'all', name: 'All', color: 'default' },
    { id: 'performance', name: 'Performance', color: 'blue' },
    { id: 'training', name: 'Training', color: 'green' },
    { id: 'nutrition', name: 'Nutrition', color: 'orange' },
    { id: 'profile', name: 'Profile', color: 'purple' },
    { id: 'social', name: 'Social', color: 'pink' },
    { id: 'recruiting', name: 'Recruiting', color: 'yellow' },
    { id: 'academic', name: 'Academic', color: 'indigo' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Trophy className="h-3.5 w-3.5 mr-1 text-amber-500" />
              <span>{totalPoints} Points</span>
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Medal className="h-3.5 w-3.5 mr-1 text-blue-500" />
              <span>{completedCount} / {ACHIEVEMENT_BADGES.length}</span>
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search achievements..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                <span>{filterStatus === 'all' ? 'All' : filterStatus === 'completed' ? 'Completed' : 'In Progress'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('in-progress')}>
                In Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      {showTypeFilter && (
        <div className="px-6">
          <Tabs defaultValue={selectedType} onValueChange={(value) => setSelectedType(value as AchievementType | 'all')}>
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <TabsList className="mb-4 inline-flex h-9">
                {achievementTypes.map((type) => (
                  <TabsTrigger 
                    key={type.id} 
                    value={type.id}
                    className="flex items-center gap-1"
                  >
                    <span>{type.name}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {countByType[type.id as keyof typeof countByType] || 0}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </Tabs>
        </div>
      )}
      
      <CardContent>
        {filteredAchievements.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-2">
            {filteredAchievements.map((achievement) => {
              const { progress, isCompleted, earnedDate } = getAchievementProgress(achievement.id);
              
              return (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  progress={progress}
                  isCompleted={isCompleted}
                  earnedDate={earnedDate}
                  onClick={() => handleAchievementClick(achievement)}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <Award className="h-12 w-12 text-muted-foreground opacity-20" />
            <div>
              <p className="text-muted-foreground">No achievements found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          </div>
        )}
      </CardContent>
      
      {showAchievementModal && selectedAchievement && (
        <AchievementEarnedAnimation
          achievement={selectedAchievement}
          visible={showAchievementModal}
          onClose={() => setShowAchievementModal(false)}
        />
      )}
    </Card>
  );
}