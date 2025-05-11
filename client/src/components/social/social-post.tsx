import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageSquare,
  Share2,
  MoreVertical,
  Trash,
  Edit,
  Send,
  ChevronRight,
  Award,
  Medal,
  Trophy,
  Clock,
  Calendar,
  Star,
  ThumbsUp,
  ThumbsDown,
  Image,
  Music,
  Video,
  TrendingUp
} from "lucide-react";
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
import { ShareButton } from "@/components/social/share-button";

interface SocialPostProps {
  post: {
    id: number;
    content: string;
    media?: string | null;
    mediaType?: "image" | "video" | "audio" | null;
    createdAt: string;
    updatedAt?: string;
    likes: number;
    comments: number;
    hasLiked: boolean;
    isOwner: boolean;
    author: {
      id: number;
      name: string;
      username: string;
      profileImage?: string | null;
      position?: string | null;
    };
    achievement?: {
      id: number;
      name: string;
      badge: string;
      description: string;
      type: "performance" | "training" | "social" | "team" | "academic";
    } | null;
    trainingPlan?: {
      id: number;
      title: string;
      focus: string;
      exerciseCount: number;
    } | null;
    gameStats?: {
      id: number;
      opponent: string;
      date: string;
      score: string;
      stats: Record<string, any>;
    } | null;
    combineMetrics?: {
      id: number;
      date: string;
      metric: string;
      value: string;
      improvement: number;
    } | null;
  };
  onCommentClick?: (postId: number) => void;
}

