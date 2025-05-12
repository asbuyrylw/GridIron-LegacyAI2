import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Medal, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  scope: initialScope = 'global',
  showFilters = true,
  limit = 10,
  title = 'Leaderboard',
  description = 'Top athletes ranked by achievement points'
}: LeaderboardProps) {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>(initialTimeframe);
  const [scope, setScope] = useState<LeaderboardScope>(initialScope);

  const {
    data: leaderboard,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/leaderboard', { timeframe, scope }],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard?timeframe=${timeframe}&scope=${scope}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      return response.json() as Promise<LeaderboardEntry[]>;
    }
  });

  // Find user's position on the leaderboard
  const userEntry = leaderboard?.find(entry => entry.userId === user?.id);

  function getRankIcon(rank: number) {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: 
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">{rank}</span>;
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-2">
            <Select
              value={timeframe}
              onValueChange={(value) => setTimeframe(value as LeaderboardTimeframe)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time Period" />
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
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team">My Teams</SelectItem>
                <SelectItem value="school">My School</SelectItem>
                <SelectItem value="global">Global</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <Skeleton className="ml-auto h-5 w-10" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 text-muted-foreground">
            Failed to load leaderboard data. Please try again.
          </div>
        ) : leaderboard?.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No data available for this leaderboard.
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard?.slice(0, limit).map((entry) => (
              <div 
                key={entry.id}
                className={cn(
                  "flex items-center p-3 rounded-lg",
                  entry.userId === user?.id ? "bg-muted" : "hover:bg-muted/50 transition-colors"
                )}
              >
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(entry.rank)}
                </div>
                
                <Avatar className="h-10 w-10 border mx-2">
                  <AvatarImage src={entry.profileImage || undefined} />
                  <AvatarFallback>
                    {entry.firstName[0]}{entry.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="ml-2 flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {entry.firstName} {entry.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.position} • Level {entry.level}
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{entry.points}</span>
                </div>
              </div>
            ))}
            
            {/* Show user position if not in top entries */}
            {userEntry && userEntry.rank > limit && (
              <>
                <div className="h-px bg-border my-2" />
                <div className="flex items-center p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-center w-8 h-8">
                    <span className="text-sm font-medium text-muted-foreground">{userEntry.rank}</span>
                  </div>
                  
                  <Avatar className="h-10 w-10 border mx-2">
                    <AvatarImage src={userEntry.profileImage || undefined} />
                    <AvatarFallback>
                      {userEntry.firstName[0]}{userEntry.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="ml-2 flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {userEntry.firstName} {userEntry.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {userEntry.position} • Level {userEntry.level}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{userEntry.points}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}