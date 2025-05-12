import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Medal, Calendar, Star } from "lucide-react";

type LeaderboardTimeframe = 'weekly' | 'monthly' | 'allTime';
type LeaderboardScope = 'team' | 'school' | 'global';

interface LeaderboardEntry {
  id: number;
  userId: number;
  athleteId: number;
  rank: number;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  points: number;
  position: string;
  tier: string;
  level: number;
}

interface LeaderboardProps {
  timeframe?: LeaderboardTimeframe;
  scope?: LeaderboardScope;
  showFilters?: boolean;
  limit?: number;
  title?: string;
  description?: string;
}

export function Leaderboard({
  timeframe: initialTimeframe = 'weekly',
  scope: initialScope = 'team',
  showFilters = true,
  limit = 10,
  title = "Leaderboard",
  description = "Top athletes by achievement points",
}: LeaderboardProps) {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>(initialTimeframe);
  const [scope, setScope] = useState<LeaderboardScope>(initialScope);
  
  // Get leaderboard data
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard', timeframe, scope],
    enabled: !!user,
  });
  
  // Find current user's position in leaderboard
  const userEntry = user ? leaderboard.find(entry => entry.userId === user.id) : undefined;
  
  // Format timeframe for display
  const timeframeDisplay = {
    weekly: "This Week",
    monthly: "This Month",
    allTime: "All Time"
  };
  
  // Format scope for display
  const scopeDisplay = {
    team: "Team",
    school: "School",
    global: "Global"
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </div>
          
          {showFilters && (
            <div className="flex gap-2">
              <Select
                value={timeframe}
                onValueChange={(value) => setTimeframe(value as LeaderboardTimeframe)}
              >
                <SelectTrigger className="w-[120px]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <SelectValue placeholder="Timeframe" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={scope}
                onValueChange={(value) => setScope(value as LeaderboardScope)}
              >
                <SelectTrigger className="w-[120px]">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <SelectValue placeholder="Scope" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {!showFilters && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{timeframeDisplay[timeframe]}</span>
            <span>•</span>
            <Users className="h-3.5 w-3.5" />
            <span>{scopeDisplay[scope]}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Loading state
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))
        ) : leaderboard.length > 0 ? (
          // Leaderboard entries
          <div className="space-y-1">
            {leaderboard.slice(0, limit).map((entry, index) => {
              const isCurrentUser = user?.id === entry.userId;
              const medalColor = index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-700" : "text-gray-400";
              
              return (
                <div 
                  key={entry.id} 
                  className={`
                    flex items-center gap-3 p-2.5 rounded-md
                    ${isCurrentUser ? 'bg-primary/10' : 'hover:bg-muted/40'} 
                    transition-colors
                  `}
                >
                  {/* Rank */}
                  <div className="font-semibold w-7 text-center flex items-center justify-center">
                    {index < 3 ? (
                      <Medal className={`h-5 w-5 ${medalColor}`} />
                    ) : (
                      <span className="text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={entry.profileImage || undefined} alt={`${entry.firstName} ${entry.lastName}`} />
                    <AvatarFallback>
                      {entry.firstName.charAt(0)}{entry.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="font-medium truncate">
                        {entry.firstName} {entry.lastName}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-xs text-primary">(You)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <span className="truncate">{entry.position}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        <span>Level {entry.level}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Points */}
                  <div className="font-semibold text-primary">
                    {entry.points} pts
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-6">
            <Trophy className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No leaderboard data available yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete achievements to appear on the leaderboard
            </p>
          </div>
        )}
        
        {/* User's position if not in top entries */}
        {userEntry && !leaderboard.slice(0, limit).some(entry => entry.userId === user?.id) && (
          <>
            <div className="my-3 flex items-center gap-2">
              <div className="flex-grow border-t border-border" />
              <span className="text-xs text-muted-foreground">Your Position</span>
              <div className="flex-grow border-t border-border" />
            </div>
            
            <div className="flex items-center gap-3 p-2.5 rounded-md bg-primary/10">
              {/* Rank */}
              <div className="font-semibold w-7 text-center">
                {userEntry.rank}
              </div>
              
              {/* Avatar */}
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={userEntry.profileImage || undefined} alt={`${userEntry.firstName} ${userEntry.lastName}`} />
                <AvatarFallback>
                  {userEntry.firstName.charAt(0)}{userEntry.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <div className="font-medium truncate">
                    {userEntry.firstName} {userEntry.lastName}
                    <span className="ml-1.5 text-xs text-primary">(You)</span>
                  </div>
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                  <span className="truncate">{userEntry.position}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    <span>Level {userEntry.level}</span>
                  </span>
                </div>
              </div>
              
              {/* Points */}
              <div className="font-semibold text-primary">
                {userEntry.points} pts
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}