import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Loader2, User, Users, Calendar, MessageSquare, Clock, Award, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PageHeader from "@/components/layout/page-header";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is a parent
  if (user?.userType !== "parent") {
    return <Redirect to="/" />;
  }

  // Fetch parent profile
  const { data: parentProfile, isLoading: loadingParent } = useQuery({
    queryKey: ["/api/parents/profile"],
    enabled: !!user,
  });

  // Fetch connected athletes
  const { data: connectedAthletes, isLoading: loadingAthletes } = useQuery({
    queryKey: ["/api/parents/athletes"],
    enabled: !!user,
  });

  if (loadingParent || loadingAthletes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-4 space-y-6">
      <PageHeader 
        title="Parent Dashboard" 
        description="Monitor and support your athlete's development"
        icon={<Users className="h-6 w-6" />}
      />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="athletes">Athletes</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Connected Athletes
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{connectedAthletes?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Athletes you're monitoring
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
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  In the next 7 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Unread Messages
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  From coaches and team
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Track your athlete's recent accomplishments and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!connectedAthletes || connectedAthletes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No connected athletes yet</p>
                    <Button onClick={() => setActiveTab("athletes")}>Connect Athletes</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 rounded-md border p-3">
                      <Clock className="mt-1 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Workout Completed</p>
                        <p className="text-sm text-muted-foreground">
                          John completed "Speed & Agility Focus" workout - May 11, 2025
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-md border p-3">
                      <Award className="mt-1 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">New Achievement</p>
                        <p className="text-sm text-muted-foreground">
                          John earned "Consistency Champion" badge for completing 5 workouts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-md border p-3">
                      <Calendar className="mt-1 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Game Scheduled</p>
                        <p className="text-sm text-muted-foreground">
                          Upcoming game vs Jefferson High - May 18, 2025
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="athletes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Athletes</CardTitle>
              <CardDescription>
                Manage your connected athletes and their profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!connectedAthletes || connectedAthletes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No connected athletes yet</p>
                  <Button>Connect to an Athlete</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Connected athletes would be mapped here */}
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">John Smith</p>
                        <p className="text-sm text-muted-foreground">Quarterback (QB) • Sophomore</p>
                      </div>
                    </div>
                    <Button variant="outline">View Profile</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>
                Track upcoming games, practices and team events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-md border p-3">
                  <Calendar className="mt-1 h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Team Practice</p>
                      <span className="text-sm text-muted-foreground">May 12, 2025</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      3:30 PM - 5:30 PM • School Field
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-md border p-3">
                  <Calendar className="mt-1 h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Game vs Jefferson High</p>
                      <span className="text-sm text-muted-foreground">May 18, 2025</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      7:00 PM • Home Field
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="academics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>
                Monitor your athlete's academic progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Current GPA</span>
                  <span className="text-lg font-bold">3.5</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">NCAA Eligibility Status</span>
                  <span className="text-green-600 font-medium">On Track</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Missing Assignments</span>
                  <span className="text-lg font-bold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Academic Standing</span>
                  <span className="text-green-600 font-medium">Good</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages & Notifications</CardTitle>
              <CardDescription>
                Stay in touch with coaches and receive important team updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-md border p-3 bg-primary/5">
                  <MessageSquare className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Coach Williams</p>
                      <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full text-primary">New</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Please confirm John's attendance for the upcoming game
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-md border p-3">
                  <MessageSquare className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Team Announcement</p>
                    <p className="text-sm text-muted-foreground">
                      New practice schedule for next week has been posted
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      1 day ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}