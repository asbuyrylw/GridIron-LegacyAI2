import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
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
  Trophy,
  Dumbbell,
  Activity,
  Utensils,
  Award,
  Users,
} from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";

// Achievement category icons
const categoryIcons = {
  performance: Activity,
  training: Dumbbell,
  nutrition: Utensils,
  social: Users,
  general: Award,
};

// Achievement color by category
const categoryColors = {
  performance: "#3b82f6", // blue
  training: "#10b981", // green
  nutrition: "#f59e0b", // amber
  social: "#8b5cf6", // purple
  general: "#6366f1", // indigo
};

export function AchievementsShowcase() {
  const { user } = useAuth();
  
  // Get athlete id from user (access using optional chaining with appropriate type checks)
  const athleteId = user && 'athlete' in user ? (user as any).athlete?.id : undefined;
  
  // Query for getting all achievements
  const {
    data: allAchievements,
    isLoading: achievementsLoading,
  } = useQuery({
    queryKey: ["/api/achievements"],
    queryFn: async () => {
      const res = await fetch("/api/achievements");
      if (!res.ok) return [];
      return res.json();
    },
  });
  
  // Query for getting athlete's achievement progress
  const {
    data: athleteAchievements,
    isLoading: athleteAchievementsLoading,
  } = useQuery({
    queryKey: ["/api/athlete", athleteId, "achievements"],
    queryFn: async () => {
      if (!athleteId) return [];
      const res = await fetch(`/api/athlete/${athleteId}/achievements`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!athleteId,
  });
  
  // Group achievements by category
  const achievementsByCategory = !achievementsLoading && allAchievements
    ? allAchievements.reduce((acc: Record<string, any[]>, achievement: any) => {
        if (!acc[achievement.category]) {
          acc[achievement.category] = [];
        }
        acc[achievement.category].push(achievement);
        return acc;
      }, {})
    : {};
  
  // Create a map of athlete achievements by achievement ID for easier lookup
  const athleteAchievementMap = !athleteAchievementsLoading && athleteAchievements
    ? athleteAchievements.reduce((acc: Record<number, any>, achievement: any) => {
        acc[achievement.achievementId] = achievement;
        return acc;
      }, {})
    : {};
  
  // Calculate overall completion percentages
  const totalAchievements = allAchievements?.length || 0;
  const completedAchievements = athleteAchievements?.filter((a: any) => a.completed)?.length || 0;
  const overallProgress = totalAchievements ? Math.round((completedAchievements / totalAchievements) * 100) : 0;
  
  // If loading or no achievements
  if (achievementsLoading || athleteAchievementsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Loading your achievements...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" /> Achievements
        </CardTitle>
        <CardDescription>Track your progress and earn achievements</CardDescription>
      </CardHeader>
      
      <div className="px-6 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Overall Progress</p>
            <p className="text-sm text-muted-foreground">
              {completedAchievements} of {totalAchievements} achievements earned
            </p>
          </div>
          <ProgressRing 
            progress={overallProgress} 
            size={64} 
            strokeWidth={8}
            showText 
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="pb-1">
        <div className="px-6">
          <TabsList className="w-full grid grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.keys(achievementsByCategory).map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <CardContent className="pt-4">
          <TabsContent value="all" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allAchievements?.map((achievement: any) => {
                const athleteAchievement = athleteAchievementMap[achievement.id];
                const progress = athleteAchievement?.progress || 0;
                const isCompleted = athleteAchievement?.completed || false;
                const CategoryIcon = categoryIcons[achievement.category as keyof typeof categoryIcons] || Trophy;
                const color = categoryColors[achievement.category as keyof typeof categoryColors] || "#6366f1";
                
                return (
                  <div 
                    key={achievement.id} 
                    className={`border rounded-lg p-4 relative ${
                      isCompleted ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex">
                        <div 
                          className="p-2 rounded-full mr-3" 
                          style={{ background: `${color}15`, color }}
                        >
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <span className="capitalize mr-2">{achievement.category}</span>
                            <span>•</span>
                            <span className="ml-2">{achievement.points} points</span>
                          </div>
                        </div>
                      </div>
                      <ProgressRing 
                        progress={progress} 
                        size={48} 
                        strokeWidth={5}
                        showText={false}
                        color={color}
                      />
                    </div>
                    
                    {isCompleted && (
                      <div className="absolute top-0 right-0 p-1">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          {Object.keys(achievementsByCategory).map(category => (
            <TabsContent key={category} value={category} className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievementsByCategory[category]?.map((achievement: any) => {
                  const athleteAchievement = athleteAchievementMap[achievement.id];
                  const progress = athleteAchievement?.progress || 0;
                  const isCompleted = athleteAchievement?.completed || false;
                  const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Trophy;
                  const color = categoryColors[category as keyof typeof categoryColors] || "#6366f1";
                  
                  return (
                    <div 
                      key={achievement.id} 
                      className={`border rounded-lg p-4 relative ${
                        isCompleted ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex">
                          <div 
                            className="p-2 rounded-full mr-3" 
                            style={{ background: `${color}15`, color }}
                          >
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{achievement.name}</h3>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            <div className="flex items-center mt-1 text-xs text-muted-foreground">
                              <span className="capitalize mr-2">{category}</span>
                              <span>•</span>
                              <span className="ml-2">{achievement.points} points</span>
                            </div>
                          </div>
                        </div>
                        <ProgressRing 
                          progress={progress} 
                          size={48} 
                          strokeWidth={5}
                          showText={false}
                          color={color}
                        />
                      </div>
                      
                      {isCompleted && (
                        <div className="absolute top-0 right-0 p-1">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </CardContent>
      </Tabs>
    </Card>
  );
}