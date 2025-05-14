import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Brain } from "lucide-react";
import { calculateOverallLevel, getLevelColor } from "@/lib/football-iq-utils";

/**
 * Football IQ summary component for the dashboard
 */
export function FootballIqSummary() {
  const { user, athlete } = useAuth();
  
  // Fetch athlete's progress
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['/api/athlete', athlete?.id, 'football-iq/progress'],
    queryFn: async () => {
      try {
        if (!athlete?.id) return [];
        const response = await fetch(`/api/athlete/${athlete.id}/football-iq/progress`);
        if (!response.ok) {
          console.error('Error response from progress API:', response.status, response.statusText);
          throw new Error('Failed to fetch progress');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching football IQ progress:', error);
        throw error;
      }
    },
    enabled: !!athlete?.id,
    retries: 2,
  });
  
  // If no progress data, show prompt to take first assessment
  if (!progressData || progressData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-indigo-500" />
            <span>Football IQ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Test your football knowledge with position-specific IQ assessments.
          </p>
          <Link href="/football-iq">
            <Button size="sm" className="w-full flex items-center justify-center gap-1">
              <span>Take Your First Assessment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  const overallLevel = calculateOverallLevel(progressData);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-indigo-500" />
          <span>Football IQ</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold capitalize">
              {overallLevel} 
              <span className="text-sm font-normal ml-2 text-muted-foreground">
                Level
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {progressData.length} position{progressData.length !== 1 ? 's' : ''} assessed
            </p>
          </div>
          <div>
            <Badge className={`${getLevelColor(overallLevel)} text-white px-3 py-1`}>
              {overallLevel.toUpperCase()}
            </Badge>
          </div>
        </div>
        <Link href="/football-iq">
          <Button size="sm" variant="outline" className="w-full flex items-center justify-center gap-1">
            <span>Continue Training</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}