import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AchievementGrid } from '@/components/achievements/achievement-grid';
import { Button } from '@/components/ui/button';
import { ChevronRight, Award, Users, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAchievementProgress } from '@/hooks/use-achievement-progress';
import { AchievementCategory, TierType } from '@/lib/achievement-badges';
import { Leaderboard } from '@/components/gamification/leaderboard';

const categories: { id: AchievementCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'performance', label: 'Performance', icon: <Trophy className="h-4 w-4" /> },
  { id: 'training', label: 'Training', icon: <Award className="h-4 w-4" /> },
  { id: 'nutrition', label: 'Nutrition', icon: <Award className="h-4 w-4" /> },
  { id: 'profile', label: 'Profile', icon: <Award className="h-4 w-4" /> },
  { id: 'social', label: 'Social', icon: <Users className="h-4 w-4" /> },
  { id: 'recruiting', label: 'Recruiting', icon: <Award className="h-4 w-4" /> },
  { id: 'academic', label: 'Academic', icon: <Award className="h-4 w-4" /> },
];

const tiers: { id: TierType; label: string }[] = [
  { id: 'bronze', label: 'Bronze' },
  { id: 'silver', label: 'Silver' },
  { id: 'gold', label: 'Gold' },
  { id: 'platinum', label: 'Platinum' },
];

export default function GamificationPage() {
  const { totalPoints } = useAchievementProgress();
  const [activeTab, setActiveTab] = useState('achievements');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | null>(null);
  const [selectedTier, setSelectedTier] = useState<TierType | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Achievements & Rewards" 
        description="Track your progress and earn rewards as you improve your skills"
        icon={<Award className="h-6 w-6" />}
      />
      
      {/* Points summary */}
      <div className="flex items-center mb-4">
        <div className="flex items-center bg-gradient-to-r from-amber-500 to-amber-300 text-white px-4 py-2 rounded-full">
          <Trophy className="h-5 w-5 mr-2" />
          <span className="font-bold">{totalPoints} Points</span>
        </div>
        <Button variant="ghost" size="sm" className="ml-auto">
          View Rewards <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="achievements" className="mt-4">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select 
                  value={selectedTimeframe}
                  onValueChange={value => setSelectedTimeframe(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="alltime">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Leaderboard timeframe={selectedTimeframe} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}