import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useWebSocket } from "@/hooks/use-websocket";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Activity, BarChart, Trophy, ListTodo, ShoppingBag, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Type definitions for parent access data
interface ParentAccess {
  id: number;
  athleteId: number;
  email: string;
  name: string;
  relationship: string;
  accessToken: string;
  createdAt: string;
  lastEmailSent: string | null;
  receiveUpdates: boolean;
  receiveNutritionInfo: boolean;
  active: boolean;
}

interface Athlete {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  school: string | null;
  grade: string | null;
  // other properties...
}

interface ParentViewData {
  parentAccess: ParentAccess;
  athlete: Athlete;
}

interface CombineMetric {
  id: number;
  athleteId: number;
  dateRecorded: string;
  fortyYard: number | null;
  tenYardSplit: number | null;
  shuttle: number | null;
  threeCone: number | null;
  verticalJump: number | null;
  broadJump: number | null;
  benchPress: number | null;
  benchPressReps: number | null;
  squatMax: number | null;
  powerClean: number | null;
  deadlift: number | null;
  pullUps: number | null;
}

interface PerformanceInsight {
  id: number;
  athleteId: number;
  lastUpdated: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  performanceTrend: string | null;
  positionRanking: string | null;
  improvementAreas: string[] | null;
  recentAchievements: string[] | null;
}

interface NutritionPlan {
  id: number;
  athleteId: number;
  createdAt: string;
  active: boolean;
  goal: string;
  dailyCalories: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  hydrationTarget: number;
  restrictions: string | null;
}

interface ShoppingItem {
  name: string;
  category: string;
  quantity?: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  dateEarned: string;
  iconName: string;
}

interface TeamEvent {
  id: number;
  title: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  eventType: string;
}

