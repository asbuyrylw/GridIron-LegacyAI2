import React from "react";
import { Progress } from "@/components/ui/progress";

interface MacroTarget {
  current: number;
  target: number;
}

interface MacroProgressProps {
  calories: MacroTarget;
  protein: MacroTarget;
  carbs: MacroTarget;
  fat: MacroTarget;
}

export function MacroProgress({ calories, protein, carbs, fat }: MacroProgressProps) {
  // Calculate percentages
  const caloriePercent = Math.min(100, Math.round((calories.current / calories.target) * 100));
  const proteinPercent = Math.min(100, Math.round((protein.current / protein.target) * 100));
  const carbsPercent = Math.min(100, Math.round((carbs.current / carbs.target) * 100));
  const fatPercent = Math.min(100, Math.round((fat.current / fat.target) * 100));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Calories</span>
          <span className="text-sm font-medium">{calories.current} / {calories.target} kcal</span>
        </div>
        <Progress value={caloriePercent} className="h-2" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Protein</span>
          <span className="text-sm font-medium">{protein.current} / {protein.target} g</span>
        </div>
        <Progress value={proteinPercent} className="h-2 bg-blue-100 dark:bg-blue-950">
          <div 
            className="h-full bg-blue-600" 
            style={{ width: `${proteinPercent}%` }}
          />
        </Progress>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Carbs</span>
          <span className="text-sm font-medium">{carbs.current} / {carbs.target} g</span>
        </div>
        <Progress value={carbsPercent} className="h-2 bg-amber-100 dark:bg-amber-950">
          <div 
            className="h-full bg-amber-500" 
            style={{ width: `${carbsPercent}%` }}
          />
        </Progress>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Fat</span>
          <span className="text-sm font-medium">{fat.current} / {fat.target} g</span>
        </div>
        <Progress value={fatPercent} className="h-2 bg-green-100 dark:bg-green-950">
          <div 
            className="h-full bg-green-600" 
            style={{ width: `${fatPercent}%` }}
          />
        </Progress>
      </div>
    </div>
  );
}