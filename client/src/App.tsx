import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { AchievementProvider } from "@/components/achievements/achievement-provider";
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

// Landing Pages
import LandingIndex from "@/pages/landing/index";
import LandingPlayers from "@/pages/landing/landing-players";
import LandingParents from "@/pages/landing/landing-parents";
import LandingCoaches from "@/pages/landing/landing-coaches";
import LandingSchools from "@/pages/landing/landing-schools";

function Router() {
  const { user, isLoading } = useAuth();
  
  // If not logged in, redirect to landing page instead of auth page
  if (!isLoading && !user) {
    return (
      <Switch>
        {/* Public Routes */}
        <Route path="/auth" component={AuthPage} />
        
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
  
  return (
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
      
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Landing Pages (still accessible when logged in) */}
      <Route path="/landing" component={LandingIndex} />
      <Route path="/landing/players" component={LandingPlayers} />
      <Route path="/landing/parents" component={LandingParents} />
      <Route path="/landing/coaches" component={LandingCoaches} />
      <Route path="/landing/schools" component={LandingSchools} />
      
      <Route component={NotFound} />
    </Switch>
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
