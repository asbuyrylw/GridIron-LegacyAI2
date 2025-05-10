import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { OnboardingData } from "@shared/schema";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { useOnboardingProgress } from "@/hooks/use-onboarding-progress";
import { ProgressRestoreDialog } from "@/components/onboarding/progress-restore-dialog";

// Import step components
import PersonalInfoForm from "@/components/onboarding/personal-info-form";
import FootballInfoForm from "@/components/onboarding/football-info-form";
import AthleticMetricsForm from "@/components/onboarding/athletic-metrics-form";
import AcademicProfileForm from "@/components/onboarding/academic-profile-form";
import StrengthConditioningForm from "@/components/onboarding/strength-conditioning-form";
import NutritionForm from "@/components/onboarding/nutrition-form";
import RecruitingGoalsForm from "@/components/onboarding/recruiting-goals-form";
import OnboardingComplete from "@/components/onboarding/onboarding-complete";

const steps = [
  { id: "personal", label: "Personal Info" },
  { id: "football", label: "Football Info" },
  { id: "metrics", label: "Athletic Metrics" },
  { id: "academic", label: "Academic Profile" },
  { id: "strength", label: "Strength & Conditioning" },
  { id: "nutrition", label: "Nutrition" },
  { id: "recruiting", label: "Recruiting Goals" },
  { id: "complete", label: "Complete" },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  
  // Use our custom hook for saving and loading progress
  const { 
    savedProgress, 
    saveProgress: saveProgressToServer, 
    isLoading: isProgressLoading 
  } = useOnboardingProgress();
  
  const isLastStep = currentStep === steps.length - 1;
  const progress = Math.round((currentStep / (steps.length - 1)) * 100);

  // Check for saved progress on mount
  useEffect(() => {
    if (savedProgress?.exists && !showProgressDialog) {
      setShowProgressDialog(true);
    }
  }, [savedProgress]);

  // Redirect to home if onboarding is already completed
  if (user?.athlete?.onboardingCompleted) {
    setLocation("/");
    return null;
  }
  
  // Restore progress handler
  const handleRestoreProgress = () => {
    if (savedProgress?.data) {
      setFormData(savedProgress.data);
      setCurrentStep(savedProgress.step);
    }
    setShowProgressDialog(false);
  };
  
  // Start fresh handler
  const handleStartFresh = () => {
    setShowProgressDialog(false);
  };

  const submitOnboardingMutation = useMutation({
    mutationFn: async (data: Partial<OnboardingData>) => {
      if (!user?.athlete?.id) throw new Error("Athlete ID is required");
      const res = await apiRequest("POST", `/api/athlete/${user.athlete.id}/onboarding`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Onboarding complete!",
        description: "Your profile has been set up successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Wait for a moment to show the success message before redirecting
      setTimeout(() => setLocation("/"), 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving your information",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const nextStep = (stepData: any) => {
    const updatedFormData = {
      ...formData,
      ...stepData,
    };
    
    setFormData(updatedFormData);
    
    if (isLastStep) {
      submitOnboardingMutation.mutate(updatedFormData);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };
  
  // Save onboarding progress
  const saveProgress = async () => {
    if (!user?.athlete?.id) {
      toast({
        title: "Error",
        description: "Cannot save progress - user not authenticated",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await saveProgressToServer(currentStep, formData);
      
      toast({
        title: "Progress Saved",
        description: "You can continue your onboarding later",
      });
      
      // Wait a moment to show the toast before redirecting
      setTimeout(() => setLocation("/"), 1500);
    } catch (error: any) {
      toast({
        title: "Error Saving Progress",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Progress Restore Dialog */}
      <ProgressRestoreDialog 
        open={showProgressDialog}
        onRestore={handleRestoreProgress}
        onStartFresh={handleStartFresh}
        timestamp={savedProgress?.timestamp}
        step={savedProgress?.step}
        totalSteps={steps.length}
      />
      
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b pb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1"></div>
              <div className="text-center flex-1">
                <CardTitle className="text-3xl font-extrabold">
                  Player Onboarding
                </CardTitle>
              </div>
              <div className="flex-1 flex justify-end">
                {currentStep > 0 && currentStep < steps.length - 1 && (
                  <Button variant="ghost" size="sm" onClick={saveProgress} className="text-xs">
                    Save & Exit
                  </Button>
                )}
              </div>
            </div>
            <CardDescription>
              Let's set up your profile to get personalized training, nutrition, and recruiting plans
            </CardDescription>
            
            <div className="mt-6">
              <StepIndicator steps={steps} currentStep={currentStep} className="mb-4" />
              <Progress value={progress} className="h-2" />
              <div className="mt-2 text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Tabs value={steps[currentStep].id} className="mt-4">
              <TabsList className="hidden">
                {steps.map(step => (
                  <TabsTrigger key={step.id} value={step.id}>{step.label}</TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="personal">
                <PersonalInfoForm onSubmit={nextStep} />
              </TabsContent>
              
              <TabsContent value="football">
                <FootballInfoForm 
                  onSubmit={nextStep} 
                  prevStep={prevStep}
                  initialData={formData.footballInfo}
                />
              </TabsContent>
              
              <TabsContent value="metrics">
                <AthleticMetricsForm 
                  onSubmit={nextStep} 
                  prevStep={prevStep}
                  initialData={formData.athleticMetrics}
                />
              </TabsContent>
              
              <TabsContent value="academic">
                <AcademicProfileForm 
                  onSubmit={nextStep} 
                  prevStep={prevStep}
                  initialData={formData.academicProfile}
                />
              </TabsContent>
              
              <TabsContent value="strength">
                <StrengthConditioningForm 
                  onSubmit={nextStep} 
                  prevStep={prevStep}
                  initialData={formData.strengthConditioning}
                />
              </TabsContent>
              
              <TabsContent value="nutrition">
                <NutritionForm 
                  onSubmit={nextStep} 
                  prevStep={prevStep}
                  initialData={formData.nutrition}
                />
              </TabsContent>
              
              <TabsContent value="recruiting">
                <RecruitingGoalsForm 
                  onSubmit={nextStep} 
                  prevStep={prevStep}
                  initialData={formData.recruitingGoals}
                />
              </TabsContent>
              
              <TabsContent value="complete">
                <OnboardingComplete
                  onSubmit={nextStep}
                  prevStep={prevStep}
                  isPending={submitOnboardingMutation.isPending}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}