import React, { lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { AchievementProvider } from "@/components/achievements/achievement-provider";
import { SideNav } from "@/components/layout/side-nav";
import { PageContainer } from "@/components/layout/page-container";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import OnboardingPage from "@/pages/onboarding-page";
import TrainingPage from "@/pages/training-page";
import StatsPage from "@/pages/stats-page";
import ProfilePage from "@/pages/profile-page";
import SettingsPage from "@/pages/settings-page";
import NutritionPage from "@/pages/nutrition-page";
import SocialAchievementsPage from "@/pages/social-achievements-page";
import AchievementsPage from "@/pages/achievements-page";
import SocialFeedPage from "@/pages/social-feed-page";
import SocialSettingsPage from "@/pages/social-settings-page";
import TeamsPage from "@/pages/teams-page";
import TeamDetailsPage from "@/pages/team-details-page";
import RecruitingPage from "@/pages/recruiting-page";
import EnhancedCollegeMatcherPage from "@/pages/enhanced-college-matcher-fixed";
import RecruitingProfileBuilderPage from "@/pages/recruiting-profile-builder-page";
// Removing ParentDashboard import as we're using email-only approach
import CoachDashboard from "@/pages/coach-dashboard";
import ParentManagementPage from "@/pages/parent-management";
// Removing ParentViewPage import as we're using email-only approach 
import ParentAccessTester from "@/pages/parent-access-tester";
import ParentNotificationTester from "@/pages/parent-notification-tester";
import ParentReportsPage from "@/pages/parent-reports-page";
import WebSocketTester from "@/pages/websocket-tester";
import EmailTestPage from "@/pages/email-test-page";
// Import GameificationPage component directly to fix lazy loading issue
import GameificationPage from "@/pages/gamification-page";
import GrowthPredictionPage from "@/pages/growth-prediction-page";

// Landing Pages
import LandingIndex from "@/pages/landing/index";
import LandingPlayers from "@/pages/landing/landing-players";
import LandingParents from "@/pages/landing/landing-parents";
import LandingCoaches from "@/pages/landing/landing-coaches";
import LandingSchools from "@/pages/landing/landing-schools";

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Loading state - show a spinning loader
  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" />;
  }
  
  // If not logged in, redirect to landing page instead of auth page
  if (!user) {
    return (
      <Switch>
        {/* Public Routes */}
        <Route path="/auth" component={AuthPage} />
        {/* Removed parent-view as we're using email-only approach */}
        <Route path="/parent-access-tester" component={ParentAccessTester} />
        <Route path="/websocket-tester" component={WebSocketTester} />
        
        {/* Landing Pages */}
        <Route path="/landing/players" component={LandingPlayers} />
        <Route path="/landing/parents" component={LandingParents} />
        <Route path="/landing/coaches" component={LandingCoaches} />
        <Route path="/landing/schools" component={LandingSchools} />
        <Route path="/landing" component={LandingIndex} />
        <Route path="/" component={LandingIndex} />
        
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  // Check if user needs to complete onboarding
  const needsOnboarding = user.athlete && !user.athlete.onboardingCompleted;
  
  return (
    <>
      <Switch>
        {/* Protected Routes */}
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/onboarding" component={OnboardingPage} />
        <ProtectedRoute path="/training" component={TrainingPage} />
        <ProtectedRoute path="/nutrition" component={NutritionPage} />
        <ProtectedRoute path="/stats" component={StatsPage} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <ProtectedRoute path="/social-achievements" component={SocialAchievementsPage} />
        <ProtectedRoute path="/achievements" component={AchievementsPage} />
        <ProtectedRoute path="/gamification" component={GameificationPage} />
        <ProtectedRoute path="/social-feed" component={SocialFeedPage} />
        <ProtectedRoute path="/social-settings" component={SocialSettingsPage} />
        <ProtectedRoute path="/teams" component={TeamsPage} />
        <ProtectedRoute path="/teams/:id" component={TeamDetailsPage} />
        <ProtectedRoute path="/recruiting" component={RecruitingPage} />
        <ProtectedRoute path="/recruiting-profile-builder" component={RecruitingProfileBuilderPage} />
        <ProtectedRoute path="/college-matcher" component={EnhancedCollegeMatcherPage} />
        <ProtectedRoute path="/growth-prediction" component={GrowthPredictionPage} />
        {/* Removed parent-dashboard as we're using email-only approach */}
        <ProtectedRoute path="/coach-dashboard" component={CoachDashboard} />
        <ProtectedRoute path="/parent-reports" component={ParentReportsPage} />
        <ProtectedRoute path="/parent-management" component={ParentManagementPage} />
        <ProtectedRoute path="/parent-access-tester" component={ParentAccessTester} />
        <ProtectedRoute path="/parent-notification-tester" component={ParentNotificationTester} />
        <ProtectedRoute path="/email-test" component={EmailTestPage} />
        
        {/* Public Routes */}
        <Route path="/auth" component={AuthPage} />
        {/* Removed parent-view as we're using email-only approach */}
        
        {/* Landing Pages (still accessible when logged in) */}
        <Route path="/landing" component={LandingIndex} />
        <Route path="/landing/players" component={LandingPlayers} />
        <Route path="/landing/parents" component={LandingParents} />
        <Route path="/landing/coaches" component={LandingCoaches} />
        <Route path="/landing/schools" component={LandingSchools} />
        
        <Route component={NotFound} />
      </Switch>
      
      {/* Only show side nav when user is logged in and has completed onboarding */}
      {!needsOnboarding && !location.startsWith("/landing") && location !== "/auth" && <SideNav />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AchievementProvider>
          <Router />
          <Toaster />
        </AchievementProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
