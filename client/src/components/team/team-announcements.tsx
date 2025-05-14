import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Plus, 
  Calendar, 
  Search, 
  ThumbsUp, 
  MessageSquare, 
  Eye, 
  User,
  X,
  Edit,
  Trash,
  Filter,
  ArrowUpDown
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
import { format, formatDistance } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";

interface TeamAnnouncementsProps {
  teamId: number | string;
  isAdmin: boolean;
}

// Announcement form schema
const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  content: z.string().min(10, "Content must be at least 10 characters long"),
  isPinned: z.boolean().default(false)
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export function TeamAnnouncements({ teamId, isAdmin }: TeamAnnouncementsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  
  // Form setup
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      isPinned: false
    }
  });
  
  // Query team announcements
  const { data: announcements, isLoading } = useQuery({
    queryKey: [`/api/teams/${teamId}/announcements`],
    enabled: !!teamId,
  });
  
  // Create announcement mutation
  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: AnnouncementFormValues) => {
      const res = await apiRequest("POST", `/api/teams/${teamId}/announcements`, data);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create announcement");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Announcement created",
        description: "Your announcement has been posted successfully"
      });
      
      form.reset();
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/announcements`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create announcement",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (announcementId: number) => {
      const res = await apiRequest("DELETE", `/api/teams/${teamId}/announcements/${announcementId}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete announcement");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Announcement deleted",
        description: "The announcement has been deleted successfully"
      });
      
      setDeleteDialogOpen(false);
      setDetailsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/announcements`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete announcement",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Like announcement mutation
  const likeAnnouncementMutation = useMutation({
    mutationFn: async (announcementId: number) => {
      const res = await apiRequest("POST", `/api/teams/${teamId}/announcements/${announcementId}/like`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to like announcement");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/announcements`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to like announcement",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Form submit handler
  function onSubmit(data: AnnouncementFormValues) {
    createAnnouncementMutation.mutate(data);
  }
  
  // Filter and sort announcements
  const filteredAndSortedAnnouncements = announcements ? announcements
    .filter((announcement: any) => {
      // Filter by search query
      const matchesSearch = searchQuery === "" || 
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by pinned status
      const matchesPinned = !showPinnedOnly || announcement.isPinned;
      
      return matchesSearch && matchesPinned;
    })
    .sort((a: any, b: any) => {
      // Sort by pinned status first (pinned on top)
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by date
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      return sortNewest ? dateB - dateA : dateA - dateB;
    }) : [];
  
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
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            className="pl-9 pr-9"
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
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={showPinnedOnly ? "bg-amber-50 border-amber-200 text-amber-700" : ""}
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showPinnedOnly ? "All Announcements" : "Pinned Only"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortNewest(!sortNewest)}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortNewest ? "Newest First" : "Oldest First"}
          </Button>
          
          {isAdmin && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                  <DialogDescription>
                    Post a new announcement to the team. All team members will be notified.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter announcement title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter announcement content"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isPinned"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4"
                            />
                          </FormControl>
                          <FormLabel className="m-0">Pin this announcement to the top</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" disabled={createAnnouncementMutation.isPending}>
                        {createAnnouncementMutation.isPending ? "Posting..." : "Post Announcement"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Announcements
            <Badge variant="outline" className="ml-2">
              {filteredAndSortedAnnouncements.length} {filteredAndSortedAnnouncements.length === 1 ? "announcement" : "announcements"}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {filteredAndSortedAnnouncements.length > 0 ? (
            <div className="space-y-6">
              {filteredAndSortedAnnouncements.map((announcement: any) => (
                <div 
                  key={announcement.id} 
                  className={`
                    rounded-lg p-4 cursor-pointer hover:bg-muted/30 transition-colors
                    ${announcement.isPinned ? "border border-amber-200 bg-amber-50/30" : "border"}
                  `}
                  onClick={() => {
                    setSelectedAnnouncement(announcement);
                    setDetailsDialogOpen(true);
                  }}
                >
                  <div className="flex justify-between gap-4">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={announcement.author?.profileImage} />
                        <AvatarFallback>
                          {`${announcement.author?.firstName?.[0] || ''}${announcement.author?.lastName?.[0] || ''}`}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap gap-2 items-center">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          
                          {announcement.isPinned && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Pinned
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Posted by {announcement.author?.firstName} {announcement.author?.lastName}
                        </div>
                        
                        <div className="text-sm text-muted-foreground flex gap-2">
                          <span>
                            {formatDistance(new Date(announcement.createdAt), new Date(), { addSuffix: true })}
                          </span>
                          •
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {announcement.viewCount || 0}
                          </span>
                          •
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {announcement.likeCount || 0}
                          </span>
                          {announcement.commentCount > 0 && (
                            <>
                              •
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {announcement.commentCount}
                              </span>
                            </>
                          )}
                        </div>
                        
                        <p className="mt-2 text-sm line-clamp-2">
                          {announcement.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || showPinnedOnly ? (
                <div>
                  <p>No announcements match your current filters</p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSearchQuery("");
                      setShowPinnedOnly(false);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div>
                  <p>No announcements have been posted yet</p>
                  {isAdmin && (
                    <Button 
                      variant="link" 
                      onClick={() => setCreateDialogOpen(true)}
                    >
                      Post Your First Announcement
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Announcement Details Dialog */}
      {selectedAnnouncement && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedAnnouncement.title}</DialogTitle>
                <DialogDescription className="sr-only">
                  Announcement details
                </DialogDescription>
                
                {selectedAnnouncement.isPinned && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Pinned
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={selectedAnnouncement.author?.profileImage} />
                  <AvatarFallback>
                    {`${selectedAnnouncement.author?.firstName?.[0] || ''}${selectedAnnouncement.author?.lastName?.[0] || ''}`}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-sm text-muted-foreground">
                  {selectedAnnouncement.author?.firstName} {selectedAnnouncement.author?.lastName}
                </div>
                
                <div className="text-sm text-muted-foreground">•</div>
                
                <div className="text-sm text-muted-foreground">
                  {format(new Date(selectedAnnouncement.createdAt), "PP")}
                </div>
              </div>
            </DialogHeader>
            
            <div className="mt-2 pb-4 whitespace-pre-wrap">
              {selectedAnnouncement.content}
            </div>
            
            <div className="flex items-center justify-between border-t pt-4 text-sm">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-1 ${selectedAnnouncement.hasLiked ? "text-primary" : ""}`}
                  onClick={() => likeAnnouncementMutation.mutate(selectedAnnouncement.id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {selectedAnnouncement.likeCount || 0} {selectedAnnouncement.likeCount === 1 ? "Like" : "Likes"}
                </Button>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {selectedAnnouncement.viewCount || 0} {selectedAnnouncement.viewCount === 1 ? "View" : "Views"}
                </div>
              </div>
              
              {isAdmin && (user?.id === selectedAnnouncement.authorId) && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => {
                    setDetailsDialogOpen(false);
                    // Open edit dialog with the announcement data
                    // This functionality would be implemented later
                  }}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  
                  <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this announcement? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAnnouncementMutation.mutate(selectedAnnouncement.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteAnnouncementMutation.isPending ? "Deleting..." : "Delete Announcement"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}