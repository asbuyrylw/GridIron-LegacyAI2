import React, { useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Coffee,
  UtensilsCrossed,
  Moon,
  Apple
} from "lucide-react";

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

interface MealPlanCalendarProps {
  mealLogs: MealLog[];
  onAddMeal: () => void;
}

export function MealPlanCalendar({ mealLogs, onAddMeal }: MealPlanCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Generate the 7 days of the week starting from the current week start
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
  
  // Get icon for meal type
  const getMealTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "breakfast":
        return <Coffee className="h-4 w-4" />;
      case "lunch":
        return <UtensilsCrossed className="h-4 w-4" />;
      case "dinner":
        return <Moon className="h-4 w-4" />;
      case "snack":
        return <Apple className="h-4 w-4" />;
      default:
        return <UtensilsCrossed className="h-4 w-4" />;
    }
  };
  
  // Filter meals for the selected date
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const mealsForSelectedDate = mealLogs.filter(meal => meal.date === selectedDateStr);
  
  // Group by meal type
  const mealsByType = mealsForSelectedDate.reduce<Record<string, MealLog[]>>((acc, meal) => {
    const type = meal.mealType.toLowerCase();
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(meal);
    return acc;
  }, {});
  
  // Calculate total calories for selected date
  const totalCalories = mealsForSelectedDate.reduce((sum, meal) => sum + meal.calories, 0);
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };
  
  return (
    <div className="space-y-6">
      {/* Calendar navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {format(currentWeekStart, "MMMM d")} - {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
        </div>
        <Button variant="outline" size="icon" onClick={goToNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Week day selector */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const dayStr = format(day, "yyyy-MM-dd");
          const mealsForDay = mealLogs.filter(meal => meal.date === dayStr);
          const hasMeals = mealsForDay.length > 0;
          const dayCalories = mealsForDay.reduce((sum, meal) => sum + meal.calories, 0);
          
          return (
            <Button
              key={i}
              variant={isSelected ? "default" : "outline"}
              className="flex flex-col items-center p-2 h-auto space-y-1"
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-xs font-medium">{format(day, "EEE")}</div>
              <div className="font-bold">{format(day, "d")}</div>
              {hasMeals && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {dayCalories} kcal
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
      
      {/* Meals for selected date */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-medium">{format(selectedDate, "EEEE, MMMM d")}</h3>
              <p className="text-sm text-muted-foreground">
                {mealsForSelectedDate.length} meals • {totalCalories} total calories
              </p>
            </div>
            <Button size="sm" onClick={onAddMeal}>
              <Plus className="h-4 w-4 mr-1" />
              Add Meal
            </Button>
          </div>
          
          <ScrollArea className="h-[260px] pr-4">
            {mealsForSelectedDate.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-md">
                <p className="text-muted-foreground mb-2">No meals planned for this day</p>
                <Button variant="outline" size="sm" onClick={onAddMeal}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add a meal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Breakfast */}
                <div>
                  <div className="flex items-center text-sm font-medium mb-2">
                    <Coffee className="h-4 w-4 mr-1.5 text-orange-500" />
                    Breakfast
                  </div>
                  {mealsByType.breakfast?.length ? (
                    <div className="space-y-2">
                      {mealsByType.breakfast.map((meal, index) => (
                        <div key={meal.id || index} className="border rounded-md p-3">
                          <div className="flex justify-between">
                            <div className="font-medium">{meal.name}</div>
                            <div className="text-sm">{meal.calories} kcal</div>
                          </div>
                          <div className="flex space-x-3 mt-1 text-xs text-muted-foreground">
                            <div>P: {meal.protein}g</div>
                            <div>C: {meal.carbs}g</div>
                            <div>F: {meal.fat}g</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-md p-3 text-center text-muted-foreground text-sm">
                      No breakfast planned
                    </div>
                  )}
                </div>
                
                {/* Lunch */}
                <div>
                  <div className="flex items-center text-sm font-medium mb-2">
                    <UtensilsCrossed className="h-4 w-4 mr-1.5 text-blue-500" />
                    Lunch
                  </div>
                  {mealsByType.lunch?.length ? (
                    <div className="space-y-2">
                      {mealsByType.lunch.map((meal, index) => (
                        <div key={meal.id || index} className="border rounded-md p-3">
                          <div className="flex justify-between">
                            <div className="font-medium">{meal.name}</div>
                            <div className="text-sm">{meal.calories} kcal</div>
                          </div>
                          <div className="flex space-x-3 mt-1 text-xs text-muted-foreground">
                            <div>P: {meal.protein}g</div>
                            <div>C: {meal.carbs}g</div>
                            <div>F: {meal.fat}g</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-md p-3 text-center text-muted-foreground text-sm">
                      No lunch planned
                    </div>
                  )}
                </div>
                
                {/* Dinner */}
                <div>
                  <div className="flex items-center text-sm font-medium mb-2">
                    <Moon className="h-4 w-4 mr-1.5 text-purple-500" />
                    Dinner
                  </div>
                  {mealsByType.dinner?.length ? (
                    <div className="space-y-2">
                      {mealsByType.dinner.map((meal, index) => (
                        <div key={meal.id || index} className="border rounded-md p-3">
                          <div className="flex justify-between">
                            <div className="font-medium">{meal.name}</div>
                            <div className="text-sm">{meal.calories} kcal</div>
                          </div>
                          <div className="flex space-x-3 mt-1 text-xs text-muted-foreground">
                            <div>P: {meal.protein}g</div>
                            <div>C: {meal.carbs}g</div>
                            <div>F: {meal.fat}g</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-md p-3 text-center text-muted-foreground text-sm">
                      No dinner planned
                    </div>
                  )}
                </div>
                
                {/* Snacks */}
                <div>
                  <div className="flex items-center text-sm font-medium mb-2">
                    <Apple className="h-4 w-4 mr-1.5 text-green-500" />
                    Snacks
                  </div>
                  {mealsByType.snack?.length ? (
                    <div className="space-y-2">
                      {mealsByType.snack.map((meal, index) => (
                        <div key={meal.id || index} className="border rounded-md p-3">
                          <div className="flex justify-between">
                            <div className="font-medium">{meal.name}</div>
                            <div className="text-sm">{meal.calories} kcal</div>
                          </div>
                          <div className="flex space-x-3 mt-1 text-xs text-muted-foreground">
                            <div>P: {meal.protein}g</div>
                            <div>C: {meal.carbs}g</div>
                            <div>F: {meal.fat}g</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-md p-3 text-center text-muted-foreground text-sm">
                      No snacks planned
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}