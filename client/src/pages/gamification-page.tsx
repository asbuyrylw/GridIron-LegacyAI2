import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAchievementProgress } from "@/hooks/use-achievement-progress";
import { Helmet } from "react-helmet";
import { ACHIEVEMENT_BADGES } from "@/lib/achievement-badges";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { Leaderboard } from "@/components/gamification/leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Award, Medal, Trophy, Target, Star, Crown, Users } from "lucide-react";

export default function GamificationPage() {
  const { user } = useAuth();
  const { totalPoints, isLoading } = useAchievementProgress();
  const totalPossiblePoints = ACHIEVEMENT_BADGES.reduce((sum, achievement) => sum + achievement.pointsReward, 0);
  const progressPercentage = (totalPoints / totalPossiblePoints) * 100;
  
  const yourLevel = getLevelFromPoints(totalPoints);
  const nextLevel = yourLevel + 1;
  const pointsForNextLevel = getPointsForLevel(nextLevel);
  const pointsForCurrentLevel = getPointsForLevel(yourLevel);
  const progressToNextLevel = Math.min(100, ((totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100);
  
  // Get level and title based on points
  function getLevelFromPoints(points: number): number {
    if (points < 50) return 1;
    if (points < 150) return 2;
    if (points < 300) return 3;
    if (points < 500) return 4;
    if (points < 750) return 5;
    if (points < 1000) return 6;
    if (points < 1500) return 7;
    if (points < 2000) return 8;
    if (points < 3000) return 9;
    return 10;
  }
  
  // Get points required for a level
  function getPointsForLevel(level: number): number {
    switch (level) {
      case 1: return 0;
      case 2: return 50;
      case 3: return 150;
      case 4: return 300;
      case 5: return 500;
      case 6: return 750;
      case 7: return 1000;
      case 8: return 1500;
      case 9: return 2000;
      case 10: return 3000;
      default: return 0;
    }
  }
  
  // Get title based on level
  function getTitleForLevel(level: number): string {
    switch (level) {
      case 1: return "Rookie";
      case 2: return "Prospect";
      case 3: return "Rising Star";
      case 4: return "Contender";
      case 5: return "Veteran";
      case 6: return "All-Star";
      case 7: return "MVP";
      case 8: return "Champion";
      case 9: return "Legend";
      case 10: return "Hall of Famer";
      default: return "Rookie";
    }
  }
  
  return (
    <>
      <Helmet>
        <title>Achievements & Leaderboards | GridIron LegacyAI</title>
      </Helmet>
      
      <div className="container py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Achievements & Leaderboards</h1>
          <p className="text-muted-foreground">
            Track your progress, earn achievements, and compete with other athletes
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Your Progress
              </CardTitle>
              <CardDescription>
                Track your achievements and level progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Progress */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="relative h-20 w-20">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20 flex items-center justify-center">
                          <Crown className="h-8 w-8 text-primary" />
                        </div>
                        <svg className="h-20 w-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-primary/20"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 36}`}
                            strokeDashoffset={`${(2 * Math.PI * 36) * (1 - progressPercentage / 100)}`}
                            className="text-primary"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{totalPoints} / {totalPossiblePoints}</div>
                    <div className="text-sm text-muted-foreground">Total Achievement Points</div>
                  </div>
                </div>
                
                {/* Current Level */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-2 bg-primary/10 text-primary h-20 w-20 rounded-full">
                      <div>
                        <div className="text-3xl font-bold">{yourLevel}</div>
                        <div className="text-xs">Level</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{getTitleForLevel(yourLevel)}</div>
                    <div className="text-sm text-muted-foreground">Current Rank</div>
                  </div>
                </div>
                
                {/* Level Progress */}
                <div className="space-y-4">
                  <div className="flex flex-col justify-center h-full">
                    <h4 className="text-sm font-medium mb-1">Progress to Level {nextLevel}</h4>
                    <Progress value={progressToNextLevel} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Level {yourLevel}</span>
                      <span>{totalPoints - pointsForCurrentLevel} / {pointsForNextLevel - pointsForCurrentLevel} points</span>
                      <span>Level {nextLevel}</span>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-1">Achievements Completed</h4>
                      <div className="flex gap-3 items-center justify-between">
                        <div className="flex gap-2">
                          <Award className="text-amber-500 h-5 w-5" />
                          <Medal className="text-slate-400 h-5 w-5" />
                          <Medal className="text-amber-700 h-5 w-5" />
                        </div>
                        <div className="text-sm font-medium">
                          {/* This should be calculated based on user's completed achievements */}
                          12 / {ACHIEVEMENT_BADGES.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Leaderboard */}
          <Leaderboard />
        </div>
        
        <Tabs defaultValue="achievements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="achievements" className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>Leaderboards</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="achievements" className="space-y-4 pt-2">
            <AchievementGrid
              title="All Achievements"
              description="Complete achievements to earn points and unlock rewards"
            />
          </TabsContent>
          
          <TabsContent value="leaderboards" className="space-y-4 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Leaderboard 
                timeframe="weekly" 
                scope="team" 
                showFilters={false}
              />
              <Leaderboard 
                timeframe="monthly" 
                scope="school" 
                showFilters={false}
              />
              <Leaderboard
                timeframe="allTime"
                scope="global"
                showFilters={false}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Achievement Categories
                  </CardTitle>
                  <CardDescription>
                    Top performers by achievement category
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['performance', 'training', 'nutrition', 'recruiting'].map((category) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">{category}</h4>
                        <div className="text-xs text-muted-foreground">Top 3</div>
                      </div>
                      
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-muted/40 rounded-md">
                            <div className="font-medium w-6 text-center">{i}</div>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                {i === 1 ? 'JD' : i === 2 ? 'TS' : 'RW'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                              {i === 1 ? 'John Doe' : i === 2 ? 'Tom Smith' : 'Ryan Wilson'}
                            </div>
                            <div className="text-primary font-medium">
                              {i === 1 ? '125' : i === 2 ? '110' : '95'} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

import { useMedia } from "react-use";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";