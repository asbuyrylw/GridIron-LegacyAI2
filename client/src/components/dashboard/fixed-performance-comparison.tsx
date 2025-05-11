import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, BarChart as BarChartIcon, Users } from "lucide-react";
import { ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Cell } from "recharts";
import { CombineMetric } from "@shared/schema";

// D1, D2, D3 benchmarks by position
type PositionBenchmarks = {
  [key: string]: {
    [division: string]: {
      fortyYard: number;
      tenYardSplit: number;
      shuttle: number;
      threeCone: number;
      verticalJump: number;
      broadJump: number;
      benchPressReps: number;
      squatMax: number;
    }
  }
};

const POSITION_BENCHMARKS: PositionBenchmarks = {
  "Quarterback (QB)": {
    "D1": { fortyYard: 4.7, tenYardSplit: 1.62, shuttle: 4.2, threeCone: 7.0, verticalJump: 32, broadJump: 112, benchPressReps: 15, squatMax: 380 },
    "D2": { fortyYard: 4.8, tenYardSplit: 1.67, shuttle: 4.3, threeCone: 7.2, verticalJump: 30, broadJump: 108, benchPressReps: 12, squatMax: 360 },
    "D3": { fortyYard: 4.9, tenYardSplit: 1.72, shuttle: 4.4, threeCone: 7.4, verticalJump: 28, broadJump: 104, benchPressReps: 10, squatMax: 340 }
  },
  "Running Back (RB)": {
    "D1": { fortyYard: 4.5, tenYardSplit: 1.55, shuttle: 4.1, threeCone: 6.9, verticalJump: 36, broadJump: 118, benchPressReps: 20, squatMax: 450 },
    "D2": { fortyYard: 4.6, tenYardSplit: 1.60, shuttle: 4.2, threeCone: 7.0, verticalJump: 34, broadJump: 115, benchPressReps: 18, squatMax: 425 },
    "D3": { fortyYard: 4.7, tenYardSplit: 1.65, shuttle: 4.3, threeCone: 7.2, verticalJump: 32, broadJump: 110, benchPressReps: 15, squatMax: 400 }
  },
  "Wide Receiver (WR)": {
    "D1": { fortyYard: 4.5, tenYardSplit: 1.53, shuttle: 4.1, threeCone: 6.8, verticalJump: 36, broadJump: 120, benchPressReps: 15, squatMax: 400 },
    "D2": { fortyYard: 4.6, tenYardSplit: 1.57, shuttle: 4.2, threeCone: 7.0, verticalJump: 34, broadJump: 116, benchPressReps: 12, squatMax: 380 },
    "D3": { fortyYard: 4.7, tenYardSplit: 1.62, shuttle: 4.3, threeCone: 7.2, verticalJump: 32, broadJump: 112, benchPressReps: 10, squatMax: 360 }
  },
  "Tight End (TE)": {
    "D1": { fortyYard: 4.7, tenYardSplit: 1.65, shuttle: 4.3, threeCone: 7.1, verticalJump: 34, broadJump: 116, benchPressReps: 22, squatMax: 460 },
    "D2": { fortyYard: 4.8, tenYardSplit: 1.70, shuttle: 4.4, threeCone: 7.3, verticalJump: 32, broadJump: 112, benchPressReps: 18, squatMax: 430 },
    "D3": { fortyYard: 4.9, tenYardSplit: 1.75, shuttle: 4.5, threeCone: 7.5, verticalJump: 30, broadJump: 108, benchPressReps: 15, squatMax: 400 }
  },
  "Offensive Line": {
    "D1": { fortyYard: 5.2, tenYardSplit: 1.80, shuttle: 4.6, threeCone: 7.7, verticalJump: 28, broadJump: 102, benchPressReps: 30, squatMax: 500 },
    "D2": { fortyYard: 5.3, tenYardSplit: 1.85, shuttle: 4.7, threeCone: 7.9, verticalJump: 26, broadJump: 98, benchPressReps: 25, squatMax: 470 },
    "D3": { fortyYard: 5.4, tenYardSplit: 1.90, shuttle: 4.8, threeCone: 8.1, verticalJump: 24, broadJump: 94, benchPressReps: 22, squatMax: 440 }
  },
  "Defensive Line": {
    "D1": { fortyYard: 4.9, tenYardSplit: 1.70, shuttle: 4.5, threeCone: 7.5, verticalJump: 32, broadJump: 110, benchPressReps: 30, squatMax: 500 },
    "D2": { fortyYard: 5.0, tenYardSplit: 1.75, shuttle: 4.6, threeCone: 7.7, verticalJump: 30, broadJump: 106, benchPressReps: 25, squatMax: 470 },
    "D3": { fortyYard: 5.1, tenYardSplit: 1.80, shuttle: 4.7, threeCone: 7.9, verticalJump: 28, broadJump: 102, benchPressReps: 22, squatMax: 440 }
  },
  "Linebacker (LB)": {
    "D1": { fortyYard: 4.65, tenYardSplit: 1.60, shuttle: 4.2, threeCone: 7.0, verticalJump: 34, broadJump: 115, benchPressReps: 25, squatMax: 460 },
    "D2": { fortyYard: 4.75, tenYardSplit: 1.65, shuttle: 4.3, threeCone: 7.2, verticalJump: 32, broadJump: 112, benchPressReps: 20, squatMax: 430 },
    "D3": { fortyYard: 4.85, tenYardSplit: 1.70, shuttle: 4.4, threeCone: 7.4, verticalJump: 30, broadJump: 108, benchPressReps: 18, squatMax: 400 }
  },
  "Defensive Back": {
    "D1": { fortyYard: 4.5, tenYardSplit: 1.55, shuttle: 4.1, threeCone: 6.8, verticalJump: 36, broadJump: 120, benchPressReps: 15, squatMax: 400 },
    "D2": { fortyYard: 4.6, tenYardSplit: 1.60, shuttle: 4.2, threeCone: 7.0, verticalJump: 34, broadJump: 116, benchPressReps: 12, squatMax: 380 },
    "D3": { fortyYard: 4.7, tenYardSplit: 1.65, shuttle: 4.3, threeCone: 7.2, verticalJump: 32, broadJump: 112, benchPressReps: 10, squatMax: 360 }
  }
};

