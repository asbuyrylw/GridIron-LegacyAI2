import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ProgressMetric } from "@/components/dashboard/progress-metric";
import { BodyMetrics } from "@/components/dashboard/body-metrics";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CoachLegacyCard } from "@/components/dashboard/coach-legacy-card";
import { RecruitingProfile } from "@/components/profile/recruiting-profile";
import { TrainingPlanView } from "@/components/training/training-plan";
import { AchievementSummary } from "@/components/achievements/achievement-summary";
import { SubscriptionInfo } from "@/components/subscription-info";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ChatInterface } from "@/components/coach-ai/chat-interface";
import { CombineMetric } from "@shared/schema";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const athleteId = user?.athlete?.id;
  
  const [chatOpen, setChatOpen] = useState(false);
  
  const { data: metrics } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${athleteId}/metrics`],
    enabled: !!athleteId,
  });
  
  const latestMetrics = metrics?.[0];
  
  // D1 benchmarks for calculating progress
  const D1_BENCHMARKS = {
    fortyYard: 4.5,    // seconds
    shuttle: 4.2,      // seconds
    verticalJump: 34,  // inches
    broadJump: 120,    // inches
    benchPress: 18     // reps
  };
  
  // Calculate progress percentage for metrics
  const calculateProgress = (current: number | undefined, benchmark: number, isLowerBetter = true) => {
    if (current === undefined) return 0;
    
    if (isLowerBetter) {
      // For metrics where lower is better (like 40-yard dash)
      const maxValue = benchmark * 1.5; // 50% slower than benchmark is 0% progress
      if (current >= maxValue) return 0;
      if (current <= benchmark) return 100;
      return Math.round(100 - ((current - benchmark) / (maxValue - benchmark)) * 100);
    } else {
      // For metrics where higher is better (like bench press)
      const minValue = benchmark * 0.5; // 50% of benchmark is 0% progress
      if (current <= minValue) return 0;
      if (current >= benchmark) return 100;
      return Math.round(((current - minValue) / (benchmark - minValue)) * 100);
    }
  };
  
  // Safe access to metrics with proper type checking
  const fortyYardProgress = calculateProgress(
    typeof latestMetrics?.fortyYard === 'number' ? latestMetrics.fortyYard : undefined,
    D1_BENCHMARKS.fortyYard, 
    true
  );
  
  const benchProgress = calculateProgress(
    typeof latestMetrics?.benchPress === 'number' ? latestMetrics.benchPress : undefined, 
    D1_BENCHMARKS.benchPress, 
    false
  );
  
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
  
  return (
    <div className="min-h-screen pb-16 relative bg-gradient-to-b from-blue-50/50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.firstName || 'Athlete'}!</h1>
          <p className="text-muted-foreground">Track your progress and improve your performance</p>
        </div>
      
        {/* Main Dashboard Layout - 2 column grid on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coach AI Card - Only shown when user is logged in */}
            {user && (
              <div 
                className="dashboard-card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"/><path d="M6 10v1a6 6 0 1 0 12 0v-1"/><path d="M11 22h2"/><path d="M10 22h4"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Coach Legacy AI</h3>
                    <p className="text-white/90 mb-3">Get personalized coaching and feedback from your AI coach</p>
                    <div className="w-full mt-2">
                      <iframe
                        src={`https://embed.chatnode.ai/9935e96a-42a5-4e07-88d7-35fde736371e?data-name=${user?.firstName || 'Athlete'}&data-email=${user?.email || ''}&data-phone=`}
                        width="100%"
                        height="300"
                        style={{ visibility: "hidden", border: "none", borderRadius: "0.5rem", overflow: "hidden" }}
                        onLoad={(e) => { e.currentTarget.style.visibility = "visible"; }}
                        allow="autoplay; clipboard-read; clipboard-write"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Training Plan */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Today's Training</h2>
                <button className="text-sm font-medium text-primary flex items-center">
                  View Full Plan <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
              <TrainingPlanView />
            </div>
            
            {/* Recruiting Profile */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recruiting Profile</h2>
                <button className="text-sm font-medium text-primary flex items-center">
                  Update Profile <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
              <RecruitingProfile />
            </div>
          </div>
          
          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Performance</h2>
                <button className="text-sm font-medium text-primary flex items-center">
                  View Stats <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="stat-card">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">40-Yard Dash</h3>
                    <div className="flex items-baseline">
                      <span className="text-xl font-bold">{latestMetrics?.fortyYard || "N/A"}</span>
                      <span className="text-xs ml-1 text-muted-foreground">sec</span>
                    </div>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${fortyYardProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Current</span>
                    <span>D1 Goal: {D1_BENCHMARKS.fortyYard}s</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Bench Press</h3>
                    <div className="flex items-baseline">
                      <span className="text-xl font-bold">{latestMetrics?.benchPress || "N/A"}</span>
                      <span className="text-xs ml-1 text-muted-foreground">reps</span>
                    </div>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${benchProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Current</span>
                    <span>D1 Goal: {D1_BENCHMARKS.benchPress} reps</span>
                  </div>
                </div>
              </div>
              
              <BodyMetrics />
            </div>
            
            {/* Quick Actions */}
            <div className="dashboard-card">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <QuickActions />
            </div>
            
            {/* Achievements */}
            <div className="dashboard-card">
              <AchievementSummary />
            </div>
            
            {/* Upcoming Events */}
            <div className="dashboard-card bg-blue-50 border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Reminders</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Update Combine Stats</h3>
                    <p className="text-xs text-muted-foreground">Keep your metrics current for recruiters</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Log Today's Training</h3>
                    <p className="text-xs text-muted-foreground">Track your progress consistently</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <SubscriptionInfo />
      </main>
      
      <BottomNavigation />
      {/* ChatInterface is now replaced with the embedded chatnode.ai
      <ChatInterface isOpen={chatOpen} onClose={() => setChatOpen(false)} /> 
      */}
    </div>
  );
}
