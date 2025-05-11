import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BarChart, ChevronRight, LineChart as LineChartIcon, Zap, TrendingUp, TrendingDown, Award, Clock, Scale } from "lucide-react";
import { AreaChart, Area, BarChart as RechartsBarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { CombineMetric } from "@shared/schema";

// D1 benchmarks for comparison
const D1_BENCHMARKS = {
  fortyYard: 4.5,    // seconds
  tenYardSplit: 1.55, // seconds
  shuttle: 4.2,      // seconds
  threeCone: 7.0,    // seconds
  verticalJump: 34,  // inches
  broadJump: 120,    // inches
  benchPress: 225,   // max weight (lbs)
  benchPressReps: 18, // reps at 225 lbs
  squatMax: 400,     // lbs
  powerClean: 250,   // lbs
  deadlift: 450,     // lbs
  pullUps: 15        // reps
};

// Position-specific benchmark modifiers
const POSITION_MODIFIERS: Record<string, Partial<Record<keyof typeof D1_BENCHMARKS, number>>> = {
  "Quarterback (QB)": {
    fortyYard: 4.7,
    benchPressReps: 15
  },
  "Running Back (RB)": {
    fortyYard: 4.5,
    benchPressReps: 20
  },
  "Wide Receiver (WR)": {
    fortyYard: 4.45,
    verticalJump: 36
  },
  "Offensive Line": {
    fortyYard: 5.3,
    benchPressReps: 25,
    squatMax: 450
  },
  "Defensive Line": {
    fortyYard: 4.9,
    benchPressReps: 25,
    squatMax: 450
  },
  "Linebacker (LB)": {
    fortyYard: 4.65,
    benchPressReps: 22
  },
  "Defensive Back": {
    fortyYard: 4.5,
    verticalJump: 36
  }
};

interface PerformanceDashboardProps {
  athleteId?: number;
  className?: string;
}

export function PerformanceDashboard({ athleteId, className }: PerformanceDashboardProps) {
  const { user } = useAuth();
  const id = athleteId || user?.athlete?.id;
  const position = user?.athlete?.position || "Unknown";
  
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<"1m" | "3m" | "6m" | "1y" | "all">("3m");
  
  const { data: metrics, isLoading: isMetricsLoading } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${id}/metrics`],
    enabled: !!id,
  });
  
  // Get the relevant benchmark for user's position
  const getPositionBenchmark = (metric: keyof typeof D1_BENCHMARKS): number => {
    const positionKey = Object.keys(POSITION_MODIFIERS).find(key => 
      position.includes(key.split(" ")[0])
    );
    
    if (positionKey && POSITION_MODIFIERS[positionKey][metric] !== undefined) {
      return POSITION_MODIFIERS[positionKey][metric]!;
    }
    
    return D1_BENCHMARKS[metric];
  };
  
  // Calculate progress percentage for specific metrics
  const calculateProgress = (current: number | null | undefined, benchmark: number, isLowerBetter = true) => {
    if (current === null || current === undefined) return 0;
    
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
  
  // Filter metrics based on selected time frame
  const getFilteredMetrics = () => {
    if (!metrics || metrics.length === 0) return [];
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (selectedTimeFrame) {
      case "1m":
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "3m":
        cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case "6m":
        cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case "1y":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case "all":
      default:
        return metrics;
    }
    
    return metrics.filter(m => new Date(m.dateRecorded) >= cutoffDate);
  };
  
  const filteredMetrics = getFilteredMetrics();
  const latestMetrics = filteredMetrics.length > 0 ? filteredMetrics[0] : null;
  const firstMetrics = filteredMetrics.length > 0 ? filteredMetrics[filteredMetrics.length - 1] : null;
  
  // Calculate improvement percentages between first and latest metrics
  const calculateImprovement = (
    latest: number | null | undefined, 
    first: number | null | undefined, 
    isLowerBetter = true
  ) => {
    if (
      latest === null || 
      latest === undefined || 
      first === null || 
      first === undefined ||
      first === 0
    ) {
      return null;
    }
    
    const percentChange = ((latest - first) / first) * 100;
    
    // If lower is better (like 40-yard), negative percentage means improvement
    return isLowerBetter ? -percentChange : percentChange;
  };
  
  // Prepare data for charts
  const prepareChartData = () => {
    if (!filteredMetrics || filteredMetrics.length === 0) return [];
    
    return [...filteredMetrics]
      .sort((a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime())
      .map(metric => ({
        date: format(new Date(metric.dateRecorded), 'MM/dd/yyyy'),
        fortyYard: metric.fortyYard,
        tenYardSplit: metric.tenYardSplit,
        shuttle: metric.shuttle,
        threeCone: metric.threeCone,
        verticalJump: metric.verticalJump,
        broadJump: metric.broadJump,
        benchPress: metric.benchPress,
        benchPressReps: metric.benchPressReps,
        squatMax: metric.squatMax,
        powerClean: metric.powerClean,
        deadlift: metric.deadlift,
        pullUps: metric.pullUps
      }));
  };
  
  const chartData = prepareChartData();
  
  // Prepare radar data for athletic profile
  const prepareRadarData = () => {
    if (!latestMetrics) return [];
    
    const speedProgress = calculateProgress(latestMetrics.fortyYard, getPositionBenchmark('fortyYard'), true);
    const agilityProgress = calculateProgress(latestMetrics.shuttle, getPositionBenchmark('shuttle'), true);
    const powerProgress = calculateProgress(latestMetrics.verticalJump, getPositionBenchmark('verticalJump'), false);
    const strengthProgress = calculateProgress(latestMetrics.benchPressReps, getPositionBenchmark('benchPressReps'), false);
    const enduranceProgress = calculateProgress(latestMetrics.pullUps, getPositionBenchmark('pullUps'), false);
    
    return [
      {
        attribute: "Speed",
        value: speedProgress,
        fullMark: 100
      },
      {
        attribute: "Agility",
        value: agilityProgress,
        fullMark: 100
      },
      {
        attribute: "Power",
        value: powerProgress,
        fullMark: 100
      },
      {
        attribute: "Strength",
        value: strengthProgress,
        fullMark: 100
      },
      {
        attribute: "Endurance",
        value: enduranceProgress,
        fullMark: 100
      }
    ];
  };
  
  const radarData = prepareRadarData();
  
  // Get percentage improvement for the overview card
  const fortyYardImprovement = calculateImprovement(
    latestMetrics?.fortyYard, 
    firstMetrics?.fortyYard, 
    true
  );
  
  const verticalJumpImprovement = calculateImprovement(
    latestMetrics?.verticalJump, 
    firstMetrics?.verticalJump, 
    false
  );
  
  const strengthImprovement = calculateImprovement(
    latestMetrics?.benchPressReps, 
    firstMetrics?.benchPressReps, 
    false
  );
  
  const renderImprovementBadge = (value: number | null) => {
    if (value === null) return null;
    
    if (value > 0) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <TrendingUp className="h-3 w-3 mr-1" />
          {Math.abs(value).toFixed(1)}%
        </Badge>
      );
    } else if (value < 0) {
      return (
        <Badge className="bg-red-500 hover:bg-red-600">
          <TrendingDown className="h-3 w-3 mr-1" />
          {Math.abs(value).toFixed(1)}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">No change</Badge>
      );
    }
  };
  
  // Loading state
  if (isMetricsLoading) {
    return (
      <div className={className}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-64" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[350px]" />
            <Skeleton className="h-[350px] md:col-span-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[250px]" />
            <Skeleton className="h-[250px]" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground mr-2">Time period:</div>
            <div className="flex border rounded-md overflow-hidden">
              <button 
                className={`px-3 py-1 text-sm ${selectedTimeFrame === "1m" ? "bg-primary text-white" : "hover:bg-muted"}`}
                onClick={() => setSelectedTimeFrame("1m")}
              >
                1M
              </button>
              <button 
                className={`px-3 py-1 text-sm ${selectedTimeFrame === "3m" ? "bg-primary text-white" : "hover:bg-muted"}`}
                onClick={() => setSelectedTimeFrame("3m")}
              >
                3M
              </button>
              <button 
                className={`px-3 py-1 text-sm ${selectedTimeFrame === "6m" ? "bg-primary text-white" : "hover:bg-muted"}`}
                onClick={() => setSelectedTimeFrame("6m")}
              >
                6M
              </button>
              <button 
                className={`px-3 py-1 text-sm ${selectedTimeFrame === "1y" ? "bg-primary text-white" : "hover:bg-muted"}`}
                onClick={() => setSelectedTimeFrame("1y")}
              >
                1Y
              </button>
              <button 
                className={`px-3 py-1 text-sm ${selectedTimeFrame === "all" ? "bg-primary text-white" : "hover:bg-muted"}`}
                onClick={() => setSelectedTimeFrame("all")}
              >
                All
              </button>
            </div>
          </div>
        </div>
        
        {metrics?.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Performance Data</CardTitle>
              <CardDescription>
                Update your combine metrics to see your performance data and insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/stats">
                <Button>
                  Add Metrics <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Athletic Profile Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Athletic Profile
                  </CardTitle>
                  <CardDescription>
                    Overall athletic abilities compared to position benchmarks
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="attribute" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="Performance"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Performance Metrics Trend */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription>
                    Track your improvement over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <Tabs defaultValue="speed" className="h-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="speed">Speed</TabsTrigger>
                      <TabsTrigger value="power">Power</TabsTrigger>
                      <TabsTrigger value="strength">Strength</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="speed" className="h-[calc(100%-2.5rem)]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                          data={chartData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 25,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                          <Line
                            type="monotone"
                            dataKey="fortyYard"
                            name="40-Yard (sec)"
                            stroke="#2563eb"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="shuttle"
                            name="5-10-5 Shuttle (sec)"
                            stroke="#10b981"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="threeCone"
                            name="3-Cone (sec)"
                            stroke="#f59e0b"
                            activeDot={{ r: 8 }}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </TabsContent>
                    
                    <TabsContent value="power" className="h-[calc(100%-2.5rem)]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                          data={chartData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 25,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                          <Line
                            type="monotone"
                            dataKey="verticalJump"
                            name="Vertical Jump (in)"
                            stroke="#8b5cf6"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="broadJump"
                            name="Broad Jump (in)"
                            stroke="#ec4899"
                            activeDot={{ r: 8 }}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </TabsContent>
                    
                    <TabsContent value="strength" className="h-[calc(100%-2.5rem)]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                          data={chartData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 25,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                          <Line
                            type="monotone"
                            dataKey="benchPress"
                            name="Bench Press (lbs)"
                            stroke="#ef4444"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="squatMax"
                            name="Squat Max (lbs)"
                            stroke="#6366f1"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="deadlift"
                            name="Deadlift (lbs)"
                            stroke="#84cc16"
                            activeDot={{ r: 8 }}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Key Performance Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Key Performance
                  </CardTitle>
                  <CardDescription>
                    Your latest metrics and progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">40-Yard Dash</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{latestMetrics?.fortyYard || "N/A"}</span>
                        {fortyYardImprovement !== null && renderImprovementBadge(fortyYardImprovement)}
                      </div>
                    </div>
                    <Progress 
                      value={calculateProgress(
                        latestMetrics?.fortyYard, 
                        getPositionBenchmark('fortyYard'), 
                        true
                      )} 
                      className="h-2" 
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Current</span>
                      <span>Goal: {getPositionBenchmark('fortyYard')}s</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">Vertical Jump</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{latestMetrics?.verticalJump || "N/A"}</span>
                        {verticalJumpImprovement !== null && renderImprovementBadge(verticalJumpImprovement)}
                      </div>
                    </div>
                    <Progress 
                      value={calculateProgress(
                        latestMetrics?.verticalJump, 
                        getPositionBenchmark('verticalJump'), 
                        false
                      )} 
                      className="h-2" 
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Current</span>
                      <span>Goal: {getPositionBenchmark('verticalJump')}"</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <Scale className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">Bench Press Reps</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{latestMetrics?.benchPressReps || "N/A"}</span>
                        {strengthImprovement !== null && renderImprovementBadge(strengthImprovement)}
                      </div>
                    </div>
                    <Progress 
                      value={calculateProgress(
                        latestMetrics?.benchPressReps, 
                        getPositionBenchmark('benchPressReps'), 
                        false
                      )} 
                      className="h-2" 
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Current</span>
                      <span>Goal: {getPositionBenchmark('benchPressReps')} reps</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Strength Distribution */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Strength Metrics
                  </CardTitle>
                  <CardDescription>
                    Comparison of your strength metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[230px]">
                  {latestMetrics && (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={[
                          {
                            name: 'Bench Press',
                            current: latestMetrics.benchPress || 0,
                            goal: getPositionBenchmark('benchPress')
                          },
                          {
                            name: 'Squat Max',
                            current: latestMetrics.squatMax || 0,
                            goal: getPositionBenchmark('squatMax')
                          },
                          {
                            name: 'Power Clean',
                            current: latestMetrics.powerClean || 0,
                            goal: getPositionBenchmark('powerClean')
                          },
                          {
                            name: 'Deadlift',
                            current: latestMetrics.deadlift || 0,
                            goal: getPositionBenchmark('deadlift')
                          }
                        ]}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 25,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                        <Bar dataKey="current" name="Current (lbs)" fill="hsl(var(--primary))" />
                        <Bar dataKey="goal" name="Position Goal (lbs)" fill="#d1d5db" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
        
        <div className="flex justify-end">
          <Link href="/stats">
            <Button variant="outline">
              Update Metrics <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}