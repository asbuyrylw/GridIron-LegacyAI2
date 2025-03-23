import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FaTwitter, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import { CalendarIcon, Clock, Image, RefreshCw, Send, FileImage } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Social platform icons
const platformIcons = {
  twitter: FaTwitter,
  instagram: FaInstagram,
  facebook: FaFacebook,
  tiktok: FaTiktok
};

const socialPostSchema = z.object({
  content: z.string().min(1, "Post content is required").max(280, "Post must be 280 characters or less"),
  mediaUrl: z.string().optional(),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  scheduledFor: z.date().optional(),
  status: z.string().default("pending")
});

type SocialPostFormValues = z.infer<typeof socialPostSchema>;

export function SocialPosts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isScheduled, setIsScheduled] = useState(false);
  
  // Query for getting social connections
  const { 
    data: connections, 
    isLoading: connectionsLoading,
  } = useQuery<any[]>({
    queryKey: ["/api/user/social-connections"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Query for getting social posts
  const { 
    data: posts, 
    isLoading: postsLoading,
    error: postsError
  } = useQuery<any[]>({
    queryKey: ["/api/user/social-posts"],
    queryFn: async () => {
      const res = await fetch(`/api/user/social-posts`);
      
      if (res.status === 401) {
        throw new Error("Not authorized");
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch posts");
      }
      
      return res.json();
    },
  });
  
  // Connected platforms for posting
  const connectedPlatforms = connections?.filter((conn: any) => conn.connected) || [];
  
  // Mutation for creating a post
  const createPostMutation = useMutation({
    mutationFn: async (data: SocialPostFormValues) => {
      const res = await apiRequest("POST", "/api/user/social-posts", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/social-posts"] });
      setIsCreatingPost(false);
      resetForm();
      toast({
        title: isScheduled ? "Post Scheduled" : "Post Created",
        description: isScheduled 
          ? "Your post has been scheduled for publishing" 
          : "Your post is being published to selected platforms",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Setup form
  const form = useForm<SocialPostFormValues>({
    resolver: zodResolver(socialPostSchema),
    defaultValues: {
      content: "",
      platforms: [],
      status: "pending"
    }
  });
  
  // Reset form state
  const resetForm = () => {
    form.reset({
      content: "",
      platforms: [],
      status: "pending"
    });
    setSelectedDate(undefined);
    setIsScheduled(false);
  };
  
  // Submit handler
  const onSubmit = (data: SocialPostFormValues) => {
    // Add scheduled date if selected
    if (isScheduled && selectedDate) {
      data.scheduledFor = selectedDate;
    }
    
    createPostMutation.mutate(data);
  };
  
  // Handle cancel
  const handleCancel = () => {
    setIsCreatingPost(false);
    resetForm();
  };
  
  if (postsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading posts. Please try again.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Posts</CardTitle>
        <CardDescription>
          Share your achievements and training progress on social media
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Create post form */}
        {isCreatingPost ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your latest achievement..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>Write a message to share on your social media</span>
                      <span className={cn(
                        "text-xs", 
                        field.value.length > 280 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {field.value.length}/280
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mediaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media URL (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="ml-2"
                          onClick={() => {}}
                        >
                          <FileImage className="h-4 w-4 mr-2" />
                          Browse
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Add an image URL to include with your post
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="platforms"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Select Platforms</FormLabel>
                      <FormDescription>
                        Choose which platforms to post to
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {connectionsLoading ? (
                        <div>Loading platforms...</div>
                      ) : connectedPlatforms.length === 0 ? (
                        <FormMessage>
                          No connected platforms available. Please connect a platform first.
                        </FormMessage>
                      ) : (
                        connectedPlatforms.map((platform: any) => {
                          const PlatformIcon = platformIcons[platform.platform as keyof typeof platformIcons] || FaTwitter;
                          
                          return (
                            <FormField
                              key={platform.id}
                              control={form.control}
                              name="platforms"
                              render={({ field }) => {
                                return (
                                  <FormItem 
                                    key={platform.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(platform.platform)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, platform.platform])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== platform.platform
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <div className="flex items-center gap-2">
                                      <PlatformIcon className="h-4 w-4 text-primary" />
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="capitalize">
                                          {platform.platform}
                                        </FormLabel>
                                        <FormDescription>
                                          @{platform.username}
                                        </FormDescription>
                                      </div>
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                          );
                        })
                      )}
                    </div>
                    <FormMessage className="mt-2">
                      {form.formState.errors.platforms?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Schedule Post</FormLabel>
                  <FormDescription>
                    Instead of posting now, schedule this post for later
                  </FormDescription>
                </div>
                <Switch
                  checked={isScheduled}
                  onCheckedChange={setIsScheduled}
                />
              </FormItem>
              
              {isScheduled && (
                <FormItem className="flex flex-col">
                  <FormLabel>Schedule Date & Time</FormLabel>
                  <div className="flex items-center gap-2 mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Input 
                      type="time"
                      className="w-[120px]"
                      disabled={!selectedDate}
                      onChange={(e) => {
                        if (!selectedDate) return;
                        
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const newDate = new Date(selectedDate);
                        newDate.setHours(hours, minutes);
                        setSelectedDate(newDate);
                      }}
                    />
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormDescription className="mt-1">
                    Select when you want this post to be published
                  </FormDescription>
                </FormItem>
              )}
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={createPostMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={
                    createPostMutation.isPending || 
                    (isScheduled && !selectedDate) ||
                    connectedPlatforms.length === 0
                  }
                >
                  {createPostMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {isScheduled ? "Scheduling..." : "Posting..."}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {isScheduled ? "Schedule Post" : "Post Now"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <>
            {/* Post History */}
            {!postsLoading && posts && posts.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">Post History</h3>
                {posts.map((post: any) => {
                  // Determine post status badge
                  const statusBadge = () => {
                    switch (post.status) {
                      case "posted":
                        return <Badge className="bg-green-50 text-green-600 border-green-200">Posted</Badge>;
                      case "scheduled":
                        return <Badge className="bg-blue-50 text-blue-600 border-blue-200">Scheduled</Badge>;
                      case "failed":
                        return <Badge className="bg-red-50 text-red-600 border-red-200">Failed</Badge>;
                      default:
                        return <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
                    }
                  };
                  
                  return (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {/* Show platform icons */}
                          <div className="flex">
                            {post.platforms.map((platform: string, idx: number) => {
                              const PlatformIcon = platformIcons[platform as keyof typeof platformIcons] || FaTwitter;
                              return (
                                <div key={idx} className="rounded-full bg-primary/10 p-1 -ml-1 first:ml-0">
                                  <PlatformIcon className="h-3 w-3 text-primary" />
                                </div>
                              );
                            })}
                          </div>
                          {statusBadge()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {post.postedAt ? (
                            format(new Date(post.postedAt), "PPp")
                          ) : post.scheduledFor ? (
                            <>Scheduled for {format(new Date(post.scheduledFor), "PPp")}</>
                          ) : (
                            format(new Date(post.createdAt), "PPp")
                          )}
                        </div>
                      </div>
                      <p className="text-sm mb-2">{post.content}</p>
                      {post.mediaUrl && (
                        <div className="mt-2 border rounded-md p-1 inline-block">
                          <Image className="h-4 w-4 mr-1 inline-block" />
                          <span className="text-xs text-muted-foreground">Media attached</span>
                        </div>
                      )}
                      {post.errorMessage && (
                        <p className="text-xs text-destructive mt-2">{post.errorMessage}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Empty state */}
            {!postsLoading && (!posts || posts.length === 0) && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Send className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your achievements and progress on social media
                </p>
                {connectedPlatforms.length > 0 ? (
                  <Button onClick={() => setIsCreatingPost(true)}>
                    Create Post
                  </Button>
                ) : (
                  <div className="text-center max-w-md mx-auto">
                    <p className="text-muted-foreground mb-2">
                      You need to connect at least one social media platform before posting.
                    </p>
                    <Button variant="outline">
                      Connect a Platform
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="justify-center border-t pt-4">
        {!isCreatingPost && posts && posts.length > 0 && (
          <Button onClick={() => setIsCreatingPost(true)}>
            Create New Post
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