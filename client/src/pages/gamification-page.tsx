import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AchievementGrid } from '@/components/achievements/achievement-grid';
import { Button } from '@/components/ui/button';
import { ChevronRight, Award, Users, Trophy, Zap, User, BookOpen, Apple, Dumbbell, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAchievementProgress } from '@/hooks/use-achievement-progress';
import { AchievementCategory, TierType } from '@/lib/achievement-badges';
import LeaderboardSection from '@/components/gamification/leaderboard-section';
import { LoginStreakCard } from '@/components/gamification/login-streak-card';
import { useAchievements } from '@/components/achievements/achievement-provider';

const categories: { id: AchievementCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'performance', label: 'Performance', icon: <Trophy className="h-4 w-4" /> },
  { id: 'training', label: 'Training', icon: <Dumbbell className="h-4 w-4" /> },
  { id: 'nutrition', label: 'Nutrition', icon: <Apple className="h-4 w-4" /> },
  { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  { id: 'social', label: 'Social', icon: <Users className="h-4 w-4" /> },
  { id: 'recruiting', label: 'Recruiting', icon: <Award className="h-4 w-4" /> },
  { id: 'academic', label: 'Academic', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'engagement', label: 'Engagement', icon: <Flame className="h-4 w-4" /> },
  { id: 'coach', label: 'Coach', icon: <Award className="h-4 w-4" /> },
];

const tiers: { id: TierType; label: string }[] = [
  { id: 'bronze', label: 'Bronze' },
  { id: 'silver', label: 'Silver' },
  { id: 'gold', label: 'Gold' },
  { id: 'platinum', label: 'Platinum' },
];

// Achievement test component
function AchievementTester() {
  const { checkAndUpdateProgress } = useAchievements();
  
  const achievementActions = [
    { type: 'performance', action: 'improve_forty', label: 'Performance: Improve 40-yard', icon: <Zap className="h-4 w-4" /> },
    { type: 'training', action: 'complete_workout', label: 'Training: Complete Workout', icon: <Dumbbell className="h-4 w-4" /> },
    { type: 'nutrition', action: 'log_meal', label: 'Nutrition: Log Meal', icon: <Apple className="h-4 w-4" /> },
    { type: 'profile', action: 'update_profile', label: 'Profile: Update', icon: <User className="h-4 w-4" /> },
    { type: 'academic', action: 'update_academic', label: 'Academic: Update', icon: <BookOpen className="h-4 w-4" /> },
    { type: 'social', action: 'join_team', label: 'Social: Join Team', icon: <Users className="h-4 w-4" /> },
    { type: 'engagement', action: 'login_streak', label: 'Engagement: Login Streak', icon: <Flame className="h-4 w-4" /> },
    { type: 'coach', action: 'coach_achievement', label: 'Coach Achievement', icon: <Award className="h-4 w-4" /> },
    { type: 'recruiting', action: 'update_recruiting', label: 'Recruiting: Update', icon: <Award className="h-4 w-4" /> },
  ];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Achievement Testing</CardTitle>
        <CardDescription>Click the buttons to trigger achievement progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievementActions.map((action) => (
            <Button
              key={`${action.type}-${action.action}`}
              onClick={() => checkAndUpdateProgress(action.type, action.action)}
              variant="outline"
              className="flex items-center"
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>These buttons simulate user actions that would trigger achievement progress.</p>
      </CardFooter>
    </Card>
  );
}

export default function GamificationPage() {
  const { totalPoints } = useAchievementProgress();
  const [activeTab, setActiveTab] = useState('achievements');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | null>(null);
  const [selectedTier, setSelectedTier] = useState<TierType | null>(null);
  // No longer need the timeframe state as LeaderboardSection handles this internally

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Achievements & Rewards" 
        description="Track your progress and earn rewards as you improve your skills"
        icon={<Award className="h-6 w-6" />}
      />
      
      {/* Points and Streak summary */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center">
            <div className="flex items-center bg-gradient-to-r from-amber-500 to-amber-300 text-white px-4 py-2 rounded-full">
              <Trophy className="h-5 w-5 mr-2" />
              <span className="font-bold">{totalPoints} Points</span>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto">
              View Rewards <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="md:w-1/3">
          <LoginStreakCard />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="achievements" className="mt-4">
          {/* Achievement Tester (for development/testing) */}
          <AchievementTester />
          
          {/* Category filters */}
          <div className="flex items-center space-x-2 mb-4 overflow-auto py-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="whitespace-nowrap"
            >
              All Categories
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            <ScrollArea className="whitespace-nowrap">
              <div className="flex space-x-2">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center"
                  >
                    {category.icon}
                    <span className="ml-1">{category.label}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Tier filters */}
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-sm font-medium text-muted-foreground">Tier:</span>
            <Button
              variant={selectedTier === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTier(null)}
            >
              All
            </Button>
            
            {tiers.map(tier => (
              <Button
                key={tier.id}
                variant={selectedTier === tier.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTier(tier.id)}
              >
                {tier.label}
              </Button>
            ))}
          </div>
          
          {/* Achievement Grid */}
          <AchievementGrid 
            categoryFilter={selectedCategory} 
            tierFilter={selectedTier} 
          />
        </TabsContent>
        
        <TabsContent value="leaderboard" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Leaderboards */}
            <div className="md:col-span-2">
              <LeaderboardSection 
                title="Performance Leaderboards" 
                description="See how your performance metrics compare to other players"
                showTabs={true}
              />
            </div>
            
            {/* Points Leaderboard */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Points Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <LeaderboardSection 
                    title="Overall Points" 
                    description="Athletes with the most achievement points"
                    showTabs={false}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Training Leaderboard */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Training Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <LeaderboardSection 
                    title="Training Leaders" 
                    description="Most consistent training athletes"
                    showTabs={false}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}