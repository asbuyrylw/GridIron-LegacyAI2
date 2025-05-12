import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SubscriptionInfo } from "@/components/subscription-info";
import { Header } from "@/components/layout/header";
import { CombineMetric } from "@shared/schema";
import { Redirect } from "wouter";

// New Dashboard Components
import { QuickActions } from "@/components/dashboard/quick-actions";
import { MilestoneTrackers } from "@/components/dashboard/milestone-trackers";
import { YearlyGoals } from "@/components/dashboard/yearly-goals";
import { DailyPlans } from "@/components/dashboard/daily-plans";
import { DailyQuote } from "@/components/dashboard/daily-quote";
import { AchievementSummary } from "@/components/achievements/achievement-summary";
import { BellRing, CalendarClock } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const athleteId = user?.athlete?.id;
  
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
      <Header>
        {/* Header Quick Actions */}
        <div className="ml-auto">
          <QuickActions />
        </div>
      </Header>
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        {/* Top Section: Welcome + Daily Quote + Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Section - Welcome */}
          <div className="lg:col-span-2">
            {/* Welcome & Name */}
            <h1 className="text-2xl font-bold mb-3">Welcome back, {user?.firstName || 'Athlete'}!</h1>
            
            {/* Daily Quote */}
            <div className="mb-6">
              <DailyQuote />
            </div>
            
            {/* Milestone Trackers */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Performance Milestones</h2>
              <MilestoneTrackers metrics={latestMetrics} />
            </div>
          </div>
          
          {/* Right Section - Reminders */}
          <div>
            {/* Reminders Section */}
            <div className="dashboard-card bg-blue-50 border-blue-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Reminders</h2>
              </div>
              
              <div className="space-y-3">
                {reminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      {reminder.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{reminder.title}</h3>
                      <p className="text-xs text-muted-foreground">{reminder.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Yearly Goals Section */}
            <YearlyGoals />
          </div>
        </div>
        
        {/* Main Dashboard Layout - 2 column grid on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Plans */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Today's Plans</h2>
              <DailyPlans />
            </div>
          </div>
          
          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Achievements */}
            <AchievementSummary />
            
            {/* Upgrade Plan Button (only for free trial users) */}
            {user?.athlete?.subscriptionTier === 'free' && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <h3 className="font-semibold mb-2">Upgrade Your Plan</h3>
                <p className="text-sm mb-3 text-white/90">Get access to advanced features, AI recruiting insights, and more.</p>
                <button className="w-full bg-white text-blue-600 font-medium py-2 rounded-md">
                  View Plans
                </button>
              </div>
            )}
          </div>
        </div>
        
        <SubscriptionInfo />
      </main>
    </div>
  );
}
