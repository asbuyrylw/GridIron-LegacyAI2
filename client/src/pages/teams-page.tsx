import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect, useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calendar, Megaphone, ArrowRight } from "lucide-react";
import { Team } from "@shared/schema";

export default function TeamsPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("myTeams");
  
  // Query for teams the user is a member of
  const { data: myTeams = [], isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ["/api/athlete/teams"],
    enabled: !!user?.athlete?.id,
  });
  
  // Query for teams the user coaches (if applicable)
  const { data: coachedTeams = [], isLoading: isLoadingCoachedTeams } = useQuery<Team[]>({
    queryKey: ["/api/coach/teams"],
    enabled: user?.userType === "coach",
  });
  
  // Loading state
  if (isLoading) {
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
  
  const allTeams = [...myTeams, ...coachedTeams];
  const hasTeams = allTeams.length > 0;
  
  return (
    <div className="min-h-screen pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">My Teams</h1>
          <Button 
            onClick={() => setLocation("/teams/create")}
            size="sm" 
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Create Team</span>
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="myTeams">My Teams</TabsTrigger>
            {user?.userType === "coach" && (
              <TabsTrigger value="coachedTeams">Teams I Coach</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="myTeams" className="mt-4 space-y-4">
            {isLoadingTeams ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" centered />
              </div>
            ) : myTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myTeams.map(team => (
                  <TeamCard 
                    key={team.id} 
                    team={team} 
                    onClick={() => setLocation(`/teams/${team.id}`)} 
                  />
                ))}
              </div>
            ) : (
              <EmptyTeamsState />
            )}
          </TabsContent>
          
          {user?.userType === "coach" && (
            <TabsContent value="coachedTeams" className="mt-4 space-y-4">
              {isLoadingCoachedTeams ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" centered />
                </div>
              ) : coachedTeams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coachedTeams.map(team => (
                    <TeamCard 
                      key={team.id} 
                      team={team} 
                      onClick={() => setLocation(`/teams/${team.id}`)} 
                      isCoach={true}
                    />
                  ))}
                </div>
              ) : (
                <EmptyCoachTeamsState />
              )}
            </TabsContent>
          )}
        </Tabs>
        
        {/* Resources and Quick Links */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Team Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResourceCard 
              title="Find a Team" 
              description="Search for teams at your school or in your area"
              icon={<Users className="h-8 w-8 text-primary" />}
              onClick={() => setLocation("/teams/search")}
            />
            <ResourceCard 
              title="Team Events" 
              description="View practices, games, and other team events"
              icon={<Calendar className="h-8 w-8 text-primary" />}
              onClick={() => setLocation("/teams/events")}
            />
            <ResourceCard 
              title="Team Announcements" 
              description="Important updates from your coaches"
              icon={<Megaphone className="h-8 w-8 text-primary" />}
              onClick={() => setLocation("/teams/announcements")}
            />
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}

function TeamCard({ 
  team, 
  onClick,
  isCoach = false
}: { 
  team: Team; 
  onClick: () => void;
  isCoach?: boolean;
}) {
  return (
    <Card className="hover:border-primary/50 cursor-pointer transition-all" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <Users className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-lg">{team.name}</CardTitle>
            <CardDescription>
              {team.level} • {team.season}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {team.description || `${team.name} ${team.level} football team for the ${team.season} season.`}
        </p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center">
        <div className="text-xs font-medium flex items-center gap-1">
          {isCoach ? "Coach" : "Member"}
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          <span>View Team</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function ResourceCard({ 
  title, 
  description, 
  icon,
  onClick
}: { 
  title: string; 
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Card className="hover:border-primary/50 cursor-pointer transition-all" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyTeamsState() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="text-center py-12 border rounded-lg bg-muted/20">
      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No Teams Found</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        You're not part of any teams yet. Create a new team or search for existing teams to join.
      </p>
      <div className="flex justify-center gap-4">
        <Button onClick={() => setLocation("/teams/search")}>
          Find Teams
        </Button>
        <Button variant="outline" onClick={() => setLocation("/teams/create")}>
          Create a Team
        </Button>
      </div>
    </div>
  );
}

function EmptyCoachTeamsState() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="text-center py-12 border rounded-lg bg-muted/20">
      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No Teams Found</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        You're not coaching any teams yet. Create a new team to get started.
      </p>
      <Button onClick={() => setLocation("/teams/create")}>
        Create a Team
      </Button>
    </div>
  );
}