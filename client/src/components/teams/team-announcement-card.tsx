import { BellRing, Calendar, Download, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamAnnouncement } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamAnnouncementCardProps {
  announcement: TeamAnnouncement;
  publisherName?: string;
  publisherAvatar?: string;
  isLoading?: boolean;
}

export function TeamAnnouncementCard({ 
  announcement, 
  publisherName, 
  publisherAvatar,
  isLoading 
}: TeamAnnouncementCardProps) {
  if (isLoading) {
    return <TeamAnnouncementCardSkeleton />;
  }

  const importanceColors: Record<string, string> = {
    "low": "bg-blue-100 text-blue-800 border-blue-200",
    "normal": "bg-gray-100 text-gray-800 border-gray-200",
    "high": "bg-orange-100 text-orange-800 border-orange-200",
    "urgent": "bg-red-100 text-red-800 border-red-200",
  };
  
  const importanceColor = importanceColors[announcement.importance] || "bg-gray-100 text-gray-800 border-gray-200";
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">{announcement.title}</CardTitle>
            </div>
            
            <CardDescription className="mt-1 flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>
                {announcement.publishedAt ? format(new Date(announcement.publishedAt), 'MMM d, yyyy') : 'Recently'}
              </span>
            </CardDescription>
          </div>
          
          <Badge className={`${importanceColor} capitalize`}>
            {announcement.importance}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p>{announcement.content}</p>
          
          {announcement.image && (
            <img 
              src={announcement.image} 
              alt="Announcement attachment" 
              className="rounded-md mt-3 max-h-40 object-cover"
            />
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-6 w-6">
              {publisherAvatar ? (
                <AvatarImage src={publisherAvatar} />
              ) : (
                <AvatarFallback className="bg-primary text-white text-xs">
                  {publisherName?.substring(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              )}
            </Avatar>
            <span>{publisherName || "Coach"}</span>
          </div>
        </div>
        
        {announcement.attachmentLink && (
          <Button variant="outline" size="sm" asChild>
            <a 
              href={announcement.attachmentLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              {announcement.attachmentLink.includes('.pdf') ? (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </>
              ) : (
                <>
                  <LinkIcon className="h-3.5 w-3.5" />
                  View Link
                </>
              )}
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function TeamAnnouncementCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-28" />
      </CardFooter>
    </Card>
  );
}