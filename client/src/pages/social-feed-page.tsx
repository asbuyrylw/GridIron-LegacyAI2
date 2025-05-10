import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { SocialPostCreator } from "@/components/social/social-post-creator";
import { SocialPostsFeed } from "@/components/social/social-posts-feed";
import { SocialLinks } from "@/components/social/social-links";
import { ShareButton } from "@/components/social/share-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Settings, PlusCircle } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
  
  // Determine whether the athlete has configured social connections
  const hasSocialConnections = connections.some(conn => conn.connected || conn.username);
  
  return (
    <div className="min-h-screen pb-16 relative bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 pt-6 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Social Media
            </h1>
            <p className="text-muted-foreground">
              Share your football journey with coaches, teammates, and fans
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/social-settings"}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => setActiveTab("create")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="feed" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="create">Create Post</TabsTrigger>
            <TabsTrigger value="profile">Social Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed">
            {hasSocialConnections ? (
              <SocialPostsFeed />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center my-8">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Connect Your Social Accounts</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Connect your social media accounts to start sharing your football journey with coaches, teammates, and fans.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button onClick={() => setActiveTab("profile")}>
                    Connect Accounts
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = "/social-settings"}>
                    Go to Settings
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="create">
            <div className="grid gap-6">
              <SocialPostCreator connections={connections} />
              
              {!hasSocialConnections && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 dark:bg-amber-900 dark:border-amber-800 dark:text-amber-200">
                  <div className="flex gap-2 items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <div>
                      <h4 className="font-semibold mb-1">No Connected Accounts</h4>
                      <p className="text-sm">
                        You haven't connected any social media accounts yet. Your posts will be saved but won't be shared until you connect your accounts.
                      </p>
                      <Button
                        variant="link"
                        className="text-amber-800 dark:text-amber-200 p-0 h-auto mt-1 text-sm"
                        onClick={() => setActiveTab("profile")}
                      >
                        Connect your accounts now
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="profile">
            <SocialLinks
              links={connections.map(conn => ({ platform: conn.platform, username: conn.username }))}
              editable={true}
              title="Your Social Media Accounts"
              description="Connect your accounts to share your football journey"
              onSave={(links) => {
                // This would normally save to the backend
                console.log("Save links:", links);
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}