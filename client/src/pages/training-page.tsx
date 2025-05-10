import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { TrainingPlanView } from "@/components/training/training-plan";
import { GeneratePlan } from "@/components/training/generate-plan";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/social/share-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function TrainingPage() {
  const { user, isLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" />;
  }
  
  // Redirect if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Redirect to onboarding if not completed
  if (user?.athlete && !user.athlete.onboardingCompleted) {
    return <Redirect to="/onboarding" />;
  }
  
  const nextDay = () => {
    setSelectedDate(current => addDays(current, 1));
  };
  
  const previousDay = () => {
    setSelectedDate(current => subDays(current, 1));
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  return (
    <div className="min-h-screen pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-montserrat font-bold">Training Plan</h1>
            <ShareButton 
              title={`${user?.firstName || 'Athlete'}'s Football Training`}
              text={`Check out my football training plan for ${format(selectedDate, 'MMMM d')}, focusing on strength and agility! 🏈💪`}
              size="icon"
              variant="ghost"
            />
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="icon" onClick={previousDay}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <h2 className="text-lg font-medium">
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}, {format(selectedDate, 'MMMM d')}
          </h2>
          
          <Button variant="ghost" size="icon" onClick={nextDay}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs defaultValue="workout" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workout">Workout</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          </TabsList>
          <TabsContent value="workout">
            <GeneratePlan />
            <TrainingPlanView />
          </TabsContent>
          <TabsContent value="nutrition">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Nutrition Plan Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're working on personalized nutrition plans tailored to your position and goals.
                This feature will be available in our next update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
