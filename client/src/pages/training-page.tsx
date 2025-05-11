import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/page-header";
import { TrainingPlanView } from "@/components/training/training-plan";
import { TrainingPlanGenerator } from "@/components/training/training-plan-generator";
import { WorkoutSession } from "@/components/training/workout-session";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useWorkoutSessions } from "@/hooks/use-training-hooks";
import { WorkoutSession as WorkoutSessionType } from "@shared/schema";
import { Dumbbell, CalendarDays, Clock, BarChart2, Flag, Trophy, TrendingUp, SparklesIcon } from "lucide-react";
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { cn } from "@/lib/utils";

export default function TrainingPage() {
  const { user } = useAuth();
  const athleteId = user?.athlete?.id;
  const [activeTab, setActiveTab] = useState("plan");
  const workoutCompletedRef = useRef(false);
  
  // Fetch workout sessions
  const { data: workoutSessions, isLoading: isLoadingWorkouts } = useWorkoutSessions(athleteId || 0);
  
  // Get training plan
  const { data: activePlan } = useQuery({
    queryKey: [`/api/athlete/${athleteId}/plans/date/${new Date().toISOString().split('T')[0]}`],
    enabled: !!athleteId,
  });
  
  // Handle workout completion
  const handleWorkoutComplete = () => {
    workoutCompletedRef.current = true;
    setActiveTab("history");
  };
  
  // Group workout sessions by recency
  const groupedSessions = workoutSessions ? workoutSessions.reduce<{
    today: WorkoutSessionType[];
    yesterday: WorkoutSessionType[];
    thisWeek: WorkoutSessionType[];
    thisMonth: WorkoutSessionType[];
    older: WorkoutSessionType[];
  }>((acc, session) => {
    const date = parseISO(session.date);
    if (isToday(date)) {
      acc.today.push(session);
    } else if (isYesterday(date)) {
      acc.yesterday.push(session);
    } else if (isThisWeek(date)) {
      acc.thisWeek.push(session);
    } else if (isThisMonth(date)) {
      acc.thisMonth.push(session);
    } else {
      acc.older.push(session);
    }
    return acc;
  }, {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: []
  }) : null;
  
  return (
    <div className="container px-4 py-6 max-w-5xl mx-auto">
      <PageHeader
        title="Training"
        description="Your personalized training plans and workout history"
        icon={<Dumbbell className="h-6 w-6" />}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="plan">Today's Plan</TabsTrigger>
          <TabsTrigger value="generator">
            <SparklesIcon className="h-4 w-4 mr-1" />
            AI Generator
          </TabsTrigger>
          <TabsTrigger value="history">Workout History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plan" className="space-y-4 pt-4">
          {athleteId && (
            <>
              <TrainingPlanView />
              <Separator className="my-6" />
              <WorkoutSession 
                athleteId={athleteId} 
                activePlan={activePlan}
                onComplete={handleWorkoutComplete}
              />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="generator" className="space-y-4 pt-4">
          {athleteId && (
            <TrainingPlanGenerator />
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Workout History</CardTitle>
              <CardDescription>
                View your past workout sessions and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWorkouts ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Loading workout history...</p>
                </div>
              ) : !workoutSessions || workoutSessions.length === 0 ? (
                <div className="py-8 text-center">
                  <Dumbbell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No workout history yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete workouts to see them here
                  </p>
                  <Button 
                    onClick={() => setActiveTab("plan")}
                    variant="outline"
                    className="mt-4"
                  >
                    Start a Workout
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  {groupedSessions && (
                    <div className="space-y-6">
                      {groupedSessions.today.length > 0 && (
                        <WorkoutHistorySection 
                          title="Today" 
                          sessions={groupedSessions.today}
                        />
                      )}
                      
                      {groupedSessions.yesterday.length > 0 && (
                        <WorkoutHistorySection 
                          title="Yesterday" 
                          sessions={groupedSessions.yesterday}
                        />
                      )}
                      
                      {groupedSessions.thisWeek.length > 0 && (
                        <WorkoutHistorySection 
                          title="This Week" 
                          sessions={groupedSessions.thisWeek}
                        />
                      )}
                      
                      {groupedSessions.thisMonth.length > 0 && (
                        <WorkoutHistorySection 
                          title="This Month" 
                          sessions={groupedSessions.thisMonth}
                        />
                      )}
                      
                      {groupedSessions.older.length > 0 && (
                        <WorkoutHistorySection 
                          title="Older" 
                          sessions={groupedSessions.older}
                        />
                      )}
                    </div>
                  )}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Training Stats</CardTitle>
              <CardDescription>
                Your training progress at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard 
                  title="Workouts" 
                  value={workoutSessions?.length || 0}
                  icon={<Dumbbell className="h-4 w-4" />}
                />
                <StatsCard 
                  title="This Month" 
                  value={groupedSessions ? 
                    groupedSessions.today.length + 
                    groupedSessions.yesterday.length + 
                    groupedSessions.thisWeek.length + 
                    groupedSessions.thisMonth.length 
                    : 0
                  }
                  icon={<CalendarDays className="h-4 w-4" />}
                />
                <StatsCard 
                  title="Total Hours" 
                  value={calculateTotalHours(workoutSessions || [])}
                  icon={<Clock className="h-4 w-4" />}
                  valueType="hours"
                />
                <StatsCard 
                  title="Streak" 
                  value={calculateStreak(workoutSessions || [])}
                  icon={<TrendingUp className="h-4 w-4" />}
                  valueType="days"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  valueType?: "number" | "hours" | "days";
}

function StatsCard({ title, value, icon, valueType = "number" }: StatsCardProps) {
  const formattedValue = valueType === "hours" 
    ? value.toFixed(1) 
    : value.toString();
  
  return (
    <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center">
      <div className="flex items-center text-primary gap-1 text-sm mb-1">
        {icon}
        <span>{title}</span>
      </div>
      <div className="text-2xl font-bold">
        {formattedValue}
        {valueType === "hours" && <span className="text-sm ml-1">hrs</span>}
        {valueType === "days" && <span className="text-sm ml-1">days</span>}
      </div>
    </div>
  );
}

// Workout History Section Component
interface WorkoutHistorySectionProps {
  title: string;
  sessions: WorkoutSessionType[];
}

function WorkoutHistorySection({ title, sessions }: WorkoutHistorySectionProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="space-y-3">
        {sessions.map((session) => (
          <WorkoutHistoryItem key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}

// Workout History Item Component
interface WorkoutHistoryItemProps {
  session: WorkoutSessionType;
}

function WorkoutHistoryItem({ session }: WorkoutHistoryItemProps) {
  // Determine focus type or get from training plan if linked
  const focusType = session.trainingPlanId ? "plan" : "custom";
  const startTime = session.startTime ? new Date(session.startTime) : null;
  const endTime = session.endTime ? new Date(session.endTime) : null;
  
  // Parse exercisesCompleted if it's a string
  const exercisesCompleted = typeof session.exercisesCompleted === 'string'
    ? JSON.parse(session.exercisesCompleted)
    : session.exercisesCompleted;
  
  // Count completed exercises
  const exerciseCount = exercisesCompleted 
    ? (exercisesCompleted.planExercises?.length || 0) + 
      (exercisesCompleted.customExercises?.length || 0)
    : 0;
  
  return (
    <Card className="transition-all hover:shadow-md border">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <div className="font-semibold">
                {format(parseISO(session.date), "MMM d, yyyy")}
              </div>
              <Badge 
                variant={focusType === "plan" ? "default" : "secondary"}
                className="text-xs"
              >
                {focusType === "plan" ? "Plan" : "Custom"}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground mt-1">
              {startTime && format(startTime, "h:mm a")}
              {endTime && ` - ${format(endTime, "h:mm a")}`}
              {session.duration && ` (${session.duration} min)`}
            </div>
            
            {session.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Flag className="h-3 w-3" />
                {session.location}
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {session.rating && (
              <div className="flex items-center gap-1 text-xs mr-3">
                <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                <span className="font-medium">{session.rating}/5</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 text-xs">
              <Dumbbell className="h-3.5 w-3.5" />
              <span>{exerciseCount} exercises</span>
            </div>
          </div>
        </div>
        
        {session.notes && (
          <div className="mt-2 text-sm bg-muted/50 p-2 rounded-sm">
            {session.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to calculate total hours of training
function calculateTotalHours(sessions: WorkoutSessionType[]): number {
  const totalMinutes = sessions.reduce((total, session) => {
    return total + (session.duration || 0);
  }, 0);
  
  return totalMinutes / 60;
}

// Helper function to calculate workout streak
function calculateStreak(sessions: WorkoutSessionType[]): number {
  if (!sessions.length) return 0;
  
  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Check if there's a workout today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const latestSessionDate = new Date(sortedSessions[0].date);
  latestSessionDate.setHours(0, 0, 0, 0);
  
  // If latest session is not today or yesterday, streak is 0
  if (latestSessionDate.getTime() < today.getTime() - 86400000) {
    return 0;
  }
  
  // Count consecutive days with workouts
  let streak = 1;
  let currentDate = new Date(latestSessionDate);
  
  for (let i = 1; i < sortedSessions.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    const sessionDate = new Date(sortedSessions[i].date);
    sessionDate.setHours(0, 0, 0, 0);
    
    if (sessionDate.getTime() === prevDate.getTime()) {
      streak++;
      currentDate = sessionDate;
    } else if (sessionDate.getTime() < prevDate.getTime()) {
      // Skip to next date that might be in streak
      currentDate = prevDate;
      i--; // Stay on current session to check against the next date
    } else {
      // Break in streak
      break;
    }
  }
  
  return streak;
}