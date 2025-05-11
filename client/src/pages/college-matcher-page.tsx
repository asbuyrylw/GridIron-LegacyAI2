import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap, Trophy, MapPin, BookOpen, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    region: "",
    preferredMajor: "",
    maxDistance: "",
    preferredState: "",
    financialAidImportance: 5,
    athleticScholarshipRequired: false,
    minEnrollment: "",
    maxEnrollment: "",
    publicOnly: false,
    privateOnly: false,
    useAI: true,
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
      filters.athleticScholarshipRequired,
      filters.minEnrollment,
      filters.maxEnrollment,
      filters.publicOnly,
      filters.privateOnly,
      filters.useAI,
    ],
    enabled: Boolean(user),
  });

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    refetch();
  };

  const divisionColors: Record<string, string> = {
    D1: "bg-red-500",
    D2: "bg-blue-500",
    D3: "bg-green-500",
    NAIA: "bg-purple-500",
    JUCO: "bg-orange-500",
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading college matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-red-500 mb-4">
          Error loading college matches. Please try again.
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>College Matcher | GridIron LegacyAI</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">College Matcher</h1>
              <p className="text-muted-foreground">
                Find the right college fit based on your athletic and academic profile.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button asChild variant="outline" size="sm">
                <a href="/recruiting">
                  <Share2 className="h-4 w-4 mr-2" />
                  Back to Recruiting Dashboard
                </a>
              </Button>
            </div>
          </div>
        </div>

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

            {/* Filters Section */}
            <Card className="mb-8">
              <CardHeader className="pb-3">
                <CardTitle>Refine Your Matches</CardTitle>
                <CardDescription>
                  Customize your college search with these filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Location Filters */}
                  <div>
                    <Label htmlFor="region" className="mb-1 block">
                      Region
                    </Label>
                    <Select
                      value={filters.region}
                      onValueChange={(value) =>
                        handleFilterChange("region", value)
                      }
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
                  <Input
                    id="financialAidImportance"
                    type="range"
                    min="1"
                    max="10"
                    value={filters.financialAidImportance}
                    onChange={(e) =>
                      handleFilterChange("financialAidImportance", e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                {/* School Type Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="publicOnly"
                      checked={filters.publicOnly}
                      onCheckedChange={(checked) =>
                        handleFilterChange("publicOnly", Boolean(checked))
                      }
                    />
                    <Label htmlFor="publicOnly">Public Schools Only</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privateOnly"
                      checked={filters.privateOnly}
                      onCheckedChange={(checked) =>
                        handleFilterChange("privateOnly", Boolean(checked))
                      }
                    />
                    <Label htmlFor="privateOnly">Private Schools Only</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="athleticScholarshipRequired"
                      checked={filters.athleticScholarshipRequired}
                      onCheckedChange={(checked) =>
                        handleFilterChange("athleticScholarshipRequired", Boolean(checked))
                      }
                    />
                    <Label htmlFor="athleticScholarshipRequired">Athletic Scholarships</Label>
                  </div>
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

            {/* Matched Schools Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Your College Matches</CardTitle>
                <CardDescription>
                  Based on your profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">School</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead className="text-center">Match %</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collegeMatches.matchedSchools.map((school, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {school.name}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs font-medium rounded-full px-2 py-1 text-white ${
                                divisionColors[school.division] || "bg-gray-500"
                              }`}
                            >
                              {school.division}
                            </span>
                          </TableCell>
                          <TableCell>{school.region}</TableCell>
                          <TableCell className="text-center">
                            {school.overallMatch}%
                          </TableCell>
                          <TableCell className="text-right">
                            <Accordion type="single" collapsible>
                              <AccordionItem value={`item-${index}`}>
                                <AccordionTrigger className="text-xs py-1">
                                  Details
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="flex flex-col gap-4 p-2">
                                    {/* Match scores section */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <div className="flex items-center mb-1">
                                          <Trophy className="w-4 h-4 mr-1 text-amber-500" />
                                          <span className="text-xs font-semibold">
                                            Athletic Match
                                          </span>
                                        </div>
                                        <Progress
                                          value={school.athleticMatch}
                                          className="h-2"
                                        />
                                        <div className="text-xs text-right mt-1">
                                          {school.athleticMatch}%
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex items-center mb-1">
                                          <BookOpen className="w-4 h-4 mr-1 text-blue-500" />
                                          <span className="text-xs font-semibold">
                                            Academic Match
                                          </span>
                                        </div>
                                        <Progress
                                          value={school.academicMatch}
                                          className="h-2"
                                        />
                                        <div className="text-xs text-right mt-1">
                                          {school.academicMatch}%
                                        </div>
                                      </div>
                                      {school.financialFit && (
                                        <div>
                                          <div className="flex items-center mb-1">
                                            <span className="text-xs font-semibold">
                                              Financial Fit
                                            </span>
                                          </div>
                                          <Progress
                                            value={school.financialFit}
                                            className="h-2"
                                          />
                                          <div className="text-xs text-right mt-1">
                                            {school.financialFit}%
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Key Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="text-xs font-semibold mb-2">School Information</h4>
                                        <ul className="space-y-1 text-xs">
                                          <li className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                                            <span>{`${school.city}, ${school.state}`}</span>
                                          </li>
                                          <li className="flex items-center gap-1">
                                            <span className="font-medium">Type:</span>
                                            <span>{school.isPublic ? 'Public' : 'Private'}</span>
                                          </li>
                                          <li className="flex items-center gap-1">
                                            <span className="font-medium">Enrollment:</span>
                                            <span>{school.enrollment.toLocaleString()} students</span>
                                          </li>
                                          {school.admissionRate && (
                                            <li className="flex items-center gap-1">
                                              <span className="font-medium">Acceptance Rate:</span>
                                              <span>{(school.admissionRate * 100).toFixed(1)}%</span>
                                            </li>
                                          )}
                                          {school.athleticScholarships && (
                                            <li className="flex items-center gap-1">
                                              <span className="text-green-600 font-medium">Offers athletic scholarships</span>
                                            </li>
                                          )}
                                          {school.scholarshipPotential && (
                                            <li className="flex items-center gap-1">
                                              <span className="font-medium">Scholarship Potential:</span>
                                              <span>{school.scholarshipPotential}</span>
                                            </li>
                                          )}
                                        </ul>
                                      </div>
                                      
                                      <div>
                                        <h4 className="text-xs font-semibold mb-2">Athletic Information</h4>
                                        {school.athleticRanking && (
                                          <div className="flex items-center gap-1 text-xs mb-1">
                                            <span className="font-medium">Athletic Ranking:</span>
                                            <span>#{school.athleticRanking}</span>
                                          </div>
                                        )}
                                        {school.conference && (
                                          <div className="flex items-center gap-1 text-xs mb-1">
                                            <span className="font-medium">Conference:</span>
                                            <span>{school.conference}</span>
                                          </div>
                                        )}
                                        {school.athleticFacilities && school.athleticFacilities.length > 0 && (
                                          <div className="mt-1">
                                            <span className="text-xs font-medium">Facilities:</span>
                                            <ul className="ml-3 mt-1 list-disc text-xs space-y-0.5">
                                              {school.athleticFacilities.slice(0, 2).map((facility, i) => (
                                                <li key={i}>{facility}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Academic Programs */}
                                    {school.programs && school.programs.length > 0 && (
                                      <div>
                                        <h4 className="text-xs font-semibold mb-1">
                                          Available Programs
                                        </h4>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {school.programs.map((program, i) => (
                                            <span
                                              key={i}
                                              className="text-xs bg-muted rounded-full px-2 py-0.5"
                                            >
                                              {program}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Matching Reasons */}
                                    {school.matchingReasons && school.matchingReasons.length > 0 && (
                                      <div>
                                        <h4 className="text-xs font-semibold mb-1">
                                          Why This School Matches Your Profile
                                        </h4>
                                        <ul className="ml-3 list-disc text-xs space-y-1">
                                          {school.matchingReasons.map((reason, i) => (
                                            <li key={i}>{reason}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}