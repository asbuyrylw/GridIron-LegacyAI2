import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, ChevronRight, RefreshCw, Lightbulb, TrendingUp, Target, AlertCircle } from "lucide-react";
import { CombineMetric } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Define the type for performance insights
interface PerformanceInsights {
  athleteId: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  performanceTrend?: string;
  positionRanking?: string;
  lastUpdated?: string;
}

interface AiPerformanceInsightsProps {
  athleteId?: number;
  className?: string;
}

export function AiPerformanceInsights({ athleteId, className }: AiPerformanceInsightsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const id = athleteId || user?.athlete?.id;
  const position = user?.athlete?.position || "Unknown";
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Get athlete metrics and insights
  const { data: metrics, isLoading: isMetricsLoading } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${id}/metrics`],
    enabled: !!id,
  });
  
  const { data: insights, isLoading: isInsightsLoading } = useQuery<PerformanceInsights>({
    queryKey: [`/api/athlete/${id}/insights`],
    enabled: !!id,
  });
  
  const hasInsightsData = !isInsightsLoading && insights && 
    (insights.strengths?.length > 0 || insights.weaknesses?.length > 0 || insights.recommendations?.length > 0);
    
  const latestMetrics = metrics && metrics.length > 0 ? metrics[0] : null;
  const updatedDate = insights?.lastUpdated 
    ? format(new Date(insights.lastUpdated), 'MMMM d, yyyy')
    : 'Never';
  
  // Mutation to generate new insights
  const generateInsightsMutation = useMutation({
    mutationFn: async (athleteData: { athleteId: number, metrics: CombineMetric, position: string }) => {
      const res = await apiRequest(
        "POST", 
        "/api/athlete/generate-insights", 
        athleteData
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${id}/insights`] });
      setIsGenerating(false);
      toast({
        title: "Performance insights updated",
        description: "AI has analyzed your latest metrics and provided new recommendations.",
      });
    },
    onError: (error: Error) => {
      setIsGenerating(false);
      toast({
        title: "Failed to generate insights",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleGenerateInsights = () => {
    if (!id || !latestMetrics) {
      toast({
        title: "Cannot generate insights",
        description: "You need to have performance metrics data to generate insights.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    generateInsightsMutation.mutate({
      athleteId: id,
      metrics: latestMetrics,
      position
    });
  };
  
  // Loading state
  if (isMetricsLoading || isInsightsLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!metrics || metrics.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Performance Insights
          </CardTitle>
          <CardDescription>
            Get personalized recommendations based on your athletic metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No metrics available</h3>
            <p className="text-muted-foreground mb-4">
              Add your performance metrics to receive AI-powered insights and recommendations.
            </p>
            <Button asChild>
              <a href="/stats">Add Metrics <ChevronRight className="ml-1 h-4 w-4" /></a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Performance Insights
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateInsights} 
            disabled={isGenerating || !latestMetrics}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Analyzing...' : 'Generate'}
          </Button>
        </div>
        <CardDescription>
          Performance analysis and recommendations based on your metrics
          {insights?.lastUpdated && (
            <span className="block mt-1">Last updated: {updatedDate}</span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!hasInsightsData ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Lightbulb className="h-10 w-10 text-amber-500 mb-3" />
            <h3 className="text-lg font-medium mb-2">Generate insights</h3>
            <p className="text-muted-foreground mb-4">
              Generate AI insights to receive personalized feedback on your performance and recommendations for improvement.
            </p>
            <Button onClick={handleGenerateInsights} disabled={isGenerating}>
              {isGenerating ? 'Analyzing...' : 'Generate Insights'}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="strengths">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="weaknesses">Areas for Growth</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="strengths">
              <div className="space-y-4">
                {insights?.strengths?.map((strength: string, index: number) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <p>{strength}</p>
                  </div>
                ))}
                
                {(!insights?.strengths || insights.strengths.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">
                    No strengths identified yet. Generate insights to see your athletic strengths.
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="weaknesses">
              <div className="space-y-4">
                {insights?.weaknesses?.map((weakness: string, index: number) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="bg-amber-100 rounded-full p-1 mt-0.5">
                      <Target className="h-4 w-4 text-amber-600" />
                    </div>
                    <p>{weakness}</p>
                  </div>
                ))}
                
                {(!insights?.weaknesses || insights.weaknesses.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">
                    No areas for growth identified yet. Generate insights to see improvement opportunities.
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations">
              <div className="space-y-4">
                {insights?.recommendations?.map((recommendation: string, index: number) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                    </div>
                    <p>{recommendation}</p>
                  </div>
                ))}
                
                {(!insights?.recommendations || insights.recommendations.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">
                    No recommendations available yet. Generate insights to receive training suggestions.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      {insights?.performanceTrend && (
        <CardFooter className="border-t pt-4">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Performance Trend:</span>
              <Badge 
                className={`
                  ${insights.performanceTrend === 'improving' ? 'bg-green-500 hover:bg-green-600' : ''}
                  ${insights.performanceTrend === 'stable' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                  ${insights.performanceTrend === 'declining' ? 'bg-red-500 hover:bg-red-600' : ''}
                `}
              >
                {insights.performanceTrend.charAt(0).toUpperCase() + insights.performanceTrend.slice(1)}
              </Badge>
            </div>
            
            {insights.positionRanking && (
              <span className="text-sm">{insights.positionRanking}</span>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}