import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dumbbell, 
  Utensils, 
  LineChart, 
  Plus, 
  Search, 
  ChevronRight, 
  Loader2, 
  BarChart,
  ShoppingBag,
  Calendar,
  Clock,
  Sparkles as SparklesIcon,
  BookOpen
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Import training components
import { TrainingPlanView } from "@/components/training/training-plan-view";
import { WorkoutSession } from "@/components/training/workout-session";
import { TrainingPlanGenerator } from "@/components/training/training-plan-generator";
import { WorkoutHistoryItem } from "@/components/training/workout-history-item";

// Import nutrition components
import { NutritionPlanForm } from "@/components/nutrition/nutrition-plan-form";
import { MealLogForm } from "@/components/nutrition/meal-log-form";
import { NutritionOverview } from "@/components/nutrition/nutrition-overview";
import { MealSuggestions } from "@/components/nutrition/meal-suggestions";

// Import training hooks
import { useWorkoutSessions } from "@/hooks/use-workout-hooks";

// Import nutrition hooks
import { useNutritionSearch, useNutritionPlan, useMealLogging, useShoppingList } from "@/hooks/use-nutrition-hooks";

// Newly created components for combined dashboard
import { FoodSearchBox } from "@/components/nutrition/food-search-box";
import { MacroProgress } from "@/components/nutrition/macro-progress";
import { ShoppingListGenerator } from "@/components/nutrition/shopping-list-generator";
import { MealPlanCalendar } from "@/components/nutrition/meal-plan-calendar";
import { DailyNutritionSummary } from "@/components/nutrition/daily-nutrition-summary";

type WorkoutSessionType = any;

