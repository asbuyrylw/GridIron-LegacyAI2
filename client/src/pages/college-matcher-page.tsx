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
  matchedSchools: MatchedSchool[];
  feedback: string[];
}

interface MatchedSchool {
  name: string;
  division: string;
  region: string;
  academicMatch: number;
  athleticMatch: number;
  overallMatch: number;
  programs?: string[];
  location?: string;
  positionNeeds?: boolean;
}

export default function CollegeMatcherPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    region: "",
    major: "",
    maxDistance: "",
    publicOnly: false,
    privateOnly: false,
  });
  
  // Get college matches
  const {
    data: collegeMatches,
    isLoading,
    error,
    refetch,
  } = useQuery<CollegeMatchResult>({
    queryKey: [
      "/api/college-matcher/matches",
      filters.region,
      filters.major,
      filters.maxDistance,
      filters.publicOnly,
      filters.privateOnly,
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
                        <SelectItem value="South">South</SelectItem>
                        <SelectItem value="Midwest">Midwest</SelectItem>
                        <SelectItem value="West">West</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="major" className="mb-1 block">
                      Preferred Major
                    </Label>
                    <Input
                      id="major"
                      value={filters.major}
                      onChange={(e) =>
                        handleFilterChange("major", e.target.value)
                      }
                      placeholder="e.g. Business, Engineering"
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

                <div className="flex items-center gap-6 mt-4">
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
                </div>

                <Button onClick={applyFilters} className="mt-4">
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
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
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
                                    <div>
                                      <div className="flex items-center gap-1 text-xs">
                                        <MapPin className="w-3 h-3 text-red-500" />
                                        <span>
                                          {school.location || "Location N/A"}
                                        </span>
                                      </div>
                                      {school.programs && (
                                        <div className="mt-1">
                                          <span className="text-xs font-semibold">
                                            Programs:
                                          </span>
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
                                    </div>
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