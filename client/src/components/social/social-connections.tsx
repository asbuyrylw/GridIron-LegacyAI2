import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FaTwitter, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import { Trash2, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const socialConnectionSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  username: z.string().min(1, "Username is required"),
  accessToken: z.string().optional(),
  connected: z.boolean().default(true)
});

type SocialConnectionFormValues = z.infer<typeof socialConnectionSchema>;

// Social platform icons
const platformIcons = {
  twitter: FaTwitter,
  instagram: FaInstagram,
  facebook: FaFacebook,
  tiktok: FaTiktok
};

export function SocialConnections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addingNew, setAddingNew] = useState(false);
  
  // Query for getting social connections
  const { 
    data: connections, 
    isLoading: connectionsLoading,
    error: connectionsError
  } = useQuery({
    queryKey: ["/api/user/social-connections"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Mutation for creating/updating social connection
  const createConnectionMutation = useMutation({
    mutationFn: async (data: SocialConnectionFormValues) => {
      const res = await apiRequest("POST", "/api/user/social-connections", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/social-connections"] });
      setAddingNew(false);
      toast({
        title: "Success",
        description: "Social platform connected successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutation for disconnecting a social platform
  const disconnectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/user/social-connections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/social-connections"] });
      toast({
        title: "Disconnected",
        description: "Social platform disconnected successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error disconnecting",
        description: error.message,
        variant: "destructive", 
      });
    }
  });
  
  // Setup form for adding new connection
  const form = useForm<SocialConnectionFormValues>({
    resolver: zodResolver(socialConnectionSchema),
    defaultValues: {
      platform: "",
      username: "",
      connected: true
    }
  });
  
  // Submit handler for adding new connection
  const onSubmit = (data: SocialConnectionFormValues) => {
    createConnectionMutation.mutate(data);
  };
  
  // Function to disconnect a platform
  const handleDisconnect = (id: number) => {
    if (confirm("Are you sure you want to disconnect this platform?")) {
      disconnectMutation.mutate(id);
    }
  };
  
  // Handler for cancel button
  const handleCancel = () => {
    setAddingNew(false);
    form.reset();
  };
  
  if (connectionsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading social connections. Please try again.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Connections</CardTitle>
        <CardDescription>
          Connect your social media accounts to share your achievements and training progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Display existing connections */}
        {!connectionsLoading && connections && connections.length > 0 && (
          <div className="space-y-4 mb-6">
            {connections.map((connection: any) => {
              const PlatformIcon = platformIcons[connection.platform as keyof typeof platformIcons] 
                || LinkIcon;
                
              return (
                <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <PlatformIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{connection.platform}</p>
                      <p className="text-sm text-muted-foreground">@{connection.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connection.connected ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                        Disconnected
                      </Badge>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDisconnect(connection.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Empty state */}
        {!connectionsLoading && (!connections || connections.length === 0) && !addingNew && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <LinkIcon className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No social platforms connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your social media accounts to automatically share your achievements
            </p>
            <Button onClick={() => setAddingNew(true)}>
              Connect Platform
            </Button>
          </div>
        )}
        
        {/* Add new connection form */}
        {addingNew && (
          <>
            <Separator className="my-4" />
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select platform</option>
                          <option value="twitter">Twitter</option>
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                          <option value="tiktok">TikTok</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your username on the platform without the @ symbol
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="connected"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Connection</FormLabel>
                        <FormDescription>
                          Enable automatic posting to this platform
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={createConnectionMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createConnectionMutation.isPending}
                  >
                    {createConnectionMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : "Connect Platform"}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-center border-t pt-4">
        {!addingNew && connections && connections.length > 0 && (
          <Button onClick={() => setAddingNew(true)}>
            Add Another Platform
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Helper function for query fetching
function getQueryFn<T>(options: { on401: "throw" | "returnNull" }) {
  return async () => {
    const res = await fetch(`/api/user/social-connections`);
    
    if (res.status === 401) {
      if (options.on401 === "throw") {
        throw new Error("Not authorized");
      } else {
        return null;
      }
    }
    
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    
    return res.json() as Promise<T>;
  };
}