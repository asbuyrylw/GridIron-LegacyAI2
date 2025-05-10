import { ExerciseLibrary } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dumbbell, 
  Info, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Play,
  Image as ImageIcon
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: ExerciseLibrary;
  onSelect?: (exercise: ExerciseLibrary) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export function ExerciseCard({ 
  exercise, 
  onSelect, 
  isSelected = false,
  showActions = true
}: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Extract muscle groups and convert from JSON if needed
  const muscleGroups = typeof exercise.muscleGroups === 'string' 
    ? JSON.parse(exercise.muscleGroups) 
    : exercise.muscleGroups;

  // Extract instructions and convert from JSON if needed
  const instructions = typeof exercise.instructions === 'string'
    ? JSON.parse(exercise.instructions)
    : exercise.instructions;

  // Extract tips and convert from JSON if needed
  const tips = exercise.tips 
    ? (typeof exercise.tips === 'string' ? JSON.parse(exercise.tips) : exercise.tips)
    : [];

  // Extract positions (if position-specific)
  const positions = exercise.positionSpecific && exercise.positions
    ? (typeof exercise.positions === 'string' ? JSON.parse(exercise.positions) : exercise.positions)
    : [];

  // Determine difficulty color
  const difficultyColor = {
    'beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }[exercise.difficulty.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

  return (
    <Card className={cn(
      "transition-all duration-200",
      isSelected ? "border-primary border-2" : "",
      expanded ? "shadow-lg" : "shadow"
    )}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{exercise.name}</CardTitle>
          {exercise.positionSpecific && (
            <Badge variant="outline" className="ml-2">
              {positions.join(', ')}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge className={difficultyColor}>
            {exercise.difficulty}
          </Badge>
          <Badge variant="outline">
            {exercise.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <CardDescription className="text-sm mt-2">
          {exercise.description}
        </CardDescription>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center mt-3 text-sm text-primary"
        >
          {expanded ? (
            <>Less details <ChevronUp className="h-4 w-4 ml-1" /></>
          ) : (
            <>More details <ChevronDown className="h-4 w-4 ml-1" /></>
          )}
        </button>
        
        {expanded && (
          <div className="mt-3">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="instructions">
                <AccordionTrigger className="text-sm font-medium">
                  Instructions
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 text-sm space-y-1">
                    {Array.isArray(instructions) && instructions.map((instruction, idx) => (
                      <li key={idx}>{instruction}</li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              {tips && tips.length > 0 && (
                <AccordionItem value="tips">
                  <AccordionTrigger className="text-sm font-medium">
                    Tips
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {Array.isArray(tips) && tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              <AccordionItem value="target-muscles">
                <AccordionTrigger className="text-sm font-medium">
                  Target Muscles
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(muscleGroups) && muscleGroups.map((muscle, idx) => (
                      <Badge variant="secondary" key={idx}>{muscle}</Badge>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {exercise.equipmentNeeded && (
                <AccordionItem value="equipment">
                  <AccordionTrigger className="text-sm font-medium">
                    Equipment Needed
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 text-sm">
                      {Array.isArray(exercise.equipmentNeeded) 
                        ? exercise.equipmentNeeded.map((eq, idx) => (
                            <li key={idx}>{eq}</li>
                          ))
                        : typeof exercise.equipmentNeeded === 'string'
                          ? JSON.parse(exercise.equipmentNeeded).map((eq: string, idx: number) => (
                              <li key={idx}>{eq}</li>
                            ))
                          : <li>No specific equipment needed</li>
                      }
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
            
            <div className="mt-4 flex gap-2">
              {exercise.videoUrl && (
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">
                    <Play className="h-4 w-4" /> Video
                  </a>
                </Button>
              )}
              
              {exercise.imageUrl && (
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href={exercise.imageUrl} target="_blank" rel="noopener noreferrer">
                    <ImageIcon className="h-4 w-4" /> Image
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      {showActions && (
        <CardFooter className="p-4 pt-1 flex justify-end">
          <Button 
            onClick={() => onSelect && onSelect(exercise)}
            variant={isSelected ? "default" : "secondary"}
            size="sm"
            className="gap-1"
          >
            {isSelected ? (
              <>
                <CheckCircle className="h-4 w-4" /> 
                Selected
              </>
            ) : (
              <>
                <Dumbbell className="h-4 w-4" /> 
                Add to Workout
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}