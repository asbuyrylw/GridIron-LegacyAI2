import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MealSuggestionsProps {
  athleteId: number;
  nutritionPlan: any;
}

export function MealSuggestions({ athleteId, nutritionPlan }: MealSuggestionsProps) {
  const [mealType, setMealType] = useState("breakfast");
  const [goal, setGoal] = useState("performance");
  const { toast } = useToast();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["/api/athlete", athleteId, "meal-suggestions", mealType, goal],
    queryFn: ({ signal }) => 
      fetch(`/api/athlete/${athleteId}/meal-suggestions?mealType=${mealType}&goal=${goal}`, { signal })
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) return [];
          throw new Error("Failed to fetch meal suggestions");
        }
        return res.json();
      }),
    enabled: !!athleteId && !!nutritionPlan
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/athlete/${athleteId}/meal-suggestions`, {
        mealType,
        goal
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/athlete", athleteId, "meal-suggestions", mealType, goal]
      });
      toast({
        title: "Success",
        description: "Meal suggestion generated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to generate meal suggestion: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  if (!nutritionPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meal Suggestions</CardTitle>
          <CardDescription>
            Create a nutrition plan first to receive AI-powered meal suggestions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Meal Suggestions</CardTitle>
        <CardDescription>
          Get personalized meal ideas based on your nutrition plan and goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          <div className="space-y-2 w-full md:w-1/3">
            <label className="text-sm font-medium">Meal Type</label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
                <SelectItem value="pre_workout">Pre-Workout</SelectItem>
                <SelectItem value="post_workout">Post-Workout</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 w-full md:w-1/3">
            <label className="text-sm font-medium">Fitness Goal</label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="recovery">Recovery</SelectItem>
                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                <SelectItem value="fat_loss">Fat Loss</SelectItem>
                <SelectItem value="energy">Energy & Endurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="w-full md:w-1/3"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ChefHat className="mr-2 h-4 w-4" />
                Generate Meal Idea
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !suggestions || suggestions.length === 0 ? (
          <div className="text-center py-8">
            <ChefHat className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No meal suggestions yet</h3>
            <p className="mt-2 text-muted-foreground">
              Generate your first meal suggestion by clicking the button above.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {suggestions.map((suggestion: any) => (
              <Card key={suggestion.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{suggestion.suggestion.name}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline">{suggestion.mealType.replace(/_/g, " ")}</Badge>
                        <Badge variant="outline">{suggestion.goal.replace(/_/g, " ")}</Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p><span className="font-medium">{Math.round(suggestion.suggestion.nutritionInfo.calories)}</span> kcal</p>
                      <p className="text-muted-foreground text-xs">
                        P: {Math.round(suggestion.suggestion.nutritionInfo.protein)}g | 
                        C: {Math.round(suggestion.suggestion.nutritionInfo.carbs)}g | 
                        F: {Math.round(suggestion.suggestion.nutritionInfo.fat)}g
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <Tabs defaultValue="ingredients">
                    <TabsList className="mb-2">
                      <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                      <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ingredients">
                      <ul className="list-disc pl-5 space-y-1">
                        {suggestion.suggestion.ingredients.map((ingredient: string, index: number) => (
                          <li key={index} className="text-sm">{ingredient}</li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="instructions">
                      <p className="text-sm">{suggestion.suggestion.instructions}</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}