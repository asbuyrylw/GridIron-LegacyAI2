import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { GraduationCap, BookOpen, MapPin, ChevronRight, Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CollegeCard } from "@/components/college-matcher/college-card";
import { CollegeDetailDialog } from "@/components/college-matcher/college-detail-dialog";
import { CollegeFilters, CollegeFilters as CollegeFiltersType } from "@/components/college-matcher/college-filters";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CollegeMatchResult {
  divisionRecommendation: string;
  matchScore: number;
  matchedSchools: MatchedCollege[];
  feedback: string[];
  insights?: string[];
  athleteProfile: {
    academicStrength: number;
    athleticStrength: number;
    positionRanking?: string;
  };
}

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

export default function NewCollegeMatcherPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState<CollegeFiltersType>({
    searchQuery: "",
    region: "",
    preferredState: "",
    maxDistance: "",
    preferredMajor: "",
    minEnrollment: "",
    maxEnrollment: "",
    athleticScholarship: false,
    publicOnly: false,
    privateOnly: false,
    financialAidImportance: 5,
    useAI: true,
    division: "",
  });
  
  // Get college matches for the current athlete
  const {
    data: collegeMatches,
    isLoading,
    error,
    refetch,
  } = useQuery<CollegeMatchResult>({
    queryKey: [
      "/api/college-matcher/me",
      filters.region,
      filters.preferredMajor,
      filters.maxDistance,
      filters.preferredState,
      filters.financialAidImportance,
      filters.athleticScholarship,
      filters.minEnrollment,
      filters.maxEnrollment,
      filters.publicOnly,
      filters.privateOnly,
      filters.useAI,
      filters.division,
    ],
    enabled: Boolean(user),
  });
  
  // Get saved colleges
  const {
    data: savedColleges,
    isLoading: isSavedCollegesLoading,
  } = useQuery<MatchedCollege[]>({
    queryKey: ["/api/saved-colleges"],
    enabled: Boolean(user),
  });
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Apply filters and refetch matches
  const applyFilters = () => {
    refetch();
    toast({
      title: "Filters applied",
      description: "Your college matches have been updated."
    });
  };
  
  // Clear filters
  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      region: "",
      preferredState: "",
      maxDistance: "",
      preferredMajor: "",
      minEnrollment: "",
      maxEnrollment: "",
      athleticScholarship: false,
      publicOnly: false,
      privateOnly: false,
      financialAidImportance: 5,
      useAI: true,
      division: "",
    });
    toast({
      description: "All filters have been cleared."
    });
  };
  
  // Check if college is saved
  const isCollegeSaved = (collegeId: number): boolean => {
    return savedColleges ? savedColleges.some((college) => college.id === collegeId) : false;
  };
  
  // Filter colleges by search query
  const filteredColleges = collegeMatches?.matchedSchools.filter((college) => {
    if (!filters.searchQuery) return true;
    return college.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      college.city.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      college.state.toLowerCase().includes(filters.searchQuery.toLowerCase());
  });
  
  // Open college details dialog
  const openCollegeDetails = (collegeId: number) => {
    setSelectedCollege(collegeId);
    setIsDetailOpen(true);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setIsDetailOpen(false);
  };
  
  // Division color mapping
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
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <Helmet>
          <title>College Matcher | GridIron LegacyAI</title>
        </Helmet>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading college matches...</p>
            <p className="text-xs text-muted-foreground mt-2">This may take a moment as we analyze your profile.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Check for authentication error
  if (!user) {
    return (
      <div className="container py-8">
        <Helmet>
          <title>College Matcher | GridIron LegacyAI</title>
        </Helmet>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <GraduationCap className="h-12 w-12 text-primary" />
            <h2 className="text-xl font-semibold">Sign In Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access your personalized college matches. Our College Matcher helps you find the perfect fit based on your athletic and academic profile.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
              <Button asChild className="w-full">
                <a href="/auth">Sign In</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/auth?tab=register">Create Account</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check for other errors
  if (error) {
    return (
      <div className="container py-8">
        <Helmet>
          <title>College Matcher | GridIron LegacyAI</title>
        </Helmet>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <X className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">Error Loading Matches</h2>
            <p className="text-muted-foreground">
              We encountered an issue retrieving your college matches. This might be due to incomplete profile data or a connection issue.
            </p>
            <Button onClick={() => refetch()} className="mt-2">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-6">
      <Helmet>
        <title>College Matcher | GridIron LegacyAI</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">College Matcher</h1>
          <p className="text-muted-foreground">
            Find the perfect college match based on your athletic and academic profile
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHelpOpen(true)}
          >
            <Info className="w-4 h-4 mr-2" />
            How It Works
          </Button>
        </div>
      </div>
      
      <AlertDialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>How the College Matcher Works</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 text-left">
                <p>
                  The College Matcher analyzes your athletic and academic profile to find colleges where you'll have the best chance of success, both academically and athletically.
                </p>
                <div>
                  <h3 className="font-medium mb-1">How Matches Are Calculated</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Athletic Match: Based on your performance metrics, position, and physical attributes</li>
                    <li>Academic Match: Based on your GPA, test scores, and academic interests</li>
                    <li>Overall Match: A combination of athletic, academic, and other factors</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Key Features</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Division Recommendation: Suggests which NCAA division is the best fit</li>
                    <li>College Matches: Shows schools that match your profile</li>
                    <li>Personalized Insights: Provides feedback specific to your situation</li>
                    <li>Save Colleges: Bookmark colleges you're interested in</li>
                  </ul>
                </div>
                <p>
                  Use the filters to refine your matches based on preferences for location, academic programs, and other factors.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got It</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {collegeMatches && (
        <div className="space-y-8">
          {/* Insights & Recommendations Section - Now at the top of the page */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Division Recommendation */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle>Your Division Fit</CardTitle>
                  <CardDescription>
                    Based on your athletic and academic profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <Badge 
                      className={`text-lg py-1.5 px-4 mb-4 ${getDivisionColor(collegeMatches.divisionRecommendation)}`}
                    >
                      {collegeMatches.divisionRecommendation}
                    </Badge>
                    
                    <div className="w-full mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Match Score</span>
                        <span className="text-sm font-semibold">{collegeMatches.matchScore}%</span>
                      </div>
                      <Progress value={collegeMatches.matchScore} className="h-2" />
                    </div>
                    
                    {collegeMatches.athleteProfile && (
                      <div className="w-full space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Academic Strength</span>
                            <span className="text-sm">{collegeMatches.athleteProfile.academicStrength}%</span>
                          </div>
                          <Progress value={collegeMatches.athleteProfile.academicStrength} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Athletic Strength</span>
                            <span className="text-sm">{collegeMatches.athleteProfile.athleticStrength}%</span>
                          </div>
                          <Progress value={collegeMatches.athleteProfile.athleticStrength} className="h-1.5" />
                        </div>
                        {collegeMatches.athleteProfile.positionRanking && (
                          <div className="text-sm text-center mt-4">
                            <span className="font-medium">Position Ranking: </span>
                            <span>{collegeMatches.athleteProfile.positionRanking}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
          
              {/* Feedback and Insights */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle>Personalized Feedback</CardTitle>
                  <CardDescription>
                    College recruiting insights based on your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Feedback Section */}
                    <div>
                      <h3 className="text-base font-medium mb-3">Feedback</h3>
                      <ul className="space-y-3">
                        {collegeMatches.feedback.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                              <GraduationCap className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* AI Insights Section */}
                    {collegeMatches.insights && collegeMatches.insights.length > 0 && (
                      <div>
                        <Separator className="my-4" />
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-primary/10 p-1 rounded-md">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="h-5 w-5 text-primary"
                            >
                              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9"/>
                            </svg>
                          </div>
                          <h3 className="text-base font-medium">AI Insights</h3>
                        </div>
                        <ul className="space-y-3">
                          {collegeMatches.insights.map((insight, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                <BookOpen className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-sm">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Filter Section - Now above the college list */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Filter Colleges</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>
            </CardHeader>
            
            {showFilters && (
              <CardContent>
                <CollegeFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onApplyFilters={applyFilters}
                  onClearFilters={clearFilters}
                />
              </CardContent>
            )}
          </Card>
          
          {/* College Matches Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your College Matches</h2>
              <div className="flex items-center gap-3">
                {/* Results summary */}
                <p className="text-sm text-muted-foreground">
                  {filteredColleges?.length} {filteredColleges?.length === 1 ? 'college' : 'colleges'} matched your criteria
                </p>
                {filters.searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('searchQuery', '')}
                    className="h-8"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear search
                  </Button>
                )}
              </div>
            </div>
            
            {/* College grid - Now full width */}
            {filteredColleges && filteredColleges.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredColleges.map((college) => (
                  <div 
                    key={college.id} 
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => openCollegeDetails(college.id)}
                  >
                    <CollegeCard
                      college={college}
                      isSaved={isCollegeSaved(college.id)}
                      fullWidth={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No matching colleges</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  {filters.searchQuery 
                    ? `No colleges match your search for "${filters.searchQuery}". Try a different search term or adjust your filters.`
                    : "No colleges match your current filters. Try adjusting your criteria or clearing filters."}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
          
          {/* Saved Colleges Section */}
          {savedColleges && savedColleges.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Saved Colleges</h2>
                <Badge variant="outline" className="text-sm">
                  {savedColleges.length} saved
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {savedColleges.map((college) => (
                  <div 
                    key={college.id} 
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => openCollegeDetails(college.id)}
                  >
                    <CollegeCard
                      college={college}
                      isSaved={true}
                      fullWidth={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* College Detail Dialog */}
      {selectedCollege && (
        <CollegeDetailDialog
          collegeId={selectedCollege}
          isOpen={isDetailOpen}
          onClose={handleDialogClose}
          isSaved={isCollegeSaved(selectedCollege)}
        />
      )}
    </div>
  );
}