// Default position group if user position is not matched
const DEFAULT_POSITION = "Wide Receiver (WR)";

interface PerformanceComparisonProps {
  athleteId?: number;
  className?: string;
}

export function PerformanceComparison({ athleteId, className }: PerformanceComparisonProps) {
  const { user } = useAuth();
  const id = athleteId || user?.athlete?.id;
  const position = user?.athlete?.position || "Unknown";
  
  const [selectedDivision, setSelectedDivision] = useState<"D1" | "D2" | "D3">("D1");
  const [selectedMetric, setSelectedMetric] = useState<keyof PositionBenchmarks[string][string]>("fortyYard");
  
  // Get athelete metrics
  const { data: metrics, isLoading } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${id}/metrics`],
    enabled: !!id,
  });
  
  const latestMetrics = metrics && metrics.length > 0 ? metrics[0] : null;
  
  // Determine position group
  const getPositionGroup = (): string => {
    if (!position) return DEFAULT_POSITION;
    
    // Map position to benchmark categories
    const positionMappings: Record<string, string> = {
      "Quarterback": "Quarterback (QB)",
      "Running Back": "Running Back (RB)",
      "Wide Receiver": "Wide Receiver (WR)",
      "Tight End": "Tight End (TE)",
      "Offensive Tackle": "Offensive Line",
      "Offensive Guard": "Offensive Line",
      "Center": "Offensive Line",
      "Defensive Tackle": "Defensive Line",
      "Defensive End": "Defensive Line",
      "Linebacker": "Linebacker (LB)",
      "Cornerback": "Defensive Back",
      "Safety": "Defensive Back"
    };
    
    // Find matching position key
    for (const [key, value] of Object.entries(positionMappings)) {
      if (position.includes(key)) {
        return value;
      }
    }
    
    return DEFAULT_POSITION;
  };
  
  const positionGroup = getPositionGroup();
  
  // Get benchmarks for selected division and position
  const getBenchmark = (
    metric: keyof PositionBenchmarks[string][string],
    division: "D1" | "D2" | "D3" = selectedDivision
  ): number => {
    return POSITION_BENCHMARKS[positionGroup]?.[division]?.[metric] || 0;
  };
  
  // Calculate percentage compared to benchmark
  const calculatePercentage = (
    current: number | null | undefined,
    benchmark: number,
    isLowerBetter = true
  ): number => {
    if (current === null || current === undefined || benchmark === 0) return 0;
    
    if (isLowerBetter) {
      // For metrics where lower is better (like 40-yard dash)
      if (current <= benchmark) return 100;
      // Cap at 150% of benchmark (50% slower)
      const maxValue = benchmark * 1.5;
      if (current >= maxValue) return 0;
      return Math.round(100 - ((current - benchmark) / (maxValue - benchmark)) * 100);
    } else {
      // For metrics where higher is better
      if (current >= benchmark) return 100;
      // Bottom threshold at 50% of benchmark
      const minValue = benchmark * 0.5;
      if (current <= minValue) return 0;
      return Math.round(((current - minValue) / (benchmark - minValue)) * 100);
    }
  };
  
  // Prepare data for the comparison chart
  const prepareComparisonData = () => {
    if (!latestMetrics) return [];
    
    const isLowerBetter = (metric: string): boolean => {
      return ['fortyYard', 'tenYardSplit', 'shuttle', 'threeCone'].includes(metric);
    };
    
    // Calculate for all divisions
    const d1Benchmark = getBenchmark(selectedMetric, "D1");
    const d2Benchmark = getBenchmark(selectedMetric, "D2");
    const d3Benchmark = getBenchmark(selectedMetric, "D3");
    
    // Get current athlete value for selected metric
    const currentValue = latestMetrics[selectedMetric as keyof CombineMetric] as number | undefined;
    
    // Prepare comparison data
    const data = [
      {
        name: "Your Metric",
        value: currentValue || 0,
        color: "#3b82f6" // Blue
      },
      {
        name: "D1 Benchmark",
        value: d1Benchmark,
        color: "#10b981" // Green
      },
      {
        name: "D2 Benchmark",
        value: d2Benchmark,
        color: "#f59e0b" // Amber
      },
      {
        name: "D3 Benchmark",
        value: d3Benchmark,
        color: "#6366f1" // Indigo
      }
    ];
    
    // If lower is better (like 40-yard dash), we need to invert the chart
    // So smaller values appear as better performance
    if (isLowerBetter(selectedMetric)) {
      // Find the highest value to normalize
      const maxValue = Math.max(...data.map(d => d.value)) * 1.1; // Add 10% for visual padding
      
      // Invert the values
      return data.map(item => ({
        ...item,
        // For display, keep the original value
        displayValue: item.value,
        // For the chart, invert so smaller values appear higher
        value: maxValue - item.value
      }));
    }
    
    return data;
  };
  
  const comparisonData = prepareComparisonData();
  
  // Group metrics for radar chart by category
  const metricGroups = {
    "Speed & Agility": [
      { key: "fortyYard", label: "40-Yard Dash (sec)", isLowerBetter: true },
      { key: "tenYardSplit", label: "10-Yard Split (sec)", isLowerBetter: true },
      { key: "shuttle", label: "5-10-5 Shuttle (sec)", isLowerBetter: true },
      { key: "threeCone", label: "3-Cone Drill (sec)", isLowerBetter: true }
    ],
    "Power & Explosiveness": [
      { key: "verticalJump", label: "Vertical Jump (in)", isLowerBetter: false },
      { key: "broadJump", label: "Broad Jump (in)", isLowerBetter: false }
    ],
    "Strength": [
      { key: "benchPressReps", label: "Bench Press Reps", isLowerBetter: false },
      { key: "squatMax", label: "Squat Max (lbs)", isLowerBetter: false }
    ]
  };
  
  // Find the group that contains the selected metric
  const findMetricGroup = (): string => {
    for (const [group, metrics] of Object.entries(metricGroups)) {
      if (metrics.some(m => m.key === selectedMetric)) {
        return group;
      }
    }
    return "Speed & Agility"; // Default
  };
  
  const currentMetricGroup = findMetricGroup();
  
  // Get metric details (label and isLowerBetter)
  const getCurrentMetricDetails = () => {
    for (const metrics of Object.values(metricGroups)) {
      const found = metrics.find(m => m.key === selectedMetric);
      if (found) return found;
    }
    return { key: selectedMetric, label: selectedMetric, isLowerBetter: true };
  };
  
  const currentMetricDetails = getCurrentMetricDetails();
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-10 w-1/3" />
            </div>
            <Skeleton className="h-[250px] w-full" />
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
            <BarChartIcon className="h-5 w-5" />
            Collegiate Comparison
          </CardTitle>
          <CardDescription>
            Compare your metrics to division benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No metrics available</h3>
            <p className="text-muted-foreground mb-4">
              Add your performance metrics to compare with collegiate benchmarks.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChartIcon className="h-5 w-5" />
          Collegiate Comparison
        </CardTitle>
        <CardDescription>
          Compare your performance with {selectedDivision} {positionGroup} benchmarks
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="division-select" className="mb-2 block">Division Target</Label>
              <Select
                value={selectedDivision}
                onValueChange={(value) => setSelectedDivision(value as "D1" | "D2" | "D3")}
              >
                <SelectTrigger id="division-select">
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="D1">Division 1</SelectItem>
                  <SelectItem value="D2">Division 2</SelectItem>
                  <SelectItem value="D3">Division 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="metric-select" className="mb-2 block">Performance Metric</Label>
              <Select
                value={selectedMetric}
                onValueChange={(value) => setSelectedMetric(value as keyof PositionBenchmarks[string][string])}
              >
                <SelectTrigger id="metric-select">
                  <SelectValue placeholder="Select Metric" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(metricGroups).map(([group, metrics]) => (
                    <div key={group}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {group}
                      </div>
                      {metrics.map(metric => (
                        <SelectItem key={metric.key} value={metric.key}>
                          {metric.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Metric visualization */}
          <Tabs defaultValue="chart">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="progress">Progress View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={comparisonData}
                    margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        // Display the original value if it exists
                        if (props.payload.displayValue !== undefined) {
                          return [props.payload.displayValue, name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" name={currentMetricDetails.label}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="progress">
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-medium">{currentMetricDetails.label}</h4>
                      <div className="text-sm text-muted-foreground">
                        Comparing against {selectedDivision} standard
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">
                        {latestMetrics && latestMetrics[selectedMetric as keyof CombineMetric] !== undefined
                          ? String(latestMetrics[selectedMetric as keyof CombineMetric])
                          : "N/A"}
                      </span>
                      <div className="text-sm text-muted-foreground">Your value</div>
                    </div>
                  </div>
                  <Progress 
                    value={calculatePercentage(
                      latestMetrics ? latestMetrics[selectedMetric as keyof CombineMetric] as number : undefined,
                      getBenchmark(selectedMetric, "D1"),
                      currentMetricDetails.isLowerBetter
                    )} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>0%</span>
                    <span>D1 Standard: {String(getBenchmark(selectedMetric, "D1"))}</span>
                    <span>100%</span>
                  </div>
                </div>
              
                <div>
                  <RadioGroup 
                    defaultValue="D1" 
                    className="grid grid-cols-3"
                    value={selectedDivision}
                    onValueChange={(value) => setSelectedDivision(value as "D1" | "D2" | "D3")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="D1" id="D1" />
                      <Label htmlFor="D1">Division 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="D2" id="D2" />
                      <Label htmlFor="D2">Division 2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="D3" id="D3" />
                      <Label htmlFor="D3">Division 3</Label>
                    </div>
                  </RadioGroup>
                </div>
              
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{currentMetricGroup} Metrics</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comparison with {selectedDivision} standards for {positionGroup}
                  </p>
                  
                  {metricGroups[currentMetricGroup].map(metric => (
                    <div 
                      key={metric.key}
                      className={`p-3 rounded-lg border ${selectedMetric === metric.key ? 'bg-muted border-primary' : ''} mb-2 cursor-pointer`}
                      onClick={() => setSelectedMetric(metric.key as keyof PositionBenchmarks[string][string])}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{metric.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {metric.isLowerBetter ? 'Lower is better' : 'Higher is better'}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">
                            {latestMetrics && latestMetrics[metric.key as keyof CombineMetric] !== undefined
                              ? String(latestMetrics[metric.key as keyof CombineMetric])
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}