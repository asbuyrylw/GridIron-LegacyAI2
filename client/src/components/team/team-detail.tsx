import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  UsersRound, 
  Calendar, 
  MessageSquare, 
  Settings, 
  UserPlus,
  Trash,
  Shield,
  Bell,
  Info,
  LogOut
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamMembers } from "./team-members";
import { TeamEvents } from "./team-events";
import { TeamAnnouncements } from "./team-announcements";
import { TeamSettings } from "./team-settings";

interface TeamDetailProps {
  teamId: number | string;
}

export function TeamDetail({ teamId }: TeamDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Query team details
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: [`/api/teams/${teamId}`],
    enabled: !!teamId,
  });
  
  // Team join code dialog
  const [joinCodeDialogOpen, setJoinCodeDialogOpen] = useState(false);
  
  // Invite user dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  
  // Leave team confirmation
  const [leaveTeamDialogOpen, setLeaveTeamDialogOpen] = useState(false);
  
  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", `/api/teams/${teamId}/invite`, { email });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to invite member");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent",
        description: "An invitation has been sent to the email address"
      });
      
      setInviteEmail("");
      setInviteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Leave team mutation
  const leaveTeamMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/teams/${teamId}/members/me`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to leave team");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Left team",
        description: "You have successfully left the team"
      });
      
      // Redirect to teams page
      window.location.href = "/teams";
      
      // Invalidate teams query
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to leave team",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle invite member
  const handleInviteMember = () => {
    if (!inviteEmail) {
      toast({
        title: "Email required",
        description: "Please provide an email address",
        variant: "destructive"
      });
      return;
    }
    
    inviteMemberMutation.mutate(inviteEmail);
  };
  
  // Handle leave team
  const handleLeaveTeam = () => {
    leaveTeamMutation.mutate();
  };
  
  // Loading state
  if (isTeamLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-12 w-full" />
        
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }
  
  // Return error if team not found
  if (!team) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
          <Info className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Team Not Found</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            The team you are looking for does not exist or you don't have permission to view it.
          </p>
          <Button href="/teams">
            Return to Teams
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            {team.name}
            <Badge variant={team.isPrivate ? "outline" : "secondary"} className="ml-2">
              {team.isPrivate ? "Private" : "Public"}
            </Badge>
          </h1>
          {team.description && (
            <p className="text-muted-foreground mt-1">{team.description}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          {team.isAdmin && (
            <Dialog open={joinCodeDialogOpen} onOpenChange={setJoinCodeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Join Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Team Join Code</DialogTitle>
                  <DialogDescription>
                    Share this code with others to let them join your team.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 mt-4">
                  <Input
                    readOnly
                    value={team.joinCode || "No join code available"}
                    className="font-mono text-lg"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(team.joinCode);
                      toast({
                        title: "Copied to clipboard",
                        description: "Join code has been copied to clipboard"
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {team.isAdmin && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite to Team</DialogTitle>
                  <DialogDescription>
                    Invite someone to join your team via email.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    onClick={handleInviteMember}
                    disabled={inviteMemberMutation.isPending}
                  >
                    {inviteMemberMutation.isPending ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <AlertDialog open={leaveTeamDialogOpen} onOpenChange={setLeaveTeamDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-red-200 hover:bg-red-50 hover:text-red-600">
                <LogOut className="h-4 w-4" />
                Leave
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave Team</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to leave this team? You will lose access to team events, 
                  announcements, and resources.
                  {team.isAdmin && (
                    <div className="mt-2 p-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-md">
                      <strong>Warning:</strong> You are an admin of this team. If you leave, 
                      you will lose admin privileges.
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLeaveTeam}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {leaveTeamMutation.isPending ? "Leaving..." : "Leave Team"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Team Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                  <UsersRound className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">{team.memberCount || 0}</span>
                  <span className="text-sm text-muted-foreground">Members</span>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">{team.eventCount || 0}</span>
                  <span className="text-sm text-muted-foreground">Events</span>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                  <Bell className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">{team.announcementCount || 0}</span>
                  <span className="text-sm text-muted-foreground">Announcements</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Events</span>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab("events")}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {team.recentEvents && team.recentEvents.length > 0 ? (
                  <div className="space-y-2">
                    {team.recentEvents.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40">
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">{event.date}</div>
                        </div>
                        <Badge variant={new Date(event.date) > new Date() ? "default" : "outline"}>
                          {new Date(event.date) > new Date() ? "Upcoming" : "Past"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No events scheduled
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Announcements</span>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab("announcements")}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {team.recentAnnouncements && team.recentAnnouncements.length > 0 ? (
                  <div className="space-y-2">
                    {team.recentAnnouncements.slice(0, 3).map((announcement: any) => (
                      <div key={announcement.id} className="p-2 rounded-md hover:bg-muted/40">
                        <div className="font-medium">{announcement.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Posted by {announcement.authorName} on {new Date(announcement.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No announcements
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {team.isAdmin && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>
                  Manage team settings and configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Team Settings
                  </Button>
                  
                  <Button variant="outline" onClick={() => setJoinCodeDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage Join Code
                  </Button>
                  
                  <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Members
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4 mt-4">
          <TeamMembers teamId={teamId} isAdmin={team.isAdmin} />
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4 mt-4">
          <TeamEvents teamId={teamId} isAdmin={team.isAdmin} />
        </TabsContent>
        
        <TabsContent value="announcements" className="space-y-4 mt-4">
          <TeamAnnouncements teamId={teamId} isAdmin={team.isAdmin} />
        </TabsContent>
        
        {team.isAdmin && (
          <TabsContent value="settings" className="space-y-4 mt-4">
            <TeamSettings teamId={teamId} team={team} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}