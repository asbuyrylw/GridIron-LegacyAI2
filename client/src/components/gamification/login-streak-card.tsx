import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarClock, Trophy, Award, Flame } from "lucide-react";
import { useLoginStreak } from "@/hooks/use-login-streak";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

export function LoginStreakCard() {
  const { streak, isLoading } = useLoginStreak();
  
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-amber-500" />
              <span>Login Streak</span>
            </div>
            <Skeleton className="h-6 w-14" />
          </CardTitle>
          <CardDescription>Track your consecutive logins</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }
  
  // Calculate next milestone based on current streak
  let nextMilestone = 5;
  if (streak.currentStreak >= 5) nextMilestone = 10;
  if (streak.currentStreak >= 10) nextMilestone = 25;
  if (streak.currentStreak >= 25) nextMilestone = 50;
  if (streak.currentStreak >= 50) nextMilestone = 100;
  if (streak.currentStreak >= 100) nextMilestone = 365;
  
  // Calculate progress to next milestone
  const progress = Math.min(100, (streak.currentStreak / nextMilestone) * 100);
  
  // Format last login date
  const lastLoginFormatted = streak.lastLoginDate 
    ? format(parseISO(streak.lastLoginDate), 'MMM d, yyyy')
    : 'None';
  
  // Get badge color based on longest streak
  const getBadgeColor = () => {
    if (streak.longestStreak >= 100) return "bg-purple-600 hover:bg-purple-700";
    if (streak.longestStreak >= 50) return "bg-indigo-600 hover:bg-indigo-700";
    if (streak.longestStreak >= 25) return "bg-blue-600 hover:bg-blue-700";
    if (streak.longestStreak >= 10) return "bg-green-600 hover:bg-green-700";
    if (streak.longestStreak >= 5) return "bg-amber-600 hover:bg-amber-700";
    return "bg-gray-600 hover:bg-gray-700";
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" />
            <span>Login Streak</span>
          </div>
          <Badge className="text-md bg-amber-600 hover:bg-amber-700">
            {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        <CardDescription>Track your consecutive logins</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center rounded-md bg-muted p-3">
            <Trophy className="mb-1 h-5 w-5 text-amber-500" />
            <span className="text-xs text-muted-foreground">Longest Streak</span>
            <Badge className={`mt-1 text-md ${getBadgeColor()}`}>
              {streak.longestStreak} day{streak.longestStreak !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex flex-col items-center justify-center rounded-md bg-muted p-3">
            <CalendarClock className="mb-1 h-5 w-5 text-blue-500" />
            <span className="text-xs text-muted-foreground">Last Login</span>
            <span className="mt-1 text-sm font-medium">
              {lastLoginFormatted}
            </span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progress to next milestone ({nextMilestone} days)</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
        
        <div className="rounded-md bg-muted p-3 text-center text-sm">
          <Award className="inline-block h-5 w-5 text-purple-500" /> 
          <span className="ml-1">
            {streak.currentStreak === 0 
              ? "Log in tomorrow to start your streak!" 
              : `Keep logging in daily to earn achievements!`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}