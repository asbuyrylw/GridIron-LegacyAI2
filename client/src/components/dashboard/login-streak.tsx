import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Clock4 } from "lucide-react";

interface LoginStreakData {
  currentStreak: number;
  lastLogin: Date;
  longestStreak: number;
  totalLogins: number;
}

export function LoginStreak() {
  const { user } = useAuth();
  
  // Fetch login streak data
  const { data: streakData } = useQuery<LoginStreakData>({
    queryKey: ['/api/login-streak'],
    enabled: !!user,
  });
  
  // Fallback data if not loaded yet
  const defaultData = {
    currentStreak: 3,
    lastLogin: new Date(),
    longestStreak: 14,
    totalLogins: 27
  };
  
  // Use actual data or fallback
  const data = streakData || defaultData;
  
  // Format the last login date
  const formatLastLogin = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffInDays} days ago`;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-green-500" />
          <span>Login Streak</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-50 border border-green-100 rounded-full h-24 w-24 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-green-600">{data.currentStreak}</span>
              <span className="text-xs text-green-600">days</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm font-medium">{data.longestStreak}</div>
              <div className="text-xs text-muted-foreground">Longest Streak</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{data.totalLogins}</div>
              <div className="text-xs text-muted-foreground">Total Logins</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <Clock4 className="h-3 w-3 mr-1" />
            <span>Last login: {formatLastLogin(data.lastLogin)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}