import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Trophy, BookOpen, Search, MapPin, Filter, DollarSign, Check } from "lucide-react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

export default function CollegeMatcherPage() {
  // State for college matches
  const [collegeMatches, setCollegeMatches] = useState<CollegeMatchResult | null>(null);
  
  // State for filters
  const [filters, setFilters] = useState({
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
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("matches");

  // Fetch college matches
  const { data, isLoading, refetch } = useQuery<CollegeMatchResult>({
    queryKey: ["/api/college-matcher/1"], // Hardcoded athlete ID for now
  });

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters and refetch matches
  const applyFilters = () => {
    // Build query params
    const params = new URLSearchParams();
    if (filters.region) params.append("region", filters.region);
    if (filters.preferredState) params.append("preferredState", filters.preferredState);
    if (filters.maxDistance) params.append("maxDistance", filters.maxDistance);
    if (filters.preferredMajor) params.append("preferredMajor", filters.preferredMajor);
    if (filters.minEnrollment) params.append("minEnrollment", filters.minEnrollment);
    if (filters.maxEnrollment) params.append("maxEnrollment", filters.maxEnrollment);
    if (filters.athleticScholarship) params.append("athleticScholarshipRequired", "true");
    if (filters.publicOnly) params.append("publicOnly", "true");
    if (filters.privateOnly) params.append("privateOnly", "true");
    params.append("financialAidImportance", filters.financialAidImportance.toString());
    params.append("useAI", filters.useAI.toString());
    
    // Refetch with filters
    refetch();
  };

  // Set college matches when data is loaded
  useEffect(() => {
    if (data) {
      setCollegeMatches(data);
    }
  }, [data]);

  // Division color mapping
  const divisionColors: Record<string, string> = {
    "D1": "bg-amber-500",
    "D2": "bg-blue-500",
    "D3": "bg-green-500",
    "NAIA": "bg-purple-500",
    "JUCO": "bg-gray-500",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading college matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">College Matcher</h1>
      
      <Tabs defaultValue="matches" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="matches">Your Matches</TabsTrigger>
          <TabsTrigger value="filters">Filters & Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="filters">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>College Preferences</CardTitle>
              <CardDescription>
                Refine your college matches based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Location Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="region" className="mb-1 block">
                    Region
                  </Label>
                  <Select
                    value={filters.region}
                    onValueChange={(value) => handleFilterChange("region", value)}
                  >
                    <SelectTrigger id="region">
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All regions</SelectItem>
                      <SelectItem value="Northeast">Northeast</SelectItem>
                      <SelectItem value="Southeast">Southeast</SelectItem>
                      <SelectItem value="South">South</SelectItem>
                      <SelectItem value="Midwest">Midwest</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                      <SelectItem value="Northwest">Northwest</SelectItem>
                      <SelectItem value="Southwest">Southwest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferredState" className="mb-1 block">
                    Preferred State
                  </Label>
                  <Input
                    id="preferredState"
                    value={filters.preferredState}
                    onChange={(e) =>
                      handleFilterChange("preferredState", e.target.value)
                    }
                    placeholder="e.g. California, Texas"
                  />
                </div>

                <div>
                  <Label htmlFor="maxDistance" className="mb-1 block">
                    Max Distance (miles)
                  </Label>
                  <Input
                    id="maxDistance"
                    type="number"
                    value={filters.maxDistance}
                    onChange={(e) =>
                      handleFilterChange("maxDistance", e.target.value)
                    }
                    placeholder="No limit"
                  />
                </div>
              </div>

              {/* Academic and Major Filters */}
              <div className="mt-4">
                <Label htmlFor="preferredMajor" className="mb-1 block">
                  Preferred Major
                </Label>
                <Input
                  id="preferredMajor"
                  value={filters.preferredMajor}
                  onChange={(e) =>
                    handleFilterChange("preferredMajor", e.target.value)
                  }
                  placeholder="e.g. Business, Engineering"
                />
              </div>

              {/* School Size Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="minEnrollment" className="mb-1 block">
                    Min Enrollment
                  </Label>
                  <Input
                    id="minEnrollment"
                    type="number"
                    value={filters.minEnrollment}
                    onChange={(e) =>
                      handleFilterChange("minEnrollment", e.target.value)
                    }
                    placeholder="e.g. 5000"
                  />
                </div>
                <div>
                  <Label htmlFor="maxEnrollment" className="mb-1 block">
                    Max Enrollment
                  </Label>
                  <Input
                    id="maxEnrollment"
                    type="number"
                    value={filters.maxEnrollment}
                    onChange={(e) =>
                      handleFilterChange("maxEnrollment", e.target.value)
                    }
                    placeholder="e.g. 30000"
                  />
                </div>
              </div>

              {/* Financial Aid Importance */}
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <Label htmlFor="financialAidImportance" className="block">
                    Financial Aid Importance
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {filters.financialAidImportance}/10
                  </span>
                </div>
                <Slider
                  id="financialAidImportance"
                  min={0}
                  max={10}
                  step={1}
                  value={[filters.financialAidImportance]}
                  onValueChange={(value) =>
                    handleFilterChange("financialAidImportance", value[0])
                  }
                />
              </div>

              {/* Institution Type */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="publicOnly"
                    checked={filters.publicOnly}
                    onCheckedChange={(checked) =>
                      handleFilterChange("publicOnly", Boolean(checked))
                    }
                  />
                  <Label htmlFor="publicOnly">Public schools only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privateOnly"
                    checked={filters.privateOnly}
                    onCheckedChange={(checked) =>
                      handleFilterChange("privateOnly", Boolean(checked))
                    }
                  />
                  <Label htmlFor="privateOnly">Private schools only</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="athleticScholarship"
                  checked={filters.athleticScholarship}
                  onCheckedChange={(checked) =>
                    handleFilterChange("athleticScholarship", Boolean(checked))
                  }
                />
                <Label htmlFor="athleticScholarship">
                  Athletic scholarships required
                </Label>
              </div>

              {/* AI Insights */}
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="useAI"
                  checked={filters.useAI}
                  onCheckedChange={(checked) =>
                    handleFilterChange("useAI", Boolean(checked))
                  }
                />
                <Label htmlFor="useAI">Include AI-powered insights</Label>
              </div>

              <Button onClick={applyFilters} className="mt-6 w-full">
                Apply Filters
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="matches">
          {collegeMatches && (
            <>
              {/* Division Recommendation Section */}
              <Card className="mb-8">
                <CardHeader className="pb-3">
                  <CardTitle>Your Division Recommendation</CardTitle>
                  <CardDescription>
                    Based on your athletic and academic profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-3xl font-bold">
                        {collegeMatches.divisionRecommendation}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Recommended Division
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">Match Score: {collegeMatches.matchScore}%</span>
                      </div>
                      <Progress
                        value={collegeMatches.matchScore}
                        className="h-2"
                      />
                    </div>
                  </div>

                  {collegeMatches.athleteProfile && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-muted/50 rounded-md">
                      <div>
                        <div className="text-sm font-medium mb-1">Academic Strength</div>
                        <Progress
                          value={collegeMatches.athleteProfile.academicStrength * 10}
                          className="h-2"
                        />
                        <div className="text-xs text-right mt-1">
                          {collegeMatches.athleteProfile.academicStrength}/10
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-1">Athletic Strength</div>
                        <Progress
                          value={collegeMatches.athleteProfile.athleticStrength * 10}
                          className="h-2"
                        />
                        <div className="text-xs text-right mt-1">
                          {collegeMatches.athleteProfile.athleticStrength}/10
                        </div>
                      </div>
                      
                      {collegeMatches.athleteProfile.positionRanking && (
                        <div className="flex flex-col justify-center items-center">
                          <div className="text-sm font-medium mb-1">Position Ranking</div>
                          <div className="text-lg font-bold">
                            {collegeMatches.athleteProfile.positionRanking}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Feedback</h3>
                    <ul className="space-y-2">
                      {collegeMatches.feedback.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                            <GraduationCap className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              {/* AI Recruiting Insights Section */}
              {collegeMatches.insights && collegeMatches.insights.length > 0 && (
                <Card className="mb-8 border-primary/20">
                  <CardHeader className="pb-3 bg-primary/5">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/20 p-1 rounded-md">
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
                          <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10Z"/>
                          <path d="M12 7v5l3 3"/>
                          <path d="m9 17 2.85-2.8a2.35 2.35 0 0 0 .66-1.2 2.35 2.35 0 0 0-1.3-2.4 2.33 2.33 0 0 0-2.54.4L7.5 12"/>
                        </svg>
                      </span>
                      <div>
                        <CardTitle>AI Recruiting Insights</CardTitle>
                        <CardDescription>
                          Personalized advice based on your profile and college matches
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {collegeMatches.insights.map((insight, i) => (
                        <div key={i} className="p-3 bg-background border rounded-md">
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                      <div className="text-xs text-muted-foreground italic mt-2">
                        These insights are generated by AI and should be considered as suggestions.
                        Always consult with your coaches and counselors for personalized advice.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Matched Schools Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Your College Matches</CardTitle>
                  <CardDescription>
                    Based on your profile and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collegeMatches.matchedSchools.map((school) => (
                      <Card key={school.id} className="overflow-hidden border border-muted">
                        <div className="relative">
                          {/* Header with school color */}
                          <div 
                            className={`h-20 flex items-center justify-center ${
                              school.division === "D1"
                                ? "bg-gradient-to-r from-amber-500/80 to-amber-300/30"
                                : school.division === "D2"
                                ? "bg-gradient-to-r from-blue-500/80 to-blue-300/30"
                                : school.division === "D3"
                                ? "bg-gradient-to-r from-green-500/80 to-green-300/30"
                                : school.division === "NAIA"
                                ? "bg-gradient-to-r from-purple-500/80 to-purple-300/30"
                                : "bg-gradient-to-r from-gray-500/80 to-gray-300/30"
                            }`}
                          >
                            {/* Division badge */}
                            <div className="absolute right-2 top-2 z-10">
                              <Badge 
                                className={`${
                                  school.division === "D1"
                                    ? "bg-amber-100 hover:bg-amber-100 text-amber-800"
                                    : school.division === "D2"
                                    ? "bg-blue-100 hover:bg-blue-100 text-blue-800"
                                    : school.division === "D3"
                                    ? "bg-green-100 hover:bg-green-100 text-green-800"
                                    : school.division === "NAIA"
                                    ? "bg-purple-100 hover:bg-purple-100 text-purple-800"
                                    : "bg-gray-100 hover:bg-gray-100 text-gray-800"
                                }`}
                              >
                                {school.division}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="px-4 py-3">
                            {/* School name and match score */}
                            <div className="flex flex-col">
                              <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold truncate">{school.name}</h3>
                                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md">
                                  <span className="text-xs font-medium text-primary">{school.overallMatch}%</span>
                                  <span className="text-xs text-muted-foreground">match</span>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{`${school.city}, ${school.state}`}</span>
                              </div>
                            </div>
                            
                            {/* Match scores */}
                            <div className="mt-3 space-y-2">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="font-medium flex items-center">
                                    <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                                    Athletic Fit
                                  </span>
                                  <span>{school.athleticMatch}%</span>
                                </div>
                                <Progress value={school.athleticMatch} className="h-1.5" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="font-medium flex items-center">
                                    <BookOpen className="h-3 w-3 mr-1 text-blue-500" />
                                    Academic Fit
                                  </span>
                                  <span>{school.academicMatch}%</span>
                                </div>
                                <Progress value={school.academicMatch} className="h-1.5" />
                              </div>
                              
                              {school.financialFit && (
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium flex items-center">
                                      <DollarSign className="h-3 w-3 mr-1 text-green-500" />
                                      Financial Fit
                                    </span>
                                    <span>{school.financialFit}%</span>
                                  </div>
                                  <Progress value={school.financialFit} className="h-1.5" />
                                </div>
                              )}
                            </div>
                            
                            {/* Key badges */}
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-1 mb-2">
                                <Badge variant="outline" className="text-xs font-normal">
                                  {school.isPublic ? 'Public' : 'Private'}
                                </Badge>
                                <Badge variant="outline" className="text-xs font-normal">
                                  {school.enrollment.toLocaleString()} students
                                </Badge>
                                {school.athleticScholarships && (
                                  <Badge variant="outline" className="text-xs font-normal text-green-600 border-green-200">
                                    Scholarships
                                  </Badge>
                                )}
                                {school.conference && (
                                  <Badge variant="outline" className="text-xs font-normal">
                                    {school.conference}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Expandable details */}
                            <Accordion type="single" collapsible className="mt-2">
                              <AccordionItem value="details" className="border-b-0">
                                <AccordionTrigger className="py-2 text-sm">
                                  More details
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4 mt-1 text-sm">
                                    {/* School Information */}
                                    <div>
                                      <h4 className="font-medium mb-1 text-sm">School Details</h4>
                                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                        {school.admissionRate && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Acceptance:</span>
                                            <span>{(school.admissionRate * 100).toFixed(0)}%</span>
                                          </div>
                                        )}
                                        {school.averageGPA && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Avg GPA:</span>
                                            <span>{school.averageGPA.toFixed(1)}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">In-state:</span>
                                          <span>${school.tuition.inState.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Out-of-state:</span>
                                          <span>${school.tuition.outOfState.toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Football Program */}
                                    <div>
                                      <h4 className="font-medium mb-1 text-sm">Football Program</h4>
                                      {(school.recruitingProfile?.offensiveStyle || 
                                       school.recruitingProfile?.defensiveStyle) && (
                                        <div className="mb-2 text-xs">
                                          {school.recruitingProfile.offensiveStyle && (
                                            <div className="flex gap-1">
                                              <span className="text-muted-foreground">Offense:</span> 
                                              <span>{school.recruitingProfile.offensiveStyle}</span>
                                            </div>
                                          )}
                                          {school.recruitingProfile.defensiveStyle && (
                                            <div className="flex gap-1">
                                              <span className="text-muted-foreground">Defense:</span>
                                              <span>{school.recruitingProfile.defensiveStyle}</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      
                                      {school.recruitingProfile?.activelyRecruiting && (
                                        <div className="mb-2">
                                          <div className="text-xs text-muted-foreground mb-1">Actively Recruiting:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {school.recruitingProfile.activelyRecruiting.map((pos, idx) => (
                                              <span 
                                                key={idx}
                                                className="px-1.5 py-0.5 bg-muted rounded-sm text-[0.65rem]"
                                              >
                                                {pos}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {school.athleticFacilities && (
                                        <div className="text-xs">
                                          <div className="text-muted-foreground mb-0.5">Facilities:</div>
                                          <ul className="list-disc pl-4 space-y-0.5">
                                            {school.athleticFacilities.map((facility, idx) => (
                                              <li key={idx}>{facility}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Why This Matches You */}
                                    {school.matchingReasons && school.matchingReasons.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-1 text-sm">Why This Matches You</h4>
                                        <ul className="space-y-1">
                                          {school.matchingReasons.map((reason, idx) => (
                                            <li key={idx} className="flex items-start gap-1 text-xs">
                                              <div className="rounded-full bg-primary/10 p-0.5 mt-0.5 flex-shrink-0">
                                                <Check className="h-2 w-2 text-primary" />
                                              </div>
                                              <span>{reason}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}