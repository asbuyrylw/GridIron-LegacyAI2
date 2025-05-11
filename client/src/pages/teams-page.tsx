import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TeamList } from "@/components/team/team-list";
import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";
import { Redirect } from "wouter";

export default function TeamsPage() {
  const { user, isLoading } = useAuth();
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
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
  
  return (
    <div className="min-h-screen pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
          <UsersRound className="h-7 w-7 text-primary" />
          My Teams
        </h1>
        
        <TeamList />
      </main>
      
      <BottomNav />
    </div>
  );
}