import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SubscriptionInfo } from "@/components/subscription-info";
import { Header } from "@/components/layout/header";
import { CombineMetric } from "@shared/schema";
import { Redirect } from "wouter";
import { useEffect } from "react";
import { useLoginStreakUpdate } from "@/hooks/use-login-streak";

// Dashboard Components
import { MilestoneTrackers } from "@/components/dashboard/milestone-trackers";
import { YearlyGoals } from "@/components/dashboard/yearly-goals";
import { DailyPlans } from "@/components/dashboard/daily-plans";
import { DailyQuote } from "@/components/dashboard/daily-quote";
import { PlanCalendar } from "@/components/dashboard/plan-calendar";
import { ProfileSummary } from "@/components/dashboard/profile-summary";
import { FootballIqSummary } from "@/components/dashboard/football-iq-summary";
import { LoginStreak } from "@/components/dashboard/login-streak";
import { AchievementsSummary } from "@/components/dashboard/achievements-summary";
import { BellRing, CalendarClock } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const athleteId = user?.athlete?.id;
  const updateLoginStreak = useLoginStreakUpdate();
  
  // Update login streak when user logs in and reaches the home page
  useEffect(() => {
    if (user && !isLoading) {
      updateLoginStreak.mutate();
    }
  }, [user, isLoading, updateLoginStreak]);
  
  const { data: metrics } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${athleteId}/metrics`],
    enabled: !!athleteId,
  });
  
  const latestMetrics = metrics?.[0];
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" />;
  }
  
  // Redirect if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Redirect to onboarding if not completed
  if (user?.athlete && !user.athlete.onboardingCompleted) {
    return <Redirect to="/onboarding" />;
  }
  
  // Reminders data (would come from API)
  const reminders = [
    {
      id: 1,
      title: "Update Combine Stats",
      description: "Keep your metrics current for recruiters",
      icon: <BellRing className="h-5 w-5" />,
    },
    {
      id: 2,
      title: "Team Practice Thursday",
      description: "5:00 PM - Football Field",
      icon: <CalendarClock className="h-5 w-5" />,
    }
  ];

  return (
    <div className="min-h-screen pb-16 relative bg-gradient-to-b from-blue-50/50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        {/* Top Section: Welcome with Profile Summary */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || 'Athlete'}!</h1>
          </div>
          
          <div className="mb-4">
            <ProfileSummary />
          </div>
        </div>
        
        {/* Main Content: Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Yearly Goals */}
            <YearlyGoals />
            
            {/* Football IQ Summary */}
            <FootballIqSummary />
            
            {/* Achievement & Login Streak Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Login Streak */}
              <LoginStreak />
              
              {/* Achievements */}
              <AchievementsSummary />
            </div>
          </div>
          
          {/* Middle Column */}
          <div className="space-y-6">
            {/* Daily Quote */}
            <DailyQuote />
            
            {/* Reminders */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <BellRing className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Reminders</h2>
              </div>
              
              <div className="flex flex-col gap-2">
                {reminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-100">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      {reminder.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">{reminder.title}</h3>
                      <p className="text-xs text-muted-foreground">{reminder.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Today's Plans */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Today's Plans</h2>
              <DailyPlans />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Training Calendar */}
            <PlanCalendar />
            
            {/* Performance Milestones */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Performance</h2>
              <MilestoneTrackers metrics={latestMetrics} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
