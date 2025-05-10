import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AchievementsPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAchievementAnimation, setShowAchievementAnimation] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // Fetch all achievements from the database
  const { data: allAchievements = [] } = useQuery<any[]>({
    queryKey: [`/api/achievements`],
    enabled: !!user?.athlete?.id,
  });
  
  // Fetch athlete achievements
  const { data: athleteAchievements = [] } = useQuery<any[]>({
    queryKey: [`/api/athlete/${user?.athlete?.id}/achievements`],
    enabled: !!user?.athlete?.id,
  });

  // Mutation to update an achievement's progress
  const updateAchievementMutation = useMutation({
    mutationFn: async ({ 
      achievementId, 
      progress, 
      completed 
    }: { 
      achievementId: number; 
      progress: number;
      completed?: boolean;
    }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/athlete/${user?.athlete?.id}/achievements/${achievementId}`,
        { progress, completed }
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the athlete achievements query to refetch
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${user?.athlete?.id}/achievements`],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update achievement",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to create a new achievement for an athlete
  const createAchievementMutation = useMutation({
    mutationFn: async ({
      achievementId,
      progress = 0,
      completed = false,
    }: {
      achievementId: number;
      progress?: number;
      completed?: boolean;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/athlete/${user?.athlete?.id}/achievements`,
        { achievementId, progress, completed }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${user?.athlete?.id}/achievements`],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create achievement",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Map backend achievements to frontend format
  const achievements = ACHIEVEMENT_BADGES.map(frontendAchievement => {
    // Find if the athlete has this achievement
    const athleteAchievement = athleteAchievements.find(
      (aa: any) => aa.achievementId === parseInt(frontendAchievement.id)
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
  
  // Check if an athlete achievement record exists, if not create one
  const handleAchievementClick = (achievement: Achievement) => {
    const achievementId = parseInt(achievement.id);
    const athleteAchievement = athleteAchievements.find(
      (aa: any) => aa.achievementId === achievementId
    );
    
    if (athleteAchievement) {
      // If it exists, update it
      if (!athleteAchievement.completed) {
        // Only allow manual completion if progress is already at 100%
        if (athleteAchievement.progress >= 100) {
          updateAchievementMutation.mutate({
            achievementId,
            progress: 100,
            completed: true
          });
          
          // Show achievement animation
          setSelectedAchievement(achievement);
          setShowAchievementAnimation(true);
        } else {
          toast({
            title: "Achievement progress updated",
            description: `Keep working on this achievement! Current progress: ${athleteAchievement.progress}%`,
          });
        }
      } else {
        // Already completed, just show the animation
        setSelectedAchievement(achievement);
        setShowAchievementAnimation(true);
      }
    } else {
      // If it doesn't exist, create it with initial progress
      createAchievementMutation.mutate({
        achievementId,
        progress: 0,
        completed: false
      });
      
      toast({
        title: "New achievement started",
        description: `You've started tracking the "${achievement.name}" achievement!`,
      });
    }
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