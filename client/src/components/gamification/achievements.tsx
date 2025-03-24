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
                          relative overflow-hidden rounded-xl p-5 ${achievement.completed ? 
                            'bg-gradient-to-br from-pink-500/90 to-purple-600 text-white shadow-lg shadow-pink-500/20' : 
                            'border bg-card shadow-sm hover:shadow-md transition-shadow'
                          }
                        `}
                      >
                        {/* Achievement Medal/Badge */}
                        <div className={`
                          absolute ${achievement.completed ? 'top-0 right-0' : 'top-0 right-0 opacity-10'}
                          h-32 w-32 -mt-8 -mr-8
                        `}>
                          <div className="relative h-full w-full">
                            <div className="absolute inset-0 rotate-12">
                              {achievement.completed ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="h-full w-full text-white/20">
                                  <circle cx="12" cy="8" r="7" fill="currentColor" strokeWidth="0.5" />
                                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" fill="currentColor" strokeWidth="0.5" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="h-full w-full">
                                  <circle cx="12" cy="8" r="7" />
                                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          {/* Icon with Progress Ring */}
                          <div className={`
                            relative h-16 w-16 rounded-full flex items-center justify-center
                            ${achievement.completed ? 
                              'bg-white/20 shadow-inner' : 
                              'bg-background border'
                            }
                          `}>
                            <div className="absolute inset-0">
                              <ProgressRing 
                                progress={achievement.progress} 
                                size={64} 
                                strokeWidth={4}
                                color={achievement.completed ? "white" : "hsl(var(--primary))"}
                                bgColor={achievement.completed ? "rgba(255,255,255,0.2)" : "hsl(var(--muted))"}
                                showText={false}
                              />
                            </div>
                            <div className={`
                              z-10 ${achievement.completed ? 'text-white' : 'text-primary'}
                            `}>
                              {CategoryIcon}
                            </div>
                          </div>
                          
                          {/* Achievement Content */}
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`font-bold text-base ${achievement.completed ? 'text-white' : ''}`}>
                                {achievement.name}
                              </h4>
                              {achievement.completed && (
                                <Badge className="bg-white/20 text-white border-0">
                                  <Star className="h-3 w-3 mr-1 fill-current" /> 
                                  {achievement.points} pts
                                </Badge>
                              )}
                            </div>
                            <p className={`text-sm mb-2 ${achievement.completed ? 'text-white/90' : 'text-muted-foreground'}`}>
                              {achievement.description}
                            </p>
                            <div className="flex justify-between items-center text-xs">
                              {achievement.completed ? (
                                <span className="text-white/80 bg-white/10 px-2 py-1 rounded-full">
                                  Completed!
                                </span>
                              ) : (
                                <div className="w-full">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs text-muted-foreground">Progress</span>
                                    <span className="text-xs font-medium">{achievement.progress}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                                      style={{ width: `${achievement.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              {achievement.earnedAt && (
                                <span className="text-white/80 bg-white/10 px-2 py-1 rounded-full ml-2">
                                  {new Date(achievement.earnedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Celebration Confetti effect for completed achievements */}
                        {achievement.completed && (
                          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                            <div className="absolute -top-4 -left-4 h-8 w-8 bg-yellow-400 rounded-full opacity-20"></div>
                            <div className="absolute top-12 -right-2 h-6 w-6 bg-green-400 rounded-full opacity-20"></div>
                            <div className="absolute -bottom-2 left-1/4 h-5 w-5 bg-blue-400 rounded-full opacity-20"></div>
                            <div className="absolute bottom-8 right-1/4 h-4 w-4 bg-pink-400 rounded-full opacity-20"></div>
                          </div>
                        )}
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