import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Clock, ArrowRight } from "lucide-react";

interface MealLog {
  id: number;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  date: string;
}

interface NutritionPlan {
  id: number;
  dailyCalories: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

interface DailyNutritionSummaryProps {
  mealLogs: MealLog[];
  nutritionPlan: NutritionPlan;
  onLogMeal: () => void;
}

export function DailyNutritionSummary({ mealLogs, nutritionPlan, onLogMeal }: DailyNutritionSummaryProps) {
  const mealTypeOrder = ["breakfast", "lunch", "dinner", "snack"];
  
  // Group meals by type
  const mealsByType = mealLogs.reduce<Record<string, MealLog[]>>((acc, meal) => {
    const type = meal.mealType.toLowerCase();
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(meal);
    return acc;
  }, {});
  
  // Calculate remaining calories
  const consumedCalories = mealLogs.reduce((sum, meal) => sum + meal.calories, 0);
  const remainingCalories = nutritionPlan.dailyCalories - consumedCalories;
  
  // Calculate remaining macros
  const consumedProtein = mealLogs.reduce((sum, meal) => sum + meal.protein, 0);
  const consumedCarbs = mealLogs.reduce((sum, meal) => sum + meal.carbs, 0);
  const consumedFat = mealLogs.reduce((sum, meal) => sum + meal.fat, 0);
  
  const remainingProtein = nutritionPlan.proteinTarget - consumedProtein;
  const remainingCarbs = nutritionPlan.carbTarget - consumedCarbs;
  const remainingFat = nutritionPlan.fatTarget - consumedFat;
  
  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case "breakfast":
        return "Breakfast";
      case "lunch":
        return "Lunch";
      case "dinner":
        return "Dinner";
      case "snack":
        return "Snacks";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Remaining Calories</div>
          <div className="text-2xl font-bold mt-1">
            {remainingCalories > 0 ? remainingCalories : 0}
            <span className="text-sm font-normal text-muted-foreground ml-1">kcal</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Remaining Macros</div>
          <div className="flex items-center space-x-3 mt-1">
            <div className="text-sm">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                P: {remainingProtein > 0 ? remainingProtein : 0}g
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-amber-600 dark:text-amber-400">
                C: {remainingCarbs > 0 ? remainingCarbs : 0}g
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-green-600 dark:text-green-400">
                F: {remainingFat > 0 ? remainingFat : 0}g
              </span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Meals by type */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Today's Meals</h3>
          <Button size="sm" variant="outline" onClick={onLogMeal}>
            <Plus className="h-4 w-4 mr-1" />
            Log Meal
          </Button>
        </div>
        
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {mealTypeOrder.map(type => (
              <div key={type}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{getMealTypeLabel(type)}</h4>
                  {mealsByType[type]?.length ? (
                    <Badge variant="outline">
                      {mealsByType[type].reduce((sum, meal) => sum + meal.calories, 0)} kcal
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      No meals
                    </Badge>
                  )}
                </div>
                
                {mealsByType[type]?.length ? (
                  <div className="space-y-2">
                    {mealsByType[type].map((meal, index) => (
                      <div key={meal.id || index} className="border rounded-md p-3">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{meal.name}</div>
                          <div className="text-sm">{meal.calories} kcal</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {meal.servingSize} {meal.servingUnit}
                        </div>
                        <div className="flex space-x-3 mt-2 text-xs">
                          <div>P: {meal.protein}g</div>
                          <div>C: {meal.carbs}g</div>
                          <div>F: {meal.fat}g</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed rounded-md p-4 text-center text-muted-foreground text-sm">
                    No {type}s logged today
                    <div className="mt-2">
                      <Button variant="ghost" size="sm" onClick={onLogMeal}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add {type}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Recommendations */}
      <div className="mt-6">
        <Separator className="mb-4" />
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Recommended Next Meal</h3>
          <Button variant="link" size="sm" className="text-primary">
            Get Suggestions <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="mt-2 border rounded-md p-4">
          <div className="text-sm text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Next recommended meal time
          </div>
          <div className="mt-2">
            <h4 className="font-medium">Protein Smoothie with Mixed Berries</h4>
            <div className="text-sm mt-1">320 kcal • 28g protein • 40g carbs • 6g fat</div>
          </div>
        </div>
      </div>
    </div>
  );
}