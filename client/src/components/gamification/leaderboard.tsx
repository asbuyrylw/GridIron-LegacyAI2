import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { FaTrophy } from 'react-icons/fa';

interface LeaderboardProps {
  leaderboardId?: number;
  title?: string;
  description?: string;
  limit?: number;
  showAllLeaderboards?: boolean;
}

interface LeaderboardEntry {
  id: number;
  athleteId: number;
  leaderboardId: number;
  value: number;
  rank: number;
  athleteName: string;
  createdAt: string;
  updatedAt: string;
}

interface Leaderboard {
  id: number;
  name: string;
  description: string;
  metric: string;
  period: string;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  lowerIsBetter: boolean;
  rules: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Leaderboard({ 
  leaderboardId, 
  title, 
  description, 
  limit = 10, 
  showAllLeaderboards = false 
}: LeaderboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedLeaderboardId, setSelectedLeaderboardId] = useState<number | undefined>(leaderboardId);
  
  // Fetch all available leaderboards
  const { 
    data: leaderboards, 
    isLoading: leaderboardsLoading, 
    error: leaderboardsError 
  } = useQuery({
    queryKey: ['/api/leaderboards'],
    enabled: showAllLeaderboards || !leaderboardId
  });
  
  // Fetch entries for the selected leaderboard
  const { 
    data: entries, 
    isLoading: entriesLoading, 
    error: entriesError 
  } = useQuery({
    queryKey: [`/api/leaderboards/${selectedLeaderboardId}/entries`],
    enabled: !!selectedLeaderboardId,
  });
  
  // Get the currently selected leaderboard details
  const selectedLeaderboard = leaderboards?.find((lb: Leaderboard) => lb.id === selectedLeaderboardId);
  
  // Set the first leaderboard as default if none is provided
  useEffect(() => {
    if (!leaderboardId && leaderboards && leaderboards.length > 0 && !selectedLeaderboardId) {
      setSelectedLeaderboardId(leaderboards[0].id);
    }
  }, [leaderboards, leaderboardId, selectedLeaderboardId]);
  
  // Calculate if current user is on the leaderboard
  const userRanking = user && entries 
    ? entries.find((entry: LeaderboardEntry) => entry.athleteId === user.athlete?.id) 
    : null;
  
  // Format the value based on the metric
  const formatValue = (value: number, metric?: string) => {
    switch (metric) {
      case 'seconds':
        return `${value.toFixed(2)}s`;
      case 'inches':
        return `${value}"`;
      case 'points':
        return value.toLocaleString();
      case 'reps':
        return `${value} reps`;
      case 'workouts':
        return `${value} workouts`;
      default:
        return value.toString();
    }
  };
  
  // Show trophy colors based on rank
  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-500"; // Gold
      case 2: return "text-gray-400";   // Silver
      case 3: return "text-amber-700";  // Bronze
      default: return "text-gray-300";  // Default
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };
  
  if (leaderboardsError || entriesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || "Leaderboard"}</CardTitle>
          <CardDescription>
            {description || "Error loading leaderboard data"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            An error occurred while loading the leaderboard data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title || selectedLeaderboard?.name || "Leaderboard"}</CardTitle>
        <CardDescription>
          {description || selectedLeaderboard?.description || "View top performers"}
        </CardDescription>
        
        {/* Leaderboard selection */}
        {showAllLeaderboards && leaderboards && (
          <div className="mt-2">
            <Select
              value={selectedLeaderboardId?.toString()}
              onValueChange={(value) => setSelectedLeaderboardId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a leaderboard" />
              </SelectTrigger>
              <SelectContent>
                {leaderboards.map((lb: Leaderboard) => (
                  <SelectItem key={lb.id} value={lb.id.toString()}>
                    {lb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Period badge */}
        {selectedLeaderboard && (
          <div className="mt-2">
            <Badge variant="outline">
              {selectedLeaderboard.period === 'all-time' ? 'All Time' : 
               selectedLeaderboard.period.charAt(0).toUpperCase() + selectedLeaderboard.period.slice(1)}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {(leaderboardsLoading || entriesLoading) ? (
          // Skeleton loader
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : entries && entries.length > 0 ? (
          // Leaderboard entries
          <div className="space-y-3">
            {entries.slice(0, limit).map((entry: LeaderboardEntry, index: number) => (
              <div key={entry.id} 
                className={`flex items-center justify-between p-2 rounded-md ${
                  user && entry.athleteId === user.athlete?.id ? 
                  'bg-primary/10 border border-primary/20' : 
                  index % 2 === 0 ? 'bg-secondary/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {entry.rank <= 3 ? (
                      <FaTrophy className={`text-xl ${getTrophyColor(entry.rank)}`} />
                    ) : (
                      <span className="text-lg font-semibold text-muted-foreground">
                        {entry.rank}
                      </span>
                    )}
                  </div>
                  
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(entry.athleteName)}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-medium text-sm">
                      {entry.athleteName}
                      {user && entry.athleteId === user.athlete?.id && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="font-semibold">
                  {formatValue(entry.value, selectedLeaderboard?.metric)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No entries found for this leaderboard.
          </div>
        )}
      </CardContent>
      
      {userRanking && (
        <CardFooter className="border-t pt-4">
          <div className="w-full">
            <div className="text-sm text-muted-foreground mb-2">Your Ranking</div>
            <div className="flex items-center justify-between bg-primary/5 p-2 rounded-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8">
                  <span className="text-base font-semibold">
                    {userRanking.rank}
                  </span>
                </div>
                
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user && user.athlete ? 
                     getInitials(`${user.athlete.firstName} ${user.athlete.lastName}`) : 
                     'YOU'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="font-medium text-sm">
                  {user && user.athlete ? 
                   `${user.athlete.firstName} ${user.athlete.lastName}` : 
                   'You'}
                </div>
              </div>
              
              <div className="font-semibold">
                {formatValue(userRanking.value, selectedLeaderboard?.metric)}
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}