export function SocialPost({ post, onCommentClick }: SocialPostProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/social/posts/${post.id}/like`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to like post");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to like post",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const res = await apiRequest("POST", `/api/social/posts/${post.id}/comments`, { content: comment });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add comment");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      setCommentText("");
      setIsCommenting(false);
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/social/posts/${post.id}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete post");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
      
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully"
      });
      
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete post",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle like post
  const handleLikePost = () => {
    likeMutation.mutate();
  };
  
  // Handle add comment
  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast({
        title: "Comment cannot be empty",
        description: "Please enter a comment",
        variant: "destructive"
      });
      return;
    }
    
    addCommentMutation.mutate(commentText);
  };
  
  // Handle delete post
  const handleDeletePost = () => {
    deletePostMutation.mutate();
  };
  
  // Handle view comments
  const handleViewComments = () => {
    if (onCommentClick) {
      onCommentClick(post.id);
    }
  };
  
  // Render media icon based on media type
  const renderMediaIcon = () => {
    switch (post.mediaType) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Music className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  // Render content preview with special components for sharing achievements, training plans, metrics, etc.
  const renderContentPreview = () => {
    if (post.achievement) {
      return (
        <div className="mt-2 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 text-white p-1.5 rounded-full">
              <Trophy className="h-4 w-4" />
            </div>
            <div className="font-medium text-amber-800 dark:text-amber-300">Achievement Unlocked!</div>
          </div>
          <div className="mt-1 font-semibold">{post.achievement.name}</div>
          <div className="text-sm text-muted-foreground">{post.achievement.description}</div>
          <Button
            variant="link"
            size="sm"
            className="px-0 mt-1 text-amber-600 dark:text-amber-400"
          >
            View All Achievements
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      );
    }
    
    if (post.trainingPlan) {
      return (
        <div className="mt-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 text-white p-1.5 rounded-full">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="font-medium text-blue-800 dark:text-blue-300">Completed Training Plan</div>
          </div>
          <div className="mt-1 font-semibold">{post.trainingPlan.title}</div>
          <div className="text-sm text-muted-foreground">
            Focus: {post.trainingPlan.focus} • {post.trainingPlan.exerciseCount} exercises
          </div>
          <Button
            variant="link"
            size="sm"
            className="px-0 mt-1 text-blue-600 dark:text-blue-400"
          >
            View Training History
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      );
    }
    
    if (post.gameStats) {
      return (
        <div className="mt-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <div className="bg-green-500 text-white p-1.5 rounded-full">
              <Award className="h-4 w-4" />
            </div>
            <div className="font-medium text-green-800 dark:text-green-300">Game Performance</div>
          </div>
          <div className="mt-1 font-semibold">vs. {post.gameStats.opponent}</div>
          <div className="text-sm text-muted-foreground">
            {post.gameStats.date} • {post.gameStats.score}
          </div>
          <Button
            variant="link"
            size="sm"
            className="px-0 mt-1 text-green-600 dark:text-green-400"
          >
            View Game Stats
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      );
    }
    
    if (post.combineMetrics) {
      return (
        <div className="mt-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500 text-white p-1.5 rounded-full">
              <Clock className="h-4 w-4" />
            </div>
            <div className="font-medium text-purple-800 dark:text-purple-300">Performance Improvement</div>
          </div>
          <div className="mt-1 font-semibold">
            {post.combineMetrics.metric}: {post.combineMetrics.value}
          </div>
          <div className="flex items-center gap-1 text-sm">
            {post.combineMetrics.improvement > 0 ? (
              <Badge className="bg-green-500 text-white">
                <TrendingUp className="h-3 w-3 mr-1" />
                {post.combineMetrics.improvement}% Improvement
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                No change
              </Badge>
            )}
          </div>
          <Button
            variant="link"
            size="sm"
            className="px-0 mt-1 text-purple-600 dark:text-purple-400"
          >
            View Performance History
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author.profileImage || undefined} />
              <AvatarFallback>
                {post.author.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="font-medium">{post.author.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span>@{post.author.username}</span>
                <span>•</span>
                <span>{formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true })}</span>
                {post.author.position && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                      {post.author.position}
                    </Badge>
                  </>
                )}
                {post.mediaType && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      {renderMediaIcon()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Post actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {post.isOwner && (
                <>
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  
                  <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        className="flex items-center text-red-600 cursor-pointer" 
                        onSelect={(e) => { 
                          e.preventDefault();
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Post
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this post? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeletePost}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deletePostMutation.isPending ? "Deleting..." : "Delete Post"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <Share2 className="h-4 w-4 mr-2" />
                Share Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-3">
        <div className="whitespace-pre-wrap">{post.content}</div>
        
        {/* Special content previews - achievement, training plan, game stats, metrics */}
        {renderContentPreview()}
        
        {/* Media preview - if available */}
        {post.media && post.mediaType === "image" && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img 
              src={post.media} 
              alt="Post media" 
              className="w-full object-cover max-h-96"
            />
          </div>
        )}
        
        {post.media && post.mediaType === "video" && (
          <div className="mt-3 rounded-md overflow-hidden">
            <video 
              src={post.media} 
              controls 
              className="w-full max-h-96"
            />
          </div>
        )}
        
        {post.media && post.mediaType === "audio" && (
          <div className="mt-3">
            <audio 
              src={post.media} 
              controls 
              className="w-full"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-2 pt-0 flex flex-col">
        <div className="w-full flex justify-between items-center p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center text-sm gap-1 ${post.hasLiked ? "text-red-500" : ""}`}
            onClick={handleLikePost}
          >
            <Heart className={`h-4 w-4 ${post.hasLiked ? "fill-red-500" : ""}`} />
            <span>{post.likes || "Like"}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-sm gap-1"
            onClick={() => {
              if (post.comments > 0) {
                handleViewComments();
              } else {
                setIsCommenting(true);
              }
            }}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments || "Comment"}</span>
          </Button>
          
          <ShareButton 
            title={`Post by ${post.author.name}`}
            text={post.content.substring(0, 100) + (post.content.length > 100 ? "..." : "")}
            url={window.location.href}
            size="sm"
          />
        </div>
        
        {/* Comment input */}
        {isCommenting && (
          <div className="w-full px-2 pb-2">
            <div className="flex gap-2 items-center">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.profileImage || undefined} />
                <AvatarFallback>
                  {user?.firstName?.[0] || ""}{user?.lastName?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 flex">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-0 h-9 py-2 px-3 resize-none"
                />
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="ml-2"
                  onClick={handleAddComment}
                  disabled={addCommentMutation.isPending}
                >
                  {addCommentMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}