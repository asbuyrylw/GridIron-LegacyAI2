import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Slider 
} from "@/components/ui/slider";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { 
  Timer, 
  PlayCircle, 
  PauseCircle, 
  RefreshCw,
  Calendar,
  MapPin,
  BarChart3,
  CloudSun,
  Dumbbell,
  Check,
  AlarmClock,
  Plus,
  ListTodo
} from "lucide-react";
import { ExerciseLibrary, TrainingPlan, InsertWorkoutSession } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ExerciseBrowser } from "./exercise-browser";
import { ExerciseCard } from "./exercise-card";
import { useCreateWorkoutSession } from "@/hooks/use-training-hooks";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restTime: number;
  completed: boolean;
}

interface WorkoutSessionProps {
  athleteId: number;
  activePlan?: TrainingPlan;
  onComplete?: () => void;
}

export function WorkoutSession({ athleteId, activePlan, onComplete }: WorkoutSessionProps) {
  const { toast } = useToast();
  
  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [initialSeconds, setInitialSeconds] = useState(60);
  
  // Workout state
  const [exercisesCompleted, setExercisesCompleted] = useState<Record<string, boolean>>({});
  const [customExercises, setCustomExercises] = useState<ExerciseLibrary[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  
  // Workout feedback state
  const [workoutLocation, setWorkoutLocation] = useState("");
  const [perceivedExertion, setPerceivedExertion] = useState<number>(5);
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [workoutRating, setWorkoutRating] = useState<number>(3);
  const [weatherConditions, setWeatherConditions] = useState("");
  const [notes, setNotes] = useState("");
  
  // Dialogs state
  const [showAddExercisesDialog, setShowAddExercisesDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  
  // Create workout session mutation
  const createWorkoutSession = useCreateWorkoutSession(athleteId);
  
  // Get exercises from the active plan
  const planExercises: Exercise[] = activePlan 
    ? (activePlan.exercises as unknown as Exercise[])
    : [];
  
  // Initialize exercisesCompleted state from plan
  useEffect(() => {
    if (planExercises.length > 0) {
      const initialState: Record<string, boolean> = {};
      planExercises.forEach(ex => {
        initialState[ex.id] = ex.completed || false;
      });
      setExercisesCompleted(initialState);
    }
  }, [planExercises]);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
      toast({
        title: "Timer Complete",
        description: "Rest period finished. Time for your next set!",
      });
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds, toast]);
  
  // Handle starting a workout
  const handleStartWorkout = () => {
    const now = new Date();
    setStartTime(now);
    toast({
      title: "Workout Started",
      description: `Started at ${format(now, "h:mm a")}`,
    });
  };
  
  // Handle stopping a workout
  const handleStopWorkout = () => {
    const now = new Date();
    setEndTime(now);
    setShowCompleteDialog(true);
  };
  
  // Set a timer
  const handleSetTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setInitialSeconds(seconds);
    setTimerRunning(true);
    toast({
      title: `${seconds}s Timer Started`,
      description: "Rest timer is running",
    });
  };
  
  // Toggle timer play/pause
  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };
  
  // Reset timer
  const resetTimer = () => {
    setTimerSeconds(initialSeconds);
    setTimerRunning(false);
  };
  
  // Handle exercise checkbox toggle
  const handleExerciseToggle = (id: string) => {
    setExercisesCompleted(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Handle adding custom exercises
  const handleAddExercises = (selected: ExerciseLibrary[]) => {
    setCustomExercises(selected);
    setShowAddExercisesDialog(false);
  };
  
  // Calculate workout duration in minutes
  const calculateDuration = (): number => {
    if (!startTime) return 0;
    const end = endTime || new Date();
    return Math.round((end.getTime() - startTime.getTime()) / 60000);
  };
  
  // Handle completing workout and saving data
  const handleCompleteWorkout = () => {
    if (!startTime) return;
    
    // Prepare workout data
    const workoutData: Omit<InsertWorkoutSession, 'athleteId'> = {
      date: format(startTime, "yyyy-MM-dd"),
      startTime: startTime,
      endTime: endTime || new Date(),
      duration: calculateDuration(),
      completed: true,
      notes: notes,
      location: workoutLocation || null,
      trainingPlanId: activePlan?.id || null,
      perceivedExertion: perceivedExertion,
      energyLevel: energyLevel,
      rating: workoutRating,
      weatherConditions: weatherConditions || null,
      exercisesCompleted: {
        planExercises: Object.entries(exercisesCompleted).map(([id, completed]) => ({ 
          id, 
          completed,
          name: planExercises.find(ex => ex.id === id)?.name || ''
        })),
        customExercises: customExercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          completed: true
        }))
      }
    };
    
    // Save workout session
    createWorkoutSession.mutate(workoutData, {
      onSuccess: () => {
        setShowCompleteDialog(false);
        
        // If there's a parent callback, call it
        if (onComplete) {
          onComplete();
        }
      }
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Workout Timer Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Workout Timer</span>
            {startTime ? (
              <div className="text-sm font-normal flex items-center gap-1 text-muted-foreground">
                <AlarmClock className="h-4 w-4" />
                Started: {format(startTime, "h:mm a")}
              </div>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!startTime ? (
            <div className="flex justify-center">
              <Button 
                onClick={handleStartWorkout} 
                className="w-full md:w-auto"
              >
                Start Workout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">
                  {format(new Date(0, 0, 0, 0, Math.floor(calculateDuration()), calculateDuration() % 1 * 60), 'mm:ss')}
                </div>
                <div className="flex gap-2">
                  {!endTime && (
                    <Button 
                      variant="destructive" 
                      onClick={handleStopWorkout}
                    >
                      Finish Workout
                    </Button>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex justify-between mb-2">
                  <div className="font-semibold">Rest Timer</div>
                  <div className="text-xl font-mono">
                    {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:
                    {(timerSeconds % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                
                <div className="flex justify-center space-x-2 mb-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={toggleTimer}
                  >
                    {timerRunning ? 
                      <PauseCircle className="h-5 w-5" /> : 
                      <PlayCircle className="h-5 w-5" />
                    }
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={resetTimer}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-4 gap-1">
                  {[30, 45, 60, 90].map(seconds => (
                    <Button 
                      key={seconds}
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleSetTimer(seconds)}
                    >
                      {seconds}s
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Exercises List */}
      {startTime && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Exercises</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 text-xs"
                onClick={() => setShowAddExercisesDialog(true)}
              >
                <Plus className="h-3 w-3" /> Add Exercise
              </Button>
            </CardTitle>
            <CardDescription>
              Track your exercise completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {planExercises.length > 0 ? (
                <>
                  <div className="font-semibold text-sm mb-1">From Training Plan:</div>
                  {planExercises.map(exercise => (
                    <div 
                      key={exercise.id}
                      className="flex items-center p-2 border-b border-gray-100 dark:border-gray-700"
                    >
                      <Checkbox 
                        id={`ex-${exercise.id}`}
                        checked={exercisesCompleted[exercise.id] || false} 
                        onCheckedChange={() => handleExerciseToggle(exercise.id)}
                        className="mr-3 h-5 w-5 text-primary"
                      />
                      <label htmlFor={`ex-${exercise.id}`} className="flex-1">
                        <div className="font-semibold">{exercise.name}</div>
                        <div className="text-sm text-gray-500">{exercise.sets} sets x {exercise.reps}</div>
                      </label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary dark:text-accent flex items-center text-sm"
                        onClick={() => handleSetTimer(exercise.restTime)}
                      >
                        <Timer className="h-3 w-3 mr-1" />
                        <span>{exercise.restTime}s</span>
                      </Button>
                    </div>
                  ))}
                </>
              ) : null}
              
              {customExercises.length > 0 && (
                <>
                  <div className="font-semibold text-sm mt-4 mb-1">Custom Exercises:</div>
                  {customExercises.map(exercise => (
                    <div 
                      key={exercise.id}
                      className="flex items-center p-2 border-b border-gray-100 dark:border-gray-700"
                    >
                      <Checkbox 
                        id={`custom-ex-${exercise.id}`}
                        checked={true} // Custom exercises are always marked as completed
                        disabled
                        className="mr-3 h-5 w-5 text-primary"
                      />
                      <label htmlFor={`custom-ex-${exercise.id}`} className="flex-1">
                        <div className="font-semibold">{exercise.name}</div>
                        <div className="text-sm text-gray-500">{exercise.category}</div>
                      </label>
                    </div>
                  ))}
                </>
              )}
              
              {planExercises.length === 0 && customExercises.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Dumbbell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No exercises yet. Click "Add Exercise" to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Exercise Browser Dialog */}
      <Dialog open={showAddExercisesDialog} onOpenChange={setShowAddExercisesDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exercise Library</DialogTitle>
            <DialogDescription>
              Browse and add exercises to your workout session
            </DialogDescription>
          </DialogHeader>
          
          <ExerciseBrowser
            onSelectExercises={handleAddExercises}
            initialSelected={customExercises}
          />
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddExercisesDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setShowAddExercisesDialog(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Complete Workout Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Workout</DialogTitle>
            <DialogDescription>
              Provide details about your workout before saving
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Duration:</div>
              <div>{calculateDuration()} minutes</div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Location
              </Label>
              <Input
                id="location"
                placeholder="Home, Gym, School field, etc."
                value={workoutLocation}
                onChange={(e) => setWorkoutLocation(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5" /> Perceived Exertion (How hard was it?)
              </Label>
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Easy</span>
                <span>Hard</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[perceivedExertion]}
                onValueChange={(vals) => setPerceivedExertion(vals[0])}
              />
              <div className="text-center font-medium">{perceivedExertion}/10</div>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <CloudSun className="h-3.5 w-3.5" /> Weather Conditions
              </Label>
              <RadioGroup value={weatherConditions} onValueChange={setWeatherConditions}>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Indoor" id="indoor" />
                    <Label htmlFor="indoor">Indoor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Hot" id="hot" />
                    <Label htmlFor="hot">Hot</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Cold" id="cold" />
                    <Label htmlFor="cold">Cold</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Humid" id="humid" />
                    <Label htmlFor="humid">Humid</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Rainy" id="rainy" />
                    <Label htmlFor="rainy">Rainy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Windy" id="windy" />
                    <Label htmlFor="windy">Windy</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Workout Rating
              </Label>
              <RadioGroup 
                value={workoutRating.toString()} 
                onValueChange={(val) => setWorkoutRating(Number(val))}
              >
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex flex-col items-center space-y-1">
                      <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                      <Label 
                        htmlFor={`rating-${rating}`}
                        className="text-xs"
                      >
                        {rating}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-1">
                <ListTodo className="h-3.5 w-3.5" /> Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="How did the workout feel? Any areas of progress or challenge?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCompleteDialog(false)}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteWorkout}
              className="sm:w-auto w-full"
              disabled={createWorkoutSession.isPending}
            >
              {createWorkoutSession.isPending ? (
                <>
                  <span>Saving...</span>
                </>
              ) : (
                <>Save Workout</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}