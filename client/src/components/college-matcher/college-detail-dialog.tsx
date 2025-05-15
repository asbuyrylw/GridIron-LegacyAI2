import { useState } from "react";
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
import { ExternalLink, ChevronLeft, Trophy, Star, Award } from "lucide-react";

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
            {/* College Header with Image */}
            <div className="relative">
              <div className="p-6 flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
                    {college.imageUrl ? (
                      <img 
                        src={college.imageUrl} 
                        alt={college.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-muted-foreground"
                        >
                          <path d="M22 8a.76.76 0 0 0 0-.21v0a.75.75 0 0 0-.07-.17L20 4a1 1 0 0 0-.86-.5H4.86A1 1 0 0 0 4 4L2.07 7.62a.75.75 0 0 0-.07.17v0a.76.76 0 0 0 0 .21V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8Z" />
                          <path d="M2 8h20" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{college.name}</h1>
                    <p className="text-sm text-muted-foreground">{college.city}, {college.state}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getDivisionColor(college.division)}>
                    DIVISION {college.division}
                  </Badge>
                  <SaveCollegeButton collegeId={college.id} initialSaved={isSaved} />
                </div>
              </div>
              
              {/* Key Stats */}
              <div className="grid grid-cols-3 px-6 gap-6 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Academic</span>
                    <span className="text-xs font-semibold">{college.academicMatch}%</span>
                  </div>
                  <Progress value={college.academicMatch} className="h-2.5" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Athletic</span>
                    <span className="text-xs font-semibold">{college.athleticMatch}%</span>
                  </div>
                  <Progress value={college.athleticMatch} className="h-2.5" />
                </div>
              </div>
            </div>
            
            {/* Tabs for different sections */}
            <Tabs
              defaultValue="overview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col h-[calc(90vh-180px)]"
            >
              <div className="px-6 border-b">
                <TabsList className="h-10 w-full justify-start rounded-none bg-transparent space-x-6 p-0">
                  <TabsTrigger value="overview" className="relative h-10 pb-4 pt-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-medium">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="academic" className="relative h-10 pb-4 pt-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-medium">
                    Academic
                  </TabsTrigger>
                  <TabsTrigger value="athletic" className="relative h-10 pb-4 pt-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-medium">
                    Athletic
                  </TabsTrigger>
                  {college.matchingReasons && (
                    <TabsTrigger value="matching" className="relative h-10 pb-4 pt-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-medium">
                      Why It Matches
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-6">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-base font-medium mb-3">College Information</h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium">Institution Type</h4>
                              <p className="text-sm">{college.isPublic ? 'Public' : 'Private'} University</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium">Enrollment</h4>
                              <p className="text-sm">{college.enrollment.toLocaleString()} students</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {college.campusSize || 'Medium'} campus size
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium">Tuition & Fees</h4>
                              <p className="text-sm">
                                {formatCurrency(college.tuition.inState)} in-state
                              </p>
                              <p className="text-sm">
                                {formatCurrency(college.tuition.outOfState)} out-of-state
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {college.scholarshipPotential 
                                  ? `Scholarship potential: ${college.scholarshipPotential}` 
                                  : 'Scholarship information not available'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        {/* Location Map */}
                        {college.city && college.state && (
                          <div className="mb-4">
                            <h3 className="text-base font-medium mb-3">Location</h3>
                            <div className="h-32 rounded-md overflow-hidden border">
                              <SimpleMap 
                                city={college.city}
                                state={college.state}
                                name={college.name} 
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Popular Programs */}
                        {college.programs && college.programs.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-base font-medium mb-2">Popular Programs</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {college.programs.map((program, idx) => (
                                <Badge key={idx} variant="outline">
                                  {program}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Website link */}
                    {college.website && (
                      <div className="mt-6">
                        <Button 
                          onClick={() => window.open(college.website, '_blank')}
                          className="w-full"
                        >
                          Visit College Website
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Academic Tab */}
                  <TabsContent value="academic" className="m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-base font-medium mb-3">Academic Profile</h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Percent className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium">Admission Rate</h4>
                              <p className="text-sm">
                                {college.admissionRate 
                                  ? `${(college.admissionRate * 100).toFixed(0)}%` 
                                  : 'Not available'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {college.admissionChance || 'Admission chances unknown'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium">Average GPA</h4>
                              <p className="text-sm">
                                {college.averageGPA 
                                  ? college.averageGPA.toFixed(1) 
                                  : 'Not available'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <BookMarked className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium">Academic Support</h4>
                              <div className="mt-1">
                                {college.academicSupport && college.academicSupport.length > 0 ? (
                                  <ul className="list-disc text-sm pl-4 space-y-1">
                                    {college.academicSupport.map((support, idx) => (
                                      <li key={idx}>{support}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Academic support details not available
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium mb-3">Popular Programs</h3>
                        {college.programs && college.programs.length > 0 ? (
                          <ul className="space-y-2">
                            {college.programs.map((program, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{program}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Program information not available
                          </p>
                        )}
                        
                        {/* Academic match */}
                        <div className="mt-6">
                          <h3 className="text-base font-medium mb-2">Academic Match</h3>
                          <Progress value={college.academicMatch} className="h-2.5 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            This college is a {getMatchDescription(college.academicMatch)} academic match for your profile.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Athletic Tab */}
                  <TabsContent value="athletic" className="m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-base font-medium mb-3">Athletic Profile</h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Trophy className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium">Division</h4>
                              <p className="text-sm">{college.division}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {college.conference || 'Conference information not available'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <Star className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium">Athletic Ranking</h4>
                              <p className="text-sm">
                                {college.athleticRanking 
                                  ? `Ranked #${college.athleticRanking} in ${college.division}`
                                  : 'Ranking not available'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium">Athletic Scholarships</h4>
                              <p className="text-sm">
                                {college.athleticScholarships 
                                  ? 'Available' 
                                  : 'Not available (Division restrictions)'}
                              </p>
                              {college.scholarshipPotential && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Your scholarship potential: {college.scholarshipPotential}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Recruiting info */}
                        {college.recruitingProfile && (
                          <div className="mt-6">
                            <h3 className="text-base font-medium mb-3">Recruiting Information</h3>
                            <div className="space-y-3">
                              {college.recruitingProfile.activelyRecruiting && 
                               college.recruitingProfile.activelyRecruiting.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium">Actively Recruiting</h4>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {college.recruitingProfile.activelyRecruiting.map((position, idx) => (
                                      <Badge key={idx} variant="outline">{position}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {college.recruitingProfile.offensiveStyle && (
                                <div>
                                  <h4 className="text-sm font-medium">Offensive Style</h4>
                                  <p className="text-sm">{college.recruitingProfile.offensiveStyle}</p>
                                </div>
                              )}
                              
                              {college.recruitingProfile.defensiveStyle && (
                                <div>
                                  <h4 className="text-sm font-medium">Defensive Style</h4>
                                  <p className="text-sm">{college.recruitingProfile.defensiveStyle}</p>
                                </div>
                              )}
                              
                              {college.recruitingProfile.recentSuccess && (
                                <div>
                                  <h4 className="text-sm font-medium">Recent Success</h4>
                                  <p className="text-sm">{college.recruitingProfile.recentSuccess}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        {/* Facilities */}
                        {college.athleticFacilities && college.athleticFacilities.length > 0 && (
                          <div>
                            <h3 className="text-base font-medium mb-2">Athletic Facilities</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              {college.athleticFacilities.map((facility, idx) => (
                                <li key={idx}>{facility}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Sport offerings */}
                        {college.sportOfferings && college.sportOfferings.length > 0 && (
                          <div className="mt-6">
                            <h3 className="text-base font-medium mb-2">Sports Offered</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {college.sportOfferings.map((sport, idx) => (
                                <Badge key={idx} variant="outline">{sport}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Athletic match */}
                        <div className="mt-6">
                          <h3 className="text-base font-medium mb-2">Athletic Match</h3>
                          <Progress value={college.athleticMatch} className="h-2.5 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            This college is a {getMatchDescription(college.athleticMatch)} athletic match for your profile.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Why It Matches Tab */}
                  {college.matchingReasons && (
                    <TabsContent value="matching" className="m-0">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-base font-medium mb-3">Why This College Matches Your Profile</h3>
                          <ul className="space-y-3">
                            {college.matchingReasons.map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                  <BarChart4 className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-sm">{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium">Overall Match</span>
                              <span className="text-xs font-semibold">{college.overallMatch}%</span>
                            </div>
                            <Progress value={college.overallMatch} className="h-2.5" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium">Academic</span>
                              <span className="text-xs font-semibold">{college.academicMatch}%</span>
                            </div>
                            <Progress value={college.academicMatch} className="h-2.5" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium">Athletic</span>
                              <span className="text-xs font-semibold">{college.athleticMatch}%</span>
                            </div>
                            <Progress value={college.athleticMatch} className="h-2.5" />
                          </div>
                        </div>
                        
                        {college.financialFit && (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium">Financial Fit</span>
                              <span className="text-xs font-semibold">{college.financialFit}%</span>
                            </div>
                            <Progress value={college.financialFit} className="h-2.5" />
                          </div>
                        )}
                        
                        {college.locationFit && (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium">Location Fit</span>
                              <span className="text-xs font-semibold">{college.locationFit}%</span>
                            </div>
                            <Progress value={college.locationFit} className="h-2.5" />
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )}
                </div>
              </ScrollArea>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get match description based on score
function getMatchDescription(score: number): string {
  if (score >= 90) return "perfect";
  if (score >= 80) return "excellent";
  if (score >= 70) return "strong";
  if (score >= 60) return "good";
  if (score >= 50) return "decent";
  if (score >= 40) return "fair";
  return "potential";
}