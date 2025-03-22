import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Timer } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TrainingPlan } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restTime: number;
  completed: boolean;
}

export function TrainingPlanView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  
  const { data: plan, isLoading } = useQuery<TrainingPlan>({
    queryKey: [`/api/athlete/${athleteId}/plans/date/${todayStr}`],
    enabled: !!athleteId,
  });
  
  // If no plan exists, create a dummy one for demo
  const [dummyPlan] = useState<TrainingPlan>({
    id: 0,
    athleteId: athleteId || 0,
    date: today,
    title: "Speed & Agility Focus",
    focus: "Speed",
    exercises: [
      {
        id: "ex1",
        name: "Sprint Ladder",
        sets: 4,
        reps: "30 seconds",
        restTime: 30,
        completed: false
      },
      {
        id: "ex2",
        name: "5-10-5 Shuttle Drills",
        sets: 5,
        reps: "with 60s rest",
        restTime: 60,
        completed: false
      },
      {
        id: "ex3",
        name: "Box Jumps",
        sets: 3,
        reps: "10 reps",
        restTime: 45,
        completed: false
      }
    ],
    completed: false,
    coachTip: "Focus on proper hip rotation during the 5-10-5 drill to optimize your change of direction."
  });
  
  const activePlan = plan || dummyPlan;
  const exercises = activePlan.exercises as unknown as Exercise[];
  
  const [activeExercises, setActiveExercises] = useState<Exercise[]>(exercises);
  
  const updateMutation = useMutation({
    mutationFn: async (updatedPlan: Partial<TrainingPlan>) => {
      if (!athleteId) throw new Error("Athlete ID is required");
      
      const res = await apiRequest(
        "PATCH", 
        `/api/athlete/${athleteId}/plans/${activePlan.id}`, 
        updatedPlan
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/plans/date/${todayStr}`] });
      toast({
        title: "Training plan updated",
        description: "Your progress has been saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update plan",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleCheckboxChange = (exerciseId: string) => {
    const updatedExercises = activeExercises.map(ex => 
      ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
    );
    setActiveExercises(updatedExercises);
    
    if (plan?.id) {
      updateMutation.mutate({
        exercises: updatedExercises
      });
    }
  };
  
  const handleCompleteWorkout = () => {
    const allCompleted = activeExercises.map(ex => ({ ...ex, completed: true }));
    setActiveExercises(allCompleted);
    
    if (plan?.id) {
      updateMutation.mutate({
        exercises: allCompleted,
        completed: true
      });
    }
    
    toast({
      title: "Workout completed!",
      description: "Great job on completing today's training session!"
    });
  };
  
  const handleLogNotes = () => {
    toast({
      title: "Log Notes",
      description: "Notes feature coming soon!"
    });
  };
  
  const startTimer = (seconds: number) => {
    toast({
      title: `${seconds}s Timer Started`,
      description: "Rest timer is running"
    });
  };
  
  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-montserrat font-bold">Today's Training</h2>
        <Button 
          variant="ghost" 
          className="text-primary dark:text-accent font-semibold text-sm flex items-center gap-1"
        >
          <span>Full Plan</span>
          <Calendar className="h-4 w-4" />
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-montserrat font-bold">{activePlan.title}</h3>
            <span className="text-sm text-gray-500">
              {format(new Date(activePlan.date), "EEE, MMMM d")}
            </span>
          </div>
          
          <div className="space-y-3">
            {activeExercises.map(exercise => (
              <div 
                key={exercise.id}
                className="flex items-center p-2 border-b border-gray-100 dark:border-gray-700"
              >
                <Checkbox 
                  id={exercise.id}
                  checked={exercise.completed} 
                  onCheckedChange={() => handleCheckboxChange(exercise.id)}
                  className="mr-3 h-5 w-5 text-primary"
                />
                <label htmlFor={exercise.id} className="flex-1">
                  <div className="font-semibold">{exercise.name}</div>
                  <div className="text-sm text-gray-500">{exercise.sets} sets x {exercise.reps}</div>
                </label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary dark:text-accent flex items-center text-sm"
                  onClick={() => startTimer(exercise.restTime)}
                >
                  <Timer className="h-3 w-3 mr-1" />
                  <span>{exercise.restTime}s</span>
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
            <div className="font-montserrat font-semibold mb-1">Coach Tip:</div>
            <p>{activePlan.coachTip}</p>
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button 
              variant="outline" 
              className="text-sm"
              onClick={handleLogNotes}
            >
              Log Notes
            </Button>
            <Button 
              className="text-sm"
              onClick={handleCompleteWorkout}
            >
              Complete Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
