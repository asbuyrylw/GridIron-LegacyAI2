import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Separator } from "@/components/ui/separator";
import { ArrowUpCircle, ClipboardCheck, Edit, UtensilsCrossed } from "lucide-react";

interface NutritionOverviewProps {
  nutritionPlan: any;
  mealLogs: any[];
  onCreateNewPlan: () => void;
}

export function NutritionOverview({ nutritionPlan, mealLogs, onCreateNewPlan }: NutritionOverviewProps) {
  // Calculate daily nutrition progress
  const dailyCaloriesConsumed = mealLogs.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const dailyProteinConsumed = mealLogs.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const dailyCarbsConsumed = mealLogs.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  const dailyFatConsumed = mealLogs.reduce((sum, meal) => sum + (meal.fat || 0), 0);

  const calorieProgress = Math.min(100, Math.round((dailyCaloriesConsumed / nutritionPlan.dailyCalories) * 100));
  const proteinProgress = Math.min(100, Math.round((dailyProteinConsumed / nutritionPlan.proteinTarget) * 100));
  const carbProgress = Math.min(100, Math.round((dailyCarbsConsumed / nutritionPlan.carbTarget) * 100));
  const fatProgress = Math.min(100, Math.round((dailyFatConsumed / nutritionPlan.fatTarget) * 100));

  // Format nutrition goal to display
  const formatGoal = (goal: string) => {
    switch (goal) {
      case "lose_weight":
        return "Weight Loss";
      case "gain_weight":
        return "Weight Gain";
      case "maintain":
        return "Weight Maintenance";
      case "performance":
        return "Performance";
      case "recovery":
        return "Recovery";
      default:
        return goal.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Nutrition Plan: {formatGoal(nutritionPlan.goal)}</CardTitle>
            <CardDescription>
              Daily targets based on your goals and training needs
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onCreateNewPlan}>
            <Edit className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <ProgressRing 
                progress={calorieProgress} 
                size={100} 
                strokeWidth={8} 
                showText
              />
              <p className="mt-2 text-sm font-medium">Calories</p>
              <p className="text-sm text-muted-foreground">{dailyCaloriesConsumed} / {nutritionPlan.dailyCalories} kcal</p>
            </div>
            <div className="flex flex-col items-center">
              <ProgressRing 
                progress={proteinProgress} 
                size={100} 
                strokeWidth={8} 
                color="#0288d1" 
                showText
              />
              <p className="mt-2 text-sm font-medium">Protein</p>
              <p className="text-sm text-muted-foreground">{dailyProteinConsumed} / {nutritionPlan.proteinTarget}g</p>
            </div>
            <div className="flex flex-col items-center">
              <ProgressRing 
                progress={carbProgress} 
                size={100} 
                strokeWidth={8} 
                color="#43a047" 
                showText
              />
              <p className="mt-2 text-sm font-medium">Carbs</p>
              <p className="text-sm text-muted-foreground">{dailyCarbsConsumed} / {nutritionPlan.carbTarget}g</p>
            </div>
            <div className="flex flex-col items-center">
              <ProgressRing 
                progress={fatProgress} 
                size={100} 
                strokeWidth={8} 
                color="#ff9800" 
                showText
              />
              <p className="mt-2 text-sm font-medium">Fat</p>
              <p className="text-sm text-muted-foreground">{dailyFatConsumed} / {nutritionPlan.fatTarget}g</p>
            </div>
          </div>

          <Separator className="my-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Plan Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Calories:</span>
                  <span className="font-medium">{nutritionPlan.dailyCalories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protein Target:</span>
                  <span className="font-medium">{nutritionPlan.proteinTarget}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carb Target:</span>
                  <span className="font-medium">{nutritionPlan.carbTarget}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fat Target:</span>
                  <span className="font-medium">{nutritionPlan.fatTarget}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meal Frequency:</span>
                  <span className="font-medium">{nutritionPlan.mealFrequency} meals/day</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Nutrition Tips</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <ClipboardCheck className="h-5 w-5 mt-0.5 text-primary" />
                  <p className="text-sm">Prioritize protein to support muscle recovery after workouts.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <ArrowUpCircle className="h-5 w-5 mt-0.5 text-primary" />
                  <p className="text-sm">Increase carbohydrate intake on heavy training days for fuel.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <UtensilsCrossed className="h-5 w-5 mt-0.5 text-primary" />
                  <p className="text-sm">Stay hydrated with at least 3-4 liters of water daily for optimal performance.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          {nutritionPlan.restrictions && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">Dietary Restrictions:</h4>
              <p className="text-sm text-muted-foreground">{nutritionPlan.restrictions}</p>
            </div>
          )}
          {nutritionPlan.preferredMeals && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">Preferred Foods:</h4>
              <p className="text-sm text-muted-foreground">{nutritionPlan.preferredMeals}</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}