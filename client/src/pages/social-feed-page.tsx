import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SocialFeed } from "@/components/social/social-feed";
import { ShareButton } from "@/components/social/share-button";
import { Loader2, Settings, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialConnection {
  platform: string;
  username: string;
  connected: boolean;
}

export default function SocialFeedPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("feed");
  
  // Query social connections
  const { data: connections = [], isLoading: isLoadingConnections } = useQuery<SocialConnection[]>({
    queryKey: ["/api/athlete/social-connections"],
    enabled: !!user?.athlete?.id,
  });
  
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
  
  return (
    <div className="min-h-screen pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-primary" />
              Team Social Feed
            </h1>
            <p className="text-muted-foreground">
              Share updates, achievements, and connect with your teammates
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/social-settings">
                <Settings className="h-4 w-4 mr-2" />
                Social Settings
              </a>
            </Button>
          </div>
        </div>
        
        <SocialFeed />
      </main>
      
      <BottomNav />
    </div>
  );
}