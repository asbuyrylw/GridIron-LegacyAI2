import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  UsersRound, 
  Calendar, 
  MessageSquare, 
  PlusCircle,
  ChevronRight,
  UserPlus,
  Trash,
  Shield,
  User
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";

// Team form schema
const teamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters long"),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false)
});

export function TeamList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Form setup
  const form = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false
    }
  });
  
  // Query for athlete's teams
  const { data: teams, isLoading } = useQuery({
    queryKey: ["/api/teams"],
    enabled: !!user
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (data: z.infer<typeof teamSchema>) => {
      const res = await apiRequest("POST", "/api/teams", data);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create team");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Team created successfully",
        description: "Your new team has been created"
      });
      
      // Reset form and close dialog
      form.reset();
      setCreateDialogOpen(false);
      
      // Invalidate teams query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create team",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Submit handler
  function onSubmit(data: z.infer<typeof teamSchema>) {
    createTeamMutation.mutate(data);
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Teams</h2>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Team</DialogTitle>
              <DialogDescription>
                Create a team to collaborate with other players, share resources, and track events.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter team name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe your team" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={createTeamMutation.isPending}>
                    {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {teams && teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team: any) => (
            <Card key={team.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>{team.name}</CardTitle>
                  <Badge variant={team.isPrivate ? "outline" : "secondary"}>
                    {team.isPrivate ? "Private" : "Public"}
                  </Badge>
                </div>
                {team.description && (
                  <CardDescription>{team.description}</CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <UsersRound className="h-4 w-4" />
                    <span>{team.memberCount || 0} members</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{team.eventCount || 0} events</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{team.announcementCount || 0} announcements</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {team.isAdmin && (
                    <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  
                  {!team.isAdmin && team.role && (
                    <Badge variant="outline" className="bg-muted hover:bg-muted/80">
                      <User className="h-3 w-3 mr-1" />
                      {team.role}
                    </Badge>
                  )}
                </div>
                
                <Link href={`/teams/${team.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View Team
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/40">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
            <UsersRound className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Teams Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Create a team to collaborate with teammates, coaches, and other players. 
              You can schedule events, share announcements, and more.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}