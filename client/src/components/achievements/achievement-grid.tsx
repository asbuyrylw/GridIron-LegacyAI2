import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger
} from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, BarChart3, Medal, Trophy } from "lucide-react";
import { AchievementBadge } from "./achievement-badge";
import { AchievementType, ACHIEVEMENT_BADGES, getAchievementById } from "@/lib/achievement-badges";
import { useAchievementProgress } from "@/hooks/use-achievement-progress";
import { useAchievementContext } from "./achievement-provider";
import { AchievementEarnedAnimation } from "./achievement-earned-animation";

const typeLabels: Record<AchievementType, string> = {
  performance: "Performance",
  training: "Training",
  nutrition: "Nutrition",
  profile: "Profile",
  social: "Social",
  recruiting: "Recruiting",
  academic: "Academic"
};

const typeIcons: Record<string, React.ElementType> = {
  performance: BarChart3,
  training: Award,
  nutrition: Award,
  profile: Award,
  social: Award,
  recruiting: Award,
  academic: Award
};

interface AchievementGridProps {
  title: string;
  description?: string;
  showTypeFilter?: boolean;
  filterType?: 'all' | 'completed' | 'in-progress';
}

export function AchievementGrid({
  title,
  description,
  showTypeFilter = false,
  filterType = 'all'
}: AchievementGridProps) {
  const { achievements } = useAchievementProgress();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [showEarnedAnimation, setShowEarnedAnimation] = useState(false);
  
  // Extract unique achievement types for filtering
  const achievementTypes = Array.from(new Set(ACHIEVEMENT_BADGES.map(a => a.type)));
  
  // Create a map of athlete achievements by achievement ID for easier lookup
  const achievementMap = achievements.reduce((acc: Record<string, any>, achievement) => {
    acc[achievement.achievementId] = achievement;
    return acc;
  }, {});
  
  // Filter achievements based on type and completion status
  let filteredAchievements = ACHIEVEMENT_BADGES;
  
  // Filter by selected type
  if (selectedType !== "all") {
    filteredAchievements = filteredAchievements.filter(a => a.type === selectedType);
  }
  
  // Filter by completion status
  if (filterType === "completed") {
    filteredAchievements = filteredAchievements.filter(a => {
      const athleteAchievement = achievementMap[a.id];
      return athleteAchievement && athleteAchievement.completed;
    });
  } else if (filterType === "in-progress") {
    filteredAchievements = filteredAchievements.filter(a => {
      const athleteAchievement = achievementMap[a.id];
      return athleteAchievement && !athleteAchievement.completed && athleteAchievement.progress > 0;
    });
  }
  
  // Handler for clicking on an achievement badge
  const handleBadgeClick = (achievement: any) => {
    setSelectedAchievement(achievement.id);
  };
  
  // Get the selected achievement details
  const achievement = selectedAchievement ? ACHIEVEMENT_BADGES.find(a => a.id === selectedAchievement) : null;
  const achievementProgress = selectedAchievement ? achievementMap[selectedAchievement] : null;
  
  // Calculate total points and completion percentage
  const completedAchievements = achievements.filter(a => a.completed);
  const totalPoints = completedAchievements.reduce((sum, a) => {
    const achievement = ACHIEVEMENT_BADGES.find(badge => badge.id === a.achievementId);
    return sum + (achievement?.points || 0);
  }, 0);
  const completionPercentage = Math.round((completedAchievements.length / ACHIEVEMENT_BADGES.length) * 100);
  
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{title}</CardTitle>
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">{totalPoints} pts</div>
              <div className="text-sm text-gray-500">
                {completionPercentage}% Complete
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {showTypeFilter && (
            <Tabs defaultValue="all" className="mb-6">
              <TabsList className="mb-2 flex flex-wrap h-auto">
                <TabsTrigger value="all" onClick={() => setSelectedType("all")}>
                  All
                </TabsTrigger>
                {achievementTypes.map(type => (
                  <TabsTrigger 
                    key={type} 
                    value={type}
                    onClick={() => setSelectedType(type)}
                  >
                    {typeLabels[type as AchievementType]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAchievements.map((achievement) => {
              const progress = achievementMap[achievement.id]?.progress || 0;
              const isCompleted = achievementMap[achievement.id]?.completed || false;
              const earnedDate = achievementMap[achievement.id]?.completedAt;
              
              return (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  progress={progress}
                  isCompleted={isCompleted}
                  earnedDate={earnedDate}
                  onClick={() => handleBadgeClick(achievement)}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Achievement details dialog */}
      <Dialog 
        open={!!selectedAchievement} 
        onOpenChange={(open) => !open && setSelectedAchievement(null)}
      >
        {achievement && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-xl">{achievement.icon}</span>
                {achievement.name}
              </DialogTitle>
              <DialogDescription>
                {achievement.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-primary/10 mr-2">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm font-medium">
                  {achievement.points} points
                </div>
                <div className="ml-auto px-2 py-1 rounded text-xs font-semibold" style={{
                  backgroundColor: achievement.level === 'bronze' ? '#cd7f32' : 
                                  achievement.level === 'silver' ? '#c0c0c0' :
                                  achievement.level === 'gold' ? '#ffd700' : '#e5e4e2',
                  color: achievement.level === 'gold' ? '#000' : '#fff'
                }}>
                  {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
                </div>
              </div>
              
              <div className="text-sm">
                <div className="font-medium mb-2">Requirements:</div>
                <ul className="space-y-2">
                  {achievement.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center bg-muted mr-2 flex-shrink-0">
                        <span className="text-xs">{index + 1}</span>
                      </div>
                      <span>{req.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {achievementProgress && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm">{achievementProgress.progress}%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div 
                      className={`${achievementProgress.completed ? 'bg-green-600' : 'bg-primary'} h-2 rounded-full`} 
                      style={{ width: `${achievementProgress.progress}%` }} 
                    />
                  </div>
                  
                  {achievementProgress.completed && achievementProgress.completedAt && (
                    <div className="mt-2 text-sm text-green-600">
                      Completed on {new Date(achievementProgress.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedAchievement(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Achievement earned animation - demo purposes - normally triggered by actual achievement completion */}
      {achievement && (
        <AchievementEarnedAnimation 
          achievement={achievement}
          visible={showEarnedAnimation}
          onClose={() => setShowEarnedAnimation(false)}
        />
      )}
    </>
  );
}