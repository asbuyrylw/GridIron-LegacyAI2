import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Achievement {
  id: number;
  name: string;
  description: string;
  type: "performance" | "training" | "nutrition" | "profile" | "social" | "recruiting" | "academic";
  icon: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  achievementId: string;
  dateEarned: Date;
}

export function AchievementsSummary() {
  const { user } = useAuth();
  const athleteId = user?.athlete?.id;
  
  // Fetch achievements data
  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: [`/api/athlete/${athleteId}/achievements`],
    enabled: !!athleteId,
  });
  
  // Get color based on achievement level
  const getLevelColor = (level: string) => {
    switch (level) {
      case "bronze":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "silver":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "platinum":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };
  
  // Sort and limit achievements - show most recent
  const recentAchievements = achievements 
    ? [...achievements].sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime()).slice(0, 3)
    : [];
  
  // Default achievements if none are loaded
  const defaultAchievements = [
    {
      id: 1,
      name: "Speed Demon",
      level: "bronze",
      type: "performance",
      dateEarned: new Date()
    },
    {
      id: 2,
      name: "Perfect Attendance",
      level: "silver",
      type: "training",
      dateEarned: new Date(Date.now() - 86400000) // Yesterday
    },
    {
      id: 3,
      name: "Networking Pro",
      level: "bronze",
      type: "recruiting",
      dateEarned: new Date(Date.now() - 172800000) // 2 days ago
    }
  ];
  
  // Use actual data or fallback
  const displayAchievements = recentAchievements.length > 0 ? recentAchievements : defaultAchievements;
  
  // Format date to display relative time
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return `${diffDays} days ago`;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-500" />
          <span>Recent Achievements</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant="outline" className={`mr-2 capitalize ${getLevelColor(achievement.level)}`}>
                  {achievement.level}
                </Badge>
                <div>
                  <div className="text-sm font-medium">{achievement.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(achievement.dateEarned)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Link href="/achievements">
            <Button variant="ghost" size="sm" className="w-full mt-2 flex items-center justify-between">
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}