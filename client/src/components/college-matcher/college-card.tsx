import { BookmarkIcon, GraduationCap, Trophy, MapPin, Globe, DollarSign, School } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SaveCollegeButton } from "./save-college-button";

interface MatchedCollege {
  id: number;
  name: string;
  division: string;
  conference?: string;
  region: string;
  state: string;
  city: string;
  isPublic: boolean;
  enrollment: number;
  admissionRate?: number;
  averageGPA?: number;
  athleticRanking?: number;
  programs: string[];
  tuition: {
    inState: number;
    outOfState: number;
  };
  athleticScholarships: boolean;
  sportOfferings: string[];
  academicMatch: number;
  athleticMatch: number;
  overallMatch: number;
  financialFit?: number;
  locationFit?: number;
  scholarshipPotential?: string;
  admissionChance?: string;
  campusSize?: string;
  matchingReasons?: string[];
  athleticFacilities?: string[];
  academicSupport?: string[];
  recruitingProfile?: {
    activelyRecruiting: string[];
    offensiveStyle?: string;
    defensiveStyle?: string;
    recentSuccess?: string;
  };
  website?: string;
  imageUrl?: string;
  notes?: string;
}

interface CollegeCardProps {
  college: MatchedCollege;
  isSaved?: boolean;
  variant?: 'default' | 'compact';
}

export function CollegeCard({ college, isSaved = false, variant = 'default' }: CollegeCardProps) {
  // Division-specific styling
  const getDivisionColor = (division: string) => {
    switch (division) {
      case "D1":
        return "from-amber-500/80 to-amber-300/30";
      case "D2":
        return "from-blue-500/80 to-blue-300/30";
      case "D3":
        return "from-green-500/80 to-green-300/30";
      case "NAIA":
        return "from-purple-500/80 to-purple-300/30";
      default:
        return "from-gray-500/80 to-gray-300/30";
    }
  };

  const getDivisionBadgeColor = (division: string) => {
    switch (division) {
      case "D1":
        return "bg-amber-100 hover:bg-amber-100 text-amber-800";
      case "D2":
        return "bg-blue-100 hover:bg-blue-100 text-blue-800";
      case "D3":
        return "bg-green-100 hover:bg-green-100 text-green-800";
      case "NAIA":
        return "bg-purple-100 hover:bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 hover:bg-gray-100 text-gray-800";
    }
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden border border-muted">
        <div className="relative">
          {/* College header with color gradient based on division */}
          <div className={`h-20 flex items-center justify-center bg-gradient-to-r ${getDivisionColor(college.division)}`}>
            {/* Actions and division badge */}
            <div className="absolute inset-0 flex justify-between items-start p-2 z-10">
              <SaveCollegeButton 
                collegeId={college.id}
                initialSaved={isSaved}
                size="sm"
              />
              <Badge className={getDivisionBadgeColor(college.division)}>
                {college.division}
              </Badge>
            </div>
          </div>
          
          <div className="px-4 py-3">
            {/* School name and location */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold truncate">{college.name}</h3>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{`${college.city}, ${college.state}`}</span>
              </div>
            </div>
            
            {/* College details */}
            <div className="mt-3">
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge variant="outline" className="text-xs font-normal">
                  {college.isPublic ? 'Public' : 'Private'}
                </Badge>
                <Badge variant="outline" className="text-xs font-normal">
                  {college.enrollment.toLocaleString()} students
                </Badge>
                {college.conference && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {college.conference}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Visit link */}
            {college.website && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => window.open(college.website, '_blank')}
              >
                <Globe className="h-3 w-3 mr-2" />
                Visit Website
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-muted">
      <div className="relative">
        {/* College header with color gradient based on division */}
        <div className={`h-24 flex items-center justify-center bg-gradient-to-r ${getDivisionColor(college.division)}`}>
          {/* Actions and division badge */}
          <div className="absolute top-0 right-0 p-2">
            <Badge className={getDivisionBadgeColor(college.division)}>
              {college.division}
            </Badge>
          </div>
          <div className="absolute top-0 left-0 p-2">
            <SaveCollegeButton 
              collegeId={college.id}
              initialSaved={isSaved}
            />
          </div>
        </div>
        
        <div className="px-5 py-4">
          {/* School name and location */}
          <div className="flex flex-col mb-4">
            <h3 className="text-xl font-semibold">{college.name}</h3>
            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{`${college.city}, ${college.state}`}</span>
            </div>
          </div>

          {/* Match scores */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Overall Match</span>
                <span className="text-xs">{college.overallMatch}%</span>
              </div>
              <Progress value={college.overallMatch} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Academic</span>
                <span className="text-xs">{college.academicMatch}%</span>
              </div>
              <Progress value={college.academicMatch} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Athletic</span>
                <span className="text-xs">{college.athleticMatch}%</span>
              </div>
              <Progress value={college.athleticMatch} className="h-2" />
            </div>
          </div>
          
          {/* College details */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-muted-foreground" />
              <span>
                {college.isPublic ? 'Public' : 'Private'} • {college.enrollment.toLocaleString()} students
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span title={`Out-of-state: ${formatCurrency(college.tuition.outOfState)}`}>
                {formatCurrency(college.tuition.inState)}/yr (in-state)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>
                {college.admissionRate ? `${(college.admissionRate * 100).toFixed(0)}% acceptance` : 'Admission rate N/A'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span>
                {college.athleticScholarships ? 'Athletic scholarships available' : 'No athletic scholarships'}
              </span>
            </div>
          </div>
          
          {/* Matching reasons */}
          {college.matchingReasons && college.matchingReasons.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Why it's a good match:</h4>
              <div className="flex flex-wrap gap-1">
                {college.matchingReasons.slice(0, 3).map((reason, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {reason}
                  </Badge>
                ))}
                {college.matchingReasons.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{college.matchingReasons.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-2 mt-2">
            {college.website && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => window.open(college.website, '_blank')}
              >
                <Globe className="h-4 w-4 mr-2" />
                Visit Website
              </Button>
            )}
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              onClick={() => window.open(`/college-detail/${college.id}`, '_self')}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}