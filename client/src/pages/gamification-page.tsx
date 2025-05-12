import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAchievementProgress } from "@/hooks/use-achievement-progress";
import { ACHIEVEMENT_BADGES } from "@/lib/achievement-badges";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { Leaderboards } from "@/components/gamification/leaderboards";
import { AchievementEarnedAnimation } from "@/components/achievements/achievement-earned-animation";
import { Award, Trophy, Medal, Star, BookOpen, Rocket, Crown } from "lucide-react";

export default function GamificationPage() {
  // Achievements and leaderboards section
  const { achievements, totalPoints } = useAchievementProgress();
  const [showDemo, setShowDemo] = useState(false);
  const [selectedAchievementIndex, setSelectedAchievementIndex] = useState(0);
  
  // Calculate some stats
  const completedCount = achievements.filter(a => a.completed).length;
  const totalCount = ACHIEVEMENT_BADGES.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  
  // Get the completion count by type
  const getCompletionByType = (type: string) => {
    const typeAchievements = ACHIEVEMENT_BADGES.filter(a => a.type === type);
    const completedTypeAchievements = achievements.filter(a => {
      const achievement = ACHIEVEMENT_BADGES.find(badge => badge.id === a.achievementId);
      return a.completed && achievement?.type === type;
    });
    
    return {
      completed: completedTypeAchievements.length,
      total: typeAchievements.length,
      percentage: Math.round((completedTypeAchievements.length / typeAchievements.length) * 100)
    };
  };
  
  // Achievement types with their display names and icons
  const achievementTypes = [
    { type: 'performance', name: 'Performance', icon: <Trophy className="h-4 w-4" /> },
    { type: 'training', name: 'Training', icon: <Award className="h-4 w-4" /> },
    { type: 'nutrition', name: 'Nutrition', icon: <BookOpen className="h-4 w-4" /> },
    { type: 'profile', name: 'Profile', icon: <Star className="h-4 w-4" /> },
    { type: 'social', name: 'Social', icon: <Crown className="h-4 w-4" /> },
    { type: 'recruiting', name: 'Recruiting', icon: <Rocket className="h-4 w-4" /> },
    { type: 'academic', name: 'Academic', icon: <Medal className="h-4 w-4" /> },
  ];
  
  // Show achievement earned animation demo
  const showAchievementDemo = (index: number) => {
    setSelectedAchievementIndex(index);
    setShowDemo(true);
  };
  
  return (
    <div className="pb-20">
      <Header />
      
      <main className="container mx-auto px-4 pt-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Achievements & Leaderboards</h1>
          <p className="text-muted-foreground">
            Track your progress, earn badges, and see how you rank against other athletes
          </p>
        </div>
        
        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-full mr-3">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <div className="text-2xl font-bold">{totalPoints}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-amber-500/10 rounded-full mr-3">
                  <Award className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
                  <div className="text-2xl font-bold">
                    {completedCount} <span className="text-base text-muted-foreground">/ {totalCount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500/10 rounded-full mr-3">
                  <Star className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Performance Milestones</p>
                  <div className="text-2xl font-bold">
                    {getCompletionByType('performance').completed} <span className="text-base text-muted-foreground">/ {getCompletionByType('performance').total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500/10 rounded-full mr-3">
                  <Medal className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Leaderboard Rank</p>
                  <div className="text-2xl font-bold">
                    <span className="text-base text-muted-foreground">#</span> 1
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content tabs */}
        <Tabs defaultValue="achievements" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AchievementGrid 
                  title="All Achievements" 
                  description="Track your progress and unlock new achievements"
                  showTypeFilter={true}
                />
              </div>
              
              <div className="space-y-6">
                {/* Achievement Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Achievement Categories</CardTitle>
                    <CardDescription>Your progress across all categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {achievementTypes.map(({ type, name, icon }) => {
                        const { completed, total, percentage } = getCompletionByType(type);
                        return (
                          <div key={type} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="mr-2">{icon}</div>
                                <span className="text-sm font-medium">{name}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {completed} / {total}
                              </span>
                            </div>
                            <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Demo Section (for development) */}
                <Card>
                  <CardHeader>
                    <CardTitle>Achievement Demo</CardTitle>
                    <CardDescription>See how achievements look when unlocked</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Click the button below to see how achievement notifications appear when unlocked.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={() => showAchievementDemo(0)}
                          variant="outline"
                          size="sm"
                        >
                          Performance Badge
                        </Button>
                        <Button 
                          onClick={() => showAchievementDemo(20)}
                          variant="outline"
                          size="sm"
                        >
                          Training Badge
                        </Button>
                        <Button 
                          onClick={() => showAchievementDemo(33)}
                          variant="outline"
                          size="sm"
                        >
                          Academic Badge
                        </Button>
                        <Button 
                          onClick={() => showAchievementDemo(28)}
                          variant="outline"
                          size="sm"
                        >
                          Social Badge
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="leaderboards">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Leaderboards 
                  initialLeaderboardId="weekly-points"
                  showFilters={true}
                  highlightCurrentUser={true}
                  title="Performance Leaderboards"
                />
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>How Leaderboards Work</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm">
                        Leaderboards showcase the top performing athletes across various metrics:
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                          <p className="text-sm"><span className="font-medium">Points Leaderboards</span> - Achievement points earned</p>
                        </div>
                        <div className="flex items-center">
                          <Crown className="h-4 w-4 text-purple-500 mr-2" />
                          <p className="text-sm"><span className="font-medium">Performance Metrics</span> - Speed, strength, agility</p>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-blue-500 mr-2" />
                          <p className="text-sm"><span className="font-medium">Training Stats</span> - Workout consistency and progress</p>
                        </div>
                        <div className="flex items-center">
                          <Medal className="h-4 w-4 text-green-500 mr-2" />
                          <p className="text-sm"><span className="font-medium">Academic Excellence</span> - GPA and academic achievements</p>
                        </div>
                      </div>
                      
                      <p className="text-sm">
                        Leaderboards reset on different schedules:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Weekly leaderboards reset every Monday at midnight</li>
                        <li>Monthly leaderboards reset on the 1st of each month</li>
                        <li>All-time leaderboards never reset</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recent Rank Changes */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Your Recent Rankings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">Weekly Points</span>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Rank #1</span>
                          <span className="text-green-500 ml-2">▲2</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">40-Yard Dash</span>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Rank #5</span>
                          <span className="text-red-500 ml-2">▼1</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">Workouts Completed</span>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Rank #3</span>
                          <span className="text-green-500 ml-2">▲5</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pb-2">
                        <span className="text-sm">Vertical Jump</span>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Rank #9</span>
                          <span className="text-gray-400 ml-2">-</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Achievement Earned Animation Demo */}
      {showDemo && ACHIEVEMENT_BADGES[selectedAchievementIndex] && (
        <AchievementEarnedAnimation
          achievement={ACHIEVEMENT_BADGES[selectedAchievementIndex]}
          visible={showDemo}
          onClose={() => setShowDemo(false)}
        />
      )}
    </div>
  );
}