export default function ParentViewPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ParentViewData | null>(null);
  const [metrics, setMetrics] = useState<CombineMetric | null>(null);
  const [insights, setInsights] = useState<PerformanceInsight | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<TeamEvent[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  
  // Initialize WebSocket connection
  const { isConnected, lastMessage, sendMessage, authenticateParentView } = useWebSocket();

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      console.log('Received WebSocket message:', lastMessage);
      
      // Handle different message types
      switch (lastMessage.type) {
        case 'connection':
          setWsConnected(true);
          break;
        case 'parent_view_success':
          console.log('Parent view authenticated via WebSocket');
          break;
        case 'athlete_data':
          // Update athlete data if needed
          if (lastMessage.data && data && data.athlete) {
            setData(prev => prev ? {
              ...prev,
              athlete: {
                ...prev.athlete,
                ...lastMessage.data
              }
            } : prev);
          }
          break;
        case 'metrics_update':
          // Update metrics in real-time
          if (lastMessage.data) {
            setMetrics(lastMessage.data);
          }
          break;
        case 'insights_update':
          // Update insights in real-time
          if (lastMessage.data) {
            setInsights(lastMessage.data);
          }
          break;
        case 'error':
          console.error('WebSocket error:', lastMessage.message);
          break;
      }
    }
  }, [lastMessage, data]);
  
  // WebSocket authentication
  useEffect(() => {
    if (isConnected) {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        console.log('Authenticating parent view with WebSocket');
        authenticateParentView(token);
      }
    }
  }, [isConnected, authenticateParentView]);

  // Main data loading effect
  useEffect(() => {
    async function fetchParentAccess() {
      try {
        setLoading(true);
        
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
          setError('No access token provided');
          setLoading(false);
          return;
        }
        
        // Fetch parent access data
        const response = await fetch(`/api/parent/access?token=${token}`);
        
        if (!response.ok) {
          throw new Error(`Access denied: ${response.statusText}`);
        }
        
        const accessData = await response.json();
        setData(accessData);
        
        // If access data is valid, fetch additional information
        if (accessData && accessData.athlete) {
          await Promise.all([
            fetchMetrics(accessData.athlete.id, token),
            fetchInsights(accessData.athlete.id, token),
            fetchNutritionPlan(accessData.athlete.id, token),
            fetchAchievements(accessData.athlete.id, token),
            fetchUpcomingEvents(accessData.athlete.id, token)
          ]);
        }
      } catch (err) {
        console.error('Error fetching parent access:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    
    // Fetch athlete metrics
    async function fetchMetrics(athleteId: number, token: string) {
      try {
        const response = await fetch(`/api/athlete/${athleteId}/metrics?token=${token}`);
        if (response.ok) {
          const metricsData = await response.json();
          // Get the most recent metrics if there are multiple
          if (Array.isArray(metricsData) && metricsData.length > 0) {
            setMetrics(metricsData[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
    }
    
    // Fetch performance insights
    async function fetchInsights(athleteId: number, token: string) {
      try {
        const response = await fetch(`/api/athlete/${athleteId}/performance/insights?token=${token}`);
        if (response.ok) {
          const insightsData = await response.json();
          setInsights(insightsData);
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
      }
    }
    
    // Fetch nutrition plan
    async function fetchNutritionPlan(athleteId: number, token: string) {
      try {
        const response = await fetch(`/api/athlete/${athleteId}/nutrition/plan?token=${token}`);
        if (response.ok) {
          const nutritionData = await response.json();
          setNutritionPlan(nutritionData);
          
          // Generate sample shopping list based on nutrition plan
          if (nutritionData) {
            // In a real app, this would come from the API based on the nutrition plan
            // Using sample data for demonstration
            setShoppingList([
              { name: "Chicken Breast", category: "Proteins", quantity: "2 lbs" },
              { name: "Salmon", category: "Proteins", quantity: "1 lb" },
              { name: "Eggs", category: "Proteins", quantity: "1 dozen" },
              { name: "Greek Yogurt", category: "Dairy", quantity: "32 oz" },
              { name: "Spinach", category: "Vegetables", quantity: "2 bunches" },
              { name: "Broccoli", category: "Vegetables", quantity: "1 head" },
              { name: "Sweet Potatoes", category: "Carbs", quantity: "3 medium" },
              { name: "Brown Rice", category: "Carbs", quantity: "1 bag" },
              { name: "Blueberries", category: "Fruits", quantity: "1 pint" },
              { name: "Bananas", category: "Fruits", quantity: "1 bunch" },
              { name: "Almonds", category: "Snacks", quantity: "1 bag" },
              { name: "Olive Oil", category: "Fats", quantity: "1 bottle" },
            ]);
          }
        }
      } catch (err) {
        console.error('Error fetching nutrition plan:', err);
      }
    }
    
    // Fetch achievements
    async function fetchAchievements(athleteId: number, token: string) {
      try {
        const response = await fetch(`/api/athlete/${athleteId}/achievements?token=${token}`);
        if (response.ok) {
          const achievementsData = await response.json();
          setAchievements(achievementsData);
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
      }
    }
    
    // Fetch upcoming events
    async function fetchUpcomingEvents(athleteId: number, token: string) {
      try {
        const response = await fetch(`/api/athlete/${athleteId}/events?token=${token}`);
        if (response.ok) {
          const eventsData = await response.json();
          setUpcomingEvents(eventsData);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    }
    
    fetchParentAccess();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Error</h1>
        <p className="text-muted-foreground mb-6">{error || "Invalid or expired access token"}</p>
        <Button onClick={() => setLocation("/")}>Return to Home</Button>
      </div>
    );
  }

  const { parentAccess, athlete } = data;
  const athleteFullName = `${athlete.firstName} ${athlete.lastName}`;

  return (
    <div className="container max-w-screen-lg mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{athleteFullName}'s Dashboard</CardTitle>
              <CardDescription>
                Viewing as {parentAccess.name} ({parentAccess.relationship})
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">Read-Only View</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Position</p>
              <p>{athlete.position || "Not set"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">School</p>
              <p>{athlete.school || "Not set"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Grade</p>
              <p>{athlete.grade || "Not set"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="performance">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="performance">
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition">
            <ShoppingBag className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nutrition</span>
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="w-5 h-5 mr-2" />
                  Latest Metrics
                </CardTitle>
                {metrics && (
                  <CardDescription>
                    Recorded on {new Date(metrics.dateRecorded).toLocaleDateString()}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {metrics ? (
                  <Table>
                    <TableBody>
                      {metrics.fortyYard && (
                        <TableRow>
                          <TableCell className="font-medium">40-Yard Dash</TableCell>
                          <TableCell>{metrics.fortyYard} seconds</TableCell>
                        </TableRow>
                      )}
                      {metrics.verticalJump && (
                        <TableRow>
                          <TableCell className="font-medium">Vertical Jump</TableCell>
                          <TableCell>{metrics.verticalJump} inches</TableCell>
                        </TableRow>
                      )}
                      {metrics.benchPress && (
                        <TableRow>
                          <TableCell className="font-medium">Bench Press</TableCell>
                          <TableCell>{metrics.benchPress} lbs</TableCell>
                        </TableRow>
                      )}
                      {metrics.squatMax && (
                        <TableRow>
                          <TableCell className="font-medium">Squat Max</TableCell>
                          <TableCell>{metrics.squatMax} lbs</TableCell>
                        </TableRow>
                      )}
                      {metrics.shuttle && (
                        <TableRow>
                          <TableCell className="font-medium">Shuttle Run</TableCell>
                          <TableCell>{metrics.shuttle} seconds</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No metrics recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Performance Insights
                </CardTitle>
                {insights && insights.lastUpdated && (
                  <CardDescription>
                    Updated {formatDistanceToNow(new Date(insights.lastUpdated), { addSuffix: true })}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {insights ? (
                  <div className="space-y-4">
                    {insights.strengths && insights.strengths.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Strengths</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {insights.strengths.map((strength, index) => (
                            <li key={index} className="text-sm">{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {insights.improvementAreas && insights.improvementAreas.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Areas for Improvement</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {insights.improvementAreas.map((area, index) => (
                            <li key={index} className="text-sm">{area}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {insights.recommendations && insights.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {insights.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No performance insights available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="nutrition">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Plan</CardTitle>
                {nutritionPlan && (
                  <CardDescription>
                    Goal: {nutritionPlan.goal}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {nutritionPlan ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Daily Calories</p>
                        <p>{nutritionPlan.dailyCalories} kcal</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Daily Hydration</p>
                        <p>{nutritionPlan.hydrationTarget} oz</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Macronutrient Targets</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-primary/10 rounded-lg">
                          <p className="text-lg font-bold">{nutritionPlan.proteinTarget}g</p>
                          <p className="text-xs">Protein</p>
                        </div>
                        <div className="text-center p-2 bg-primary/10 rounded-lg">
                          <p className="text-lg font-bold">{nutritionPlan.carbTarget}g</p>
                          <p className="text-xs">Carbs</p>
                        </div>
                        <div className="text-center p-2 bg-primary/10 rounded-lg">
                          <p className="text-lg font-bold">{nutritionPlan.fatTarget}g</p>
                          <p className="text-xs">Fat</p>
                        </div>
                      </div>
                    </div>
                    
                    {nutritionPlan.restrictions && (
                      <div className="space-y-1 mt-4">
                        <p className="text-sm font-medium">Dietary Restrictions</p>
                        <p className="text-sm">{nutritionPlan.restrictions}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No nutrition plan available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ListTodo className="w-5 h-5 mr-2" />
                  Shopping List
                </CardTitle>
                <CardDescription>
                  Suggested items based on {athlete.firstName}'s nutrition plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shoppingList.length > 0 ? (
                  <div className="space-y-4">
                    {/* Group by category */}
                    {Object.entries(
                      shoppingList.reduce((acc, item) => {
                        acc[item.category] = acc[item.category] || [];
                        acc[item.category].push(item);
                        return acc;
                      }, {} as Record<string, ShoppingItem[]>)
                    ).map(([category, items]) => (
                      <div key={category}>
                        <h4 className="font-medium mb-2">{category}</h4>
                        <ul className="space-y-1">
                          {items.map((item, i) => (
                            <li key={i} className="flex justify-between text-sm">
                              <span>{item.name}</span>
                              {item.quantity && <span className="text-muted-foreground">{item.quantity}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No shopping list available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Achievements & Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className="border-2 border-primary/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{achievement.name}</CardTitle>
                        <CardDescription>
                          {new Date(achievement.dateEarned).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{achievement.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground">No achievements earned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <div className="flex border-l-4 border-primary">
                        <div className="p-4 flex-shrink-0 flex flex-col items-center justify-center w-24 bg-muted">
                          <span className="text-2xl font-bold">
                            {new Date(event.startDate).getDate()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                          </span>
                        </div>
                        <div className="p-4 flex-grow">
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex flex-col sm:flex-row sm:gap-4 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {event.endDate && ` - ${new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </p>
                            {event.location && (
                              <p className="text-sm text-muted-foreground">
                                {event.location}
                              </p>
                            )}
                          </div>
                          <Badge className="mt-2" variant="outline">{event.eventType}</Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground">No upcoming events scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>This is a read-only view for parents/guardians.</p>
        <p className="mt-1">Access provided by GridIron LegacyAI on behalf of {athleteFullName}.</p>
      </div>
    </div>
  );
}