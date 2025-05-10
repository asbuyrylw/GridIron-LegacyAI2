import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CombineMetric, TrainingPlan } from "@shared/schema";
import { Loader2, RefreshCw, Brain, TrendingUp, Dumbbell, Target, ArrowDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PerformanceInsightsProps {
  className?: string;
  athleteId?: number;
}

export function PerformanceInsights({ className, athleteId }: PerformanceInsightsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const id = athleteId || user?.athlete?.id;
  const position = user?.athlete?.position || "Unknown";
  const [activeTab, setActiveTab] = useState("insights");
  
  // Fetch the athlete's metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${id}/metrics`],
    enabled: !!id,
  });
  
  // Fetch the athlete's training plans
  const { data: trainingPlans, isLoading: plansLoading } = useQuery<TrainingPlan[]>({
    queryKey: [`/api/athlete/${id}/training-plans`],
    enabled: !!id,
  });
  
  // Fetch the current insights
  const { 
    data: insights, 
    isLoading: insightsLoading,
    isError: insightsError
  } = useQuery<{
    id: number;
    athleteId: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    performanceTrend: string;
    positionRanking: string | null;
    improvementAreas: string[];
    recentAchievements: string[];
    lastUpdated: Date;
  }>({
    queryKey: [`/api/athlete/${id}/performance-insights`],
    enabled: !!id && !!metrics && metrics.length > 0,
  });
  
  // Mutation for generating new insights
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST", 
        `/api/athlete/${id}/generate-insights`,
        { position }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${id}/performance-insights`] });
      toast({
        title: "Insights generated",
        description: "Your performance insights have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate insights",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const isLoading = metricsLoading || plansLoading || insightsLoading;
  const isEmpty = !metrics || metrics.length < 1;
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (isEmpty) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Performance Insights
          </CardTitle>
          <CardDescription>
            Personalized analysis and recommendations based on your metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              No performance data available. Update your combine metrics to receive AI-powered insights.
            </p>
            <Button disabled variant="outline">Generate Insights</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Performance Insights
            </CardTitle>
            <CardDescription>
              Personalized analysis and recommendations based on your metrics
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8"
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
          >
            {generateInsightsMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Update
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="insights" className="flex-1">Insights</TabsTrigger>
            <TabsTrigger value="nextLevel" className="flex-1">Next Level</TabsTrigger>
            <TabsTrigger value="recommendations" className="flex-1">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights">
            {insightsError || !insights ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  No insights available yet. Generate your first AI performance analysis.
                </p>
                <Button 
                  onClick={() => generateInsightsMutation.mutate()}
                  disabled={generateInsightsMutation.isPending}
                >
                  {generateInsightsMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Brain className="mr-2 h-4 w-4" />
                  )}
                  Generate Insights
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-3 text-green-600 dark:text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {insights.strengths.map((strength, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">•</span> 
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
                    <Target className="h-4 w-4" />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {insights.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="nextLevel">
            {insightsError || !insights ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Generate insights to see what you need to reach the next level.
                </p>
                <Button 
                  onClick={() => generateInsightsMutation.mutate()}
                  disabled={generateInsightsMutation.isPending}
                >
                  Generate Insights
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Performance Analytics</h3>
                
                {/* Position Ranking */}
                {insights.positionRanking && (
                  <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-400">Position Ranking</h4>
                    <p className="text-sm font-medium">{insights.positionRanking}</p>
                  </div>
                )}
                
                {/* Performance Trend */}
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-medium mb-2">Performance Trend</h4>
                  <div className="flex items-center gap-2">
                    {insights.performanceTrend === 'improving' && (
                      <>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                          <TrendingUp className="h-4 w-4" />
                        </span>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Improving</p>
                      </>
                    )}
                    
                    {insights.performanceTrend === 'stable' && (
                      <>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          <Minus className="h-4 w-4" />
                        </span>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Stable</p>
                      </>
                    )}
                    
                    {insights.performanceTrend === 'declining' && (
                      <>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                          <ArrowDown className="h-4 w-4" />
                        </span>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">Declining</p>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Improvement Areas */}
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-medium mb-2">Key Areas to Improve</h4>
                  <ul className="space-y-2">
                    {insights.improvementAreas.map((area, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Recent Achievements */}
                {insights.recentAchievements && insights.recentAchievements.length > 0 && (
                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-medium mb-2">Recent Highlights</h4>
                    <ul className="space-y-2">
                      {insights.recentAchievements.map((achievement, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">
                    These insights are based on AI analysis of your performance metrics and training history.
                    Results are updated when you record new performance data.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommendations">
            {insightsError || !insights ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Generate insights to see personalized training recommendations.
                </p>
                <Button 
                  onClick={() => generateInsightsMutation.mutate()}
                  disabled={generateInsightsMutation.isPending}
                >
                  Generate Insights
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                  <Dumbbell className="h-4 w-4" />
                  Training Recommendations
                </h3>
                
                <div className="space-y-3">
                  {insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
                
                {trainingPlans && trainingPlans.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3">Active Training Plans</h4>
                    <div className="flex flex-wrap gap-2">
                      {trainingPlans
                        .filter(plan => plan.active)
                        .map(plan => (
                          <Badge key={plan.id} variant="outline" className="px-3 py-1">
                            {plan.title}
                          </Badge>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-xs text-muted-foreground">
          Insights are generated using AI analysis of your metrics and training history. 
          Consult with your coach for a comprehensive training plan.
        </p>
      </CardFooter>
    </Card>
  );
}