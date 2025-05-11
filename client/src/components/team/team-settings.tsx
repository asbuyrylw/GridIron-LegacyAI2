import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, RefreshCw, RotateCw, Trash, AlertTriangle } from "lucide-react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";

interface TeamSettingsProps {
  teamId: number | string;
  team: any;
}

const teamSettingsSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters long"),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false)
});

type TeamSettingsValues = z.infer<typeof teamSettingsSchema>;

export function TeamSettings({ teamId, team }: TeamSettingsProps) {
  const { toast } = useToast();
  const [refreshJoinCodeDialogOpen, setRefreshJoinCodeDialogOpen] = useState(false);
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false);
  
  // Form setup
  const form = useForm<TeamSettingsValues>({
    resolver: zodResolver(teamSettingsSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
      isPrivate: team?.isPrivate || false
    }
  });
  
  // Update team settings mutation
  const updateTeamMutation = useMutation({
    mutationFn: async (data: TeamSettingsValues) => {
      const res = await apiRequest("PATCH", `/api/teams/${teamId}`, data);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update team settings");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Team settings have been updated successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Refresh join code mutation
  const refreshJoinCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/teams/${teamId}/refresh-join-code`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to refresh join code");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Join code refreshed",
        description: "A new join code has been generated"
      });
      
      setRefreshJoinCodeDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to refresh join code",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/teams/${teamId}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete team");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Team deleted",
        description: "The team has been permanently deleted"
      });
      
      // Redirect to teams page
      window.location.href = "/teams";
      
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete team",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Form submit handler
  function onSubmit(data: TeamSettingsValues) {
    updateTeamMutation.mutate(data);
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Team Settings
          </CardTitle>
          <CardDescription>
            Manage your team's basic settings
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormDescription>
                      Briefly describe your team's purpose or focus
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Private Team</FormLabel>
                      <FormDescription>
                        Make your team private to restrict access to invited members only
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={updateTeamMutation.isPending}
              >
                {updateTeamMutation.isPending ? "Saving Changes..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Join Code
          </CardTitle>
          <CardDescription>
            Manage your team's join code
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 rounded-md border">
            <div className="text-sm font-medium mb-2">Current Join Code</div>
            <div className="flex items-center gap-2">
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-md font-semibold">
                {team?.joinCode || "No join code available"}
              </code>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (team?.joinCode) {
                    navigator.clipboard.writeText(team.joinCode);
                    toast({
                      title: "Copied to clipboard",
                      description: "Join code has been copied to clipboard"
                    });
                  }
                }}
                disabled={!team?.joinCode}
              >
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Share this code with others to let them join your team
            </p>
          </div>
          
          <AlertDialog open={refreshJoinCodeDialogOpen} onOpenChange={setRefreshJoinCodeDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <RotateCw className="h-4 w-4 mr-2" />
                Refresh Join Code
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Refresh Join Code</AlertDialogTitle>
                <AlertDialogDescription>
                  This will generate a new join code and invalidate the current one. Anyone with the old code will no longer be able to join.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => refreshJoinCodeMutation.mutate()}
                  disabled={refreshJoinCodeMutation.isPending}
                >
                  {refreshJoinCodeMutation.isPending ? "Refreshing..." : "Refresh Join Code"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
      
      <Card className="border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your team
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <AlertDialog open={deleteTeamDialogOpen} onOpenChange={setDeleteTeamDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full gap-2">
                <Trash className="h-4 w-4" />
                Delete Team
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Team</AlertDialogTitle>
                <AlertDialogDescription>
                  <p className="mb-2">
                    Are you sure you want to delete this team? This action is permanent and cannot be undone.
                  </p>
                  <div className="mt-4 p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
                    <p className="font-semibold mb-1">Warning:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>All team data, including events and announcements, will be permanently deleted</li>
                      <li>All team members will lose access to this team</li>
                      <li>This action is irreversible - there is no way to recover the team later</li>
                    </ul>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <Separator className="my-2" />
              
              <div className="flex items-center border rounded-md p-2">
                <Input 
                  className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder={`Type "${team?.name}" to confirm`}
                  onChange={(e) => {
                    const confirmButton = document.getElementById("confirm-delete") as HTMLButtonElement;
                    if (confirmButton) {
                      confirmButton.disabled = e.target.value !== team?.name;
                    }
                  }}
                />
              </div>
              
              <AlertDialogFooter className="mt-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  id="confirm-delete"
                  onClick={() => deleteTeamMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={true}
                >
                  {deleteTeamMutation.isPending ? "Deleting..." : "Permanently Delete Team"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}