import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Sparkles, 
  Coffee, 
  UtensilsCrossed, 
  Moon, 
  Plus,
  Clock,
  ThumbsUp 
} from "lucide-react";

interface NutritionPlan {
  id: number;
  dailyCalories: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

interface MealSuggestion {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  ingredients: string[];
  preparationTime: number;
}

interface MealSuggestionsProps {
  nutritionPlan: NutritionPlan;
  onGetSuggestions: (preferences: string[]) => Promise<any>;
  isLoading?: boolean;
}

export function MealSuggestions({ 
  nutritionPlan, 
  onGetSuggestions, 
  isLoading = false 
}: MealSuggestionsProps) {
  const [preferences, setPreferences] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<MealSuggestion[] | null>(null);
  
  // Dietary preference options
  const dietaryOptions = [
    { id: "high-protein", label: "High Protein" },
    { id: "low-carb", label: "Low Carb" },
    { id: "vegetarian", label: "Vegetarian" },
    { id: "dairy-free", label: "Dairy Free" },
    { id: "gluten-free", label: "Gluten Free" },
    { id: "quick-prep", label: "Quick Prep (<15 min)" },
    { id: "budget-friendly", label: "Budget Friendly" },
    { id: "athlete-friendly", label: "Athlete Performance" },
  ];
  
  // Toggle a preference in the selection
  const togglePreference = (id: string) => {
    setPreferences(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id) 
        : [...prev, id]
    );
  };
  
  // Generate meal suggestions based on preferences
  const handleGenerateSuggestions = async () => {
    try {
      const result = await onGetSuggestions(preferences);
      setSuggestions(result);
    } catch (error) {
      console.error("Error generating meal suggestions:", error);
    }
  };
  
  // Get icon for meal type
  const getMealTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "breakfast":
        return <Coffee className="h-4 w-4" />;
      case "lunch":
        return <UtensilsCrossed className="h-4 w-4" />;
      case "dinner":
        return <Moon className="h-4 w-4" />;
      default:
        return <UtensilsCrossed className="h-4 w-4" />;
    }
  };
  
  // Placeholder data for initial UI display
  const placeholderSuggestions: MealSuggestion[] = [
    {
      name: "Greek Yogurt Protein Bowl",
      calories: 420,
      protein: 32,
      carbs: 45,
      fat: 12,
      mealType: "breakfast",
      ingredients: ["Greek yogurt", "Protein powder", "Granola", "Mixed berries", "Honey"],
      preparationTime: 5
    },
    {
      name: "Grilled Chicken & Quinoa Salad",
      calories: 580,
      protein: 42,
      carbs: 65,
      fat: 18,
      mealType: "lunch",
      ingredients: ["Chicken breast", "Quinoa", "Mixed greens", "Cherry tomatoes", "Olive oil", "Lemon"],
      preparationTime: 25
    },
    {
      name: "Baked Salmon with Sweet Potato",
      calories: 650,
      protein: 38,
      carbs: 40,
      fat: 25,
      mealType: "dinner",
      ingredients: ["Salmon fillet", "Sweet potato", "Asparagus", "Olive oil", "Herbs"],
      preparationTime: 30
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="text-sm">Select dietary preferences:</div>
        <div className="grid grid-cols-2 gap-3">
          {dietaryOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox 
                id={option.id} 
                checked={preferences.includes(option.id)}
                onCheckedChange={() => togglePreference(option.id)}
              />
              <label 
                htmlFor={option.id} 
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={handleGenerateSuggestions} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Meal Suggestions
            </>
          )}
        </Button>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="font-medium">Suggested Meals</div>
        
        <ScrollArea className="h-[300px] pr-4">
          {!suggestions && !isLoading ? (
            <div className="space-y-4">
              {placeholderSuggestions.map((meal, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          {getMealTypeIcon(meal.mealType)}
                          <span className="font-medium ml-2 capitalize">{meal.mealType}</span>
                        </div>
                        <h3 className="font-medium mt-2">{meal.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{meal.preparationTime} min prep time</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {meal.calories} kcal
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-xs">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {meal.protein}g
                        </span>
                        <span className="text-muted-foreground"> protein</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {meal.carbs}g
                        </span>
                        <span className="text-muted-foreground"> carbs</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {meal.fat}g
                        </span>
                        <span className="text-muted-foreground"> fat</span>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="text-xs">
                      <span className="font-medium">Ingredients: </span>
                      {meal.ingredients.join(", ")}
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <Button variant="outline" size="sm" className="text-primary">
                        <Plus className="h-3 w-3 mr-1" />
                        Add to Meal Plan
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Like
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="text-center text-sm text-muted-foreground pt-4">
                <p>These are example suggestions. Click "Generate Meal Suggestions" for personalized recommendations.</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((meal, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          {getMealTypeIcon(meal.mealType)}
                          <span className="font-medium ml-2 capitalize">{meal.mealType}</span>
                        </div>
                        <h3 className="font-medium mt-2">{meal.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{meal.preparationTime} min prep time</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {meal.calories} kcal
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-xs">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {meal.protein}g
                        </span>
                        <span className="text-muted-foreground"> protein</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {meal.carbs}g
                        </span>
                        <span className="text-muted-foreground"> carbs</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {meal.fat}g
                        </span>
                        <span className="text-muted-foreground"> fat</span>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="text-xs">
                      <span className="font-medium">Ingredients: </span>
                      {meal.ingredients.join(", ")}
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <Button variant="outline" size="sm" className="text-primary">
                        <Plus className="h-3 w-3 mr-1" />
                        Add to Meal Plan
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Like
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No suggestions available. Try different preferences.
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}