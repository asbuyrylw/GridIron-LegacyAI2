import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  User, 
  School, 
  GraduationCap, 
  Users2, 
  Calendar, 
  Ruler, 
  Weight, 
  Medal, 
  ChevronRight 
} from "lucide-react";
import { CombineMetric } from "@shared/schema";

export function ProfileSummary() {
  const { user } = useAuth();
  const athleteId = user?.athlete?.id;
  
  // Fetch the latest metrics
  const { data: metrics } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${athleteId}/metrics`],
    enabled: !!athleteId,
  });
  
  const latestMetrics = metrics?.[0];
  
  if (!user?.athlete) {
    return null;
  }
  
  const athlete = user.athlete;
  
  // Calculate age from date of birth
  const calculateAge = () => {
    if (!athlete.dateOfBirth) return null;
    const dob = new Date(athlete.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };
  
  // Get formatted graduation year
  const getGradYear = () => {
    if (!athlete.graduationYear) return "N/A";
    return `Class of ${athlete.graduationYear}`;
  };
  
  return (
    <Card className="border-blue-100">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">
              {athlete.firstName} {athlete.lastName}
            </h3>
            <div className="flex items-center text-xs text-muted-foreground">
              <Medal className="h-3 w-3 mr-1" />
              {athlete.position}
              {athlete.captainLeadershipRoles && 
                <span className="ml-1">• {athlete.captainLeadershipRoles}</span>
              }
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
          {athlete.school && (
            <div className="flex items-center text-xs">
              <School className="h-3 w-3 mr-1.5 text-blue-500" />
              <span>{athlete.school}</span>
            </div>
          )}
          
          {athlete.graduationYear && (
            <div className="flex items-center text-xs">
              <GraduationCap className="h-3 w-3 mr-1.5 text-blue-500" />
              <span>{getGradYear()}</span>
            </div>
          )}
          
          {athlete.teamLevel && (
            <div className="flex items-center text-xs">
              <Users2 className="h-3 w-3 mr-1.5 text-blue-500" />
              <span>{athlete.teamLevel}</span>
            </div>
          )}
          
          {athlete.dateOfBirth && calculateAge() && (
            <div className="flex items-center text-xs">
              <Calendar className="h-3 w-3 mr-1.5 text-blue-500" />
              <span>{calculateAge()} years old</span>
            </div>
          )}
          
          {athlete.height && (
            <div className="flex items-center text-xs">
              <Ruler className="h-3 w-3 mr-1.5 text-blue-500" />
              <span>{athlete.height}</span>
            </div>
          )}
          
          {athlete.weight && (
            <div className="flex items-center text-xs">
              <Weight className="h-3 w-3 mr-1.5 text-blue-500" />
              <span>{athlete.weight} lbs</span>
            </div>
          )}
        </div>
        
        <Link href="/profile">
          <div className="text-xs text-blue-600 flex items-center hover:underline">
            <span>View full profile</span>
            <ChevronRight className="h-3 w-3 ml-0.5" />
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}