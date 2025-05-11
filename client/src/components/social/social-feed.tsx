import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { SocialPost } from "@/components/social/social-post";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Image as ImageIcon,
  Video,
  Mic,
  Smile,
  MapPin,
  X,
  Camera,
  CheckCircle,
  TrendingUp,
  Trophy,
  BarChart2,
  SendHorizontal,
  AlertCircle,
  Loader2
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SocialComments } from "@/components/social/social-comments";

export function SocialFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newPostText, setNewPostText] = useState("");
  const [selectedPostMedia, setSelectedPostMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "team" | "achievements">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  
  // Query posts with selected tab filter
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/social/feed", activeTab],
    queryFn: async () => {
      const queryParams = activeTab !== "all" ? `?filter=${activeTab}` : "";
      const res = await fetch(`/api/social/feed${queryParams}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch posts");
      }
      
      return res.json();
    }
  });
  
  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      // Create FormData to support file uploads
      const formData = new FormData();
      formData.append("content", newPostText);
      
      if (selectedPostMedia) {
        formData.append("media", selectedPostMedia);
        formData.append("mediaType", mediaType || "image");
      }
      
      const res = await fetch("/api/social/posts", {
        method: "POST",
        body: formData
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create post");
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Reset form
      setNewPostText("");
      setSelectedPostMedia(null);
      setMediaType(null);
      
      // Invalidate feed query to show the new post
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
      
      toast({
        title: "Post created",
        description: "Your post has been created successfully",
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
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file under 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // Determine media type
    if (file.type.startsWith("image/")) {
      setMediaType("image");
    } else if (file.type.startsWith("video/")) {
      setMediaType("video");
    } else if (file.type.startsWith("audio/")) {
      setMediaType("audio");
    } else {
      toast({
        title: "Unsupported file type",
        description: "Please select an image, video, or audio file",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedPostMedia(file);
  };
  
  // Handle submit post
  const handleSubmitPost = () => {
    if (!newPostText.trim() && !selectedPostMedia) {
      toast({
        title: "Post cannot be empty",
        description: "Please add some text or media to your post",
        variant: "destructive",
      });
      return;
    }
    
    createPostMutation.mutate();
  };
  
  // Handle post comment click
  const handlePostCommentClick = (postId: number) => {
    setSelectedPost(postId);
    setCommentsDialogOpen(true);
  };
  
  // Format media preview type
  const formatMediaPreviewType = () => {
    if (!selectedPostMedia) return null;
    
    switch (mediaType) {
      case "image":
        return "Image";
      case "video":
        return "Video";
      case "audio":
        return "Audio";
      default:
        return "File";
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Create Post</CardTitle>
          <CardDescription>
            Share updates, achievements, or milestones with your teammates and coaches
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={user?.profileImage || undefined} />
              <AvatarFallback>
                {user?.firstName?.[0] || ""}{user?.lastName?.[0] || ""}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                className="resize-none min-h-[100px]"
              />
              
              {/* Selected media preview */}
              {selectedPostMedia && (
                <div className="mt-3 p-2 border rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {mediaType === "image" && <ImageIcon className="h-4 w-4 text-blue-500" />}
                    {mediaType === "video" && <Video className="h-4 w-4 text-red-500" />}
                    {mediaType === "audio" && <Mic className="h-4 w-4 text-purple-500" />}
                    <span className="text-sm">
                      {formatMediaPreviewType()}: {selectedPostMedia.name.length > 30 ? 
                        selectedPostMedia.name.substring(0, 30) + "..." : 
                        selectedPostMedia.name}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      setSelectedPostMedia(null);
                      setMediaType(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 flex justify-between items-center">
          <div className="flex gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*"
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              <span className="hidden md:inline">Add Media</span>
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden md:inline">Add Achievement</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h3 className="font-medium">Share Achievement</h3>
                  <p className="text-sm text-muted-foreground">
                    Select an achievement to share with your followers
                  </p>
                  
                  <div className="bg-muted/50 text-center p-6 rounded-md">
                    <div className="text-muted-foreground text-sm">
                      Coming soon! Achievement sharing will be available in the next update.
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span className="hidden md:inline">Add Stats</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h3 className="font-medium">Share Performance Stats</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your latest game stats or combine metrics
                  </p>
                  
                  <div className="bg-muted/50 text-center p-6 rounded-md">
                    <div className="text-muted-foreground text-sm">
                      Coming soon! Performance stats sharing will be available in the next update.
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            className="gap-2"
            onClick={handleSubmitPost}
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <SendHorizontal className="h-4 w-4" />
                Post
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Feed Tabs */}
      <Tabs value={activeTab} onValueChange={(value: "all" | "team" | "achievements") => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {isLoading ? (
            // Loading state
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="p-2 pt-0">
                    <div className="w-full flex justify-between items-center p-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            // Render posts
            <div className="space-y-4">
              {posts.map((post: any) => (
                <SocialPost 
                  key={post.id} 
                  post={post} 
                  onCommentClick={handlePostCommentClick}
                />
              ))}
            </div>
          ) : (
            // Empty state
            <Card className="bg-muted/30">
              <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  {activeTab === "all" && <SendHorizontal className="h-8 w-8 text-primary" />}
                  {activeTab === "team" && <Users className="h-8 w-8 text-primary" />}
                  {activeTab === "achievements" && <Trophy className="h-8 w-8 text-primary" />}
                </div>
                <h3 className="text-lg font-medium mb-1">No posts yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  {activeTab === "all" && "Be the first to share something with your teammates and coaches."}
                  {activeTab === "team" && "No team posts yet. Share updates about practices, games, or team events."}
                  {activeTab === "achievements" && "No achievement posts yet. Complete milestones and share your progress."}
                </p>
                <Button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  Create Your First Post
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Comments Dialog */}
      <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {selectedPost && <SocialComments postId={selectedPost} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}