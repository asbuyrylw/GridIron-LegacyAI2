import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Award, Trophy, Loader2, Info } from "lucide-react";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { ACHIEVEMENT_BADGES } from "@/lib/achievement-badges";
import { useAchievementProgress } from "@/hooks/use-achievement-progress";

export default function AchievementsPage() {
  const { user, isLoading } = useAuth();
  const { progressData, isCompleted } = useAchievementProgress();
  const [activeTab, setActiveTab] = useState("all");
  
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
  const completedCount = progressData && progressData.length ? 
    progressData.filter(a => a.completed).length : 0;
  const totalCount = ACHIEVEMENT_BADGES.length;
  
  // Calculate total points
  const totalPoints = progressData && progressData.length ? 
    progressData
      .filter(a => a.completed)
      .reduce((sum, a) => {
        const achievement = ACHIEVEMENT_BADGES.find(badge => badge.id === a.achievementId);
        return sum + (achievement?.pointValue || 0);
      }, 0)
    : 0;
  
  // Get in-progress achievements (not completed but has some progress)
  const inProgressCount = progressData && progressData.length ? 
    progressData.filter(a => !a.completed && a.progress > 0).length : 0;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-6 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
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
                    {completedCount} 
                    <span className="text-xl text-muted-foreground ml-1">/ {totalCount}</span>
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
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle>How Achievements Work</AlertTitle>
                <AlertDescription className="text-sm">
                  <p className="mb-1">Click on any achievement to view details. Achievements are unlocked when you:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Record metrics that meet achievement thresholds</li>
                    <li>Complete tasks like logging training sessions</li>
                    <li>Fill out profile sections and recruiting information</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
        
        {/* Achievement Grid */}
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Achievements</TabsTrigger>
            <TabsTrigger value="earned">
              Earned ({completedCount})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({inProgressCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <AchievementGrid 
              showFilters={true}
            />
          </TabsContent>
          
          <TabsContent value="earned">
            <AchievementGrid 
              showFilters={true}
            />
          </TabsContent>
          
          <TabsContent value="in-progress">
            <AchievementGrid 
              showFilters={true}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}