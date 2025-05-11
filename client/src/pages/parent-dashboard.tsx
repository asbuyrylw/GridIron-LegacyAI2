import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Loader2, User, Users, Calendar, MessageSquare, Clock, Award, BookOpen, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import PageHeader from "@/components/layout/page-header";

// Define schema for connecting to an athlete
const connectAthleteSchema = z.object({
  athleteId: z.string().min(1, "Athlete ID is required"),
  relationship: z.string().min(1, "Relationship is required"),
});

// Type for academic info
interface AcademicInfo {
  gpa: number | null;
  actScore: number | null;
  school: string | null;
  graduationYear: number | null;
  grade: string | null;
  eligibilityStatus: string;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [showAcademicInfo, setShowAcademicInfo] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null);
  
  // Form setup for connecting to an athlete
  const connectForm = useForm<z.infer<typeof connectAthleteSchema>>({
    resolver: zodResolver(connectAthleteSchema),
    defaultValues: {
      athleteId: "",
      relationship: "Parent/Guardian",
    },
  });

  // Check if user is a parent
  if (user?.userType !== "parent") {
    return <Redirect to="/" />;
  }
  
  // Connect to athlete mutation
  const connectAthleteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof connectAthleteSchema>) => {
      const response = await apiRequest("POST", "/api/parents/connect-athlete", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to connect to athlete");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection request sent",
        description: "The athlete will need to approve the connection.",
      });
      setShowConnectForm(false);
      connectForm.reset();
      // Invalidate athletes query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/parents/athletes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
  
  // Fetch athlete academic info
  const { data: academicInfo, isLoading: loadingAcademics } = useQuery<AcademicInfo>({
    queryKey: ["/api/parents/athletes", selectedAthleteId, "academics"],
    queryFn: async () => {
      if (!selectedAthleteId) return null;
      const response = await fetch(`/api/parents/athletes/${selectedAthleteId}/academics`);
      if (!response.ok) {
        throw new Error("Failed to fetch academic information");
      }
      return response.json();
    },
    enabled: !!selectedAthleteId && showAcademicInfo,
  });
  
  // Handle submitting connect athlete form
  const onSubmitConnectForm = (data: z.infer<typeof connectAthleteSchema>) => {
    connectAthleteMutation.mutate({
      athleteId: data.athleteId,
      relationship: data.relationship,
    });
  };
  
  // Handle viewing athlete academic info
  const handleViewAthleteAcademics = (athleteId: number) => {
    setSelectedAthleteId(athleteId);
    setShowAcademicInfo(true);
  };

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
                  <Button onClick={() => setShowConnectForm(true)}>Connect to an Athlete</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectedAthletes.map((athlete) => (
                    <div key={athlete.id} className="flex items-center justify-between rounded-md border p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{athlete.firstName} {athlete.lastName}</p>
                          <p className="text-sm text-muted-foreground">
                            {athlete.position} • {athlete.graduationYear ? `Class of ${athlete.graduationYear}` : ""}
                            <span className="ml-2 text-primary text-xs">({athlete.relationship})</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => handleViewAthleteAcademics(athlete.id)}
                        >
                          Academic Info
                        </Button>
                        <Button variant="outline">View Profile</Button>
                      </div>
                    </div>
                  ))}
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
      
      {/* Connect to Athlete Dialog */}
      <Dialog open={showConnectForm} onOpenChange={setShowConnectForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect to an Athlete</DialogTitle>
            <DialogDescription>
              Enter the athlete's ID and your relationship to connect with them.
            </DialogDescription>
          </DialogHeader>
          <Form {...connectForm}>
            <form onSubmit={connectForm.handleSubmit(onSubmitConnectForm)} className="space-y-4">
              <FormField
                control={connectForm.control}
                name="athleteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Athlete ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter athlete ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={connectForm.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Parent/Guardian">Parent/Guardian</SelectItem>
                          <SelectItem value="Family Member">Family Member</SelectItem>
                          <SelectItem value="Mentor">Mentor</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={connectAthleteMutation.isPending}
                >
                  {connectAthleteMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Connect
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Academic Info Dialog */}
      <Dialog open={showAcademicInfo} onOpenChange={setShowAcademicInfo}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Academic Information</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAcademicInfo(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {loadingAcademics ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !academicInfo ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No academic information available</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">GPA</p>
                  <p className="text-lg font-semibold">{academicInfo.gpa || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">ACT Score</p>
                  <p className="text-lg font-semibold">{academicInfo.actScore || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">School</p>
                  <p className="text-lg font-semibold">{academicInfo.school || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Grade</p>
                  <p className="text-lg font-semibold">{academicInfo.grade || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Graduation Year</p>
                  <p className="text-lg font-semibold">{academicInfo.graduationYear || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Eligibility Status</p>
                  <p className="text-lg font-semibold">{academicInfo.eligibilityStatus || 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-muted-foreground mb-2">Academic Requirements for College Eligibility:</p>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  <li>NCAA Division I: 2.3 GPA in core courses, sliding scale for SAT/ACT</li>
                  <li>NCAA Division II: 2.2 GPA in core courses, minimum SAT/ACT score</li>
                  <li>NCAA Division III: Determined by individual schools</li>
                  <li>NAIA: 2.0 GPA, minimum 18 ACT or 970 SAT</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}