import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function YearlyGoals() {
  // This would typically be fetched from the API
  const goals = {
    division: "D1",
    performanceGoals: [
      { name: "40-Yard Dash", target: "4.5 sec" },
      { name: "Bench Press", target: "18 reps" },
      { name: "Vertical Jump", target: "36 inches" },
      { name: "GPA", target: "3.5+" },
    ],
    trainingFocus: "Speed and explosive power development while maintaining strength gains."
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-lg">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span>Yearly Goals</span>
          </div>
          <span className="text-sm font-normal text-muted-foreground">Target: {goals.division}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Performance Targets</h3>
            <div className="grid grid-cols-2 gap-2">
              {goals.performanceGoals.map((goal, index) => (
                <div key={index} className="text-xs p-2 bg-muted rounded-md">
                  <span className="font-medium">{goal.name}</span>: {goal.target}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-1">Training Focus</h3>
            <p className="text-xs text-muted-foreground">{goals.trainingFocus}</p>
          </div>
          
          <Link href="/plan">
            <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
              <span>View Full Plan</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}