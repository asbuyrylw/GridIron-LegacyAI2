import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SOCIAL_PLATFORMS, SocialPlatform } from "@/lib/social-platforms";
import { formatDistance } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, MessageSquare, Heart, Share2, Calendar, Clock } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SocialPost {
  id: number;
  userId: number;
  content: string;
  mediaUrl: string | null;
  platforms: string[];
  status: 'pending' | 'posted' | 'failed';
  scheduledFor: string | null;
  postedAt: string | null;
  errorMessage: string | null;
  user: {
    username: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
}

export function SocialPostsFeed() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  
  const { data: posts = [], isLoading } = useQuery<SocialPost[]>({
    queryKey: ["/api/social/posts"],
    enabled: !!user,
  });
  
  // Filter posts based on active tab
  const filteredPosts = posts.filter(post => {
    if (activeTab === "all") return true;
    if (activeTab === "scheduled") return post.scheduledFor && post.status === "pending";
    if (activeTab === "posted") return post.status === "posted";
    if (activeTab === "pending") return !post.scheduledFor && post.status === "pending";
    
    // Filter by platform
    return post.platforms.includes(activeTab);
  });
  
  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const dateA = new Date(a.postedAt || a.scheduledFor || "").getTime();
    const dateB = new Date(b.postedAt || b.scheduledFor || "").getTime();
    
    if (sortOption === "newest") return dateB - dateA;
    return dateA - dateB;
  });
  
  // Function to render platform badges
  const renderPlatformBadges = (platformIds: string[]) => {
    return platformIds.map(id => {
      const platform = SOCIAL_PLATFORMS.find(p => p.id === id);
      if (!platform) return null;
      
      return (
        <Badge 
          key={id} 
          variant="secondary"
          className="flex items-center gap-1"
          style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
        >
          <platform.icon className="h-3 w-3" />
          <span>{platform.name}</span>
        </Badge>
      );
    });
  };
  
  // Function to render post status
  const renderPostStatus = (post: SocialPost) => {
    if (post.status === "posted") {
      return (
        <Badge variant="success" className="gap-1">
          <span className="h-2 w-2 rounded-full bg-green-400"></span>
          Posted
        </Badge>
      );
    }
    
    if (post.status === "failed") {
      return (
        <Badge variant="destructive" className="gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400"></span>
          Failed
        </Badge>
      );
    }
    
    if (post.scheduledFor) {
      return (
        <Badge variant="outline" className="gap-1">
          <Calendar className="h-3 w-3" />
          Scheduled
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };
  
  // Function to render time ago
  const renderTimeAgo = (post: SocialPost) => {
    const date = post.postedAt || post.scheduledFor;
    if (!date) return "Just now";
    
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <CardTitle>Social Feed</CardTitle>
            <CardDescription>
              View and manage your social media posts
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={sortOption}
              onValueChange={setSortOption}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex flex-wrap h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="posted">Posted</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="twitter">Twitter</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sortedPosts.length > 0 ? (
              sortedPosts.map(post => (
                <div key={post.id} className="border rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={post.user.profileImage || undefined} />
                          <AvatarFallback>
                            {post.user.firstName?.[0]}{post.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {post.user.firstName} {post.user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {renderTimeAgo(post)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {renderPostStatus(post)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Post Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Edit Post</DropdownMenuItem>
                            <DropdownMenuItem>Copy Link</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">Delete Post</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="text-sm mb-3">
                      {post.content}
                    </div>
                    
                    {post.mediaUrl && (
                      <div className="rounded-md overflow-hidden mb-3">
                        <img 
                          src={post.mediaUrl}
                          alt="Post media"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {renderPlatformBadges(post.platforms)}
                    </div>
                    
                    {post.errorMessage && (
                      <div className="mt-2 text-sm text-red-500">
                        Error: {post.errorMessage}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-muted/50 p-2 flex justify-between">
                    <div className="flex gap-4">
                      <Button variant="ghost" size="sm" className="text-xs gap-1">
                        <Heart className="h-4 w-4" />
                        <span>Like</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>Comment</span>
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs gap-1">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="rounded-full bg-muted p-3 inline-flex mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                  </svg>
                </div>
                <h3 className="font-medium text-lg mb-1">No posts found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "all" 
                    ? "You haven't created any posts yet. Create your first post to get started!"
                    : `No ${activeTab} posts found. Try a different filter or create a new post.`
                  }
                </p>
                <Button>Create a Post</Button>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}