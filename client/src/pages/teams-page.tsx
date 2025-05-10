import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTeams, useAthleteTeams, useJoinTeam, useLeaveTeam } from "@/hooks/use-team-hooks";
import { TeamCard, TeamCardSkeleton } from "@/components/teams/team-card";
import { CreateTeamForm } from "@/components/teams/create-team-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Filter, RefreshCw } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TeamsPage() {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    level: "all",
    searchTerm: "",
  });
  
  // Get all teams
  const { data: allTeams, isLoading: isLoadingAllTeams, refetch: refetchAllTeams } = useTeams();
  
  // Get teams the athlete belongs to
  const athleteId = user?.athlete?.id;
  const { data: athleteTeams, isLoading: isLoadingAthleteTeams, refetch: refetchAthleteTeams } = useAthleteTeams(athleteId);
  
  // Join/leave team mutations
  const joinTeam = useJoinTeam(athleteId);
  const leaveTeam = useLeaveTeam(athleteId);

  // Filter teams based on filters
  const filterTeams = (teams) => {
    if (!teams) return [];
    
    return teams.filter((team) => {
      // Filter by level
      if (filters.level !== "all" && team.level !== filters.level) {
        return false;
      }
      
      // Filter by search term
      if (filters.searchTerm && !team.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };
  
  const filteredAllTeams = filterTeams(allTeams);
  const filteredAthleteTeams = filterTeams(athleteTeams);
  
  // Check if user is a member of a team
  const isTeamMember = (teamId) => {
    return athleteTeams?.some(team => team.id === teamId);
  };
  
  // Handle team join
  const handleJoinTeam = (teamId) => {
    joinTeam.mutate(teamId, {
      onSuccess: () => {
        refetchAllTeams();
        refetchAthleteTeams();
      }
    });
  };
  
  // Handle team leave
  const handleLeaveTeam = (teamId) => {
    leaveTeam.mutate(teamId, {
      onSuccess: () => {
        refetchAllTeams();
        refetchAthleteTeams();
      }
    });
  };
  
  const handleCreateTeamSuccess = () => {
    setShowCreateDialog(false);
    refetchAllTeams();
    refetchAthleteTeams();
    setActiveTab("my");
  };
  
  const isLoading = isLoadingAllTeams || isLoadingAthleteTeams;
  const isJoining = joinTeam.isPending;
  const isLeaving = leaveTeam.isPending;
  
  // Skeleton array for loading state
  const skeletonArray = Array(6).fill(0);

  return (
    <div className="container px-4 py-6 max-w-6xl">
      <PageHeader
        title="Teams"
        description="Join existing teams or create your own team"
        icon={<Users className="h-6 w-6" />}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Teams</TabsTrigger>
            <TabsTrigger value="my">My Teams</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <Input
              placeholder="Search teams..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="pl-8"
            />
            <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Teams</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Level</p>
                  <RadioGroup 
                    value={filters.level} 
                    onValueChange={(value) => setFilters({ ...filters, level: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">All Levels</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Varsity" id="varsity" />
                      <Label htmlFor="varsity">Varsity</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="JV" id="jv" />
                      <Label htmlFor="jv">JV</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Freshman" id="freshman" />
                      <Label htmlFor="freshman">Freshman</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Middle School" id="middle" />
                      <Label htmlFor="middle">Middle School</Label>
                    </div>
                  </RadioGroup>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                refetchAllTeams();
                refetchAthleteTeams();
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create a New Team</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to create a new team. You'll be automatically set as the coach.
                  </DialogDescription>
                </DialogHeader>
                <CreateTeamForm onSuccess={handleCreateTeamSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      <TabsContent value="all" className="m-0">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skeletonArray.map((_, idx) => (
              <TeamCardSkeleton key={idx} />
            ))}
          </div>
        ) : filteredAllTeams?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAllTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                athleteId={athleteId}
                isMember={isTeamMember(team.id)}
                onJoin={handleJoinTeam}
                onLeave={handleLeaveTeam}
                isLoading={isJoining || isLeaving}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No teams found</h3>
            <p className="text-muted-foreground">
              {filters.searchTerm || filters.level !== "all" 
                ? "Try adjusting your filters or search term"
                : "There are no teams available yet. Create the first one!"}
            </p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="my" className="m-0">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skeletonArray.slice(0, 3).map((_, idx) => (
              <TeamCardSkeleton key={idx} />
            ))}
          </div>
        ) : filteredAthleteTeams?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAthleteTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                athleteId={athleteId}
                isMember={true}
                onLeave={handleLeaveTeam}
                isLoading={isLeaving}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">You haven't joined any teams yet</h3>
            <p className="text-muted-foreground mb-6">
              Join an existing team or create your own team to get started
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab("all")}
              >
                Browse Teams
              </Button>
              <Button onClick={() => setShowCreateDialog(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </div>
          </div>
        )}
      </TabsContent>
    </div>
  );
}