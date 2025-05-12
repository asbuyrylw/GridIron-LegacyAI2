import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  BarChart3, 
  Award, 
  Medal, 
  Dumbbell, 
  Timer, 
  TrendingUp, 
  Trophy, 
  GraduationCap, 
  RefreshCcw, 
  ListFilter,
  Info
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format, formatDistance } from "date-fns";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

// Interface for leaderboard definitions
interface LeaderboardDefinition {
  id: string;
  name: string;
  description: string;
  metric: string;
  metricFormatted: string;
  icon: React.ReactNode;
  period: 'weekly' | 'monthly' | 'all-time';
  category: 'performance' | 'training' | 'academic' | 'points';
}

const LEADERBOARDS: LeaderboardDefinition[] = [
  {
    id: "weekly-points",
    name: "Weekly Points",
    description: "Top athletes by achievement points earned this week",
    metric: "points",
    metricFormatted: "Points",
    icon: <Trophy className="h-5 w-5 text-amber-500" />,
    period: "weekly",
    category: "points"
  },
  {
    id: "monthly-points",
    name: "Monthly Points",
    description: "Top athletes by achievement points earned this month",
    metric: "points",
    metricFormatted: "Points",
    icon: <Trophy className="h-5 w-5 text-amber-500" />,
    period: "monthly",
    category: "points"
  },
  {
    id: "all-time-points",
    name: "All-Time Points",
    description: "Top athletes by total achievement points",
    metric: "points",
    metricFormatted: "Points",
    icon: <Trophy className="h-5 w-5 text-amber-500" />,
    period: "all-time",
    category: "points"
  },
  {
    id: "forty-yard-dash",
    name: "Forty Yard Dash",
    description: "Top athletes by 40-yard dash times",
    metric: "fortyYard",
    metricFormatted: "Time (s)",
    icon: <Timer className="h-5 w-5 text-blue-500" />,
    period: "all-time",
    category: "performance"
  },
  {
    id: "vertical-jump",
    name: "Vertical Jump",
    description: "Top athletes by vertical jump height",
    metric: "verticalJump",
    metricFormatted: "Height (in)",
    icon: <TrendingUp className="h-5 w-5 text-green-500" />,
    period: "all-time",
    category: "performance"
  },
  {
    id: "bench-press",
    name: "Bench Press Reps",
    description: "Top athletes by bench press reps at 225 lbs",
    metric: "benchPressReps",
    metricFormatted: "Reps",
    icon: <Dumbbell className="h-5 w-5 text-red-500" />,
    period: "all-time",
    category: "performance"
  },
  {
    id: "workouts-completed",
    name: "Workouts Completed",
    description: "Top athletes by number of workouts completed this month",
    metric: "workoutsCompleted",
    metricFormatted: "Workouts",
    icon: <Award className="h-5 w-5 text-purple-500" />,
    period: "monthly",
    category: "training"
  },
  {
    id: "academic-gpa",
    name: "Academic GPA",
    description: "Top athletes by current GPA",
    metric: "gpa",
    metricFormatted: "GPA",
    icon: <GraduationCap className="h-5 w-5 text-indigo-500" />,
    period: "all-time",
    category: "academic"
  }
];

export interface LeaderboardEntry {
  id: number;
  athleteId: number;
  value: number;
  rank: number;
  updatedAt: string;
  athlete?: {
    userId: number;
    firstName: string;
    lastName: string;
    position: string;
    school?: string;
    profileImage?: string;
  };
}

interface LeaderboardsProps {
  initialLeaderboardId?: string;
  filter?: 'performance' | 'training' | 'academic' | 'points' | 'all';
  compact?: boolean;
  showFilters?: boolean;
  maxEntries?: number;
  highlightCurrentUser?: boolean;
  title?: string;
}