export default function TrainingNutritionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  
  // Tab state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeMealTab, setActiveMealTab] = useState("meal-plan");
  const [activeTrainingTab, setActiveTrainingTab] = useState("plan");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Reference for completed workouts
  const workoutCompletedRef = { current: false };
  
  // Fetch nutrition plan
  const { 
    data: nutritionPlan,
    isLoading: isLoadingNutritionPlan 
  } = useQuery({
    queryKey: [`/api/athlete/${athleteId}/nutrition-plan`],
    enabled: !!athleteId,
  });
  
  // Fetch meal logs
  const { 
    data: mealLogs,
    isLoading: isLoadingMealLogs 
  } = useQuery({
    queryKey: [`/api/athlete/${athleteId}/meal-logs`],
    enabled: !!athleteId,
  });
  
  // Fetch workout sessions
  const { 
    data: workoutSessions, 
    isLoading: isLoadingWorkouts 
  } = useWorkoutSessions(athleteId || 0);
  
  // Get training plan
  const { 
    data: activePlan,
    isLoading: isLoadingTrainingPlan
  } = useQuery({
    queryKey: [`/api/athlete/${athleteId}/plans/date/${new Date().toISOString().split('T')[0]}`],
    enabled: !!athleteId,
  });
  
  // Create a nutrition plan
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      return apiRequest(`/api/athlete/${athleteId}/nutrition-plan`, {
        method: 'POST',
        data: planData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/nutrition-plan`] });
      toast({
        title: "Nutrition Plan Created",
        description: "Your new nutrition plan has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Create Plan",
        description: "There was an error creating your nutrition plan. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Create a meal log
  const logMealMutation = useMutation({
    mutationFn: async (mealData: any) => {
      return apiRequest(`/api/athlete/${athleteId}/meal-logs`, {
        method: 'POST',
        data: mealData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/meal-logs`] });
      toast({
        title: "Meal Logged",
        description: "Your meal has been logged successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Log Meal",
        description: "There was an error logging your meal. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Get meal suggestions
  const getMealSuggestionsMutation = useMutation({
    mutationFn: async (preferences: any) => {
      return apiRequest(`/api/nutrition/suggest-meal-plan`, {
        method: 'POST',
        data: {
          calories: nutritionPlan?.dailyCalories || 2500,
          proteinTarget: nutritionPlan?.proteinTarget || 150,
          carbTarget: nutritionPlan?.carbTarget || 300,
          fatTarget: nutritionPlan?.fatTarget || 80,
          dietaryPreferences: preferences
        }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Meal Suggestions Generated",
        description: "Personalized meal suggestions have been generated based on your nutrition plan.",
      });
      
      // You could save these suggestions to the user's account here
      return data;
    },
    onError: () => {
      toast({
        title: "Failed to Generate Suggestions",
        description: "There was an error generating meal suggestions. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle workout completion
  const handleWorkoutComplete = () => {
    workoutCompletedRef.current = true;
    setActiveTrainingTab("history");
  };
  
  // Handle food search
  const handleFoodSearch = async (query: string) => {
    if (!query.trim()) {
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await apiRequest(`/api/nutrition/search`, {
        method: 'GET',
        params: { query }
      });
      
      return results;
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "There was an error searching for food items.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
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

  const [isCreatingNutritionPlan, setIsCreatingNutritionPlan] = useState(false);
  
  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Training & Nutrition"
        description="Manage your training schedule and nutrition in one place"
        icon={<Dumbbell className="h-6 w-6" />}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="grid grid-cols-4 w-full mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-1.5">
            <BarChart className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-1.5">
            <Dumbbell className="h-4 w-4" />
            <span>Training</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-1.5">
            <Utensils className="h-4 w-4" />
            <span>Nutrition</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1.5">
            <LineChart className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab - Combined Overview */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today's Training Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2 text-blue-500" />
                  Today's Training
                </CardTitle>
                <CardDescription>
                  {activePlan ? activePlan.title : "No workout scheduled for today"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTrainingPlan ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : activePlan ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Focus:</span>
                      <span className="font-medium">{activePlan.focus}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Exercises:</span>
                      <span className="font-medium">{activePlan.exercises?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={activePlan.completed ? "success" : "outline"}>
                        {activePlan.completed ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <Button 
                      onClick={() => {
                        setActiveTab("training");
                        setActiveTrainingTab("plan");
                      }} 
                      variant="outline" 
                      className="w-full"
                    >
                      View Workout Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">No workout plan for today.</p>
                    <Button 
                      onClick={() => {
                        setActiveTab("training");
                        setActiveTrainingTab("generator");
                      }} 
                      variant="outline"
                    >
                      <SparklesIcon className="h-4 w-4 mr-1" />
                      Generate Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          
            {/* Nutrition Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Utensils className="h-5 w-5 mr-2 text-green-500" />
                  Nutrition Today
                </CardTitle>
                <CardDescription>
                  {nutritionPlan ? "Daily nutrition progress" : "No active nutrition plan"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingNutritionPlan ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : nutritionPlan ? (
                  <div className="space-y-3">
                    <MacroProgress 
                      calories={{
                        current: mealLogs?.reduce((sum, meal) => sum + (meal.calories || 0), 0) || 0,
                        target: nutritionPlan.dailyCalories
                      }}
                      protein={{
                        current: mealLogs?.reduce((sum, meal) => sum + (meal.protein || 0), 0) || 0,
                        target: nutritionPlan.proteinTarget
                      }}
                      carbs={{
                        current: mealLogs?.reduce((sum, meal) => sum + (meal.carbs || 0), 0) || 0,
                        target: nutritionPlan.carbTarget
                      }}
                      fat={{
                        current: mealLogs?.reduce((sum, meal) => sum + (meal.fat || 0), 0) || 0,
                        target: nutritionPlan.fatTarget
                      }}
                    />
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <Button 
                        onClick={() => {
                          setActiveTab("nutrition");
                          setActiveMealTab("meal-log");
                        }} 
                        variant="outline" 
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Log Meal
                      </Button>
                      <Button 
                        onClick={() => {
                          setActiveTab("nutrition");
                        }} 
                        variant="outline" 
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">No nutrition plan set up.</p>
                    <Button 
                      onClick={() => {
                        setActiveTab("nutrition");
                        setIsCreatingNutritionPlan(true);
                      }} 
                      variant="outline"
                    >
                      Create Nutrition Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          
            {/* Quick Food Search */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2 text-orange-500" />
                  Quick Food Search
                </CardTitle>
                <CardDescription>
                  Search for foods and log them instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FoodSearchBox 
                    onSearch={handleFoodSearch}
                    onFoodSelect={(food) => {
                      if (food && nutritionPlan) {
                        // Prepare data for meal log
                        const mealData = {
                          athleteId,
                          nutritionPlanId: nutritionPlan.id,
                          name: food.food_name,
                          mealType: "snack", // Default to snack
                          calories: food.nf_calories,
                          protein: food.nf_protein,
                          carbs: food.nf_total_carbohydrate,
                          fat: food.nf_total_fat,
                          servingSize: food.serving_qty,
                          servingUnit: food.serving_unit,
                          date: new Date().toISOString().split('T')[0]
                        };
                        
                        // Log the meal
                        logMealMutation.mutate(mealData);
                      } else {
                        toast({
                          title: "Cannot Log Food",
                          description: "Please create a nutrition plan first.",
                          variant: "destructive",
                        });
                      }
                    }}
                    isLoading={isSearching}
                  />
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    Powered by Nutritionix API
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="text-sm">
                    <strong>Recently Logged Foods</strong>
                    <ScrollArea className="h-[110px] mt-2">
                      {isLoadingMealLogs ? (
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-full" />
                        </div>
                      ) : mealLogs && mealLogs.length > 0 ? (
                        <ul className="space-y-1">
                          {mealLogs.slice(0, 5).map((meal: any, index: number) => (
                            <li key={index} className="flex items-center justify-between text-sm py-1">
                              <div className="flex items-center">
                                <span className="font-medium">{meal.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {meal.servingSize} {meal.servingUnit}
                                </span>
                              </div>
                              <span className="text-sm">{meal.calories} kcal</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No meals logged today
                        </p>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Training Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Weekly Training Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingWorkouts ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : groupedSessions && (
                  groupedSessions.today.length === 0 && 
                  groupedSessions.yesterday.length === 0 &&
                  groupedSessions.thisWeek.length === 0
                ) ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-2">No workouts completed this week</p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setActiveTab("training");
                        setActiveTrainingTab("plan");
                      }}
                    >
                      Start Today's Workout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Today's workouts */}
                    {groupedSessions?.today && groupedSessions.today.length > 0 && (
                      <div>
                        <h3 className="font-medium text-sm mb-2">Today</h3>
                        {groupedSessions.today.map((session, i) => (
                          <WorkoutHistoryItem key={`today-${i}`} session={session} />
                        ))}
                      </div>
                    )}
                    
                    {/* Yesterday's workouts */}
                    {groupedSessions?.yesterday && groupedSessions.yesterday.length > 0 && (
                      <div>
                        <h3 className="font-medium text-sm mb-2">Yesterday</h3>
                        {groupedSessions.yesterday.map((session, i) => (
                          <WorkoutHistoryItem key={`yesterday-${i}`} session={session} />
                        ))}
                      </div>
                    )}
                    
                    {/* This week's workouts */}
                    {groupedSessions?.thisWeek && groupedSessions.thisWeek.length > 0 && (
                      <div>
                        <h3 className="font-medium text-sm mb-2">This Week</h3>
                        {groupedSessions.thisWeek.map((session, i) => (
                          <WorkoutHistoryItem key={`thisWeek-${i}`} session={session} />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setActiveTab("training");
                          setActiveTrainingTab("history");
                        }}
                        className="text-sm"
                      >
                        View All History
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Meal Plan for Today */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                  Today's Meal Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingNutritionPlan || isLoadingMealLogs ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : !nutritionPlan ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-2">No nutrition plan created yet</p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setActiveTab("nutrition");
                        setIsCreatingNutritionPlan(true);
                      }}
                    >
                      Create Nutrition Plan
                    </Button>
                  </div>
                ) : (
                  <DailyNutritionSummary 
                    mealLogs={mealLogs || []}
                    nutritionPlan={nutritionPlan}
                    onLogMeal={() => {
                      setActiveTab("nutrition");
                      setActiveMealTab("meal-log");
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <Tabs value={activeTrainingTab} onValueChange={setActiveTrainingTab} className="w-full">
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
                    View your past workout sessions and performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingWorkouts ? (
                    <div className="space-y-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : groupedSessions && (
                    groupedSessions.today.length === 0 && 
                    groupedSessions.yesterday.length === 0 &&
                    groupedSessions.thisWeek.length === 0 &&
                    groupedSessions.thisMonth.length === 0 &&
                    groupedSessions.older.length === 0
                  ) ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No workout history found</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Today's workouts */}
                      {groupedSessions?.today && groupedSessions.today.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Today</h3>
                          {groupedSessions.today.map((session, i) => (
                            <WorkoutHistoryItem key={`today-${i}`} session={session} />
                          ))}
                        </div>
                      )}
                      
                      {/* Yesterday's workouts */}
                      {groupedSessions?.yesterday && groupedSessions.yesterday.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Yesterday</h3>
                          {groupedSessions.yesterday.map((session, i) => (
                            <WorkoutHistoryItem key={`yesterday-${i}`} session={session} />
                          ))}
                        </div>
                      )}
                      
                      {/* This week's workouts */}
                      {groupedSessions?.thisWeek && groupedSessions.thisWeek.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">This Week</h3>
                          {groupedSessions.thisWeek.map((session, i) => (
                            <WorkoutHistoryItem key={`thisWeek-${i}`} session={session} />
                          ))}
                        </div>
                      )}
                      
                      {/* This month's workouts */}
                      {groupedSessions?.thisMonth && groupedSessions.thisMonth.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">This Month</h3>
                          {groupedSessions.thisMonth.map((session, i) => (
                            <WorkoutHistoryItem key={`thisMonth-${i}`} session={session} />
                          ))}
                        </div>
                      )}
                      
                      {/* Older workouts */}
                      {groupedSessions?.older && groupedSessions.older.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Older</h3>
                          {groupedSessions.older.map((session, i) => (
                            <WorkoutHistoryItem key={`older-${i}`} session={session} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="space-y-4">
          <Tabs value={activeMealTab} onValueChange={setActiveMealTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="meal-plan">Meal Plan</TabsTrigger>
              <TabsTrigger value="meal-log">Log Meal</TabsTrigger>
              <TabsTrigger value="shopping">
                <ShoppingBag className="h-4 w-4 mr-1" />
                Shopping List
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {!nutritionPlan && !isCreatingNutritionPlan ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Nutrition Plan</CardTitle>
                    <CardDescription>
                      You don't have an active nutrition plan. Create one to start tracking your nutrition goals.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setIsCreatingNutritionPlan(true)}>Create Nutrition Plan</Button>
                  </CardContent>
                </Card>
              ) : isCreatingNutritionPlan ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Nutrition Plan</CardTitle>
                    <CardDescription>
                      Set your nutrition goals based on your training needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <NutritionPlanForm 
                      onSubmit={(data) => createPlanMutation.mutate(data)}
                      onCancel={() => setIsCreatingNutritionPlan(false)}
                      isLoading={createPlanMutation.isPending}
                    />
                  </CardContent>
                </Card>
              ) : (
                <NutritionOverview 
                  nutritionPlan={nutritionPlan} 
                  mealLogs={mealLogs || []} 
                  onCreateNewPlan={() => setIsCreatingNutritionPlan(true)}
                />
              )}
            </TabsContent>
            
            <TabsContent value="meal-plan">
              {!nutritionPlan ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Nutrition Plan</CardTitle>
                    <CardDescription>
                      You need a nutrition plan to access meal planning features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => {
                      setActiveMealTab("overview");
                      setIsCreatingNutritionPlan(true);
                    }}>
                      Create Nutrition Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Meal Plan</CardTitle>
                      <CardDescription>
                        Plan your meals for the week ahead
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MealPlanCalendar 
                        mealLogs={mealLogs || []} 
                        onAddMeal={() => setActiveMealTab("meal-log")}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Meal Suggestions</CardTitle>
                      <CardDescription>
                        AI-generated meal ideas based on your nutrition plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MealSuggestions 
                        nutritionPlan={nutritionPlan}
                        onGetSuggestions={(preferences) => 
                          getMealSuggestionsMutation.mutate(preferences)
                        }
                        isLoading={getMealSuggestionsMutation.isPending}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="meal-log">
              {!nutritionPlan ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Nutrition Plan</CardTitle>
                    <CardDescription>
                      You need a nutrition plan to log meals.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => {
                      setActiveMealTab("overview");
                      setIsCreatingNutritionPlan(true);
                    }}>
                      Create Nutrition Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Log Your Meal</CardTitle>
                    <CardDescription>
                      Track what you eat to stay on top of your nutrition goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <FoodSearchBox 
                        onSearch={handleFoodSearch}
                        onFoodSelect={(food) => {
                          if (food && nutritionPlan) {
                            // Prepare data for meal log
                            const mealData = {
                              athleteId,
                              nutritionPlanId: nutritionPlan.id,
                              name: food.food_name,
                              mealType: "snack", // Default to snack
                              calories: food.nf_calories,
                              protein: food.nf_protein,
                              carbs: food.nf_total_carbohydrate,
                              fat: food.nf_total_fat,
                              servingSize: food.serving_qty,
                              servingUnit: food.serving_unit,
                              date: new Date().toISOString().split('T')[0]
                            };
                            
                            // Log the meal
                            logMealMutation.mutate(mealData);
                          }
                        }}
                        isLoading={isSearching}
                        fullWidth
                      />
                      <Separator />
                      <MealLogForm 
                        onSubmit={(data) => logMealMutation.mutate(data)}
                        nutritionPlanId={nutritionPlan.id}
                        athleteId={athleteId || 0}
                        isLoading={logMealMutation.isPending}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="shopping">
              {!nutritionPlan ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Nutrition Plan</CardTitle>
                    <CardDescription>
                      You need a nutrition plan to generate shopping lists.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => {
                      setActiveMealTab("overview");
                      setIsCreatingNutritionPlan(true);
                    }}>
                      Create Nutrition Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <ShoppingListGenerator 
                  mealLogs={mealLogs || []}
                  nutritionPlan={nutritionPlan}
                  athleteId={athleteId || 0}
                />
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training & Nutrition Insights</CardTitle>
              <CardDescription>
                Analyze your performance and nutrition trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Reports and insights coming soon!
                </p>
                <Button variant="outline" disabled>
                  <LineChart className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}