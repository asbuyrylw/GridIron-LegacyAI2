import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import TrainingPage from "@/pages/training-page";
import StatsPage from "@/pages/stats-page";
import ProfilePage from "@/pages/profile-page";
import SettingsPage from "@/pages/settings-page";

// Landing Pages
import LandingIndex from "@/pages/landing/index";
import LandingPlayers from "@/pages/landing/landing-players";
import LandingParents from "@/pages/landing/landing-parents";
import LandingCoaches from "@/pages/landing/landing-coaches";
import LandingSchools from "@/pages/landing/landing-schools";

function Router() {
  return (
    <Switch>
      {/* Protected Routes */}
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/training" component={TrainingPage} />
      <ProtectedRoute path="/stats" component={StatsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Landing Pages */}
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
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
