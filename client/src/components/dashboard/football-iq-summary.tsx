import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ChevronRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

interface FootballIqProgress {
  id: number;
  athleteId: number;
  level: string;
  score: number;
  totalQuizzes: number;
  completedQuizzes: number;
  streak: number;
  lastQuizDate: Date | null;
}

export function FootballIqSummary() {
  const { user } = useAuth();
  const athleteId = user?.athlete?.id;
  
  // Fetch football IQ progress for the current athlete
  const { data: footballIqProgress, isLoading } = useQuery<FootballIqProgress>({
    queryKey: [`/api/football-iq/athlete/${athleteId}/progress`],
    enabled: !!athleteId,
  });
  
  // Fallback data if not loaded yet
  const [progress] = useState({
    level: "Rookie",
    score: 125,
    totalQuizzes: 15,
    completedQuizzes: 3,
    streak: 2,
  });
  
  // Use actual data or fallback
  const currentProgress = footballIqProgress || progress;
  
  // Calculate the progress percentage
  const completionPercentage = Math.round((currentProgress.completedQuizzes / currentProgress.totalQuizzes) * 100);
  
  // Get the path to the quiz page
  const getQuizPath = () => {
    return "/football-iq/quiz";
  };
  
  // Get color based on the level
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "rookie":
        return "text-blue-600";
      case "developing":
        return "text-green-600";
      case "experienced":
        return "text-amber-600";
      case "advanced":
        return "text-purple-600";
      case "elite":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-lg">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-500" />
            <span>Football IQ</span>
          </div>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${getLevelColor(currentProgress.level)}`}>
              {currentProgress.level}
            </span>
            {currentProgress.streak > 0 && (
              <div className="ml-2 flex items-center bg-amber-100 rounded-full px-1.5 py-0.5">
                <Trophy className="h-3 w-3 text-amber-600 mr-0.5" />
                <span className="text-xs text-amber-800">{currentProgress.streak}🔥</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Quiz Progress</span>
              <span className="text-xs font-medium">{currentProgress.completedQuizzes} of {currentProgress.totalQuizzes}</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted rounded-md p-2">
              <div className="text-2xl font-semibold text-center">
                {currentProgress.score}
              </div>
              <div className="text-xs text-center text-muted-foreground">Total Score</div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-2xl font-semibold text-center">
                {currentProgress.completedQuizzes > 0 
                  ? Math.round(currentProgress.score / currentProgress.completedQuizzes)
                  : 0
                }
              </div>
              <div className="text-xs text-center text-muted-foreground">Avg. Score</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={getQuizPath()} className="w-full">
          <Button variant="outline" size="sm" className="w-full flex items-center justify-between">
            <span>Take Next Quiz</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}