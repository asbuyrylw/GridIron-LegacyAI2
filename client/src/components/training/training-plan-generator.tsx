import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SparklesIcon, Dumbbell, RotateCw, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { TrainingPlan } from "@shared/schema";
import { format } from "date-fns";

// Focus area options for athletes to choose from
const FOCUS_AREAS = [
  { id: "speed", label: "Speed", category: "physical" },
  { id: "strength", label: "Strength", category: "physical" },
  { id: "agility", label: "Agility", category: "physical" },
  { id: "power", label: "Power", category: "physical" },
  { id: "endurance", label: "Endurance", category: "physical" },
  { id: "core", label: "Core Stability", category: "physical" },
  { id: "recovery", label: "Recovery", category: "physical" },
  { id: "mobility", label: "Mobility", category: "physical" },
  { id: "technique", label: "Position Technique", category: "skill" },
  { id: "footwork", label: "Footwork", category: "skill" },
  { id: "armStrength", label: "Arm Strength", category: "skill" },
  { id: "handEye", label: "Hand-Eye Coordination", category: "skill" },
  { id: "explosiveness", label: "Explosiveness", category: "skill" },
  { id: "injuryPrevention", label: "Injury Prevention", category: "wellness" },
  { id: "flexibility", label: "Flexibility", category: "wellness" },
  { id: "balance", label: "Balance", category: "wellness" }
];

export function TrainingPlanGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("categories");
  const [generatedPlan, setGeneratedPlan] = useState<TrainingPlan | null>(null);
  
  // Handle focus area selection
  const toggleFocusArea = (id: string) => {
    if (focusAreas.includes(id)) {
      setFocusAreas(focusAreas.filter(area => area !== id));
    } else {
      // Limit to 3 focus areas
      if (focusAreas.length < 3) {
        setFocusAreas([...focusAreas, id]);
      } else {
        toast({
          title: "Maximum Focus Areas",
          description: "You can select up to 3 focus areas for best results",
          variant: "destructive"
        });
      }
    }
  };
  
  // Use mutation to generate training plan with AI
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!athleteId) throw new Error("Athlete ID is required");
      
      const res = await apiRequest(
        "POST",
        `/api/athlete/${athleteId}/plans/generate`,
        { focusAreas }
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to generate training plan");
      }
      
      return await res.json() as TrainingPlan;
    },
    onSuccess: (data) => {
      setGeneratedPlan(data);
      setActiveTab("result");
      
      // Invalidate the plans query to refresh the list
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${athleteId}/plans`]
      });
      
      toast({
        title: "Training Plan Generated",
        description: "Your personalized training plan is ready",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate training plan. Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  // Group focus areas by category
  const physicalFocusAreas = FOCUS_AREAS.filter(area => area.category === "physical");
  const skillFocusAreas = FOCUS_AREAS.filter(area => area.category === "skill");
  const wellnessFocusAreas = FOCUS_AREAS.filter(area => area.category === "wellness");
  
  // Handle plan generation
  const handleGeneratePlan = () => {
    if (focusAreas.length === 0) {
      toast({
        title: "No Focus Areas Selected",
        description: "Please select at least one focus area",
        variant: "destructive"
      });
      return;
    }
    
    generateMutation.mutate();
  };
  
  // Handle saving or dismissing the generated plan
  const handleSavePlan = () => {
    setGeneratedPlan(null);
    setFocusAreas([]);
    setActiveTab("categories");
    
    toast({
      title: "Plan Saved",
      description: "Your new training plan is ready to use",
    });
  };
  
  const handleDiscard = () => {
    setGeneratedPlan(null);
    setActiveTab("categories");
    
    toast({
      title: "Plan Discarded",
      description: "You can generate a new plan anytime",
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-primary" />
            AI Training Plan Generator
          </CardTitle>
          
          {focusAreas.length > 0 && activeTab === "categories" && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">Selected:</span>
              {focusAreas.map(area => {
                const focusArea = FOCUS_AREAS.find(f => f.id === area);
                return (
                  <Badge key={area} variant="secondary" className="text-xs">
                    {focusArea?.label || area}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
        <CardDescription>
          Create a personalized training plan based on your goals and metrics
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardContent>
          {activeTab === "categories" && (
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="physical">Physical</TabsTrigger>
              <TabsTrigger value="skill">Skill</TabsTrigger>
              <TabsTrigger value="wellness">Wellness</TabsTrigger>
            </TabsList>
          )}
          
          <TabsContent value="categories" className="pt-2">
            <div className="space-y-4">
              <TabsContent value="physical" className="mt-0">
                <div className="grid grid-cols-2 gap-3">
                  {physicalFocusAreas.map((area) => (
                    <div key={area.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={`focus-${area.id}`} 
                        checked={focusAreas.includes(area.id)}
                        onCheckedChange={() => toggleFocusArea(area.id)}
                      />
                      <Label
                        htmlFor={`focus-${area.id}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {area.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="skill" className="mt-0">
                <div className="grid grid-cols-2 gap-3">
                  {skillFocusAreas.map((area) => (
                    <div key={area.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={`focus-${area.id}`} 
                        checked={focusAreas.includes(area.id)}
                        onCheckedChange={() => toggleFocusArea(area.id)}
                      />
                      <Label
                        htmlFor={`focus-${area.id}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {area.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="wellness" className="mt-0">
                <div className="grid grid-cols-2 gap-3">
                  {wellnessFocusAreas.map((area) => (
                    <div key={area.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={`focus-${area.id}`} 
                        checked={focusAreas.includes(area.id)}
                        onCheckedChange={() => toggleFocusArea(area.id)}
                      />
                      <Label
                        htmlFor={`focus-${area.id}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {area.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <div className="pt-2">
                <Button 
                  onClick={handleGeneratePlan} 
                  className="w-full" 
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Generate Personal Training Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="result" className="space-y-4">
            {generatedPlan && (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{generatedPlan.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge>{generatedPlan.focus}</Badge>
                      <Badge variant="outline">{generatedPlan.difficultyLevel}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(generatedPlan.date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Exercises
                  </h4>
                  
                  <div className="space-y-3">
                    {(generatedPlan.exercises as any[]).map((exercise, index) => (
                      <div 
                        key={exercise.id || index}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div>
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps}
                            {exercise.category && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {exercise.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {exercise.restTime}s rest
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {generatedPlan.coachTip && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <h4 className="font-semibold text-sm mb-1">Coach Tip:</h4>
                      <p className="text-sm">{generatedPlan.coachTip}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </CardContent>
      
        <CardFooter className="flex justify-between">
          {activeTab === "result" && generatedPlan ? (
            <>
              <Button variant="outline" onClick={handleDiscard}>
                <XCircleIcon className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button onClick={handleSavePlan}>
                <CheckCircle2Icon className="h-4 w-4 mr-2" />
                Use This Plan
              </Button>
            </>
          ) : (
            <div className="text-xs text-muted-foreground w-full text-center">
              Plans are tailored to your position, training history, and athletic metrics
            </div>
          )}
        </CardFooter>
      </Tabs>
    </Card>
  );
}