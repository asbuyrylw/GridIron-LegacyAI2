import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, CheckCircle, Star, TrendingUp, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLoginStreak } from '@/hooks/use-login-streak';

export function LoginStreakCard() {
  const { streak, isLoading, error } = useLoginStreak();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center">
            <CalendarDays className="h-5 w-5 mr-2" />
            <span>Daily Login Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center">
            <CalendarDays className="h-5 w-5 mr-2" />
            <span>Daily Login Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Unable to load streak data
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate the next tier threshold
  const currentStreak = streak.currentStreak;
  let nextMilestone = 0;
  
  if (currentStreak < 3) {
    nextMilestone = 3;
  } else if (currentStreak < 7) {
    nextMilestone = 7;
  } else if (currentStreak < 14) {
    nextMilestone = 14;
  } else if (currentStreak < 30) {
    nextMilestone = 30;
  } else if (currentStreak < 60) {
    nextMilestone = 60;
  } else if (currentStreak < 90) {
    nextMilestone = 90;
  } else {
    nextMilestone = Math.ceil(currentStreak / 30) * 30;
  }
  
  const progressToNextMilestone = (currentStreak / nextMilestone) * 100;

  function getStreakEmoji(count: number) {
    if (count >= 90) return "🔥🔥🔥";
    if (count >= 30) return "🔥🔥";
    if (count >= 7) return "🔥";
    return "";
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center justify-between">
          <div className="flex items-center">
            <CalendarDays className="h-5 w-5 mr-2" />
            <span>Daily Login Streak</span>
          </div>
          {streak.currentStreak > 0 && (
            <Badge variant={streak.currentStreak >= 7 ? "default" : "outline"}>
              {getStreakEmoji(streak.currentStreak)} {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-4">
            <div className="text-2xl font-bold flex items-center">
              {streak.currentStreak}
              {streak.currentStreak >= 7 && <CheckCircle className="h-4 w-4 text-green-500 ml-1" />}
            </div>
            <div className="text-xs text-muted-foreground text-center">Current Streak</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-4">
            <div className="text-2xl font-bold flex items-center">
              {streak.longestStreak}
              {streak.longestStreak >= 30 && <Trophy className="h-4 w-4 text-amber-500 ml-1" />}
            </div>
            <div className="text-xs text-muted-foreground text-center">Record Streak</div>
          </div>
        </div>
        
        {nextMilestone > currentStreak && (
          <div className="space-y-1 mb-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Next milestone</span>
              <span className="font-medium">{currentStreak} / {nextMilestone} days</span>
            </div>
            <Progress value={progressToNextMilestone} />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-1">
        <div className="w-full text-xs text-muted-foreground">
          <div className="flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Keep logging in daily to earn achievement points and rewards
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}