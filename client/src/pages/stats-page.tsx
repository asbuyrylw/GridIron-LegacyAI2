import * as React from "react";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CombineMetricsForm } from "@/components/training/combine-metrics-form";
import { PerformanceTrends } from "@/components/stats/performance-trends";
import { PositionPercentile } from "@/components/stats/position-percentile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { CombineMetric } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Redirect, Link } from "wouter";
import { Loader2 } from "lucide-react";

export default function StatsPage() {
  const { user, isLoading } = useAuth();
  const athleteId = user?.athlete?.id;
  
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
  
  const { data: metrics } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${athleteId}/metrics`],
    enabled: !!athleteId,
  });
  
  // Transform metrics data for charts
  const chartData = metrics?.map(metric => ({
    date: format(new Date(metric.dateRecorded), 'MM/dd'),
    fortyYard: metric.fortyYard,
    shuttle: metric.shuttle,
    verticalJump: metric.verticalJump,
    broadJump: metric.broadJump,
    benchPress: metric.benchPress
  })).reverse();
  
  return (
    <div className="min-h-screen pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Performance Dashboard</h1>
        
        <Tabs defaultValue="dashboard">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
            <TabsTrigger value="metrics" className="flex-1">Update Metrics</TabsTrigger>
            <TabsTrigger value="insights" className="flex-1">AI Insights</TabsTrigger>
            <TabsTrigger value="compare" className="flex-1">College Comparison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="space-y-6">
              {/* Import the PerformanceDashboard component */}
              {React.createElement(
                require("@/components/dashboard/performance-dashboard").PerformanceDashboard,
                { athleteId }
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="metrics">
            <div className="space-y-6">
              <CombineMetricsForm />
              
              {/* Position Percentile Ranking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PositionPercentile />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insights">
            <div className="space-y-6">
              {/* AI Performance Insights component */}
              {React.createElement(
                require("@/components/dashboard/ai-performance-insights").AiPerformanceInsights,
                { athleteId }
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="compare">
            <div className="space-y-6">
              {/* Performance Comparison component */}
              {React.createElement(
                require("@/components/dashboard/performance-comparison").PerformanceComparison,
                { athleteId }
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNav />
    </div>
  );
}