export function Leaderboards({
  initialLeaderboardId = "weekly-points",
  filter = "all",
  compact = false,
  showFilters = true,
  maxEntries = 10,
  highlightCurrentUser = true,
  title = "Leaderboards"
}: LeaderboardsProps) {
  const { user } = useAuth();
  const athleteId = user?.athlete?.id;
  
  // States
  const [selectedLeaderboardId, setSelectedLeaderboardId] = useState<string>(initialLeaderboardId);
  const [filterCategory, setFilterCategory] = useState<string>(filter);
  
  // Get the currently selected leaderboard definition
  const currentLeaderboard = LEADERBOARDS.find(l => l.id === selectedLeaderboardId) || LEADERBOARDS[0];
  
  // Filter leaderboards based on category
  const filteredLeaderboards = filterCategory === 'all' 
    ? LEADERBOARDS 
    : LEADERBOARDS.filter(l => l.category === filterCategory);
  
  // Fetch leaderboard entries
  const { 
    data: leaderboardEntries = [], 
    isLoading: entriesLoading,
    refetch: refetchEntries
  } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/leaderboards/${selectedLeaderboardId}`],
    enabled: !!selectedLeaderboardId,
  });
  
  // Format metric value based on the metric type
  const formatMetricValue = (value: number, metric: string) => {
    if (metric === 'fortyYard' || metric === 'shuttle' || metric === 'threeCone') {
      return value.toFixed(2) + 's';
    } else if (metric === 'verticalJump' || metric === 'broadJump') {
      return value + '"';
    } else if (metric === 'gpa') {
      return value.toFixed(2);
    } else {
      return value.toString();
    }
  };
  
  // Get the user's rank in this leaderboard
  const userEntry = athleteId ? leaderboardEntries.find(entry => entry.athleteId === athleteId) : null;
  const userRank = userEntry?.rank || 'N/A';
  
  // Prepare limited entries for display
  const displayEntries = leaderboardEntries.slice(0, maxEntries);
  
  return (
    <Card className={compact ? 'overflow-hidden' : ''}>
      <CardHeader className={compact ? 'pb-2' : 'pb-4'}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              {!compact && (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">About Leaderboards</h4>
                      <p className="text-sm">
                        Leaderboards are updated daily and show rankings across various metrics.
                        Weekly and monthly leaderboards reset at the end of their period.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </CardTitle>
            {!compact && (
              <CardDescription>{currentLeaderboard.description}</CardDescription>
            )}
          </div>
          
          {!compact && highlightCurrentUser && userEntry && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg text-sm">
              <span className="font-medium">Your Rank:</span>
              <span className="font-bold">{userRank}</span>
              {typeof userRank === 'number' && userRank <= 3 && (
                <div className="p-3 bg-primary/20 rounded-full">
                  <Award className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
          )}
        </div>
        
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            {/* Leaderboard selector */}
            <Select
              value={selectedLeaderboardId}
              onValueChange={setSelectedLeaderboardId}
            >
              <SelectTrigger className="w-full sm:w-[260px]">
                <SelectValue placeholder="Select a leaderboard" />
              </SelectTrigger>
              <SelectContent>
                {filteredLeaderboards.map((leaderboard) => (
                  <SelectItem key={leaderboard.id} value={leaderboard.id} className="flex items-center">
                    <div className="flex items-center gap-2">
                      {leaderboard.icon}
                      <span>{leaderboard.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Category filter */}
            {!compact && (
              <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="points">Achievement Points</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {/* Refresh button */}
            {!compact && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => refetchEntries()}
                className="ml-auto"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className={compact ? 'pt-0' : ''}>
        {/* Leaderboard table */}
        {entriesLoading ? (
          <div className="flex justify-center py-8">
            <BarChart3 className="h-8 w-8 text-muted-foreground animate-pulse" />
          </div>
        ) : leaderboardEntries && leaderboardEntries.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead>Athlete</TableHead>
                  <TableHead className="text-right">{currentLeaderboard.metricFormatted}</TableHead>
                  {!compact && (
                    <TableHead className="text-right w-32">Last Updated</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayEntries.map((entry: LeaderboardEntry) => {
                  const isCurrentUser = entry.athleteId === athleteId;
                  return (
                    <TableRow 
                      key={entry.id} 
                      className={isCurrentUser && highlightCurrentUser ? "bg-primary/5" : ""}
                    >
                      <TableCell className="text-center font-bold">
                        {entry.rank === 1 ? (
                          <div className="flex justify-center">
                            <Medal className="h-5 w-5 text-yellow-500" />
                          </div>
                        ) : entry.rank === 2 ? (
                          <div className="flex justify-center">
                            <Medal className="h-5 w-5 text-gray-400" />
                          </div>
                        ) : entry.rank === 3 ? (
                          <div className="flex justify-center">
                            <Medal className="h-5 w-5 text-amber-700" />
                          </div>
                        ) : (
                          entry.rank
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage 
                              src={entry.athlete?.profileImage || 
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${entry.athlete?.firstName} ${entry.athlete?.lastName}`} 
                              alt={entry.athlete?.firstName || 'Athlete'} 
                            />
                            <AvatarFallback>
                              {entry.athlete?.firstName?.charAt(0) || 'A'}
                              {entry.athlete?.lastName?.charAt(0) || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {entry.athlete?.firstName} {entry.athlete?.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {entry.athlete?.position} {entry.athlete?.school ? `• ${entry.athlete.school}` : ''}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatMetricValue(entry.value, currentLeaderboard.metric)}
                      </TableCell>
                      {!compact && (
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatDistance(new Date(entry.updatedAt), new Date(), { addSuffix: true })}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-4 opacity-30" />
            <p>No leaderboard data available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}