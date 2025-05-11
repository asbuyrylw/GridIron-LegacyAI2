import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CombineMetric } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { BarChart2, TrendingUp, Clock, CheckCircle2, List, Dumbbell, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Training focus options for athletes to choose from
const TRAINING_FOCUS_OPTIONS = [
  { id: "speed", label: "Speed" },
  { id: "strength", label: "Strength" },
  { id: "agility", label: "Agility" },
  { id: "power", label: "Power" },
  { id: "endurance", label: "Endurance" },
  { id: "technique", label: "Technique" },
  { id: "injuryPrevention", label: "Injury Prevention" },
  { id: "positionSkills", label: "Position Skills" }
];

// Timeframe options
const TIMEFRAME_OPTIONS = [
  { id: "short", label: "1 Month" },
  { id: "medium", label: "3 Months" },
  { id: "long", label: "6 Months" }
];

// Experience level options
const EXPERIENCE_OPTIONS = [
  { id: "1", label: "0-1 year" },
  { id: "2", label: "1-2 years" },
  { id: "3", label: "3-4 years" },
  { id: "5", label: "5+ years" }
];

interface GrowthPredictionsProps {
  currentMetrics: CombineMetric;
  onClose?: () => void;
}

export function GrowthPredictions({ currentMetrics, onClose }: GrowthPredictionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  
  const [trainingFocus, setTrainingFocus] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState<"short" | "medium" | "long">("medium");
  const [experience, setExperience] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("metrics");
  
  const [predictions, setPredictions] = useState<{
    predictedMetrics: Partial<CombineMetric>;
    recommendations: string[];
    potentialAreas: string[];
    timeline: {
      shortTerm: string[];
      mediumTerm: string[];
      longTerm: string[];
    };
  } | null>(null);
  
  // Handle training focus selection
  const toggleTrainingFocus = (id: string) => {
    if (trainingFocus.includes(id)) {
      setTrainingFocus(trainingFocus.filter(focus => focus !== id));
    } else {
      // Limit to 3 focus areas
      if (trainingFocus.length < 3) {
        setTrainingFocus([...trainingFocus, id]);
      } else {
        toast({
          title: "Maximum Focus Areas",
          description: "You can select up to 3 focus areas for best results",
          variant: "destructive"
        });
      }
    }
  };
  
  // Use mutation to generate predictions
  const predictionMutation = useMutation({
    mutationFn: async () => {
      if (!athleteId) throw new Error("Athlete ID is required");
      
      const res = await apiRequest(
        "POST",
        `/api/athlete/${athleteId}/performance/predictions`,
        { trainingFocus, timeframe, experience }
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to generate predictions");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      setPredictions(data);
      setActiveTab("metrics");
      
      toast({
        title: "Predictions Generated",
        description: "Your personalized growth predictions are ready",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Prediction Failed",
        description: error.message || "Failed to generate predictions. Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  // Handle generate predictions
  const handleGeneratePredictions = () => {
    if (trainingFocus.length === 0) {
      toast({
        title: "No Focus Areas Selected",
        description: "Please select at least one training focus area",
        variant: "destructive"
      });
      return;
    }
    
    predictionMutation.mutate();
  };
  
  // Format metrics for display
  const formatMetricsTableData = () => {
    if (!predictions || !predictions.predictedMetrics) return [];
    
    const metricsToDisplay = [
      { key: "fortyYard", label: "40-yard dash (s)", isSpeed: true },
      { key: "tenYardSplit", label: "10-yard split (s)", isSpeed: true },
      { key: "shuttle", label: "Shuttle (s)", isSpeed: true },
      { key: "threeCone", label: "3-Cone (s)", isSpeed: true },
      { key: "verticalJump", label: "Vertical Jump (in)", isSpeed: false },
      { key: "broadJump", label: "Broad Jump (in)", isSpeed: false },
      { key: "benchPress", label: "Bench Press (lbs)", isSpeed: false },
      { key: "benchPressReps", label: "Bench Press Reps", isSpeed: false },
      { key: "squatMax", label: "Squat Max (lbs)", isSpeed: false },
      { key: "powerClean", label: "Power Clean (lbs)", isSpeed: false },
      { key: "deadlift", label: "Deadlift (lbs)", isSpeed: false }
    ];
    
    return metricsToDisplay
      .filter(metric => 
        currentMetrics[metric.key as keyof CombineMetric] !== null && 
        predictions.predictedMetrics[metric.key as keyof CombineMetric] !== undefined
      )
      .map(metric => {
        const currentValue = currentMetrics[metric.key as keyof CombineMetric];
        const predictedValue = predictions.predictedMetrics[metric.key as keyof CombineMetric];
        
        if (currentValue === null || predictedValue === undefined) {
          return null;
        }
        
        const improvement = 
          metric.isSpeed
            ? Number(currentValue) - Number(predictedValue) // For speed metrics, lower is better
            : Number(predictedValue) - Number(currentValue); // For other metrics, higher is better
        
        const improvementPercent = 
          (Math.abs(improvement) / Number(currentValue)) * 100;
        
        return {
          metric: metric.label,
          current: Number(currentValue).toFixed(metric.key.includes("Yard") || metric.key.includes("split") ? 2 : 0),
          predicted: Number(predictedValue).toFixed(metric.key.includes("Yard") || metric.key.includes("split") ? 2 : 0),
          improvement: improvement.toFixed(metric.key.includes("Yard") || metric.key.includes("split") ? 2 : 0),
          percent: improvementPercent.toFixed(1) + "%",
          isPositive: improvement > 0
        };
      })
      .filter(Boolean);
  };
  
  // Format metrics for chart
  const formatMetricsChartData = () => {
    if (!predictions || !predictions.predictedMetrics) return [];
    
    const metricsTable = formatMetricsTableData();
    if (!metricsTable.length) return [];
    
    // Just return the top 5 metrics with the biggest improvement percentage
    return metricsTable
      .sort((a, b) => {
        if (!a || !b) return 0;
        return parseFloat(b.percent) - parseFloat(a.percent);
      })
      .slice(0, 5)
      .map(item => {
        if (!item) return null;
        return {
          name: item.metric.split(" ")[0], // Just first word of metric name for chart
          Current: parseFloat(item.current),
          Predicted: parseFloat(item.predicted),
          metric: item.metric,
          isSpeed: item.metric.includes("dash") || item.metric.includes("Shuttle") || item.metric.includes("Cone") || item.metric.includes("split")
        };
      })
      .filter(Boolean) as any[];
  };
  
  const metricsTableData = predictions ? formatMetricsTableData() : [];
  const metricsChartData = predictions ? formatMetricsChartData() : [];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Performance Growth Predictions
        </CardTitle>
        <CardDescription>
          AI-powered projection of your athletic improvements based on your training focus
        </CardDescription>
      </CardHeader>
      
      {!predictions ? (
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Select Training Focus (up to 3)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {TRAINING_FOCUS_OPTIONS.map((focus) => (
                  <div key={focus.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`focus-${focus.id}`} 
                      checked={trainingFocus.includes(focus.id)}
                      onCheckedChange={() => toggleTrainingFocus(focus.id)}
                    />
                    <Label
                      htmlFor={`focus-${focus.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {focus.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeframe">Prediction Timeframe</Label>
                <Select 
                  value={timeframe} 
                  onValueChange={value => setTimeframe(value as any)}
                >
                  <SelectTrigger id="timeframe">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEFRAME_OPTIONS.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Football Experience</Label>
                <Select 
                  value={experience || ""} 
                  onValueChange={setExperience}
                >
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_OPTIONS.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="metrics">
                <BarChart2 className="h-4 w-4 mr-2" />
                Metrics
              </TabsTrigger>
              <TabsTrigger value="recommendations">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Clock className="h-4 w-4 mr-2" />
                Timeline
              </TabsTrigger>
            </TabsList>
            
            <div className="p-4">
              <TabsContent value="metrics" className="space-y-4 mt-0">
                {metricsTableData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={metricsChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.3} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            const isSpeedMetric = props.payload.isSpeed;
                            const formattedValue = isSpeedMetric ? 
                              `${value}s` : 
                              (props.payload.metric.includes("lbs") ? `${value} lbs` : value);
                            return [formattedValue, name];
                          }}
                          labelFormatter={(value) => metricsChartData[value].metric}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="Current" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Predicted" 
                          stroke="#82ca9d" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    
                    <Separator />
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Current</TableHead>
                          <TableHead>Predicted</TableHead>
                          <TableHead className="text-right">Improvement</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metricsTableData.map((item, index) => {
                          if (!item) return null;
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.metric}</TableCell>
                              <TableCell>{item.current}</TableCell>
                              <TableCell>{item.predicted}</TableCell>
                              <TableCell className="text-right">
                                <span className={item.isPositive ? "text-green-600" : "text-red-600"}>
                                  {item.improvement} ({item.percent})
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <BarChart2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No metric predictions available</p>
                  </div>
                )}
                
                {predictions.potentialAreas && predictions.potentialAreas.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Areas with Highest Growth Potential
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {predictions.potentialAreas.map((area, index) => (
                        <Badge key={index} variant="secondary">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4 mt-0">
                {predictions.recommendations && predictions.recommendations.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Training Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {predictions.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <List className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No recommendations available</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="timeline" className="space-y-4 mt-0">
                {(predictions.timeline?.shortTerm?.length > 0 || 
                   predictions.timeline?.mediumTerm?.length > 0 || 
                   predictions.timeline?.longTerm?.length > 0) ? (
                  <div className="space-y-4">
                    {predictions.timeline.shortTerm && predictions.timeline.shortTerm.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-800 dark:text-blue-300 mr-2">
                            <span className="text-xs">1M</span>
                          </div>
                          Short-term Goals (1 Month)
                        </h3>
                        <ul className="space-y-2">
                          {predictions.timeline.shortTerm.map((goal, index) => (
                            <li key={index} className="flex items-start gap-2 p-2 rounded bg-blue-50 dark:bg-blue-950">
                              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {predictions.timeline.mediumTerm && predictions.timeline.mediumTerm.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <div className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-800 dark:text-purple-300 mr-2">
                            <span className="text-xs">3M</span>
                          </div>
                          Medium-term Goals (3 Months)
                        </h3>
                        <ul className="space-y-2">
                          {predictions.timeline.mediumTerm.map((goal, index) => (
                            <li key={index} className="flex items-start gap-2 p-2 rounded bg-purple-50 dark:bg-purple-950">
                              <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {predictions.timeline.longTerm && predictions.timeline.longTerm.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-800 dark:text-green-300 mr-2">
                            <span className="text-xs">6M</span>
                          </div>
                          Long-term Goals (6 Months)
                        </h3>
                        <ul className="space-y-2">
                          {predictions.timeline.longTerm.map((goal, index) => (
                            <li key={index} className="flex items-start gap-2 p-2 rounded bg-green-50 dark:bg-green-950">
                              <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No timeline goals available</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      )}
      
      <CardFooter className="flex justify-between border-t pt-4">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
        
        {!predictions ? (
          <Button 
            onClick={handleGeneratePredictions} 
            className={onClose ? "" : "w-full"}
            disabled={predictionMutation.isPending}
          >
            {predictionMutation.isPending ? (
              <>
                <Dumbbell className="h-4 w-4 mr-2 animate-spin" />
                Generating Predictions...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Predictions
              </>
            )}
          </Button>
        ) : (
          <Button 
            variant="default" 
            onClick={() => {
              setPredictions(null);
              setTrainingFocus([]);
            }}
          >
            <Dumbbell className="h-4 w-4 mr-2" />
            Generate New Prediction
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Placeholder component when metrics aren't available
export function GrowthPredictionsPlaceholder() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Performance Growth Predictions
        </CardTitle>
        <CardDescription>
          Record your combine metrics to unlock AI-powered performance predictions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        <div className="py-6 flex flex-col items-center justify-center">
          <Skeleton className="h-[100px] w-[80%] mb-4" />
          <div className="space-y-2 text-center max-w-md">
            <h3 className="font-medium">No Metrics Available</h3>
            <p className="text-sm text-muted-foreground">
              Record your combine metrics like 40-yard dash, vertical jump, and strength data
              to unlock personalized growth predictions.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button className="w-full" disabled>
          <TrendingUp className="h-4 w-4 mr-2" />
          Requires Combine Metrics
        </Button>
      </CardFooter>
    </Card>
  );
}