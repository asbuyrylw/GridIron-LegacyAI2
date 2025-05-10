import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { CombineMetric } from "@shared/schema";
import { format, subMonths } from "date-fns";
import { Loader2, TrendingUp } from "lucide-react";

interface PerformanceTrendsProps {
  className?: string;
  athleteId?: number;
}

export function PerformanceTrends({ className, athleteId }: PerformanceTrendsProps) {
  const { user } = useAuth();
  const id = athleteId || user?.athlete?.id;
  
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
            <TrendingUp className="h-5 w-5" />
            Performance Trends
          </CardTitle>
          <CardDescription>
            Track your progress over time with detailed performance analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">
              No performance data available. Update your combine metrics to see trends.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Prepare data for charts
  const chartData = [...metrics]
    .sort((a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime())
    .map(metric => ({
      date: format(new Date(metric.dateRecorded), 'MM/dd/yy'),
      fortyYard: metric.fortyYard,
      tenYardSplit: metric.tenYardSplit,
      shuttle: metric.shuttle,
      threeCone: metric.threeCone,
      verticalJump: metric.verticalJump,
      broadJump: metric.broadJump,
      benchPress: metric.benchPressReps || metric.benchPress,
      squatMax: metric.squatMax,
      deadlift: metric.deadlift,
      powerClean: metric.powerClean,
      pullUps: metric.pullUps,
      timestamp: new Date(metric.dateRecorded).getTime()
    }));
  
  // Latest metrics
  const latestMetrics = chartData[chartData.length - 1];
  
  // D1 benchmarks for football
  const D1_BENCHMARKS = {
    fortyYard: 4.5,       // seconds (lower is better)
    tenYardSplit: 1.5,    // seconds (lower is better)
    shuttle: 4.2,         // seconds (lower is better)
    threeCone: 7.0,       // seconds (lower is better)
    verticalJump: 34,     // inches (higher is better)
    broadJump: 120,       // inches (higher is better)
    benchPress: 18,       // reps at 225 (higher is better)
    squatMax: 400,        // pounds (higher is better)
    deadlift: 500,        // pounds (higher is better)
    powerClean: 275,      // pounds (higher is better)
    pullUps: 12           // reps (higher is better)
  };
  
  // Calculate percentage of D1 benchmark
  const calculateBenchmarkPercentage = (value: number | undefined | null, benchmark: number, isLowerBetter = false) => {
    if (value === undefined || value === null) return 0;
    
    if (isLowerBetter) {
      // For metrics where lower is better (like 40-yard dash)
      if (value <= benchmark) return 100; // Already at or better than D1 level
      
      const maxValue = benchmark * 1.5; // 50% slower is 0% of benchmark
      if (value >= maxValue) return 0;
      
      return Math.round(100 - ((value - benchmark) / (maxValue - benchmark)) * 100);
    } else {
      // For metrics where higher is better (like bench press)
      if (value >= benchmark) return 100; // Already at or better than D1 level
      
      const minValue = benchmark * 0.5; // 50% of benchmark is 0%
      if (value <= minValue) return 0;
      
      return Math.round(((value - minValue) / (benchmark - minValue)) * 100);
    }
  };
  
  // Radar chart data
  const radarData = [
    {
      category: "Speed",
      metric: "40-Yard",
      value: calculateBenchmarkPercentage(
        latestMetrics?.fortyYard !== undefined ? latestMetrics.fortyYard : null, 
        D1_BENCHMARKS.fortyYard, 
        true
      ),
      fullMark: 100
    },
    {
      category: "Agility",
      metric: "Shuttle",
      value: calculateBenchmarkPercentage(
        latestMetrics?.shuttle !== undefined ? latestMetrics.shuttle : null, 
        D1_BENCHMARKS.shuttle, 
        true
      ),
      fullMark: 100
    },
    {
      category: "Power",
      metric: "Vertical",
      value: calculateBenchmarkPercentage(
        latestMetrics?.verticalJump !== undefined ? latestMetrics.verticalJump : null, 
        D1_BENCHMARKS.verticalJump, 
        false
      ),
      fullMark: 100
    },
    {
      category: "Strength",
      metric: "Bench",
      value: calculateBenchmarkPercentage(
        latestMetrics?.benchPress !== undefined ? latestMetrics.benchPress : null, 
        D1_BENCHMARKS.benchPress, 
        false
      ),
      fullMark: 100
    },
    {
      category: "Endurance",
      metric: "Pull-Ups",
      value: calculateBenchmarkPercentage(
        latestMetrics?.pullUps !== undefined ? latestMetrics.pullUps : null, 
        D1_BENCHMARKS.pullUps, 
        false
      ),
      fullMark: 100
    }
  ];
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Trends
        </CardTitle>
        <CardDescription>
          Track your progress over time with detailed performance analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="speed">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="speed">Speed & Agility</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
            <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="speed">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
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
                    name="Shuttle (sec)" 
                    stroke="#7c3aed" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="threeCone" 
                    name="3-Cone (sec)" 
                    stroke="#10b981" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg bg-primary/5 p-4">
                <h4 className="font-semibold text-sm">40-Yard Dash Avg Improvement</h4>
                <p className="text-2xl font-bold mt-1">
                  {chartData.length > 1 ? 
                    (Math.abs(
                      (chartData[0].fortyYard || 0) - 
                      (chartData[chartData.length - 1].fortyYard || 0)
                    ) / chartData.length).toFixed(2) : 
                    '0.00'
                  } sec
                </p>
              </div>
              
              <div className="rounded-lg bg-primary/5 p-4">
                <h4 className="font-semibold text-sm">Current vs D1 Benchmark</h4>
                <p className="text-2xl font-bold mt-1">
                  {latestMetrics?.fortyYard ? `${calculateBenchmarkPercentage(
                    latestMetrics.fortyYard, 
                    D1_BENCHMARKS.fortyYard, 
                    true
                  )}%` : 'N/A'}
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="strength">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="benchPress" 
                    name="Bench Press (reps)" 
                    fill="#2563eb" 
                  />
                  <Bar 
                    dataKey="squatMax" 
                    name="Squat (lbs)" 
                    fill="#7c3aed" 
                  />
                  <Bar 
                    dataKey="deadlift" 
                    name="Deadlift (lbs)" 
                    fill="#10b981" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg bg-primary/5 p-4">
                <h4 className="font-semibold text-sm">Bench Press Improvement</h4>
                <p className="text-2xl font-bold mt-1">
                  {chartData.length > 1 ? 
                    Math.max(0, ((chartData[chartData.length - 1].benchPress || 0) - 
                    (chartData[0].benchPress || 0))) : 
                    '0'
                  } reps
                </p>
              </div>
              
              <div className="rounded-lg bg-primary/5 p-4">
                <h4 className="font-semibold text-sm">Strength vs D1 Benchmark</h4>
                <p className="text-2xl font-bold mt-1">
                  {latestMetrics?.benchPress ? `${calculateBenchmarkPercentage(
                    latestMetrics.benchPress, 
                    D1_BENCHMARKS.benchPress, 
                    false
                  )}%` : 'N/A'}
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="overview">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} width={730} height={250} data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Current Level"
                    dataKey="value"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                This radar chart shows your current performance level compared to D1 benchmarks across
                different performance categories. 100% means you've reached or exceeded the Division 1 
                benchmark for that category.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}