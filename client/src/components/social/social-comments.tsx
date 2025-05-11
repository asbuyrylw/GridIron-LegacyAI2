import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  MoreVertical,
  Trash,
  Send,
  ThumbsUp,
  Reply
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";

interface SocialCommentsProps {
  postId: number;
}

export function SocialComments({ postId }: SocialCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; author: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<number | null>(null);
  
  // Query comments
  const { data: comments, isLoading } = useQuery({
    queryKey: [`/api/social/posts/${postId}/comments`],
    queryFn: async () => {
      const res = await fetch(`/api/social/posts/${postId}/comments`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }
      
      return res.json();
    }
  });
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: { content: string; parentId?: number }) => {
      const res = await apiRequest("POST", `/api/social/posts/${postId}/comments`, data);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add comment");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      setCommentText("");
      setReplyTo(null);
      
      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/social/posts/${postId}/comments`] });
      
      // Also invalidate feed query to update comment count
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
  
  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("POST", `/api/social/comments/${commentId}/like`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to like comment");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/social/posts/${postId}/comments`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to like comment",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("DELETE", `/api/social/comments/${commentId}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete comment");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      setDeleteDialogOpen(false);
      
      queryClient.invalidateQueries({ queryKey: [`/api/social/posts/${postId}/comments`] });
      
      // Also invalidate feed query to update comment count
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete comment",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
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
    
    const data: { content: string; parentId?: number } = {
      content: commentText
    };
    
    if (replyTo) {
      data.parentId = replyTo.id;
    }
    
    addCommentMutation.mutate(data);
  };
  
  // Handle like comment
  const handleLikeComment = (commentId: number) => {
    likeCommentMutation.mutate(commentId);
  };
  
  // Handle delete comment
  const handleDeleteComment = () => {
    if (selectedComment) {
      deleteCommentMutation.mutate(selectedComment);
    }
  };
  
  // Handle reply
  const handleReply = (commentId: number, authorName: string) => {
    setReplyTo({ id: commentId, author: authorName });
    
    // Focus the comment textarea
    const textarea = document.getElementById("comment-textarea");
    if (textarea) {
      textarea.focus();
      
      // Scroll to the comment box
      window.setTimeout(() => {
        textarea.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };
  
  // Organize comments into a hierarchy
  const organizeComments = (commentsData: any[]) => {
    if (!commentsData) return [];
    
    const commentMap = new Map();
    const rootComments: any[] = [];
    
    // First, map all comments by ID
    commentsData.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });
    
    // Then, organize into parent-child relationships
    commentsData.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        } else {
          rootComments.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });
    
    return rootComments;
  };
  
  const organizedComments = organizeComments(comments);
  
  // Render a comment and its replies
  const renderComment = (comment: any, isReply = false) => {
    return (
      <div key={comment.id} className={`${isReply ? "ml-12 mt-3" : "mt-4"}`}>
        <div className="flex gap-3">
          <Avatar className={isReply ? "h-8 w-8" : "h-10 w-10"}>
            <AvatarImage src={comment.author.profileImage || undefined} />
            <AvatarFallback>
              {comment.author.name.split(" ").map((n: string) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">{comment.author.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>@{comment.author.username}</span>
                    <span>•</span>
                    <span>{formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}</span>
                    {comment.author.position && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="h-4 px-1 text-[10px]">
                          {comment.author.position}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Comment actions dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleReply(comment.id, comment.author.name)}
                    >
                      <Reply className="h-3.5 w-3.5 mr-2" />
                      Reply
                    </DropdownMenuItem>
                    
                    {comment.isOwner && (
                      <>
                        <AlertDialog 
                          open={deleteDialogOpen && selectedComment === comment.id} 
                          onOpenChange={(open) => {
                            setDeleteDialogOpen(open);
                            if (!open) setSelectedComment(null);
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="flex items-center text-red-600 cursor-pointer" 
                              onSelect={(e) => { 
                                e.preventDefault();
                                setSelectedComment(comment.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-3.5 w-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this comment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteComment}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleteCommentMutation.isPending ? "Deleting..." : "Delete Comment"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="mt-1">{comment.content}</div>
            </div>
            
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 text-xs flex items-center gap-1 ${comment.hasLiked ? "text-primary" : ""}`}
                onClick={() => handleLikeComment(comment.id)}
              >
                <ThumbsUp className={`h-3.5 w-3.5 ${comment.hasLiked ? "fill-primary" : ""}`} />
                <span>{comment.likes || "Like"}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs flex items-center gap-1"
                onClick={() => handleReply(comment.id, comment.author.name)}
              >
                <Reply className="h-3.5 w-3.5" />
                <span>Reply</span>
              </Button>
            </div>
            
            {/* Render replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-2">
                {comment.replies.map((reply: any) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      {isLoading ? (
        // Loading state
        <div className="space-y-4 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : organizedComments && organizedComments.length > 0 ? (
        // Comments list
        <div className="py-4">
          {organizedComments.map(comment => renderComment(comment))}
        </div>
      ) : (
        // No comments
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        </div>
      )}
      
      <Separator className="my-4" />
      
      {/* Add comment form */}
      <div className="flex gap-3 pb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.profileImage || undefined} />
          <AvatarFallback>
            {user?.firstName?.[0] || ""}{user?.lastName?.[0] || ""}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          {replyTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Replying to {replyTo.author}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setReplyTo(null)}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <Textarea
              id="comment-textarea"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 min-h-[80px]"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleAddComment}
              disabled={addCommentMutation.isPending}
              className="gap-1"
            >
              {addCommentMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}