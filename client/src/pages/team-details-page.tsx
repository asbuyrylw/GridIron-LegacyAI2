import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect, useLocation, useRoute } from "wouter";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ShareButton } from "@/components/social/share-button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Team, TeamMember, TeamEvent, TeamAnnouncement } from "@shared/schema";
import { 
  Users, 
  Calendar, 
  Megaphone, 
  Settings, 
  Clock, 
  MapPin,
  ChevronLeft,
  ChevronsUpDown
} from "lucide-react";
import { formatDistance, format } from "date-fns";

export default function TeamDetailsPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/teams/:id");
  const teamId = params?.id ? parseInt(params.id) : null;
  const [activeTab, setActiveTab] = useState("overview");
  
  // Query for team details
  const { data: team, isLoading: isLoadingTeam } = useQuery<Team & { isCoach: boolean }>({
    queryKey: [`/api/teams/${teamId}`],
    enabled: !!teamId,
  });
  
  // Query for team members
  const { data: members = [], isLoading: isLoadingMembers } = useQuery<TeamMember[]>({
    queryKey: [`/api/teams/${teamId}/members`],
    enabled: !!teamId,
  });
  
  // Query for upcoming team events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery<TeamEvent[]>({
    queryKey: [`/api/teams/${teamId}/events`],
    enabled: !!teamId,
  });
  
  // Query for team announcements
  const { data: announcements = [], isLoading: isLoadingAnnouncements } = useQuery<TeamAnnouncement[]>({
    queryKey: [`/api/teams/${teamId}/announcements`],
    enabled: !!teamId,
  });
  
  // Loading state
  if (isLoading || isLoadingTeam) {
    return <LoadingSpinner fullScreen size="lg" />;
  }
  
  // Redirect if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Redirect to onboarding if not completed
  if (user?.athlete && !user.athlete.onboardingCompleted) {
    return <Redirect to="/onboarding" />;
  }
  
  // Handle team not found
  if (!team && !isLoadingTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Team Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">The team you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => setLocation("/teams")}>Back to Teams</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const upcomingEvents = events
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);
  
  const recentAnnouncements = announcements
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);
  
  const isCoach = team?.isCoach || false;
  
  return (
    <div className="min-h-screen pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        <div className="flex items-center gap-2 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => setLocation("/teams")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Team Details</h1>
        </div>
        
        {/* Team Header */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex justify-between">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  {team?.logoUrl ? (
                    <img 
                      src={team.logoUrl} 
                      alt={team.name} 
                      className="w-14 h-14 rounded-full object-cover" 
                    />
                  ) : (
                    <Users className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{team?.name}</h2>
                  <p className="text-muted-foreground">
                    {team?.level} • {team?.season}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShareButton 
                  title={`${team?.name} - ${team?.level} Football Team`}
                  text={`Check out my football team: ${team?.name} (${team?.level}) for the ${team?.season} season!`}
                  size="sm"
                />
                {isCoach && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation(`/teams/${teamId}/manage`)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              {team?.description || `${team?.name} ${team?.level} football team for the ${team?.season} season.`}
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{members.length} Members</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Team Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="announcements">Updates</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-6">
            {/* Upcoming Events Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Upcoming Events</h3>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => setActiveTab("events")}
                >
                  View All
                </Button>
              </div>
              {isLoadingEvents ? (
                <div className="py-4 flex justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event}
                      onClick={() => setLocation(`/teams/${teamId}/events/${event.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No upcoming events</p>
                </div>
              )}
            </div>
            
            {/* Recent Announcements Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Recent Announcements</h3>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => setActiveTab("announcements")}
                >
                  View All
                </Button>
              </div>
              {isLoadingAnnouncements ? (
                <div className="py-4 flex justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : recentAnnouncements.length > 0 ? (
                <div className="space-y-3">
                  {recentAnnouncements.map(announcement => (
                    <AnnouncementCard 
                      key={announcement.id} 
                      announcement={announcement}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border rounded-lg">
                  <Megaphone className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No announcements</p>
                </div>
              )}
            </div>
            
            {/* Team Stats Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Team Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Members" value={members.length} icon={<Users className="h-5 w-5" />} />
                <StatCard title="Events" value={events.length} icon={<Calendar className="h-5 w-5" />} />
                <StatCard title="Announcements" value={announcements.length} icon={<Megaphone className="h-5 w-5" />} />
                <StatCard title="Season" value={team?.season || "-"} icon={<ChevronsUpDown className="h-5 w-5" />} />
              </div>
            </div>
          </TabsContent>
          
          {/* Members Tab */}
          <TabsContent value="members" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Team Members</h3>
              {isCoach && (
                <Button 
                  size="sm"
                  onClick={() => setLocation(`/teams/${teamId}/manage/members`)}
                >
                  Manage Members
                </Button>
              )}
            </div>
            
            {isLoadingMembers ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : members.length > 0 ? (
              <div className="space-y-3">
                {members.map(member => (
                  <MemberCard 
                    key={member.id} 
                    member={member}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border rounded-lg">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No team members yet</p>
                {isCoach && (
                  <Button 
                    variant="link" 
                    onClick={() => setLocation(`/teams/${teamId}/manage/members/add`)}
                  >
                    Add Members
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Events Tab */}
          <TabsContent value="events" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Team Events</h3>
              {isCoach && (
                <Button 
                  size="sm"
                  onClick={() => setLocation(`/teams/${teamId}/events/create`)}
                >
                  Add Event
                </Button>
              )}
            </div>
            
            {isLoadingEvents ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-3">
                {events
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event}
                      onClick={() => setLocation(`/teams/${teamId}/events/${event.id}`)}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 border rounded-lg">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No events scheduled</p>
                {isCoach && (
                  <Button 
                    variant="link" 
                    onClick={() => setLocation(`/teams/${teamId}/events/create`)}
                  >
                    Schedule an Event
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Announcements Tab */}
          <TabsContent value="announcements" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Team Announcements</h3>
              {isCoach && (
                <Button 
                  size="sm"
                  onClick={() => setLocation(`/teams/${teamId}/announcements/create`)}
                >
                  Post Announcement
                </Button>
              )}
            </div>
            
            {isLoadingAnnouncements ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements
                  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                  .map(announcement => (
                    <AnnouncementCard 
                      key={announcement.id} 
                      announcement={announcement}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 border rounded-lg">
                <Megaphone className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No announcements</p>
                {isCoach && (
                  <Button 
                    variant="link" 
                    onClick={() => setLocation(`/teams/${teamId}/announcements/create`)}
                  >
                    Post an Announcement
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNav />
    </div>
  );
}

function EventCard({ event, onClick }: { event: TeamEvent; onClick: () => void }) {
  const isPast = new Date(event.startDate) < new Date();
  
  return (
    <Card 
      className={`hover:border-primary/50 cursor-pointer transition-all ${isPast ? 'opacity-70' : ''}`} 
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="min-w-[50px] text-center">
            <div className="bg-primary/10 rounded-md py-1 px-2">
              <div className="text-xs text-muted-foreground">
                {format(new Date(event.startDate), 'MMM')}
              </div>
              <div className="text-lg font-bold">
                {format(new Date(event.startDate), 'd')}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1">{event.title}</h4>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{format(new Date(event.startDate), 'h:mm a')}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-xs font-medium">
            {isPast ? (
              <span className="text-muted">Past</span>
            ) : (
              <span className="text-primary">{event.eventType}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnnouncementCard({ announcement }: { announcement: TeamAnnouncement }) {
  const timeAgo = formatDistance(
    new Date(announcement.publishedAt),
    new Date(),
    { addSuffix: true }
  );
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium">{announcement.title}</h4>
          <div className="text-xs text-muted-foreground">{timeAgo}</div>
        </div>
        <p className="text-sm mb-2">{announcement.content}</p>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {announcement.importance && announcement.importance !== "normal" && (
              <span className={`
                font-medium 
                ${announcement.importance === "high" ? "text-amber-600" : ""} 
                ${announcement.importance === "urgent" ? "text-red-600" : ""}
              `}>
                {(announcement.importance || "normal").charAt(0).toUpperCase() + (announcement.importance || "normal").slice(1)} Priority
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  // This would be expanded with real user data in the actual implementation
  const getInitials = (position: string) => {
    return position?.substring(0, 2).toUpperCase() || 'ME';
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(member.position || '')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-medium">Player Name</h4>
            <div className="text-xs text-muted-foreground">
              {member.position} {member.jerseyNumber ? `• #${member.jerseyNumber}` : ''}
            </div>
          </div>
          <div className="text-xs font-medium bg-primary/10 py-1 px-2 rounded-full">
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ 
  title, 
  value, 
  icon 
}: { 
  title: string; 
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 bg-primary/10 p-2 rounded-full">
            {icon}
          </div>
          <div className="text-2xl font-bold mb-1">{value}</div>
          <div className="text-xs text-muted-foreground">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
}