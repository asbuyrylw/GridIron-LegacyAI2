import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  UserPlus,
  UserMinus,
  Users,
  Shield,
  UserCog,
  Filter,
  User,
  X,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface TeamMembersProps {
  teamId: number | string;
  isAdmin: boolean;
}

export function TeamMembers({ teamId, isAdmin }: TeamMembersProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [setRoleDialogOpen, setSetRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  
  // Query team members
  const { data: members, isLoading } = useQuery({
    queryKey: [`/api/teams/${teamId}/members`],
    enabled: !!teamId,
  });
  
  // Set member role mutation
  const setRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: number, role: string }) => {
      const res = await apiRequest("PATCH", `/api/teams/${teamId}/members/${memberId}`, { role });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update member role");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: "The member's role has been updated"
      });
      
      setSetRoleDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/members`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      const res = await apiRequest("DELETE", `/api/teams/${teamId}/members/${memberId}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to remove member");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Member removed",
        description: "The member has been removed from the team"
      });
      
      setRemoveDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/members`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle set member role
  const handleSetRole = () => {
    if (!selectedMember || !newRole) {
      toast({
        title: "Role required",
        description: "Please select a role for the member",
        variant: "destructive"
      });
      return;
    }
    
    setRoleMutation.mutate({ memberId: selectedMember.id, role: newRole });
  };
  
  // Handle remove member
  const handleRemoveMember = () => {
    if (!selectedMember) return;
    
    removeMemberMutation.mutate(selectedMember.id);
  };
  
  // Filter members by search query and role
  const filteredMembers = members ? members.filter((member: any) => {
    const matchesSearch = searchQuery === "" || 
      member.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      member.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${member.user.firstName} ${member.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.role && member.role.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === null || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) : [];
  
  // Get unique roles for filter
  const uniqueRoles = members ? [...new Set(members.map((member: any) => member.role).filter(Boolean))] : [];
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-12 w-full" />
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
            <Badge variant="outline" className="ml-2">
              {members?.length || 0} members
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {uniqueRoles.length > 0 && (
              <div className="md:w-auto w-full">
                <ToggleGroup type="single" value={roleFilter || ""} onValueChange={(value) => setRoleFilter(value || null)}>
                  <ToggleGroupItem value="" className="text-xs">All</ToggleGroupItem>
                  {uniqueRoles.map((role) => (
                    <ToggleGroupItem key={role} value={role} className="text-xs">
                      {role}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}
          </div>
          
          {/* Member List */}
          <div className="space-y-2">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member: any) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user.profileImage} />
                      <AvatarFallback>
                        {`${member.user.firstName?.[0] || ''}${member.user.lastName?.[0] || ''}`}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-medium">{member.user.firstName} {member.user.lastName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        {member.isAdmin ? (
                          <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : member.role ? (
                          <Badge variant="outline" className="bg-muted hover:bg-muted/80">
                            <User className="h-3 w-3 mr-1" />
                            {member.role}
                          </Badge>
                        ) : (
                          "Member"
                        )}
                        
                        {member.pending && (
                          <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && !member.isAdmin && (
                    <div className="flex gap-2">
                      <Dialog open={setRoleDialogOpen && selectedMember?.id === member.id} onOpenChange={(open) => {
                        setSetRoleDialogOpen(open);
                        if (open) {
                          setSelectedMember(member);
                          setNewRole(member.role || "");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <UserCog className="h-4 w-4" />
                            <span className="hidden md:inline">Set Role</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Set Member Role</DialogTitle>
                            <DialogDescription>
                              Assign a role to {member.user.firstName} {member.user.lastName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant={newRole === "Player" ? "default" : "outline"}
                                onClick={() => setNewRole("Player")}
                              >
                                Player
                              </Button>
                              <Button
                                variant={newRole === "Coach" ? "default" : "outline"}
                                onClick={() => setNewRole("Coach")}
                              >
                                Coach
                              </Button>
                              <Button
                                variant={newRole === "Manager" ? "default" : "outline"}
                                onClick={() => setNewRole("Manager")}
                              >
                                Manager
                              </Button>
                              <Button
                                variant={newRole === "Staff" ? "default" : "outline"}
                                onClick={() => setNewRole("Staff")}
                              >
                                Staff
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Custom Role</div>
                              <Input
                                placeholder="Enter custom role"
                                value={!["Player", "Coach", "Manager", "Staff"].includes(newRole) ? newRole : ""}
                                onChange={(e) => setNewRole(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button
                              onClick={handleSetRole}
                              disabled={setRoleMutation.isPending}
                            >
                              {setRoleMutation.isPending ? "Saving..." : "Save Role"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog open={removeDialogOpen && selectedMember?.id === member.id} onOpenChange={(open) => {
                        setRemoveDialogOpen(open);
                        if (open) setSelectedMember(member);
                      }}>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-50">
                            <UserMinus className="h-4 w-4" />
                            <span className="hidden md:inline">Remove</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.user.firstName} {member.user.lastName} from the team?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleRemoveMember}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {removeMemberMutation.isPending ? "Removing..." : "Remove Member"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                  
                  {member.pending && isAdmin && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="hidden md:inline">Approve</span>
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <XCircle className="h-4 w-4" />
                        <span className="hidden md:inline">Reject</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || roleFilter ? 
                  "No members match your search criteria" : 
                  "No members in this team yet"}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}