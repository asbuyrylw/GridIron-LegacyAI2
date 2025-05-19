import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useDevelopmentPlan } from "@/hooks/use-development-plan";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar, CheckCircle, Clock, BarChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function DevelopmentPlanPage() {
  const { user, athlete, isLoading: isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState("long-term");
  const [location, setLocation] = useLocation();

  // Navigate to login page if user is not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      setLocation("/login");
    }
  }, [user, isUserLoading, setLocation]);

  // If user is logged in but not an athlete, redirect to home
  useEffect(() => {
    if (user && !athlete && !isUserLoading) {
      setLocation("/");
    }
  }, [user, athlete, isUserLoading, setLocation]);

  // Only use the hook if we have an athlete
  const athleteId = athlete?.id;
  const developmentPlanData = useDevelopmentPlan(athleteId);
  
  // Destructure values with defaults to prevent errors
  const {
    developmentPlan = null,
    isLoading = false,
    error = null,
    generateDevelopmentPlan = () => {},
    isGenerating = false,
    generateProgressReport = () => {},
    progressReport = null,
    isGeneratingProgressReport = false,
    generateAnnualReview = () => {},
    annualReview = null,
    isGeneratingAnnualReview = false
  } = athleteId ? developmentPlanData : {};

  if (isUserLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      </div>
    );
  }

  if (!user || !athlete) {
    return null; // This will be handled by the useEffect redirects
  }

  const handleGeneratePlan = () => {
    generateDevelopmentPlan();
  };

  const handleGenerateProgressReport = () => {
    generateProgressReport();
  };

  const handleGenerateAnnualReview = () => {
    generateAnnualReview();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Development Plan</h1>
          <p className="text-muted-foreground">
            Your personalized football development plan based on your profile and metrics
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 space-x-2">
          <Button 
            variant="default" 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate New Plan"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load development plan. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {!developmentPlan && !isLoading && !isGenerating && (
        <Card className="p-6 mb-6">
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Development Plan Yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate your personalized development plan to see a year-by-year roadmap to achieve your football goals.
            </p>
            <Button onClick={handleGeneratePlan} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Development Plan"}
            </Button>
          </div>
        </Card>
      )}

      {(isLoading || isGenerating) && (
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </Card>
      )}

      {developmentPlan && (
        <>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
              <TabsTrigger value="long-term">Long-Term Plan</TabsTrigger>
              <TabsTrigger value="current-year">Current Year</TabsTrigger>
              <TabsTrigger value="analysis">Analysis & Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="long-term" className="mt-4">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Long-Term Development Plan</h2>
                <p className="text-muted-foreground mb-6">
                  Your comprehensive development roadmap from now until your senior year
                </p>

                <div className="space-y-6">
                  {developmentPlan.longTermPlan?.yearByYear?.map((yearPlan, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="text-xl font-semibold mb-2">{yearPlan.year}: {yearPlan.grade} Grade</h3>
                      <p className="mb-4">{yearPlan.overview}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm uppercase text-muted-foreground mb-2">Key Goals</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {yearPlan.goals?.map((goal, i) => (
                              <li key={i}>{goal}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm uppercase text-muted-foreground mb-2">Focus Areas</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {yearPlan.focusAreas?.map((area, i) => (
                              <li key={i}>{area}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {yearPlan.metricTargets && (
                        <div className="mt-4">
                          <h4 className="font-medium text-sm uppercase text-muted-foreground mb-2">Metric Targets</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Metric</TableHead>
                                <TableHead>Current</TableHead>
                                <TableHead>Target</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(yearPlan.metricTargets).map(([metric, values], i) => (
                                <TableRow key={i}>
                                  <TableCell className="font-medium">{metric}</TableCell>
                                  <TableCell>{values.current || 'N/A'}</TableCell>
                                  <TableCell>{values.target}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="current-year" className="mt-4">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Current Year Development Plan</h2>
                <p className="text-muted-foreground mb-4">
                  Detailed quarterly breakdown of your development for this year
                </p>

                <div className="flex items-center mb-6">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="text-sm">Next progress check: {developmentPlan.currentYearPlan?.nextUpdateDate || 'Not scheduled'}</span>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {developmentPlan.currentYearPlan?.quarters?.map((quarter, index) => (
                    <AccordionItem key={index} value={`quarter-${index + 1}`}>
                      <AccordionTrigger className="text-lg font-semibold">
                        Q{index + 1}: {quarter.focus}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <p>{quarter.overview}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Training Focus</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {quarter.trainingFocus?.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Nutrition Focus</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {quarter.nutritionFocus?.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Key Activities</h4>
                            <ul className="space-y-2">
                              {quarter.keyActivities?.map((activity, i) => (
                                <li key={i} className="flex items-start">
                                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                                  <span>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {quarter.metrics && (
                            <div>
                              <h4 className="font-medium mb-2">Target Metrics</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {Object.entries(quarter.metrics).map(([metric, target], i) => (
                                  <li key={i}><span className="font-medium">{metric}:</span> {target}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Analysis & Reports</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">Progress Report</h3>
                        <p className="text-sm text-muted-foreground">Compare your current metrics to your plan</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleGenerateProgressReport}
                        disabled={isGeneratingProgressReport}
                      >
                        {isGeneratingProgressReport ? "Generating..." : "Generate Report"}
                      </Button>
                    </div>
                    
                    {progressReport ? (
                      <div>
                        <h4 className="font-medium mb-2">Progress Summary</h4>
                        <p className="mb-4">{progressReport.summary}</p>
                        
                        <h4 className="font-medium mb-2">Key Metrics</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Metric</TableHead>
                              <TableHead>Target</TableHead>
                              <TableHead>Current</TableHead>
                              <TableHead>Progress</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {progressReport.metrics?.map((metric, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{metric.name}</TableCell>
                                <TableCell>{metric.target}</TableCell>
                                <TableCell>{metric.current}</TableCell>
                                <TableCell>
                                  <span className={metric.onTrack ? "text-green-500" : "text-yellow-500"}>
                                    {metric.progress}%
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart className="h-12 w-12 mx-auto mb-3" />
                        <p>Generate a progress report to compare your current metrics with your development plan goals.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">Annual Review</h3>
                        <p className="text-sm text-muted-foreground">Yearly evaluation and college projections</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleGenerateAnnualReview}
                        disabled={isGeneratingAnnualReview}
                      >
                        {isGeneratingAnnualReview ? "Generating..." : "Generate Review"}
                      </Button>
                    </div>
                    
                    {annualReview ? (
                      <div>
                        <h4 className="font-medium mb-2">Year in Review</h4>
                        <p className="mb-4">{annualReview.summary}</p>
                        
                        <h4 className="font-medium mb-2">Key Accomplishments</h4>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                          {annualReview.accomplishments?.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                        
                        <h4 className="font-medium mb-2">College Projections</h4>
                        <p>{annualReview.collegeProjection}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-3" />
                        <p>Generate an annual review to see your yearly progress and updated college football projections.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}