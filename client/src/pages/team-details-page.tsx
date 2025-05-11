import { useState } from "react";
import { useRoute, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TeamDetail } from "@/components/team/team-detail";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function TeamDetailsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, params] = useRoute("/teams/:id");
  const teamId = params?.id;
  
  // Query for team
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: [`/api/teams/${teamId}`],
    enabled: !!teamId && !!user,
  });
  
  const isLoading = isAuthLoading || isTeamLoading;
  
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
  
  // Redirect to onboarding if not completed
  if (user?.athlete && !user.athlete.onboardingCompleted) {
    return <Redirect to="/onboarding" />;
  }
  
  // Redirect if team not found or user doesn't have access
  if (!team && !isLoading) {
    return <Redirect to="/teams" />;
  }
  
  return (
    <div className="min-h-screen pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        <div className="mb-6">
          <Button variant="ghost" className="gap-1 -ml-2 mb-2" onClick={() => window.history.back()}>
            <ChevronLeft className="h-4 w-4" />
            Back to Teams
          </Button>
          
          {teamId && <TeamDetail teamId={teamId} />}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}