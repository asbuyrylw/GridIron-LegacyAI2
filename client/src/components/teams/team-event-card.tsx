import { CalendarClock, Clock, MapPin, Users, Star } from "lucide-react";
import { format, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamEvent } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamEventCardProps {
  event: TeamEvent;
  athleteId?: number;
  attendanceStatus?: string;
  onUpdateAttendance?: (status: string) => void;
  isLoading?: boolean;
}

export function TeamEventCard({ 
  event, 
  athleteId, 
  attendanceStatus,
  onUpdateAttendance,
  isLoading
}: TeamEventCardProps) {
  if (isLoading) {
    return <TeamEventCardSkeleton />;
  }
  
  const isPastEvent = event.startDate ? isPast(new Date(event.startDate)) : false;
  
  const eventTypeColors: Record<string, string> = {
    "practice": "bg-blue-100 text-blue-800 border-blue-200",
    "game": "bg-green-100 text-green-800 border-green-200",
    "scrimmage": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "meeting": "bg-purple-100 text-purple-800 border-purple-200",
    "workout": "bg-orange-100 text-orange-800 border-orange-200",
    "team-building": "bg-indigo-100 text-indigo-800 border-indigo-200",
  };
  
  const eventTypeColor = eventTypeColors[event.eventType.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  
  const renderAttendanceStatusBadge = () => {
    if (!attendanceStatus) return null;
    
    const attendanceColors: Record<string, string> = {
      "attending": "bg-green-100 text-green-800 border-green-200",
      "pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "excused": "bg-blue-100 text-blue-800 border-blue-200",
      "absent": "bg-red-100 text-red-800 border-red-200",
    };
    
    const color = attendanceColors[attendanceStatus.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
    
    return (
      <Badge className={`${color} capitalize`}>
        {attendanceStatus}
      </Badge>
    );
  };
  
  return (
    <Card className={`overflow-hidden ${isPastEvent ? 'opacity-70' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>
              {event.description}
            </CardDescription>
          </div>
          <Badge className={eventTypeColor + " capitalize"}>
            {event.eventType}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 opacity-70" />
            <span>
              {event.startDate ? format(new Date(event.startDate), 'EEE, MMM d, yyyy') : 'Date TBD'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 opacity-70" />
            <span>
              {event.startDate && format(new Date(event.startDate), 'h:mm a')}
              {event.endDate && ` - ${format(new Date(event.endDate), 'h:mm a')}`}
            </span>
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 opacity-70" />
              <span>{event.location}</span>
            </div>
          )}
          
          {event.isRequired && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="font-medium">Attendance Required</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {athleteId && onUpdateAttendance && !isPastEvent && (
        <CardFooter className="pt-0 flex flex-col items-start gap-2">
          <div className="flex items-center gap-2 w-full">
            <span className="text-sm font-medium">Your Status:</span>
            {renderAttendanceStatusBadge()}
          </div>
          
          <div className="flex flex-wrap gap-2 w-full">
            <Button 
              variant={attendanceStatus === 'attending' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onUpdateAttendance('attending')}
            >
              Attending
            </Button>
            <Button 
              variant={attendanceStatus === 'excused' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onUpdateAttendance('excused')}
            >
              Request Excuse
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export function TeamEventCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="space-y-2 w-full">
          <Skeleton className="h-5 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}