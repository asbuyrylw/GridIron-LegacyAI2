import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Dumbbell, Zap } from "lucide-react";

const FOCUS_OPTIONS = [
  { value: "speed", label: "Speed & Agility" },
  { value: "strength", label: "Strength" },
  { value: "endurance", label: "Endurance" },
  { value: "position", label: "Position Specific" },
  { value: "recovery", label: "Recovery & Mobility" }
];

export function GeneratePlan() {
  const { user } = useAuth();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  const [focus, setFocus] = useState("");

  const generateMutation = useMutation({
    mutationFn: async (focusArea: string) => {
      if (!athleteId) throw new Error("Athlete ID is required");
      
      const res = await apiRequest(
        "POST", 
        `/api/athlete/${athleteId}/generate-plan`, 
        { focus: focusArea }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/plans`] });
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/plans/date/${today}`] });
      
      toast({
        title: "Training plan generated",
        description: "Your AI-powered training plan is ready",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate plan",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleGeneratePlan = () => {
    if (!focus) {
      toast({
        title: "Select a focus area",
        description: "Please select a training focus before generating a plan",
        variant: "destructive",
      });
      return;
    }
    
    generateMutation.mutate(focus);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-montserrat font-bold flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          Generate Training Plan
        </CardTitle>
        <CardDescription>
          Create a personalized AI training plan based on your position and goals
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Training Focus</label>
            <Select value={focus} onValueChange={setFocus}>
              <SelectTrigger>
                <SelectValue placeholder="Select focus area" />
              </SelectTrigger>
              <SelectContent>
                {FOCUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
            <p className="flex items-center gap-1 text-primary font-medium mb-1">
              <Zap className="h-4 w-4" />
              Why use AI-powered training?
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI analyzes your position, metrics, and goals to create a personalized training program optimized for your development.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleGeneratePlan}
          disabled={generateMutation.isPending || !focus}
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Plan...
            </>
          ) : (
            "Generate Training Plan"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}