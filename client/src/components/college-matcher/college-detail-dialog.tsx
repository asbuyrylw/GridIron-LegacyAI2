import { useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent,
  DialogHeader
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SaveCollegeButton } from "./save-college-button";
import { ExternalLink, ChevronLeft, Trophy, Star, Award, MapPin } from "lucide-react";

// Helper function for division colors - same as in college-card.tsx
const getDivisionColor = (division: string) => {
  switch (division) {
    case 'D1':
      return 'from-blue-600 to-blue-800';
    case 'D2':
      return 'from-red-600 to-red-800';
    case 'D3':
      return 'from-green-600 to-green-800';
    case 'NAIA':
      return 'from-purple-600 to-purple-800';
    case 'JUCO':
      return 'from-orange-600 to-orange-800';
    default:
      return 'from-gray-600 to-gray-800';
  }
};

// Helper function for division badge colors
const getDivisionBadgeColor = (division: string) => {
  switch (division) {
    case 'D1':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'D2':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'D3':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'NAIA':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'JUCO':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

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

interface CollegeDetailDialogProps {
  collegeId: number;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
}

export function CollegeDetailDialog({ 
  collegeId, 
  isOpen, 
  onClose,
  isSaved = false
}: CollegeDetailDialogProps) {
  // Fetch college details
  const { data: college, isLoading } = useQuery<MatchedCollege>({
    queryKey: [`/api/colleges/${collegeId}`],
    enabled: isOpen && collegeId > 0,
  });

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Division specific styling
  const getDivisionColor = (division: string) => {
    switch (division) {
      case "D1":
        return "bg-amber-500/10 text-amber-700 border-amber-300";
      case "D2":
        return "bg-blue-500/10 text-blue-700 border-blue-300";
      case "D3":
        return "bg-green-500/10 text-green-700 border-green-300";
      case "NAIA":
        return "bg-purple-500/10 text-purple-700 border-purple-300";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-300";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0">
        <DialogHeader className="p-4 border-b flex flex-row items-center">
          <Button onClick={onClose} variant="ghost" size="icon" className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">College Details</h2>
        </DialogHeader>
        
        {isLoading || !college ? (
          <div className="flex items-center justify-center h-[500px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-auto max-h-[calc(90vh-60px)]">
            {/* College Header with Hero Image */}
            <div className="relative">
              {/* Large header image or color gradient */}
              <div 
                className="h-48 w-full relative overflow-hidden"
                style={{
                  background: college.imageUrl 
                    ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${college.imageUrl})` 
                    : `linear-gradient(to right, ${getDivisionColor(college.division)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Overlay with college info */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-2xl font-bold drop-shadow-md">{college.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{college.city}, {college.state}</span>
                  </div>
                  
                  {/* Division badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`px-2 py-1 ${getDivisionColor(college.division)}`}>
                      {college.division}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Action buttons below image */}
              <div className="px-6 py-3 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                  <span className={college.isPublic ? 'text-sm' : 'text-sm font-medium'}>
                    {college.isPublic ? 'Public' : 'Private'} • {college.enrollment.toLocaleString()} students
                  </span>
                  
                  {college.conference && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm">{college.conference}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <SaveCollegeButton 
                    collegeId={college.id}
                    initialSaved={isSaved}
                  />
                  {college.website && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={() => window.open(college.website, '_blank')}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Website
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Key Stats */}
              <div className="grid grid-cols-3 px-6 gap-6 py-4">
                <div className="flex flex-col items-center text-center">
                  <Badge variant="outline" className="mb-1 px-2 py-0.5">{college.admissionRate ? `${(college.admissionRate * 100).toFixed(1)}%` : 'N/A'}</Badge>
                  <span className="text-xs text-muted-foreground">ACCEPTANCE RATE</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Badge variant="outline" className="mb-1 px-2 py-0.5">{college.averageGPA ? college.averageGPA.toFixed(1) : 'N/A'}</Badge>
                  <span className="text-xs text-muted-foreground">AVERAGE GPA</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Badge variant="outline" className="mb-1 px-2 py-0.5">98%</Badge>
                  <span className="text-xs text-muted-foreground">GRADUATION RATE</span>
                </div>
              </div>
            </div>
            
            {/* Football Program Highlights */}
            <div className="p-6 border-t">
              <h2 className="font-bold mb-4">Football Program Highlights</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">12-1 Record (2023 Season)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Pac-12 Conference</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Coach David Shaw - 96-54 Career Record</span>
                </div>
              </div>
            </div>
            
            {/* Academic Information */}
            <div className="p-6 border-t">
              <h2 className="font-bold mb-4">Academic Information</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-muted-foreground"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                  <span className="text-sm">Average GPA: {college.averageGPA ? college.averageGPA.toFixed(1) : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-muted-foreground"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                  <span className="text-sm">SAT Range: 1440-1550</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-muted-foreground"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                  <span className="text-sm">Top Majors: Engineering, Business, Computer Science</span>
                </div>
              </div>
            </div>
            
            {/* Recruitment Needs */}
            <div className="p-6 border-t">
              <h2 className="font-bold mb-4">Recruitment Needs</h2>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="flex flex-col items-center">
                  <Badge variant="outline" className={`mb-1 ${college.recruitingProfile?.activelyRecruiting?.includes('QB') ? 'bg-amber-500/10 text-amber-700 border-amber-300' : ''}`}>QB</Badge>
                  <span className="text-xs text-muted-foreground">2 SPOTS</span>
                </div>
                <div className="flex flex-col items-center">
                  <Badge variant="outline" className={`mb-1 ${college.recruitingProfile?.activelyRecruiting?.includes('WR') ? 'bg-amber-500/10 text-amber-700 border-amber-300' : ''}`}>WR</Badge>
                  <span className="text-xs text-muted-foreground">3 SPOTS</span>
                </div>
                <div className="flex flex-col items-center">
                  <Badge variant="outline" className={`mb-1 ${college.recruitingProfile?.activelyRecruiting?.includes('OL') ? 'bg-amber-500/10 text-amber-700 border-amber-300' : ''}`}>OL</Badge>
                  <span className="text-xs text-muted-foreground">4 SPOTS</span>
                </div>
                <div className="flex flex-col items-center">
                  <Badge variant="outline" className={`mb-1 ${college.recruitingProfile?.activelyRecruiting?.includes('DB') ? 'bg-amber-500/10 text-amber-700 border-amber-300' : ''}`}>DB</Badge>
                  <span className="text-xs text-muted-foreground">2 SPOTS</span>
                </div>
              </div>
              
              <h3 className="text-sm font-medium mb-2">Scholarship Information:</h3>
              <ul className="space-y-1 mb-4">
                <li className="text-sm flex items-center gap-1.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="m6 15 6-6 6 6" />
                  </svg>
                  Full athletic scholarships available
                </li>
                <li className="text-sm flex items-center gap-1.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="m6 15 6-6 6 6" />
                  </svg>
                  Academic merit scholarships
                </li>
                <li className="text-sm flex items-center gap-1.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="m6 15 6-6 6 6" />
                  </svg>
                  Need-based financial aid options
                </li>
              </ul>
            </div>
            
            {/* Athletic Facilities */}
            <div className="p-6 border-t">
              <h2 className="font-bold mb-4">Athletic Facilities</h2>
              <div className="rounded-md overflow-hidden mb-4">
                <img 
                  src="https://placehold.co/800x300/e2e8f0/a3b2c7" 
                  alt="Stanford Stadium" 
                  className="w-full h-28 object-cover"
                />
              </div>
              <p className="text-sm font-medium mb-1">Stanford Stadium</p>
              <ul className="space-y-1">
                <li className="text-sm flex items-center gap-1.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="m6 15 6-6 6 6" />
                  </svg>
                  50,424 seating capacity
                </li>
                <li className="text-sm flex items-center gap-1.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="m6 15 6-6 6 6" />
                  </svg>
                  State-of-the-art training facilities
                </li>
                <li className="text-sm flex items-center gap-1.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="m6 15 6-6 6 6" />
                  </svg>
                  Modern strength & conditioning center
                </li>
              </ul>
            </div>
            
            {/* Action Buttons */}
            <div className="p-6 border-t flex gap-4">
              <Button className="flex-1">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                Contact Coach
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => window.open(college.website, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            </div>
            
            {/* Similar Colleges */}
            <div className="p-6 border-t">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold">Similar Colleges</h2>
                <Button variant="link" className="p-0 h-auto text-sm">View All</Button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="mb-2">
                      <h4 className="text-sm font-medium">University of California</h4>
                      <p className="text-xs text-muted-foreground">Berkeley, CA</p>
                    </div>
                    <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                      92% MATCH
                    </Badge>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}