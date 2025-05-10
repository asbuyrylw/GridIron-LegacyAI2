import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  useTeam, 
  useTeamMembers, 
  useTeamEvents, 
  useTeamAnnouncements, 
  useCreateTeamEvent,
  useCreateTeamAnnouncement,
  useEventAttendance,
  useUpdateEventAttendance
} from "@/hooks/use-team-hooks";
import { TeamEventCard } from "@/components/teams/team-event-card";
import { TeamAnnouncementCard } from "@/components/teams/team-announcement-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { 
  CalendarPlus, 
  Users, 
  ChevronLeft, 
  Calendar, 
  BellPlus,
  MapPin,
  Globe,
  Shield,
  UserPlus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TeamEvent, TeamAnnouncement } from "@shared/schema";
import { format } from "date-fns";

export default function TeamDetailsPage() {
  const { user } = useAuth();
  const [, params] = useRoute("/teams/:id");
  const teamId = params?.id ? parseInt(params.id) : 0;
  const athleteId = user?.athlete?.id;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  const [createAnnouncementDialogOpen, setCreateAnnouncementDialogOpen] = useState(false);

  // Get team details
  const { data: team, isLoading: isLoadingTeam } = useTeam(teamId);
  
  // Get team members
  const { data: teamMembers, isLoading: isLoadingMembers } = useTeamMembers(teamId);
  
  // Get team events
  const { data: teamEvents, isLoading: isLoadingEvents } = useTeamEvents(teamId);
  
  // Get team announcements
  const { data: teamAnnouncements, isLoading: isLoadingAnnouncements } = useTeamAnnouncements(teamId);
  
  // Get event attendance for the athlete
  const getAttendanceStatus = (eventId: number) => {
    // This would be implemented to get the attendance status for each event
    // For now, return a default value
    return "pending";
  };
  
  // Handle creating events and announcements
  const createEvent = useCreateTeamEvent(teamId);
  const createAnnouncement = useCreateTeamAnnouncement(teamId);
  
  // Handle updating attendance
  const handleUpdateAttendance = (eventId: number, status: string) => {
    // This would be implemented to update attendance status
    console.log(`Update attendance for event ${eventId} to ${status}`);
  };
  
  // Check if user is a team coach or admin
  const isCoachOrAdmin = team && (team.coachId === user?.id || user?.userType === "admin");
  
  // Check if user is a team member
  const isMember = teamMembers?.some(member => member.athleteId === athleteId);
  
  if (isLoadingTeam) {
    return (
      <div className="container px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teams">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Teams
            </Link>
          </Button>
        </div>
        
        <div className="w-full h-40 rounded-lg bg-gray-200 animate-pulse mb-4" />
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/4">
            <Skeleton className="h-9 w-40 mb-6" />
            <Skeleton className="h-24 w-full mb-6" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="w-full md:w-1/4">
            <Skeleton className="h-9 w-40 mb-6" />
            <Skeleton className="h-60 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teams">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Teams
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Team not found</h3>
          <p className="text-muted-foreground mb-6">
            The team you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/teams">Go to Teams</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 max-w-6xl">
      {/* Back button */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teams">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Teams
          </Link>
        </Button>
      </div>
      
      {/* Team banner */}
      <div 
        className="w-full h-40 bg-cover bg-center rounded-lg mb-8 relative" 
        style={{ 
          backgroundImage: team.bannerImage 
            ? `url(${team.bannerImage})` 
            : 'linear-gradient(to right, #4f46e5, #3b82f6)' 
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-white text-primary">{team.level}</Badge>
              <span className="text-sm">{team.season}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content */}
        <div className="w-full md:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
            </TabsList>
            
            {/* Overview tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Information</CardTitle>
                  <CardDescription>Details about {team.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {team.description && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Description</h3>
                      <p className="text-sm text-muted-foreground">{team.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{team.location}</span>
                      </div>
                    )}
                    
                    {team.homeField && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Home Field: {team.homeField}</span>
                      </div>
                    )}
                    
                    {team.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={team.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Team Website
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Created {team.createdAt ? format(new Date(team.createdAt), 'MMM d, yyyy') : 'recently'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Upcoming events preview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>Next events for {team.name}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="#" onClick={() => setActiveTab("events")}>
                      View All
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingEvents ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : teamEvents && teamEvents.length > 0 ? (
                    <div className="space-y-4">
                      {teamEvents.slice(0, 2).map((event) => (
                        <TeamEventCard
                          key={event.id}
                          event={event}
                          athleteId={athleteId}
                          attendanceStatus={getAttendanceStatus(event.id)}
                          onUpdateAttendance={(status) => handleUpdateAttendance(event.id, status)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No upcoming events</p>
                      {isCoachOrAdmin && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setCreateEventDialogOpen(true)}
                        >
                          <CalendarPlus className="h-4 w-4 mr-2" />
                          Create Event
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent announcements preview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Recent Announcements</CardTitle>
                    <CardDescription>Latest news for {team.name}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="#" onClick={() => setActiveTab("announcements")}>
                      View All
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingAnnouncements ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : teamAnnouncements && teamAnnouncements.length > 0 ? (
                    <div className="space-y-4">
                      {teamAnnouncements.slice(0, 2).map((announcement) => (
                        <TeamAnnouncementCard
                          key={announcement.id}
                          announcement={announcement}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No announcements yet</p>
                      {isCoachOrAdmin && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setCreateAnnouncementDialogOpen(true)}
                        >
                          <BellPlus className="h-4 w-4 mr-2" />
                          Create Announcement
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Events tab */}
            <TabsContent value="events" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Team Events</h2>
                {isCoachOrAdmin && (
                  <Button onClick={() => setCreateEventDialogOpen(true)}>
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </div>
              
              {isLoadingEvents ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, idx) => (
                    <Skeleton key={idx} className="h-40 w-full" />
                  ))}
                </div>
              ) : teamEvents && teamEvents.length > 0 ? (
                <div className="space-y-4">
                  {teamEvents.map((event) => (
                    <TeamEventCard
                      key={event.id}
                      event={event}
                      athleteId={athleteId}
                      attendanceStatus={getAttendanceStatus(event.id)}
                      onUpdateAttendance={(status) => handleUpdateAttendance(event.id, status)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
                  <p className="text-muted-foreground mb-6">
                    There are no events scheduled for this team yet.
                  </p>
                  {isCoachOrAdmin && (
                    <Button onClick={() => setCreateEventDialogOpen(true)}>
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Announcements tab */}
            <TabsContent value="announcements" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Team Announcements</h2>
                {isCoachOrAdmin && (
                  <Button onClick={() => setCreateAnnouncementDialogOpen(true)}>
                    <BellPlus className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                )}
              </div>
              
              {isLoadingAnnouncements ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, idx) => (
                    <Skeleton key={idx} className="h-40 w-full" />
                  ))}
                </div>
              ) : teamAnnouncements && teamAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {teamAnnouncements.map((announcement) => (
                    <TeamAnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">No announcements</h3>
                  <p className="text-muted-foreground mb-6">
                    There are no announcements posted for this team yet.
                  </p>
                  {isCoachOrAdmin && (
                    <Button onClick={() => setCreateAnnouncementDialogOpen(true)}>
                      <BellPlus className="h-4 w-4 mr-2" />
                      Create Announcement
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Team Members</span>
                <Badge>{teamMembers?.length || 0}</Badge>
              </CardTitle>
              <CardDescription>
                Players and coaches on this team
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingMembers ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : teamMembers && teamMembers.length > 0 ? (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {member.position ? member.position[0] : "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Athlete #{member.athleteId}</p>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs h-5 px-1">
                            {member.position || "Position unknown"}
                          </Badge>
                          {member.jerseyNumber && (
                            <Badge variant="secondary" className="text-xs h-5 px-1">
                              #{member.jerseyNumber}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No members yet</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {isCoachOrAdmin && (
                <Button variant="outline" size="sm" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Players
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Event creation dialog would go here */}
      <Dialog open={createEventDialogOpen} onOpenChange={setCreateEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team Event</DialogTitle>
            <DialogDescription>
              Add a new event to the team calendar
            </DialogDescription>
          </DialogHeader>
          {/* Event creation form would go here */}
          <div className="py-6 text-center">
            <p className="text-muted-foreground">
              Event creation form will be implemented here
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Announcement creation dialog would go here */}
      <Dialog open={createAnnouncementDialogOpen} onOpenChange={setCreateAnnouncementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>
              Post a new announcement to the team
            </DialogDescription>
          </DialogHeader>
          {/* Announcement creation form would go here */}
          <div className="py-6 text-center">
            <p className="text-muted-foreground">
              Announcement creation form will be implemented here
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}