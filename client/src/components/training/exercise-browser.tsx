import { useState, useEffect } from "react";
import { useExercises } from "@/hooks/use-training-hooks";
import { ExerciseLibrary } from "@shared/schema";
import { ExerciseCard } from "./exercise-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { footballPositions } from "@/lib/constants";

interface ExerciseBrowserProps {
  onSelectExercises: (exercises: ExerciseLibrary[]) => void;
  initialSelected?: ExerciseLibrary[];
  maxSelections?: number;
}

export function ExerciseBrowser({
  onSelectExercises,
  initialSelected = [],
  maxSelections = 10,
}: ExerciseBrowserProps) {
  // Filter state
  const [filters, setFilters] = useState<{
    category?: string;
    difficulty?: string;
    position?: string;
  }>({});
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<ExerciseLibrary[]>(initialSelected);
  
  // Fetch exercises based on filters
  const { data: exercises, isLoading, error } = useExercises(filters);
  
  // Effect to sync initialSelected with selectedExercises
  useEffect(() => {
    if (initialSelected.length > 0) {
      setSelectedExercises(initialSelected);
    }
  }, [initialSelected]);
  
  // Categories derived from data
  const categories = exercises 
    ? Array.from(new Set(exercises.map(ex => ex.category)))
    : [];
  
  // Difficulties
  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  
  // Handle selecting an exercise
  const handleSelectExercise = (exercise: ExerciseLibrary) => {
    const isSelected = selectedExercises.some(ex => ex.id === exercise.id);
    
    let newSelectedExercises;
    if (isSelected) {
      // Remove from selection
      newSelectedExercises = selectedExercises.filter(ex => ex.id !== exercise.id);
    } else {
      // Add to selection if under max limit
      if (selectedExercises.length < maxSelections) {
        newSelectedExercises = [...selectedExercises, exercise];
      } else {
        // Could handle max selection error message here
        return;
      }
    }
    
    setSelectedExercises(newSelectedExercises);
    onSelectExercises(newSelectedExercises);
  };
  
  // Filter exercises by search term
  const filteredExercises = exercises 
    ? exercises.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  return (
    <div className="w-full">
      <div className="mb-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[150px]">
            <Select 
              value={filters.category || ""} 
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, category: value || undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <Select 
              value={filters.difficulty || ""} 
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, difficulty: value || undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Difficulties</SelectItem>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <Select 
              value={filters.position || ""} 
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, position: value || undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Positions</SelectItem>
                {footballPositions.map(position => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setFilters({});
              setSearchTerm("");
            }}
            className="gap-1"
          >
            <Filter className="h-4 w-4" /> Clear
          </Button>
        </div>
        
        {selectedExercises.length > 0 && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">
              Selected: {selectedExercises.length}/{maxSelections}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedExercises.map(exercise => (
                <Button
                  key={exercise.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSelectExercise(exercise)}
                  className="gap-1"
                >
                  {exercise.name}
                  <span className="ml-1">×</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center p-8 text-destructive">
          <p>Error loading exercises.</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          <p>No exercises found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSelect={handleSelectExercise}
              isSelected={selectedExercises.some(ex => ex.id === exercise.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}