import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AchievementProgress } from "@/hooks/use-achievement-progress";
import { Trophy, Medal, ArrowUp, ArrowDown, Minus, UserCircle2, Users, Clock, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Leaderboard entry types
interface LeaderboardEntry {
  userId: number;
  athleteId: number;
  username: string;
  fullName: string;
  profileImage?: string;
  points: number;
  rank: number;
  previousRank: number;
  achievements: number;
  topAchievement?: string;
}

interface LeaderboardsProps {
  timeframe?: 'weekly' | 'monthly' | 'allTime';
  scope?: 'team' | 'school' | 'global';
  limit?: number;
  className?: string;
  showFilters?: boolean;
  compact?: boolean;
}

export function Leaderboard({
  timeframe: initialTimeframe = 'weekly',
  scope: initialScope = 'global',
  limit = 10,
  className = '',
  showFilters = true,
  compact = false,
}: LeaderboardsProps) {
  // State for filters
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'allTime'>(initialTimeframe);
  const [scope, setScope] = useState<'team' | 'school' | 'global'>(initialScope);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get current user
  const { user } = useAuth();
  
  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard', timeframe, scope],
    enabled: !!user,
  });
  
  // Filter leaderboard data by search term
  const filteredLeaderboard = leaderboard.filter(entry => 
    entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Find current user's rank
  const currentUserRank = leaderboard.findIndex(entry => entry.userId === user?.id) + 1;
  const currentUserEntry = leaderboard.find(entry => entry.userId === user?.id);
  
  // Get rank change icon
  const getRankChangeIcon = (entry: LeaderboardEntry) => {
    const change = entry.previousRank - entry.rank;
    
    if (change > 0) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };
  
  // Get timeframe display text
  const getTimeframeText = () => {
    switch (timeframe) {
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      case 'allTime':
        return 'All Time';
    }
  };
  
  // Get scope display text
  const getScopeText = () => {
    switch (scope) {
      case 'team':
        return 'Team';
      case 'school':
        return 'School';
      case 'global':
        return 'Global';
    }
  };
  
  // Format user's rank display
  const formatRank = (rank: number) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };
  
  // Render a leaderboard entry
  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = entry.userId === user?.id;
    const isTopThree = index < 3;
    
    return (
      <div 
        key={entry.userId}
        className={`
          flex items-center gap-3 py-2 px-3 rounded-md
          ${isCurrentUser ? 'bg-primary/10 font-medium' : 'hover:bg-muted/40'}
          ${index !== filteredLeaderboard.length - 1 ? 'border-b' : ''}
          transition-colors
        `}
      >
        <div className="flex-shrink-0 w-8 text-center font-semibold">
          {isTopThree ? (
            <div className="inline-flex items-center justify-center">
              {index === 0 && <Trophy className="h-5 w-5 text-amber-500" />}
              {index === 1 && <Medal className="h-5 w-5 text-slate-400" />}
              {index === 2 && <Medal className="h-5 w-5 text-amber-700" />}
            </div>
          ) : (
            <span className="text-muted-foreground">{entry.rank}</span>
          )}
        </div>
        
        <Avatar className="flex-shrink-0 h-8 w-8 border">
          {entry.profileImage ? (
            <AvatarImage src={entry.profileImage} alt={entry.fullName} />
          ) : (
            <AvatarFallback>
              {entry.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-grow truncate">
          <div className="flex justify-between items-center">
            <span className="truncate font-medium">
              {entry.fullName}
              {isCurrentUser && <span className="text-xs ml-1 opacity-70">(You)</span>}
            </span>
            
            {!compact && (
              <div className="flex items-center text-xs text-muted-foreground gap-1">
                <span className="flex items-center gap-0.5">
                  {getRankChangeIcon(entry)}
                  <span className="w-6 text-center">{Math.abs(entry.previousRank - entry.rank) || '-'}</span>
                </span>
              </div>
            )}
          </div>
          
          {!compact && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                <span>{entry.achievements} achievements</span>
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0 font-semibold text-primary">
          {entry.points} pts
        </div>
      </div>
    );
  };
  
  // Loading skeleton
  const renderSkeleton = () => {
    return Array(5).fill(0).map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-2 px-3">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-grow space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    ));
  };
  
  return (
    <Card className={className}>
      <CardHeader className={compact ? 'pb-2' : ''}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>{compact ? 'Leaderboard' : `${getScopeText()} Leaderboard`}</span>
            </CardTitle>
            {!compact && (
              <CardDescription>
                {getTimeframeText()} • See how you rank against other athletes
              </CardDescription>
            )}
          </div>
          
          {currentUserEntry && !isLoading && (
            <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
              <span>Your rank:</span>
              <span className="text-primary ml-1">{formatRank(currentUserRank)}</span>
              <span className="mx-1">•</span>
              <span>{currentUserEntry.points} pts</span>
            </div>
          )}
        </div>
        
        {showFilters && !compact && (
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-4">
            <div className="w-full flex gap-2">
              <Select
                value={timeframe}
                onValueChange={(value) => setTimeframe(value as 'weekly' | 'monthly' | 'allTime')}
              >
                <SelectTrigger className="w-[140px]">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={scope}
                onValueChange={(value) => setScope(value as 'team' | 'school' | 'global')}
              >
                <SelectTrigger className="w-[140px]">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">Your Team</SelectItem>
                  <SelectItem value="school">Your School</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className={compact ? 'pt-0' : ''}>
        <ScrollArea className={`${compact ? 'max-h-[300px]' : 'max-h-[400px]'}`}>
          {isLoading ? (
            renderSkeleton()
          ) : (
            <>
              {filteredLeaderboard.length > 0 ? (
                filteredLeaderboard.slice(0, limit).map((entry, index) => renderLeaderboardEntry(entry, index))
              ) : (
                <div className="py-8 text-center">
                  <UserCircle2 className="mx-auto h-10 w-10 text-muted-foreground opacity-20" />
                  <p className="mt-2 text-muted-foreground">No athletes found</p>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </CardContent>
      
      {!compact && (
        <CardFooter className="flex justify-center pt-2">
          <Button variant="outline" size="sm" className="w-full" disabled={isLoading}>
            View Full Leaderboard
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}