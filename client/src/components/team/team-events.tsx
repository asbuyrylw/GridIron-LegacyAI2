import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Plus, MapPin, Clock, Users, ArrowUpDown, Eye, Check, X, Edit, Trash } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, isToday, addHours } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";

interface TeamEventsProps {
  teamId: number | string;
  isAdmin: boolean;
}

// Event form schema
const eventSchema = z.object({
  title: z.string().min(3, "Event title must be at least 3 characters long"),
  description: z.string().optional(),
  location: z.string().optional(),
  date: z.date(),
  startTime: z.string().min(5),
  endTime: z.string().min(5),
  eventType: z.string().min(1, "Event type is required"),
  isRequired: z.boolean().default(true)
});

type EventFormValues = z.infer<typeof eventSchema>;

export function TeamEvents({ teamId, isAdmin }: TeamEventsProps) {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "title" | "eventType">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"upcoming" | "past" | "all">("upcoming");
  
  // Form setup
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      date: new Date(),
      startTime: "16:00", // 4:00 PM
      endTime: "18:00", // 6:00 PM
      eventType: "Practice",
      isRequired: true
    }
  });
  
  // Query team events
  const { data: events, isLoading } = useQuery({
    queryKey: [`/api/teams/${teamId}/events`],
    enabled: !!teamId,
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      // Format data for API
      const formattedData = {
        ...data,
        dateTime: new Date(
          data.date.getFullYear(), 
          data.date.getMonth(), 
          data.date.getDate(),
          parseInt(data.startTime.split(':')[0]),
          parseInt(data.startTime.split(':')[1])
        ).toISOString(),
        endDateTime: new Date(
          data.date.getFullYear(), 
          data.date.getMonth(), 
          data.date.getDate(),
          parseInt(data.endTime.split(':')[0]),
          parseInt(data.endTime.split(':')[1])
        ).toISOString()
      };
      
      const res = await apiRequest("POST", `/api/teams/${teamId}/events`, formattedData);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create event");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Event created",
        description: "The event has been created successfully"
      });
      
      form.reset();
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/events`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest("DELETE", `/api/teams/${teamId}/events/${eventId}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete event");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully"
      });
      
      setDeleteDialogOpen(false);
      setDetailsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/events`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete event",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, attending }: { eventId: number, attending: boolean }) => {
      const res = await apiRequest("POST", `/api/teams/${teamId}/events/${eventId}/rsvp`, { attending });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to RSVP");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "RSVP saved",
        description: "Your response has been saved"
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/events`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to RSVP",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Form submit handler
  function onSubmit(data: EventFormValues) {
    // Validate that end time is after start time
    const startHour = parseInt(data.startTime.split(':')[0]);
    const startMinute = parseInt(data.startTime.split(':')[1]);
    const endHour = parseInt(data.endTime.split(':')[0]);
    const endMinute = parseInt(data.endTime.split(':')[1]);
    
    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
      toast({
        title: "Invalid time",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }
    
    createEventMutation.mutate(data);
  }
  
  // Filter and sort events
  const filteredAndSortedEvents = events ? events
    .filter((event: any) => {
      // Filter by event type
      if (filterType && event.eventType !== filterType) {
        return false;
      }
      
      // Filter by view mode
      const eventDate = new Date(event.dateTime);
      if (viewMode === "upcoming" && isBefore(eventDate, new Date()) && !isToday(eventDate)) {
        return false;
      }
      if (viewMode === "past" && (isToday(eventDate) || isBefore(new Date(), eventDate))) {
        return false;
      }
      
      return true;
    })
    .sort((a: any, b: any) => {
      // Sort by selected field
      if (sortBy === "date") {
        const dateA = new Date(a.dateTime).getTime();
        const dateB = new Date(b.dateTime).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      if (sortBy === "title") {
        return sortDirection === "asc" 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      
      if (sortBy === "eventType") {
        return sortDirection === "asc" 
          ? a.eventType.localeCompare(b.eventType)
          : b.eventType.localeCompare(a.eventType);
      }
      
      return 0;
    }) : [];
  
  // Get unique event types for filter
  const uniqueEventTypes = events ? [...new Set(events.map((event: any) => event.eventType))] : [];
  
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
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  // Calculate event status
  const getEventStatus = (event: any) => {
    const eventDate = new Date(event.dateTime);
    
    if (isBefore(eventDate, new Date()) && !isToday(eventDate)) {
      return "past";
    }
    
    if (isToday(eventDate)) {
      return "today";
    }
    
    return "upcoming";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Select value={viewMode} onValueChange={(value: "upcoming" | "past" | "all") => setViewMode(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming Events</SelectItem>
              <SelectItem value="past">Past Events</SelectItem>
              <SelectItem value="all">All Events</SelectItem>
            </SelectContent>
          </Select>
          
          {uniqueEventTypes.length > 0 && (
            <Select value={filterType || ""} onValueChange={(value) => setFilterType(value || null)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {uniqueEventTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => {
              setSortDirection(sortDirection === "asc" ? "desc" : "asc");
            }}
          >
            <ArrowUpDown className="h-4 w-4" />
            <Select value={sortBy} onValueChange={(value: "date" | "title" | "eventType") => setSortBy(value)}>
              <SelectTrigger className="w-[100px] border-0 p-0 h-auto">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="title">By Title</SelectItem>
                <SelectItem value="eventType">By Type</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{sortDirection === "asc" ? "↑" : "↓"}</span>
          </Button>
        </div>
        
        {isAdmin && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Add a new event to the team calendar.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Practice">Practice</SelectItem>
                            <SelectItem value="Game">Game</SelectItem>
                            <SelectItem value="Meeting">Meeting</SelectItem>
                            <SelectItem value="Training">Training</SelectItem>
                            <SelectItem value="Social">Social</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full pl-3 text-left font-normal"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Attendance</FormLabel>
                          <Select
                            value={field.value ? "required" : "optional"}
                            onValueChange={(value) => field.onChange(value === "required")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select attendance type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="required">Required</SelectItem>
                              <SelectItem value="optional">Optional</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location" {...field} />
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
                          <Textarea
                            placeholder="Enter event description or notes"
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createEventMutation.isPending}>
                      {createEventMutation.isPending ? "Creating..." : "Create Event"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {viewMode === "upcoming" ? "Upcoming Events" : viewMode === "past" ? "Past Events" : "All Events"}
            <Badge variant="outline" className="ml-2">
              {filteredAndSortedEvents.length} {filteredAndSortedEvents.length === 1 ? "event" : "events"}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {filteredAndSortedEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredAndSortedEvents.map((event: any) => {
                const eventStatus = getEventStatus(event);
                
                return (
                  <div 
                    key={event.id} 
                    className={`
                      border rounded-lg p-4 hover:bg-muted/30 cursor-pointer transition-colors
                      ${eventStatus === "today" ? "border-primary" : ""}
                    `}
                    onClick={() => {
                      setSelectedEvent(event);
                      setDetailsDialogOpen(true);
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{event.title}</h3>
                          <Badge className={
                            eventStatus === "past" ? "bg-muted text-muted-foreground" : 
                            eventStatus === "today" ? "bg-green-500" :
                            ""
                          }>
                            {eventStatus === "past" ? "Past" : 
                             eventStatus === "today" ? "Today" : 
                             "Upcoming"}
                          </Badge>
                          
                          <Badge variant="outline">
                            {event.eventType}
                          </Badge>
                          
                          {event.isRequired && (
                            <Badge variant="secondary">Required</Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>{format(new Date(event.dateTime), "EEE, MMMM d, yyyy")}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{format(new Date(event.dateTime), "h:mm a")} - {event.endDateTime ? format(new Date(event.endDateTime), "h:mm a") : ""}</span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{event.attendingCount || 0} attending</span>
                          </div>
                        </div>
                      </div>
                      
                      {eventStatus !== "past" && (
                        <div className="flex gap-2">
                          {event.hasResponded ? (
                            <Badge variant={event.isAttending ? "default" : "outline"}>
                              {event.isAttending ? (
                                <><Check className="h-3 w-3 mr-1" /> Attending</>
                              ) : (
                                <><X className="h-3 w-3 mr-1" /> Not Attending</>
                              )}
                            </Badge>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  rsvpMutation.mutate({ eventId: event.id, attending: true });
                                }}
                              >
                                <Check className="h-4 w-4" />
                                <span className="hidden md:inline">Attending</span>
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  rsvpMutation.mutate({ eventId: event.id, attending: false });
                                }}
                              >
                                <X className="h-4 w-4" />
                                <span className="hidden md:inline">Not Attending</span>
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {filterType || viewMode !== "all" ? (
                <div>
                  <p>No events match your current filters</p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setFilterType(null);
                      setViewMode("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div>
                  <p>No events have been scheduled yet</p>
                  {isAdmin && (
                    <Button 
                      variant="link" 
                      onClick={() => setCreateDialogOpen(true)}
                    >
                      Create Your First Event
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">
                  {selectedEvent.eventType}
                </Badge>
                
                {selectedEvent.isRequired && (
                  <Badge variant="secondary">Required</Badge>
                )}
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Date & Time</div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(new Date(selectedEvent.dateTime), "EEE, MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground mt-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(selectedEvent.dateTime), "h:mm a")} - 
                      {selectedEvent.endDateTime ? format(new Date(selectedEvent.endDateTime), "h:mm a") : ""}
                    </span>
                  </div>
                </div>
                
                {selectedEvent.location && (
                  <div>
                    <div className="text-sm font-medium mb-1">Location</div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedEvent.description && (
                <div>
                  <div className="text-sm font-medium mb-1">Description</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium mb-1">Attendance</div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{selectedEvent.attendingCount || 0} attending / {selectedEvent.notAttendingCount || 0} not attending</span>
                </div>
              </div>
              
              {getEventStatus(selectedEvent) !== "past" && (
                <div className="pt-2">
                  <div className="text-sm font-medium mb-2">Your Response</div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant={selectedEvent.hasResponded && selectedEvent.isAttending ? "default" : "outline"}
                      onClick={() => {
                        rsvpMutation.mutate({ eventId: selectedEvent.id, attending: true });
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Attending
                    </Button>
                    
                    <Button
                      className="flex-1"
                      variant={selectedEvent.hasResponded && !selectedEvent.isAttending ? "default" : "outline"}
                      onClick={() => {
                        rsvpMutation.mutate({ eventId: selectedEvent.id, attending: false });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Not Attending
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {isAdmin && (
              <div className="flex justify-between pt-4 border-t mt-4">
                <Button variant="outline" className="gap-1" onClick={() => {
                  setDetailsDialogOpen(false);
                  // Open edit dialog with the selectedEvent data
                  // This functionality would be added later
                }}>
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-1 border-red-200 hover:bg-red-50 hover:text-red-600">
                      <Trash className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Event</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this event? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteEventMutation.mutate(selectedEvent.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleteEventMutation.isPending ? "Deleting..." : "Delete Event"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}