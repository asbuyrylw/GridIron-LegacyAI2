import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Award, Trophy, Loader2, Info } from "lucide-react";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { AchievementEarnedAnimation } from "@/components/achievements/achievement-earned-animation";
import { Achievement, ACHIEVEMENT_BADGES, getAchievementById } from "@/lib/achievement-badges";

export default function AchievementsPage() {
  const { user, isLoading } = useAuth();
  const [showAchievementAnimation, setShowAchievementAnimation] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // Fetch all achievements
  const { data: allAchievements = [] } = useQuery({
    queryKey: [`/api/achievements`],
    enabled: !!user?.athlete?.id,
  });
  
  // Fetch athlete achievements
  const { data: athleteAchievements = [] } = useQuery({
    queryKey: [`/api/athlete/${user?.athlete?.id}/achievements`],
    enabled: !!user?.athlete?.id,
  });
  
  // Map backend achievements to frontend format
  const achievements = ACHIEVEMENT_BADGES.map(frontendAchievement => {
    // Find if the athlete has this achievement
    const athleteAchievement = athleteAchievements.find(
      aa => aa.achievementId === parseInt(frontendAchievement.id)
    );
    
    return {
      ...frontendAchievement,
      isEarned: !!athleteAchievement?.completed,
      earnedDate: athleteAchievement?.earnedAt,
      progress: athleteAchievement?.progress || 0
    };
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Redirect to onboarding if not completed
  if (user?.athlete && !user.athlete.onboardingCompleted) {
    return <Redirect to="/onboarding" />;
  }
  
  // Calculate achievement stats
  const earnedCount = achievements.filter(a => a.isEarned).length;
  const totalPoints = achievements
    .filter(a => a.isEarned)
    .reduce((sum, a) => sum + a.points, 0);
  
  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementAnimation(true);
  };
  
  const handleCloseAnimation = () => {
    setShowAchievementAnimation(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 relative">
      <Header />
      
      {showAchievementAnimation && selectedAchievement && (
        <AchievementEarnedAnimation 
          achievement={selectedAchievement}
          onClose={handleCloseAnimation}
        />
      )}
      
      <main className="container mx-auto px-4 pt-6 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-montserrat font-bold mb-2">
            Achievements & Badges
          </h1>
          <p className="text-muted-foreground">
            Track your progress and earn badges for your accomplishments
          </p>
        </div>
        
        {/* Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 p-3 rounded-full bg-primary/10">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Achievements Earned
                  </p>
                  <h2 className="text-3xl font-bold">
                    {earnedCount} 
                    <span className="text-xl text-muted-foreground ml-1">/ {achievements.length}</span>
                  </h2>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 p-3 rounded-full bg-amber-500/10">
                  <Trophy className="h-8 w-8 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Points
                  </p>
                  <h2 className="text-3xl font-bold">
                    {totalPoints} <span className="text-xl text-muted-foreground">pts</span>
                  </h2>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>For Demo Purposes</AlertTitle>
                <AlertDescription>
                  Click on any achievement to see the earned animation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
        
        {/* Achievement Grid */}
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Achievements</TabsTrigger>
            <TabsTrigger value="earned">Earned</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <AchievementGrid 
              achievements={achievements}
              onAchievementClick={handleAchievementClick}
            />
          </TabsContent>
          
          <TabsContent value="earned">
            <AchievementGrid 
              achievements={achievements.filter(a => a.isEarned)}
              onAchievementClick={handleAchievementClick}
            />
          </TabsContent>
          
          <TabsContent value="in-progress">
            <AchievementGrid 
              achievements={achievements.filter(a => !a.isEarned && a.progress > 0)}
              onAchievementClick={handleAchievementClick}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}