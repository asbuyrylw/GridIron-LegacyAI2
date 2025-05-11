import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Loader2, Users, Calendar, Clipboard, MessageSquare, BarChart3, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PageHeader from "@/components/layout/page-header";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function CoachDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is a coach
  if (user?.userType !== "coach") {
    return <Redirect to="/" />;
  }

  // Fetch coach profile
  const { data: coachProfile, isLoading: loadingCoach } = useQuery({
    queryKey: ["/api/coaches/profile"],
    enabled: !!user,
  });

  // Fetch team information
  const { data: teamInfo, isLoading: loadingTeam } = useQuery({
    queryKey: ["/api/coaches/teams"],
    enabled: !!user,
  });

  // Fetch team members (athletes)
  const { data: teamMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ["/api/coaches/team-members"],
    enabled: !!user && !!teamInfo,
  });

  if (loadingCoach || loadingTeam || loadingMembers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-4 space-y-6">
      <PageHeader 
        title="Coach Dashboard" 
        description="Manage your team and athlete development"
        icon={<Users className="h-6 w-6" />}
      />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Athletes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active team members
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Practice Attendance
                </CardTitle>
                <Clipboard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days average
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Events
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  In the next 7 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Performance Improvement
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+8.5%</div>
                <p className="text-xs text-muted-foreground">
                  From previous month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
                <CardDescription>
                  {teamInfo?.name || "Your team information"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Team Name</span>
                    <span className="font-medium">{teamInfo?.name || "Central High Varsity"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium">{teamInfo?.level || "Varsity"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Season</span>
                    <span className="font-medium">{teamInfo?.season || "Fall 2025"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Home Field</span>
                    <span className="font-medium">{teamInfo?.homeField || "Memorial Stadium"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest team events and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Award className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Team Achievement</p>
                      <p className="text-sm text-muted-foreground">
                        95% of players completed their weekly training goals
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        2 days ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MessageSquare className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Announcement Posted</p>
                      <p className="text-sm text-muted-foreground">
                        New practice schedule for next week
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        3 days ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roster" className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Team Roster</CardTitle>
                <CardDescription>
                  Manage your team members and their positions
                </CardDescription>
              </div>
              <Button>Add Athlete</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!teamMembers || teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No team members found</TableCell>
                    </TableRow>
                  ) : (
                    <>
                      <TableRow>
                        <TableCell className="font-medium">John Smith</TableCell>
                        <TableCell>Quarterback (QB)</TableCell>
                        <TableCell>12</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                            Active
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Michael Johnson</TableCell>
                        <TableCell>Wide Receiver (WR)</TableCell>
                        <TableCell>84</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800">
                            Injured
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Team Schedule</CardTitle>
                <CardDescription>
                  Manage practices, games, and other team events
                </CardDescription>
              </div>
              <Button>Add Event</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Team Practice</TableCell>
                    <TableCell>May 12, 2025</TableCell>
                    <TableCell>3:30 PM - 5:30 PM</TableCell>
                    <TableCell>School Field</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Attendance</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Game vs Jefferson High</TableCell>
                    <TableCell>May 18, 2025</TableCell>
                    <TableCell>7:00 PM</TableCell>
                    <TableCell>Home Field</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Roster</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Management</CardTitle>
              <CardDescription>
                Create and assign training plans to athletes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Current Training Plan</h3>
                  <Button>Create New Plan</Button>
                </div>
                
                <div className="rounded-md border p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Speed & Agility Focus</h4>
                      <p className="text-sm text-muted-foreground">Week of May 11 - May 17, 2025</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Assign</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Team Completion</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} />
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exercise</TableHead>
                          <TableHead>Sets</TableHead>
                          <TableHead>Reps</TableHead>
                          <TableHead>Focus</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Sprint Ladder</TableCell>
                          <TableCell>4</TableCell>
                          <TableCell>30 seconds</TableCell>
                          <TableCell>Speed</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>5-10-5 Shuttle Drills</TableCell>
                          <TableCell>5</TableCell>
                          <TableCell>With 60s rest</TableCell>
                          <TableCell>Agility</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Box Jumps</TableCell>
                          <TableCell>3</TableCell>
                          <TableCell>10 reps</TableCell>
                          <TableCell>Power</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Track and analyze team and individual performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Team Performance Overview</h3>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <div className="p-4 border rounded-md">
                      <div className="text-sm text-muted-foreground">Avg. 40-Yard Dash</div>
                      <div className="text-2xl font-bold">4.8s</div>
                      <div className="text-xs text-green-600">↑ 0.2s improvement</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm text-muted-foreground">Avg. Vertical Jump</div>
                      <div className="text-2xl font-bold">30.5"</div>
                      <div className="text-xs text-green-600">↑ 1.5" improvement</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm text-muted-foreground">Avg. Bench Press</div>
                      <div className="text-2xl font-bold">225 lbs</div>
                      <div className="text-xs text-green-600">↑ 15 lbs improvement</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Top Performers</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Athlete</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Metric</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Improvement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Michael Johnson</TableCell>
                        <TableCell>WR</TableCell>
                        <TableCell>40-Yard Dash</TableCell>
                        <TableCell>4.4s</TableCell>
                        <TableCell className="text-green-600">↑ 0.3s</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">John Smith</TableCell>
                        <TableCell>QB</TableCell>
                        <TableCell>Passing Accuracy</TableCell>
                        <TableCell>68%</TableCell>
                        <TableCell className="text-green-600">↑ 5%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Team Communication</CardTitle>
                <CardDescription>
                  Manage announcements, messages, and parent communications
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button>New Announcement</Button>
                <Button variant="outline">Message Parents</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="announcements">
                <TabsList className="mb-4">
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                </TabsList>
                
                <TabsContent value="announcements" className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold">New Practice Schedule</h4>
                      <span className="text-sm text-muted-foreground">May 10, 2025</span>
                    </div>
                    <p className="text-sm mb-3">
                      We've updated the practice schedule for next week. Please make note of the time changes.
                      Monday and Wednesday practices will now start at 4:00 PM instead of 3:30 PM.
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Sent to: All team members and parents</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Delete</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="messages" className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold">Jane Smith (Michael's Parent)</h4>
                        <p className="text-sm text-muted-foreground">Re: Game Transportation</p>
                      </div>
                      <span className="text-sm text-muted-foreground">May 11, 2025</span>
                    </div>
                    <p className="text-sm mb-3">
                      Hi Coach, just confirming that I'll be driving Michael and 3 other players to the away game on Saturday.
                      Please let me know if there are any changes to the plan.
                    </p>
                    <div className="flex justify-end">
                      <Button>Reply</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}