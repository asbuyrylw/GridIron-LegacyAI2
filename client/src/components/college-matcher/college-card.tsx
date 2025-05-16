import { useState } from 'react';
import { BookmarkIcon, GraduationCap, Trophy, MapPin, Globe, DollarSign, School } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SaveCollegeButton } from "./save-college-button";
import { CollegeDetailDialog } from "./college-detail-dialog";

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
  fullWidth?: boolean;
}

export function CollegeCard({ college, isSaved = false, variant = 'default', fullWidth = false }: CollegeCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Render the detail dialog separately
  const renderDetailDialog = () => {
    return (
      <CollegeDetailDialog
        collegeId={college.id}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        isSaved={isSaved}
      />
    );
  };

  // Render the card component 
  const renderCard = () => {
    return variant === 'compact' ? renderCompactCard() : renderFullCard();
  };
  
  // Render compact card
  const renderCompactCard = () => {
    return (
      <Card className="overflow-hidden border border-muted">
        <div className="relative">
          {/* College header with background image or color gradient fallback */}
          <div 
            className={`h-20 flex items-center justify-center relative overflow-hidden`}
            style={{
              background: college.imageUrl 
                ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${college.imageUrl})` 
                : `linear-gradient(to right, ${getDivisionColor(college.division)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* College name overlay for image header - always display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white font-bold text-sm text-center px-3 drop-shadow-md">
                {college.name}
              </h3>
            </div>
            
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
  };
  
  // Render full card
  const renderFullCard = () => {
    return (
      <Card className="overflow-hidden border border-muted">
        <div className="relative">
          {/* College header with background image or color gradient fallback */}
          <div 
            className={`h-24 flex items-center justify-center relative overflow-hidden`}
            style={{
              background: college.imageUrl 
                ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${college.imageUrl})` 
                : `linear-gradient(to right, ${getDivisionColor(college.division)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* College name overlay for image header - always display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white font-bold text-lg text-center px-4 drop-shadow-md">
                {college.name}
              </h3>
            </div>
            
            {/* Actions and division badge */}
            <div className="absolute top-0 right-0 p-2 z-10">
              <Badge className={getDivisionBadgeColor(college.division)}>
                {college.division}
              </Badge>
            </div>
            <div className="absolute top-0 left-0 p-2 z-10">
              <SaveCollegeButton 
                collegeId={college.id}
                initialSaved={isSaved}
              />
            </div>
          </div>
          
          <div className="px-5 py-4">
            {fullWidth ? (
              // Full-width layout
              <div className="flex flex-col md:flex-row md:gap-6">
                {/* Left column: School name and basic info */}
                <div className="flex-shrink-0 md:w-1/3 mb-4 md:mb-0">
                  <div className="flex flex-col mb-4">
                    <h3 className="text-xl font-semibold">{college.name}</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{`${college.city}, ${college.state}`}</span>
                    </div>
                  </div>

                  {/* College type details */}
                  <div className="space-y-3 text-sm">
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
                </div>
                
                {/* Middle column: Match scores and reasons */}
                <div className="flex-grow md:w-1/3 mb-4 md:mb-0">
                  {/* Match scores */}
                  <div className="space-y-4 mb-5">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Overall Match</span>
                        <span className="text-sm">{college.overallMatch}%</span>
                      </div>
                      <Progress value={college.overallMatch} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Academic</span>
                        <span className="text-sm">{college.academicMatch}%</span>
                      </div>
                      <Progress value={college.academicMatch} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Athletic</span>
                        <span className="text-sm">{college.athleticMatch}%</span>
                      </div>
                      <Progress value={college.athleticMatch} className="h-2" />
                    </div>
                  </div>
                  
                  {/* Conference info */}
                  {college.conference && (
                    <div className="mb-3">
                      <span className="text-sm font-medium">Conference: </span>
                      <Badge variant="outline">{college.conference}</Badge>
                    </div>
                  )}
                </div>
                
                {/* Right column: Matching reasons and actions */}
                <div className="flex-shrink-0 md:w-1/3">
                  {/* Matching reasons */}
                  {college.matchingReasons && college.matchingReasons.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-sm font-medium mb-2">Why it's a good match:</h4>
                      <ul className="space-y-1 text-sm">
                        {college.matchingReasons.slice(0, 4).map((reason, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="rounded-full bg-primary/10 p-0.5 mt-0.5">
                              <GraduationCap className="h-3 w-3 text-primary" />
                            </div>
                            <span>{reason}</span>
                          </li>
                        ))}
                        {college.matchingReasons.length > 4 && (
                          <li className="text-sm text-muted-foreground pl-5">
                            +{college.matchingReasons.length - 4} more reasons
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 mt-auto">
                    {college.website && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(college.website, '_blank');
                        }}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setDialogOpen(true)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Original layout for standard cards
              <>
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
                        <Badge variant="outline" className="text-xs">
                          +{college.matchingReasons.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex gap-2">
                  {college.website && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(college.website, '_blank');
                      }}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setDialogOpen(true)}
                  >
                    View Details
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  };

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
          {fullWidth ? (
            // Full-width layout
            <div className="flex flex-col md:flex-row md:gap-6">
              {/* Left column: School name and basic info */}
              <div className="flex-shrink-0 md:w-1/3 mb-4 md:mb-0">
                <div className="flex flex-col mb-4">
                  <h3 className="text-xl font-semibold">{college.name}</h3>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{`${college.city}, ${college.state}`}</span>
                  </div>
                </div>

                {/* College type details */}
                <div className="space-y-3 text-sm">
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
              </div>
              
              {/* Middle column: Match scores and reasons */}
              <div className="flex-grow md:w-1/3 mb-4 md:mb-0">
                {/* Match scores */}
                <div className="space-y-4 mb-5">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Overall Match</span>
                      <span className="text-sm">{college.overallMatch}%</span>
                    </div>
                    <Progress value={college.overallMatch} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Academic</span>
                      <span className="text-sm">{college.academicMatch}%</span>
                    </div>
                    <Progress value={college.academicMatch} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Athletic</span>
                      <span className="text-sm">{college.athleticMatch}%</span>
                    </div>
                    <Progress value={college.athleticMatch} className="h-2" />
                  </div>
                </div>
                
                {/* Conference info */}
                {college.conference && (
                  <div className="mb-3">
                    <span className="text-sm font-medium">Conference: </span>
                    <Badge variant="outline">{college.conference}</Badge>
                  </div>
                )}
              </div>
              
              {/* Right column: Matching reasons and actions */}
              <div className="flex-shrink-0 md:w-1/3">
                {/* Matching reasons */}
                {college.matchingReasons && college.matchingReasons.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-medium mb-2">Why it's a good match:</h4>
                    <ul className="space-y-1 text-sm">
                      {college.matchingReasons.slice(0, 4).map((reason, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="rounded-full bg-primary/10 p-0.5 mt-0.5">
                            <GraduationCap className="h-3 w-3 text-primary" />
                          </div>
                          <span>{reason}</span>
                        </li>
                      ))}
                      {college.matchingReasons.length > 4 && (
                        <li className="text-sm text-muted-foreground pl-5">
                          +{college.matchingReasons.length - 4} more reasons
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex gap-2 mt-auto">
                  {college.website && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(college.website, '_blank');
                      }}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setDialogOpen(true)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Original layout for standard cards
            <>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(college.website, '_blank');
                    }}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setDialogOpen(true)}
                >
                  View Details
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  // Add both the card and the detail dialog
  return (
    <>
      {variant === 'compact' ? renderCompactCard() : renderFullCard()}
      {renderDetailDialog()}
    </>
  );
}