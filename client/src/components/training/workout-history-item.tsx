import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { CheckCircle, ChevronRight, Dumbbell, Calendar } from "lucide-react";

interface WorkoutSessionProps {
  session: {
    id: number;
    athleteId: number;
    title: string;
    focus: string;
    date: string;
    completed: boolean;
    intensity: number;
    durationMinutes: number;
    notes?: string;
  };
}

export function WorkoutHistoryItem({ session }: WorkoutSessionProps) {
  // Format date from ISO string
  const formattedDate = format(parseISO(session.date), "MMM d, yyyy");
  
  // Get intensity level label
  const getIntensityLabel = (level: number) => {
    if (level <= 3) return "Low";
    if (level <= 6) return "Medium";
    return "High";
  };
  
  // Get intensity color class
  const getIntensityColor = (level: number) => {
    if (level <= 3) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    if (level <= 6) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  return (
    <Card className="mb-3 p-4 hover:bg-accent/5 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{session.title}</div>
            <div className="text-sm text-muted-foreground">{session.focus}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="text-sm text-muted-foreground">{session.durationMinutes} mins</div>
          </div>
          
          <div className="flex items-center gap-2">
            {session.completed && (
              <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
                <CheckCircle className="h-3 w-3" />
                <span>Completed</span>
              </Badge>
            )}
            
            <Badge 
              variant="outline" 
              className={`gap-1 ${getIntensityColor(session.intensity)}`}
            >
              {getIntensityLabel(session.intensity)} Intensity
            </Badge>
            
            <Button variant="ghost" size="icon" className="ml-1">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}