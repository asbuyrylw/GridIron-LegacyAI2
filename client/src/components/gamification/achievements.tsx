import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Trophy, Medal, Star, Target, Calendar, Dumbbell, Brain } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Map of achievement icons
const achievementIcons: Record<string, React.ReactNode> = {
  performance: <Trophy className="h-6 w-6" />,
  training: <Dumbbell className="h-6 w-6" />,
  nutrition: <Medal className="h-6 w-6" />,
  education: <Brain className="h-6 w-6" />,
  attendance: <Calendar className="h-6 w-6" />,
  goals: <Target className="h-6 w-6" />,
  default: <Award className="h-6 w-6" />
};

export function Achievements() {
  // Get the athlete's achievements
  const {
    data: achievements,
    isLoading: achievementsLoading,
    error: achievementsError
  } = useQuery({
    queryKey: ["/api/athlete/me/achievements"],
    queryFn: async () => {
      const res = await fetch("/api/athlete/me/achievements");
      
      if (res.status === 401) {
        throw new Error("Not authorized");
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch achievements");
      }
      
      return res.json();
    }
  });

  // Get all available achievements
  const {
    data: allAchievements,
    isLoading: allAchievementsLoading,
    error: allAchievementsError
  } = useQuery({
    queryKey: ["/api/achievements"],
    queryFn: async () => {
      const res = await fetch("/api/achievements");
      
      if (res.status === 401) {
        throw new Error("Not authorized");
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch achievements");
      }
      
      return res.json();
    }
  });

  // Process achievements by category
  const getAchievementsByCategory = () => {
    if (!achievements || !allAchievements) return {};
    
    // Create a map of achievement IDs to achievement progress
    const achievementMap = new Map();
    achievements.forEach((ach: any) => {
      achievementMap.set(ach.achievementId, {
        progress: ach.progress,
        completed: ach.completed,
        earnedAt: ach.earnedAt
      });
    });
    
    // Group all achievements by category with progress
    const categories: Record<string, any[]> = {};
    allAchievements.forEach((achievement: any) => {
      const category = achievement.category || "other";
      
      if (!categories[category]) {
        categories[category] = [];
      }
      
      const progress = achievementMap.get(achievement.id);
      
      categories[category].push({
        ...achievement,
        progress: progress ? progress.progress : 0,
        completed: progress ? progress.completed : false,
        earnedAt: progress ? progress.earnedAt : null
      });
    });
    
    return categories;
  };

  const achievementCategories = getAchievementsByCategory();
  const categories = Object.keys(achievementCategories).sort();
  
  if (achievementsError || allAchievementsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading achievements. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Achievements
        </CardTitle>
        <CardDescription>
          Track your progress and earn achievements as you improve
        </CardDescription>
      </CardHeader>
      <CardContent>
        {achievementsLoading || allAchievementsLoading ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          </div>
        ) : categories.length > 0 ? (
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="w-full justify-start mb-4 flex-wrap">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievementCategories[category].map((achievement: any) => {
                    const CategoryIcon = 
                      achievement.icon && achievementIcons[achievement.icon] 
                        ? achievementIcons[achievement.icon] 
                        : achievementIcons[category] || achievementIcons.default;
                    
                    return (
                      <div 
                        key={achievement.id} 
                        className={`
                          border rounded-lg p-4 flex gap-4
                          ${achievement.completed ? 'bg-primary-50 border-primary-200' : ''}
                        `}
                      >
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <ProgressRing 
                              progress={achievement.progress} 
                              size={56} 
                              strokeWidth={4}
                              color="var(--primary)"
                              showText={false}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              {CategoryIcon}
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm">{achievement.name}</h4>
                            {achievement.completed && (
                              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                <Star className="h-3 w-3 mr-1 fill-current" /> 
                                {achievement.points} pts
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{achievement.description}</p>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-primary-600">
                              {achievement.progress}% Complete
                            </span>
                            {achievement.earnedAt && (
                              <span className="text-muted-foreground">
                                Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No achievements yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Complete activities, improve your performance metrics, and participate in challenges to earn achievements.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}