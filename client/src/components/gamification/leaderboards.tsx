import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Medal,
  Crown,
  Award,
  ChevronUp,
  ChevronDown,
  Trophy,
  BarChart,
  Timer,
  Dumbbell,
  Ruler,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Map of leaderboard metric icons
const metricIcons: Record<string, React.ReactNode> = {
  fortyYard: <Timer className="h-5 w-5" />,
  benchPress: <Dumbbell className="h-5 w-5" />,
  verticalJump: <ChevronUp className="h-5 w-5" />,
  broadJump: <Ruler className="h-5 w-5" />,
  threeConeDrill: <BarChart className="h-5 w-5" />,
  default: <Trophy className="h-5 w-5" />
};

export function Leaderboards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<number | null>(null);
  const [newScore, setNewScore] = useState("");
  
  // Query for getting all active leaderboards
  const {
    data: leaderboards,
    isLoading: leaderboardsLoading,
    error: leaderboardsError
  } = useQuery({
    queryKey: ["/api/leaderboards"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboards?active=true");
      
      if (res.status === 401) {
        throw new Error("Not authorized");
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch leaderboards");
      }
      
      return res.json();
    }
  });
  
  // Query for getting leaderboard entries when a leaderboard is selected
  const {
    data: entries,
    isLoading: entriesLoading,
    error: entriesError
  } = useQuery({
    queryKey: ["/api/leaderboards", selectedLeaderboard, "entries"],
    queryFn: async () => {
      if (!selectedLeaderboard) return null;
      
      const res = await fetch(`/api/leaderboards/${selectedLeaderboard}/entries`);
      
      if (res.status === 401) {
        throw new Error("Not authorized");
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch entries");
      }
      
      return res.json();
    },
    enabled: !!selectedLeaderboard
  });
  
  // Mutation for submitting a score to the leaderboard
  const submitScoreMutation = useMutation({
    mutationFn: async ({ leaderboardId, value }: { leaderboardId: number, value: number }) => {
      const res = await apiRequest("POST", `/api/leaderboards/${leaderboardId}/entries`, { value });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboards", selectedLeaderboard, "entries"] });
      setNewScore("");
      toast({
        title: "Score Submitted",
        description: "Your score has been submitted to the leaderboard",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit score",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Get the selected leaderboard info
  const selectedLeaderboardInfo = selectedLeaderboard 
    ? leaderboards?.find((lb: any) => lb.id === selectedLeaderboard) 
    : null;
  
  // Handle leaderboard tab change
  const handleLeaderboardChange = (leaderboardId: string) => {
    setSelectedLeaderboard(parseInt(leaderboardId));
    setNewScore("");
  };
  
  // Handle score submission
  const handleSubmitScore = () => {
    if (!selectedLeaderboard) return;
    
    const scoreValue = parseFloat(newScore);
    if (isNaN(scoreValue)) {
      toast({
        title: "Invalid Score",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }
    
    submitScoreMutation.mutate({
      leaderboardId: selectedLeaderboard,
      value: scoreValue
    });
  };
  
  // Check if the current user has an entry in the selected leaderboard
  const userEntry = entries?.find((entry: any) => {
    const athlete = entry.athlete || {};
    return athlete.userId === user?.id;
  });
  
  if (leaderboardsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading leaderboards. Please try again.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Leaderboards
        </CardTitle>
        <CardDescription>
          Compete with others and track your ranking
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboardsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : leaderboards && leaderboards.length > 0 ? (
          <Tabs 
            defaultValue={leaderboards[0].id.toString()} 
            onValueChange={handleLeaderboardChange}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2 md:flex md:justify-start mb-6">
              {leaderboards.map((leaderboard: any) => {
                const MetricIcon = metricIcons[leaderboard.metric] || metricIcons.default;
                
                return (
                  <TabsTrigger 
                    key={leaderboard.id} 
                    value={leaderboard.id.toString()}
                    className="flex items-center gap-1"
                  >
                    {MetricIcon}
                    <span className="hidden md:inline ml-1">{leaderboard.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {leaderboards.map((leaderboard: any) => (
              <TabsContent 
                key={leaderboard.id} 
                value={leaderboard.id.toString()}
                className="space-y-4 mt-0"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">{leaderboard.name}</h3>
                    <p className="text-sm text-muted-foreground">{leaderboard.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {leaderboard.period === "weekly" && "Resets weekly"}
                      {leaderboard.period === "monthly" && "Resets monthly"}
                      {leaderboard.period === "allTime" && "All-time best scores"}
                    </div>
                  </div>
                  
                  {/* Score submission form */}
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <Input
                      type="number"
                      placeholder="Your score"
                      className="w-24"
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                    />
                    <Button 
                      onClick={handleSubmitScore}
                      disabled={submitScoreMutation.isPending || !newScore}
                      size="sm"
                    >
                      {submitScoreMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trophy className="h-4 w-4 mr-2" />
                      )}
                      Submit
                    </Button>
                  </div>
                </div>
                
                {entriesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : entries && entries.length > 0 ? (
                  <div className="space-y-2">
                    {entries.map((entry: any, index: number) => {
                      const isUserEntry = entry.athlete?.userId === user?.id;
                      const rankBadges = {
                        1: <Medal className="h-5 w-5 text-yellow-500" />,
                        2: <Medal className="h-5 w-5 text-gray-400" />,
                        3: <Medal className="h-5 w-5 text-amber-700" />
                      };
                      
                      return (
                        <div 
                          key={entry.id} 
                          className={`
                            border rounded-lg p-3 flex items-center
                            ${isUserEntry ? 'bg-primary-50 border-primary-200' : ''}
                          `}
                        >
                          <div className="flex-shrink-0 w-10 text-center">
                            {entry.rank && entry.rank <= 3 ? (
                              rankBadges[entry.rank as 1 | 2 | 3]
                            ) : (
                              <span className="font-semibold">{entry.rank}</span>
                            )}
                          </div>
                          
                          <div className="flex-grow flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage 
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${entry.athlete?.firstName} ${entry.athlete?.lastName}`} 
                                alt={entry.athlete?.firstName} 
                              />
                              <AvatarFallback>
                                {entry.athlete?.firstName?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <p className="font-medium text-sm">
                                {entry.athlete?.firstName} {entry.athlete?.lastName}
                                {isUserEntry && <span className="text-xs ml-2 text-muted-foreground">(You)</span>}
                              </p>
                              {entry.athlete?.position && (
                                <p className="text-xs text-muted-foreground">{entry.athlete.position}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 text-right">
                            <div className="font-bold">
                              {entry.value}
                              <span className="text-xs ml-1 font-normal text-muted-foreground">
                                {/* Display appropriate units based on the metric */}
                                {leaderboard.metric === "fortyYard" && "sec"}
                                {leaderboard.metric === "benchPress" && "lbs"}
                                {leaderboard.metric === "verticalJump" && "in"}
                                {leaderboard.metric === "broadJump" && "in"}
                                {leaderboard.metric === "threeConeDrill" && "sec"}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Updated {new Date(entry.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No entries yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      Be the first to submit your score to this leaderboard!
                    </p>
                    <div className="flex justify-center items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Your score"
                        className="w-28"
                        value={newScore}
                        onChange={(e) => setNewScore(e.target.value)}
                      />
                      <Button 
                        onClick={handleSubmitScore}
                        disabled={submitScoreMutation.isPending || !newScore}
                      >
                        Submit Score
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* User's current standing if they have an entry */}
                {userEntry && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary-50 border-primary-200">
                          Your Rank: {userEntry.rank || "N/A"}
                        </Badge>
                        <span className="text-sm">
                          Score: <span className="font-semibold">{userEntry.value}</span>
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last updated: {new Date(userEntry.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No active leaderboards</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              There are no active leaderboards at the moment. Check back later for new competitions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}