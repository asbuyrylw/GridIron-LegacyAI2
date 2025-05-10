import { useState } from "react";
import { 
  Achievement,
  AchievementType,
  getAchievementsByType,
  ACHIEVEMENT_BADGES
} from "@/lib/achievement-badges";
import { AchievementBadge } from "./achievement-badge";
import { AchievementEarnedAnimation } from "./achievement-earned-animation";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAchievementProgress } from "@/hooks/use-achievement-progress";

interface AchievementGridProps {
  title?: string;
  description?: string;
  showTypeFilter?: boolean;
}

const typeLabels: Record<AchievementType, string> = {
  performance: "Performance",
  training: "Training",
  nutrition: "Nutrition",
  profile: "Profile",
  social: "Social",
  recruiting: "Recruiting",
  academic: "Academic"
};

export function AchievementGrid({ 
  title = "Achievements", 
  description,
  showTypeFilter = true 
}: AchievementGridProps) {
  const [selectedType, setSelectedType] = useState<AchievementType | "all">("all");
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const { achievements } = useAchievementProgress();
  
  // Calculate total points
  const totalPoints = achievements
    .filter(a => a.completed)
    .reduce((sum, a) => {
      const achievement = ACHIEVEMENT_BADGES.find(badge => badge.id === a.achievementId);
      return sum + (achievement?.points || 0);
    }, 0);
  
  // Calculate completion percentage
  const completionPercentage = achievements.length > 0
    ? Math.round((achievements.filter(a => a.completed).length / ACHIEVEMENT_BADGES.length) * 100)
    : 0;
  
  // Filter achievements based on selected type
  const filteredAchievements = selectedType === "all"
    ? ACHIEVEMENT_BADGES
    : getAchievementsByType(selectedType);
  
  // Handle badge click
  const handleBadgeClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
  };
  
  // Handle close animation
  const handleCloseAnimation = () => {
    setSelectedAchievement(null);
  };
  
  // Get all achievement types
  const achievementTypes = Array.from(
    new Set(ACHIEVEMENT_BADGES.map(a => a.type))
  ) as AchievementType[];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
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
                  {typeLabels[type]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              onClick={() => handleBadgeClick(achievement)}
            />
          ))}
        </div>
      </CardContent>
      
      {/* Achievement details modal */}
      {selectedAchievement && (
        <AchievementEarnedAnimation
          achievement={selectedAchievement}
          onClose={handleCloseAnimation}
          autoCloseDelay={0}
        />
      )}
    </Card>
  );
}