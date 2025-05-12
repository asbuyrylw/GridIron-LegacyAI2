import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet';
import { Leaderboard } from '@/components/gamification/leaderboard';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useAchievements } from '@/components/achievements/achievement-provider';
import { Award, TrendingUp, Trophy, Users } from 'lucide-react';
import { AchievementGrid } from '@/components/achievements/achievement-grid';
import { AchievementCategory, TierType } from '@/lib/achievement-badges';

const categories: { id: AchievementCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'performance', label: 'Performance', icon: <TrendingUp className="h-4 w-4" /> },
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
  const { user } = useAuth();
  const { totalPoints } = useAchievements();
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const [activeTier, setActiveTier] = useState<TierType | 'all'>('all');

  const getFilteredAchievements = () => {
    const categoryFilter = activeCategory === 'all' ? null : activeCategory;
    const tierFilter = activeTier === 'all' ? null : activeTier;
    return { categoryFilter, tierFilter };
  };

  return (
    <>
      <Helmet>
        <title>Achievements & Leaderboard | GridIron LegacyAI</title>
      </Helmet>

      <PageHeader
        title="Achievements & Leaderboard"
        description="Track your progress, unlock achievements, and compete with other athletes"
        icon={<Trophy className="h-6 w-6" />}
      />

      <Tabs defaultValue="achievements" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="achievements">
            <Award className="mr-2 h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted rounded-lg">
            <div>
              <h3 className="text-lg font-medium">Your Achievement Progress</h3>
              <div className="flex items-center gap-2 mt-1">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{totalPoints}</span>
                <span className="text-muted-foreground">points earned</span>
              </div>
            </div>

            {/* Level indicator would go here, once implemented */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current Level:</span>
                <Badge variant="outline" className="font-bold">
                  Level {Math.floor(totalPoints / 100) + 1}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Next level: {(Math.floor(totalPoints / 100) + 1) * 100 - totalPoints} more points
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Filter Achievements</h3>
            <div className="grid grid-cols-2 md:flex gap-2 mb-4">
              <Badge
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setActiveCategory('all')}
              >
                All Categories
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={activeCategory === category.id ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.label}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 md:flex gap-2 mb-6">
              <Badge
                variant={activeTier === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setActiveTier('all')}
              >
                All Tiers
              </Badge>
              {tiers.map((tier) => (
                <Badge
                  key={tier.id}
                  variant={activeTier === tier.id ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setActiveTier(tier.id)}
                >
                  {tier.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <AchievementGrid
            categoryFilter={getFilteredAchievements().categoryFilter}
            tierFilter={getFilteredAchievements().tierFilter}
          />
        </TabsContent>

        <TabsContent value="leaderboard">
          <div className="grid md:grid-cols-2 gap-6">
            <Leaderboard 
              timeframe="weekly" 
              scope="global" 
              title="Weekly Leaderboard"
              description="Top performers this week"
              showFilters={false}
            />
            
            <Leaderboard 
              timeframe="monthly" 
              scope="global" 
              title="Monthly Leaderboard"
              description="Top performers this month"
              showFilters={false}
            />
            
            <Leaderboard 
              timeframe="allTime" 
              scope="team" 
              title="Team Leaderboard"
              description="Top performers in your teams"
              showFilters={false}
            />
            
            <Leaderboard 
              timeframe="allTime" 
              scope="school" 
              title="School Leaderboard"
              description="Top performers in your school"
              showFilters={false}
            />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}