import { CalendarDays, User, Users, MapPin, Shield } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Team } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

interface TeamCardProps {
  team: Team;
  athleteId?: number;
  isMember?: boolean;
  onJoin?: (teamId: number) => void;
  onLeave?: (teamId: number) => void;
  isLoading?: boolean;
}

export function TeamCard({ 
  team, 
  athleteId, 
  isMember, 
  onJoin, 
  onLeave, 
  isLoading 
}: TeamCardProps) {
  if (isLoading) {
    return <TeamCardSkeleton />;
  }
  
  const levelColors: Record<string, string> = {
    "Varsity": "bg-green-100 text-green-800 border-green-200",
    "JV": "bg-blue-100 text-blue-800 border-blue-200",
    "Freshman": "bg-purple-100 text-purple-800 border-purple-200",
    "Middle School": "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  
  const levelColor = levelColors[team.level] || "bg-gray-100 text-gray-800 border-gray-200";
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      {team.bannerImage ? (
        <div 
          className="h-32 bg-cover bg-center" 
          style={{ 
            backgroundImage: `url(${team.bannerImage})` 
          }}
        />
      ) : (
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800" />
      )}
      
      <CardHeader className="pb-2 flex flex-row items-start gap-3">
        <Avatar className="h-16 w-16 border-4 border-white -mt-10 bg-white">
          {team.logoImage ? (
            <AvatarImage src={team.logoImage} alt={team.name} />
          ) : (
            <AvatarFallback className="bg-primary text-white text-lg">
              {team.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start gap-2">
            <div>
              <CardTitle>{team.name}</CardTitle>
              <CardDescription>{team.season}</CardDescription>
            </div>
            <Badge className={`font-normal ${levelColor}`}>
              {team.level}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="text-sm text-muted-foreground space-y-2">
          {team.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 opacity-70" />
              <span>{team.location}</span>
            </div>
          )}
          
          {team.homeField && (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 opacity-70" />
              <span>Home: {team.homeField}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 opacity-70" />
            <span>Created {team.createdAt ? format(new Date(team.createdAt), 'MMM d, yyyy') : 'recently'}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          asChild
        >
          <Link href={`/teams/${team.id}`}>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 mr-1" />
              View Team
            </span>
          </Link>
        </Button>
        
        {athleteId && (
          isMember ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onLeave?.(team.id)}
            >
              Leave Team
            </Button>
          ) : (
            <Button 
              variant="default"
              size="sm"
              onClick={() => onJoin?.(team.id)}
            >
              Join Team
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}

export function TeamCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Skeleton className="h-16 w-16 rounded-full -mt-10" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </CardFooter>
    </Card>
  );
}