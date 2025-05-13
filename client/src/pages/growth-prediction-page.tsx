import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { HeightPredictor } from "@/components/growth/height-predictor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Calculator, TrendingUp, Dumbbell, Ruler, Info } from "lucide-react";

export default function GrowthPredictionPage() {
  const { user, isLoading } = useAuth();
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Redirect to onboarding if not completed (for athletes)
  if (user?.athlete && !user.athlete.onboardingCompleted) {
    return <Redirect to="/onboarding" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-6 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center mb-2">
            <TrendingUp className="mr-2 h-7 w-7" />
            Growth Prediction & Analysis
          </h1>
          <p className="text-muted-foreground">
            Predict your adult height, track your growth trajectory, and get position-specific recommendations
          </p>
        </div>
        
        <Alert className="mb-8 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle>Why Growth Prediction Matters</AlertTitle>
          <AlertDescription>
            Projected growth helps determine optimal training approaches, position fit, and can inform 
            recruitment conversations. We use the scientifically-validated Khamis-Roche method for prediction.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <HeightPredictor />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Dumbbell className="mr-2 h-5 w-5" />
                  Growth-Optimized Training
                </CardTitle>
                <CardDescription>
                  Adjust your training based on your growth phase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Early Growth Phase (70-85%)</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Focus on flexibility and proper movement patterns</li>
                      <li>Emphasize bodyweight exercises over heavy weights</li>
                      <li>Develop foundational skills for your position</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Peak Growth Phase (85-95%)</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Carefully monitor form as proportions change</li>
                      <li>Incorporate more position-specific drills</li>
                      <li>Balance strength work with flexibility</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Final Growth Phase (95%+)</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Increase strength training intensity</li>
                      <li>Fine-tune position-specific techniques</li>
                      <li>Focus on power development and explosiveness</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Ruler className="mr-2 h-5 w-5" />
                  Height & Recruitment
                </CardTitle>
                <CardDescription>
                  How height affects college recruitment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  While height is just one factor in recruitment, it can impact position suitability
                  and division-level opportunities. Understanding your projected height can help
                  you target the right colleges and positions.
                </p>
                
                <div className="text-sm font-medium mt-2">Key Considerations:</div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mt-1">
                  <li>Different positions have different height preferences</li>
                  <li>Late-bloomers should highlight growth potential to recruiters</li>
                  <li>Technical ability can often compensate for height limitations</li>
                  <li>Include predicted height in communications with coaches</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}