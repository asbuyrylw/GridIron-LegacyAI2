import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarClock, Dumbbell, Flame } from "lucide-react";

export function TrainingPlanView() {
  // This is a placeholder component - in a full implementation, this would fetch
  // the active training plan for the athlete and display relevant details

  // Mock data
  const trainingPlan = {
    id: 1,
    title: "Pre-Season Strength and Conditioning",
    focus: "Lower-body power and explosive speed",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    workoutsPerWeek: 4,
    completed: false,
    exercises: [
      {
        id: 1,
        name: "Back Squat",
        sets: 4,
        reps: "6-8",
        rest: "2-3 min",
        notes: "Focus on controlled eccentric motion"
      },
      {
        id: 2,
        name: "Plyometric Box Jumps",
        sets: 3,
        reps: "10",
        rest: "90 sec",
        notes: "Maximum height jumps with full recovery"
      },
      {
        id: 3,
        name: "Bulgarian Split Squats",
        sets: 3,
        reps: "12 each side",
        rest: "60-90 sec",
        notes: "Keep front knee aligned with foot"
      },
      {
        id: 4,
        name: "Agility Ladder Drills",
        sets: 4,
        reps: "30 sec",
        rest: "30 sec",
        notes: "Focus on foot speed and coordination"
      }
    ]
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center">
                <Flame className="h-5 w-5 mr-2 text-primary" />
                {trainingPlan.title}
              </CardTitle>
              <CardDescription>
                Focus: {trainingPlan.focus}
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="outline" className="flex items-center">
                <CalendarClock className="h-3 w-3 mr-1" />
                7-day plan
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <Dumbbell className="h-3 w-3 mr-1" />
                {trainingPlan.workoutsPerWeek}x per week
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Today's Exercises</h3>
              <p className="text-sm text-muted-foreground mb-4">Complete all sets and reps for each exercise</p>
              
              <div className="space-y-3">
                {trainingPlan.exercises.map((exercise, i) => (
                  <div key={exercise.id} className="border rounded-md p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{exercise.name}</h4>
                        <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs bg-primary/10 px-2 py-1 rounded-md">
                          <span className="font-medium">{exercise.sets}</span> sets
                        </div>
                        <div className="text-xs bg-primary/10 px-2 py-1 rounded-md">
                          <span className="font-medium">{exercise.reps}</span> reps
                        </div>
                        <div className="text-xs bg-primary/10 px-2 py-1 rounded-md">
                          <span className="font-medium">{exercise.rest}</span> rest
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between">
              <Button variant="outline">View Full Plan</Button>
              <Button>Start Workout</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}