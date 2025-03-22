import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ProgressMetric } from "@/components/dashboard/progress-metric";
import { BodyMetrics } from "@/components/dashboard/body-metrics";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CoachLegacyCard } from "@/components/dashboard/coach-legacy-card";
import { RecruitingProfile } from "@/components/profile/recruiting-profile";
import { TrainingPlanView } from "@/components/training/training-plan";
import { SubscriptionInfo } from "@/components/subscription-info";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ChatInterface } from "@/components/coach-ai/chat-interface";
import { CombineMetric } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
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
  
  const fortyYardProgress = calculateProgress(latestMetrics?.fortyYard, D1_BENCHMARKS.fortyYard, true);
  const benchProgress = calculateProgress(latestMetrics?.benchPress, D1_BENCHMARKS.benchPress, false);
  
  return (
    <div className="min-h-screen pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        <CoachLegacyCard onRespond={() => setChatOpen(true)} />
        
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-montserrat font-bold">Your Progress</h2>
            <button className="text-primary dark:text-accent font-semibold text-sm flex items-center">
              <span>View All</span>
              <span className="material-icons text-sm ml-1">→</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <ProgressMetric
              title="40-Yard Dash"
              value={latestMetrics?.fortyYard || "N/A"}
              goal={D1_BENCHMARKS.fortyYard}
              unit="s"
              progress={fortyYardProgress}
            />
            <ProgressMetric
              title="Bench Press"
              value={latestMetrics?.benchPress || "N/A"}
              goal={D1_BENCHMARKS.benchPress}
              unit=""
              progress={benchProgress}
            />
          </div>
          
          <BodyMetrics />
          <QuickActions />
        </section>
        
        <RecruitingProfile />
        <TrainingPlanView />
        <SubscriptionInfo />
      </main>
      
      <BottomNavigation />
      <ChatInterface isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
