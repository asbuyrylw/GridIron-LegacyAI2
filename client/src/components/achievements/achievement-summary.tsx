import { useAchievementProgress } from "@/hooks/use-achievement-progress";
import { ACHIEVEMENT_BADGES } from "@/lib/achievement-badges";
import { useNavigate } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Award, ChevronRight } from "lucide-react";

/**
 * A simple achievement summary card that shows total progress and 
 * recent achievements for display on the dashboard or profile
 */
export function AchievementSummary() {
  const { achievements } = useAchievementProgress();
  const [, navigate] = useNavigate();
  
  // Get the total points
  const totalPoints = achievements
    .filter(a => a.completed)
    .reduce((sum, a) => {
      const achievement = ACHIEVEMENT_BADGES.find(badge => badge.id === a.achievementId);
      return sum + (achievement?.points || 0);
    }, 0);
  
  // Calculate completion percentage
  const completedCount = achievements.filter(a => a.completed).length;
  const totalCount = ACHIEVEMENT_BADGES.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  
  // Get recently completed achievements (up to 3)
  const recentAchievements = achievements
    .filter(a => a.completed && a.completedAt)
    .sort((a, b) => {
      return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
    })
    .slice(0, 3)
    .map(a => {
      return ACHIEVEMENT_BADGES.find(badge => badge.id === a.achievementId);
    })
    .filter(Boolean);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>Your Achievements</span>
          <span className="text-amber-600 font-bold">{totalPoints} pts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Overall Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} />
            <div className="text-xs text-muted-foreground mt-1">
              {completedCount} of {totalCount} achievements unlocked
            </div>
          </div>
          
          {/* Recent achievements */}
          {recentAchievements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Achievements</h4>
              <div className="space-y-2">
                {recentAchievements.map((achievement, index) => (
                  achievement && (
                    <div key={index} className="flex items-center p-2 bg-muted rounded-md">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3`}>
                        <span className="text-lg">{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{achievement.name}</div>
                        <div className="text-xs text-muted-foreground">{achievement.points} pts</div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          
          {/* View all button */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/achievements')}
          >
            <Award className="mr-2 h-4 w-4" />
            View All Achievements
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}