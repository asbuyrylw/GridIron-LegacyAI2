import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Medal, 
  Timer, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Award,
  RefreshCw
} from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Define schema for submitting scores
const submitScoreSchema = z.object({
  value: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Score must be a positive number",
  }),
});

type SubmitScoreFormValues = z.infer<typeof submitScoreSchema>;

export function Leaderboards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<number | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  
  // Get athlete id from user (access using optional chaining with appropriate type checks)
  const athleteId = user && 'athlete' in user ? (user as any).athlete?.id : undefined;
  
  // Query for getting all active leaderboards
  const {
    data: leaderboards,
    isLoading: leaderboardsLoading,
  } = useQuery({
    queryKey: ["/api/leaderboards"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboards?active=true");
      if (!res.ok) return [];
      return res.json();
    },
  });
  
  // Query for getting leaderboard entries for selected leaderboard
  const {
    data: leaderboardEntries,
    isLoading: entriesLoading,
  } = useQuery({
    queryKey: ["/api/leaderboards", selectedLeaderboard, "entries"],
    queryFn: async () => {
      if (!selectedLeaderboard) return [];
      const res = await fetch(`/api/leaderboards/${selectedLeaderboard}/entries`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedLeaderboard,
  });
  
  // Form for submitting scores
  const form = useForm<SubmitScoreFormValues>({
    resolver: zodResolver(submitScoreSchema),
    defaultValues: {
      value: "",
    },
  });
  
  // Mutation for submitting scores
  const submitScoreMutation = useMutation({
    mutationFn: async (data: { leaderboardId: number, value: number }) => {
      const res = await apiRequest("POST", `/api/leaderboards/${data.leaderboardId}/entries`, {
        value: data.value,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboards", selectedLeaderboard, "entries"] });
      setSubmitDialogOpen(false);
      toast({
        title: "Score submitted",
        description: "Your score has been submitted to the leaderboard",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit score",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle submitting score
  const onSubmitScore = (data: SubmitScoreFormValues) => {
    if (!selectedLeaderboard) return;
    
    submitScoreMutation.mutate({
      leaderboardId: selectedLeaderboard,
      value: parseFloat(data.value),
    });
  };
  
  // Function to get the selected leaderboard details
  const getSelectedLeaderboardDetails = () => {
    if (!selectedLeaderboard || !leaderboards) return null;
    return leaderboards.find((lb: any) => lb.id === selectedLeaderboard);
  };
  
  // Function to get user's current rank
  const getUserRank = () => {
    if (!athleteId || !leaderboardEntries) return null;
    return leaderboardEntries.find((entry: any) => entry.athleteId === athleteId);
  };
  
  // Get current leaderboard details
  const currentLeaderboard = getSelectedLeaderboardDetails();
  const userRankEntry = getUserRank();
  
  // Set first leaderboard as selected when data loads if none is selected
  if (!selectedLeaderboard && leaderboards && leaderboards.length > 0) {
    setSelectedLeaderboard(leaderboards[0].id);
  }
  
  // Loading state
  if (leaderboardsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboards</CardTitle>
          <CardDescription>Loading leaderboards...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // No leaderboards state
  if (!leaderboards || leaderboards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboards</CardTitle>
          <CardDescription>Compete with other athletes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No active leaderboards</h3>
            <p className="text-muted-foreground">
              Check back later for new competitions and challenges
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Medal className="h-5 w-5 mr-2 text-primary" /> Leaderboards
            </CardTitle>
            <CardDescription>
              Compete with other athletes and track your rankings
            </CardDescription>
          </div>
          
          {/* Leaderboard selector */}
          <div className="min-w-[200px]">
            <Select
              value={selectedLeaderboard?.toString()}
              onValueChange={(value) => setSelectedLeaderboard(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leaderboard" />
              </SelectTrigger>
              <SelectContent>
                {leaderboards.map((leaderboard: any) => (
                  <SelectItem
                    key={leaderboard.id}
                    value={leaderboard.id.toString()}
                  >
                    {leaderboard.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {currentLeaderboard && (
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium">{currentLeaderboard.name}</h3>
                <p className="text-sm text-muted-foreground">{currentLeaderboard.description}</p>
                
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="capitalize">{currentLeaderboard.metric}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Timer className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="capitalize">{currentLeaderboard.period}</span>
                  </div>
                  
                  {currentLeaderboard.startDate && currentLeaderboard.endDate && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>
                        {new Date(currentLeaderboard.startDate).toLocaleDateString()} - {new Date(currentLeaderboard.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button>Submit Score</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit Score</AlertDialogTitle>
                    <AlertDialogDescription>
                      Enter your {currentLeaderboard.metric} score for the {currentLeaderboard.name} leaderboard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitScore)} className="space-y-4 py-4">
                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Score</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your score"
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter your {currentLeaderboard.metric} value
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                  
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={form.handleSubmit(onSubmitScore)}
                      disabled={submitScoreMutation.isPending}
                    >
                      {submitScoreMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : "Submit Score"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            {/* User's current ranking */}
            {userRankEntry && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">Your Ranking</p>
                    <div className="flex items-baseline mt-1">
                      <span className="text-2xl font-bold">#{userRankEntry.rank || "N/A"}</span>
                      <span className="ml-2 text-lg">with {userRankEntry.value} {currentLeaderboard.metric}</span>
                    </div>
                  </div>
                  
                  {userRankEntry.rank && userRankEntry.rank <= 3 && (
                    <div className="p-3 bg-primary/20 rounded-full">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            )}
            
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
                      <TableHead className="text-right">{currentLeaderboard.metric}</TableHead>
                      <TableHead className="text-right w-32">Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardEntries.map((entry: any, index: number) => {
                      const isCurrentUser = entry.athleteId === athleteId;
                      return (
                        <TableRow 
                          key={entry.id} 
                          className={isCurrentUser ? "bg-primary/5" : ""}
                        >
                          <TableCell className="text-center font-medium">
                            {entry.rank <= 3 ? (
                              <div className="flex justify-center">
                                <Badge 
                                  className={`
                                    ${entry.rank === 1 ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : ""}
                                    ${entry.rank === 2 ? "bg-gray-200 text-gray-800 hover:bg-gray-200" : ""}
                                    ${entry.rank === 3 ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""}
                                  `}
                                >
                                  #{entry.rank}
                                </Badge>
                              </div>
                            ) : (
                              <span>#{entry.rank}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="font-medium">
                                {entry.athleteName || `Athlete #${entry.athleteId}`}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-primary">(You)</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {entry.value}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {new Date(entry.updatedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg">
                <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium mb-1">No entries yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Be the first to submit a score!</p>
                <Button onClick={() => setSubmitDialogOpen(true)}>Submit Score</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}