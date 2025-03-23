import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NutritionPlanForm } from "@/components/nutrition/nutrition-plan-form";
import { MealLogForm } from "@/components/nutrition/meal-log-form";
import { NutritionOverview } from "@/components/nutrition/nutrition-overview";
import { MealSuggestions } from "@/components/nutrition/meal-suggestions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isAddingMeal, setIsAddingMeal] = useState(false);

  const { data: athlete, isLoading: isLoadingAthlete } = useQuery({
    queryKey: ["/api/athlete/me"],
    queryFn: ({ signal }) => 
      fetch("/api/athlete/me", { signal })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch athlete profile");
        return res.json();
      }),
    enabled: !!user
  });

  const { data: nutritionPlan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ["/api/athlete", athlete?.id, "nutrition", "active"],
    queryFn: ({ signal }) => 
      fetch(`/api/athlete/${athlete?.id}/nutrition/active`, { signal })
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) return null;
          throw new Error("Failed to fetch nutrition plan");
        }
        return res.json();
      }),
    enabled: !!athlete
  });

  const { data: mealLogs, isLoading: isLoadingMeals } = useQuery({
    queryKey: ["/api/athlete", athlete?.id, "meals"],
    queryFn: ({ signal }) => 
      fetch(`/api/athlete/${athlete?.id}/meals?date=${new Date().toISOString().split('T')[0]}`, { signal })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch meal logs");
        return res.json();
      }),
    enabled: !!athlete
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const res = await apiRequest("POST", `/api/athlete/${athlete?.id}/nutrition`, planData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/athlete", athlete?.id, "nutrition", "active"] });
      setIsCreatingPlan(false);
      toast({
        title: "Success",
        description: "Nutrition plan created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create nutrition plan: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const createMealLogMutation = useMutation({
    mutationFn: async (mealData: any) => {
      const res = await apiRequest("POST", `/api/athlete/${athlete?.id}/meals`, mealData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/athlete", athlete?.id, "meals"] });
      setIsAddingMeal(false);
      toast({
        title: "Success",
        description: "Meal logged successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to log meal: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const isLoading = isLoadingAthlete || isLoadingPlan || isLoadingMeals;

  if (isLoading) {
    return (
      <div className="container px-4 py-8">
        <Skeleton className="h-12 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Nutrition Plan</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mealLog">Meal Log</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {!nutritionPlan && !isCreatingPlan ? (
            <Card>
              <CardHeader>
                <CardTitle>No Nutrition Plan</CardTitle>
                <CardDescription>
                  You don't have an active nutrition plan. Create one to start tracking your nutrition goals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setIsCreatingPlan(true)}>Create Nutrition Plan</Button>
              </CardContent>
            </Card>
          ) : isCreatingPlan ? (
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
                  onCancel={() => setIsCreatingPlan(false)}
                  isLoading={createPlanMutation.isPending}
                />
              </CardContent>
            </Card>
          ) : (
            <NutritionOverview 
              nutritionPlan={nutritionPlan} 
              mealLogs={mealLogs || []} 
              onCreateNewPlan={() => setIsCreatingPlan(true)}
            />
          )}
        </TabsContent>

        <TabsContent value="mealLog">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Meals</CardTitle>
                <CardDescription>
                  Track your daily food intake
                </CardDescription>
              </div>
              {!isAddingMeal && (
                <Button onClick={() => setIsAddingMeal(true)}>Add Meal</Button>
              )}
            </CardHeader>
            <CardContent>
              {isAddingMeal ? (
                <MealLogForm 
                  onSubmit={(data) => createMealLogMutation.mutate({
                    ...data,
                    date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD
                  })}
                  onCancel={() => setIsAddingMeal(false)}
                  isLoading={createMealLogMutation.isPending}
                />
              ) : (
                <div className="space-y-4">
                  {mealLogs && mealLogs.length > 0 ? (
                    mealLogs.map((meal: any) => (
                      <Card key={meal.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{meal.name}</h3>
                            <p className="text-sm text-muted-foreground">{meal.mealType}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{meal.calories} calories</p>
                            <p className="text-sm text-muted-foreground">
                              P: {meal.protein || 0}g | C: {meal.carbs || 0}g | F: {meal.fat || 0}g
                            </p>
                          </div>
                        </div>
                        {meal.notes && <p className="mt-2 text-sm">{meal.notes}</p>}
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No meals logged today.</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsAddingMeal(true)}>
                        Log Your First Meal
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <MealSuggestions athleteId={athlete?.id} nutritionPlan={nutritionPlan} />
        </TabsContent>
      </Tabs>
    </div>
  );
}