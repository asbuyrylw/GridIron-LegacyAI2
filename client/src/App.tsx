import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { AchievementProvider } from "@/components/achievements/achievement-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
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
import CollegeMatcherPage from "@/pages/college-matcher-page";
import RecruitingProfileBuilderPage from "@/pages/recruiting-profile-builder-page";
import ParentDashboard from "@/pages/parent-dashboard";
import CoachDashboard from "@/pages/coach-dashboard";
import ParentManagementPage from "@/pages/parent-management";
import ParentViewPage from "@/pages/parent-view";
import ParentAccessTester from "@/pages/parent-access-tester";

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
        <Route path="/parent-view" component={ParentViewPage} />
        <Route path="/parent-access-tester" component={ParentAccessTester} />
        
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
        <ProtectedRoute path="/social-feed" component={SocialFeedPage} />
        <ProtectedRoute path="/social-settings" component={SocialSettingsPage} />
        <ProtectedRoute path="/teams" component={TeamsPage} />
        <ProtectedRoute path="/teams/:id" component={TeamDetailsPage} />
        <ProtectedRoute path="/recruiting" component={RecruitingPage} />
        <ProtectedRoute path="/recruiting-profile-builder" component={RecruitingProfileBuilderPage} />
        <ProtectedRoute path="/college-matcher" component={CollegeMatcherPage} />
        <ProtectedRoute path="/parent-dashboard" component={ParentDashboard} />
        <ProtectedRoute path="/coach-dashboard" component={CoachDashboard} />
        <ProtectedRoute path="/parent-management" component={ParentManagementPage} />
        
        {/* Public Routes */}
        <Route path="/auth" component={AuthPage} />
        <Route path="/parent-view" component={ParentViewPage} />
        
        {/* Landing Pages (still accessible when logged in) */}
        <Route path="/landing" component={LandingIndex} />
        <Route path="/landing/players" component={LandingPlayers} />
        <Route path="/landing/parents" component={LandingParents} />
        <Route path="/landing/coaches" component={LandingCoaches} />
        <Route path="/landing/schools" component={LandingSchools} />
        
        <Route component={NotFound} />
      </Switch>
      
      {/* Only show bottom nav when user is logged in and has completed onboarding */}
      {!needsOnboarding && !location.startsWith("/landing") && location !== "/auth" && <BottomNav />}
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
