import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CombineMetric } from "@shared/schema";
import { Loader2, ChartBar } from "lucide-react";

interface PositionPercentileProps {
  className?: string;
  athleteId?: number;
}

export function PositionPercentile({ className, athleteId }: PositionPercentileProps) {
  const { user } = useAuth();
  const id = athleteId || user?.athlete?.id;
  const position = user?.athlete?.position || "Unknown";
  
  const [comparisonLevel, setComparisonLevel] = useState<string>("high-school");
  
  const { data: metrics, isLoading } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${id}/metrics`],
    enabled: !!id,
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!metrics || metrics.length < 1) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="h-5 w-5" />
            Position Percentile
          </CardTitle>
          <CardDescription>
            See how you compare to other {position} players
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">
              No performance data available. Update your combine metrics to see your percentile ranking.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Get the most recent metrics
  const latestMetrics = metrics.sort(
    (a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime()
  )[0];
  
  // National averages by position and level for key metrics
  // These would ideally come from a database or API
  const getPositionalPercentile = (
    metricName: string, 
    value: number | undefined | null,
    position: string,
    level: string
  ): number => {
    if (value === undefined || value === null) return 0;
    
    // Sample data - in a real app, this would come from a database
    // The percentiles here are just examples
    
    // Is lower better for this metric?
    const lowerBetter = ["fortyYard", "shuttle", "threeCone", "tenYardSplit"].includes(metricName);
    
    // High School averages (50th percentile) by position for common metrics
    const highSchoolAverages: Record<string, Record<string, number>> = {
      "QB": { "fortyYard": 4.9, "verticalJump": 28, "benchPress": 12, "shuttle": 4.5 },
      "RB": { "fortyYard": 4.7, "verticalJump": 30, "benchPress": 15, "shuttle": 4.4 },
      "WR": { "fortyYard": 4.7, "verticalJump": 32, "benchPress": 10, "shuttle": 4.3 },
      "TE": { "fortyYard": 4.9, "verticalJump": 30, "benchPress": 18, "shuttle": 4.5 },
      "OL": { "fortyYard": 5.4, "verticalJump": 24, "benchPress": 20, "shuttle": 4.8 },
      "DL": { "fortyYard": 5.2, "verticalJump": 26, "benchPress": 22, "shuttle": 4.7 },
      "LB": { "fortyYard": 4.9, "verticalJump": 30, "benchPress": 20, "shuttle": 4.4 },
      "DB": { "fortyYard": 4.6, "verticalJump": 33, "benchPress": 12, "shuttle": 4.2 },
      "K": { "fortyYard": 5.0, "verticalJump": 25, "benchPress": 8, "shuttle": 4.6 },
    };
    
    // D1 College averages by position
    const d1Averages: Record<string, Record<string, number>> = {
      "QB": { "fortyYard": 4.7, "verticalJump": 32, "benchPress": 16, "shuttle": 4.3 },
      "RB": { "fortyYard": 4.5, "verticalJump": 36, "benchPress": 20, "shuttle": 4.2 },
      "WR": { "fortyYard": 4.5, "verticalJump": 38, "benchPress": 15, "shuttle": 4.1 },
      "TE": { "fortyYard": 4.7, "verticalJump": 35, "benchPress": 22, "shuttle": 4.3 },
      "OL": { "fortyYard": 5.2, "verticalJump": 28, "benchPress": 28, "shuttle": 4.6 },
      "DL": { "fortyYard": 5.0, "verticalJump": 32, "benchPress": 30, "shuttle": 4.5 },
      "LB": { "fortyYard": 4.7, "verticalJump": 35, "benchPress": 25, "shuttle": 4.2 },
      "DB": { "fortyYard": 4.4, "verticalJump": 38, "benchPress": 18, "shuttle": 4.0 },
      "K": { "fortyYard": 4.8, "verticalJump": 30, "benchPress": 12, "shuttle": 4.4 },
    };
    
    // NFL Combine averages by position
    const nflAverages: Record<string, Record<string, number>> = {
      "QB": { "fortyYard": 4.5, "verticalJump": 35, "benchPress": 20, "shuttle": 4.1 },
      "RB": { "fortyYard": 4.3, "verticalJump": 40, "benchPress": 25, "shuttle": 4.0 },
      "WR": { "fortyYard": 4.3, "verticalJump": 42, "benchPress": 18, "shuttle": 3.9 },
      "TE": { "fortyYard": 4.5, "verticalJump": 38, "benchPress": 25, "shuttle": 4.1 },
      "OL": { "fortyYard": 5.0, "verticalJump": 32, "benchPress": 35, "shuttle": 4.4 },
      "DL": { "fortyYard": 4.8, "verticalJump": 35, "benchPress": 35, "shuttle": 4.3 },
      "LB": { "fortyYard": 4.5, "verticalJump": 38, "benchPress": 30, "shuttle": 4.0 },
      "DB": { "fortyYard": 4.2, "verticalJump": 42, "benchPress": 22, "shuttle": 3.8 },
      "K": { "fortyYard": 4.6, "verticalJump": 32, "benchPress": 15, "shuttle": 4.2 },
    };
    
    // Select the appropriate average based on level
    let averages;
    if (level === "nfl") {
      averages = nflAverages;
    } else if (level === "d1") {
      averages = d1Averages;
    } else {
      averages = highSchoolAverages;
    }
    
    // Default to first position if we don't have data for the specified position
    const pos = averages[position] ? position : Object.keys(averages)[0];
    
    // Get the average for this metric and position
    const average = averages[pos][metricName] || 0;
    
    if (average === 0) return 0;
    
    // Calculate percentile (very simplified - in a real app you'd use more sophisticated statistics)
    // For lower-is-better metrics, the calculation is reversed
    if (lowerBetter) {
      // Lower is better, so if the athlete's value is lower than the average, they're above the 50th percentile
      if (value <= average) {
        // How much better are they than average, as a percentage?
        // If they're 10% faster than average, they're in the 90th percentile
        const pctBetter = Math.min(50 * (average - value) / (average * 0.1), 50);
        return 50 + pctBetter;
      } else {
        // They're slower than average
        // If they're 10% slower than average, they're in the 10th percentile
        const pctWorse = Math.min(50 * (value - average) / (average * 0.1), 50);
        return Math.max(50 - pctWorse, 0);
      }
    } else {
      // Higher is better
      if (value >= average) {
        // How much better are they than average, as a percentage?
        // If they're 20% better than average, they're in the 90th percentile
        const pctBetter = Math.min(50 * (value - average) / (average * 0.2), 50);
        return 50 + pctBetter;
      } else {
        // They're below average
        // If they're 20% below average, they're in the 10th percentile
        const pctWorse = Math.min(50 * (average - value) / (average * 0.2), 50);
        return Math.max(50 - pctWorse, 0);
      }
    }
  };
  
  // Get percentiles for the key metrics
  const fortyPercentile = getPositionalPercentile(
    "fortyYard", latestMetrics.fortyYard, position, comparisonLevel
  );
  
  const verticalPercentile = getPositionalPercentile(
    "verticalJump", latestMetrics.verticalJump, position, comparisonLevel
  );
  
  const benchPercentile = getPositionalPercentile(
    "benchPress", latestMetrics.benchPress || latestMetrics.benchPressReps, position, comparisonLevel
  );
  
  const shuttlePercentile = getPositionalPercentile(
    "shuttle", latestMetrics.shuttle, position, comparisonLevel
  );
  
  // Calculate overall percentile (average of the four key metrics)
  const overallPercentile = Math.round(
    [fortyPercentile, verticalPercentile, benchPercentile, shuttlePercentile]
      .filter(p => p > 0)
      .reduce((sum, p) => sum + p, 0) / 
    [fortyPercentile, verticalPercentile, benchPercentile, shuttlePercentile]
      .filter(p => p > 0).length || 0
  );
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="h-5 w-5" />
              Position Percentile
            </CardTitle>
            <CardDescription>
              How you compare to other {position} players
            </CardDescription>
          </div>
          <RadioGroup 
            defaultValue={comparisonLevel} 
            onValueChange={setComparisonLevel}
            className="flex gap-2 items-center"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="high-school" id="hs" className="h-3.5 w-3.5" />
              <Label htmlFor="hs" className="text-xs">HS</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="d1" id="d1" className="h-3.5 w-3.5" />
              <Label htmlFor="d1" className="text-xs">D1</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="nfl" id="nfl" className="h-3.5 w-3.5" />
              <Label htmlFor="nfl" className="text-xs">NFL</Label>
            </div>
          </RadioGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Overall Percentile</span>
              <span className="text-sm font-medium">{overallPercentile}%</span>
            </div>
            <Progress value={overallPercentile} className="h-2.5" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">40-Yard Dash</span>
              <span className="text-sm font-medium">{Math.round(fortyPercentile)}%</span>
            </div>
            <Progress value={fortyPercentile} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Vertical Jump</span>
              <span className="text-sm font-medium">{Math.round(verticalPercentile)}%</span>
            </div>
            <Progress value={verticalPercentile} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Bench Press</span>
              <span className="text-sm font-medium">{Math.round(benchPercentile)}%</span>
            </div>
            <Progress value={benchPercentile} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Shuttle</span>
              <span className="text-sm font-medium">{Math.round(shuttlePercentile)}%</span>
            </div>
            <Progress value={shuttlePercentile} className="h-2" />
          </div>
        </div>
        
        <div className="mt-6 text-xs text-muted-foreground">
          <p>
            Percentiles are based on average metrics for {position} players at the {comparisonLevel === "high-school" ? "high school" : comparisonLevel === "d1" ? "Division 1 college" : "NFL"} level. 
            A percentile of 90% means you perform better than 90% of players at that level.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}