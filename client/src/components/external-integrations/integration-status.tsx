import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ReloadIcon } from "@radix-ui/react-icons";
import { FaTwitter, FaPlusCircle } from "react-icons/fa";
import { SiHuawei, SiMakerbot } from "react-icons/si";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface IntegrationStatus {
  twitter: {
    connected: boolean;
    lastSynced: string | null;
  };
  hudl: {
    connected: boolean;
    lastSynced: string | null;
    profileUrl: string | null;
  };
  maxPreps: {
    connected: boolean;
    lastSynced: string | null;
    profileUrl: string | null;
  };
}

export function IntegrationStatus() {
  const [activeTab, setActiveTab] = useState("twitter");
  const [isTwitterAuthorizing, setIsTwitterAuthorizing] = useState(false);
  const [isHudlAuthorizing, setIsHudlAuthorizing] = useState(false);
  const [isMaxPrepsAuthorizing, setIsMaxPrepsAuthorizing] = useState(false);
  const [maxPrepsId, setMaxPrepsId] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/integrations/status"],
    refetchInterval: 60000,
  });

  const status: IntegrationStatus = data || {
    twitter: { connected: false, lastSynced: null },
    hudl: { connected: false, lastSynced: null, profileUrl: null },
    maxPreps: { connected: false, lastSynced: null, profileUrl: null },
  };

  const syncTwitter = async () => {
    try {
      await apiRequest("/api/twitter/sync", { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/status"] });
      toast({
        title: "Twitter Synced",
        description: "Your Twitter posts have been synchronized.",
      });
    } catch (err) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync Twitter data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const syncHudl = async () => {
    try {
      await apiRequest("/api/hudl/sync", { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/status"] });
      toast({
        title: "Hudl Synced",
        description: "Your Hudl videos have been synchronized.",
      });
    } catch (err) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync Hudl data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const syncMaxPreps = async () => {
    try {
      await apiRequest("/api/maxpreps/sync", { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/status"] });
      toast({
        title: "MaxPreps Synced",
        description: "Your MaxPreps stats have been synchronized.",
      });
    } catch (err) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync MaxPreps data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const connectTwitter = async () => {
    try {
      setIsTwitterAuthorizing(true);
      const result = await apiRequest("/api/twitter/auth", { method: "GET" });
      
      if (result?.authUrl) {
        // Open the auth URL in a new window
        window.open(result.authUrl, "_blank", "width=600,height=800");
      }
    } catch (err) {
      toast({
        title: "Authorization Failed",
        description: "Failed to authorize Twitter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTwitterAuthorizing(false);
    }
  };

  const connectHudl = async () => {
    try {
      setIsHudlAuthorizing(true);
      const result = await apiRequest("/api/hudl/auth", { method: "GET" });
      
      if (result?.authUrl) {
        // Open the auth URL in a new window
        window.open(result.authUrl, "_blank", "width=600,height=800");
      }
    } catch (err) {
      toast({
        title: "Authorization Failed",
        description: "Failed to authorize Hudl. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsHudlAuthorizing(false);
    }
  };

  const connectMaxPreps = async () => {
    if (!maxPrepsId.trim()) {
      toast({
        title: "MaxPreps ID Required",
        description: "Please enter your MaxPreps ID to connect.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsMaxPrepsAuthorizing(true);
      await apiRequest("/api/maxpreps/authorize", { 
        method: "POST",
        body: { maxPrepsId: maxPrepsId.trim() }
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/status"] });
      
      toast({
        title: "MaxPreps Connected",
        description: "Your MaxPreps account has been successfully connected.",
      });
      
      setMaxPrepsId("");
    } catch (err) {
      toast({
        title: "Authorization Failed",
        description: "Failed to authorize MaxPreps. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMaxPrepsAuthorizing(false);
    }
  };

  const disconnectTwitter = async () => {
    try {
      await apiRequest("/api/twitter/disconnect", { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/status"] });
      toast({
        title: "Twitter Disconnected",
        description: "Your Twitter account has been disconnected.",
      });
    } catch (err) {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect Twitter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const disconnectHudl = async () => {
    try {
      await apiRequest("/api/hudl/disconnect", { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/status"] });
      toast({
        title: "Hudl Disconnected",
        description: "Your Hudl account has been disconnected.",
      });
    } catch (err) {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect Hudl. Please try again.",
        variant: "destructive",
      });
    }
  };

  const disconnectMaxPreps = async () => {
    try {
      await apiRequest("/api/maxpreps/disconnect", { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/status"] });
      toast({
        title: "MaxPreps Disconnected",
        description: "Your MaxPreps account has been disconnected.",
      });
    } catch (err) {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect MaxPreps. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <ReloadIcon className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading integration status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load integration status. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="text-2xl font-bold mb-4">
        External Platform Integrations
      </h2>
      <p className="text-muted-foreground mb-6">
        Connect your external accounts to synchronize your stats, videos, and posts.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="twitter">
            <FaTwitter className="mr-2 h-4 w-4" />
            Twitter
          </TabsTrigger>
          <TabsTrigger value="hudl">
            <SiHuawei className="mr-2 h-4 w-4" />
            Hudl
          </TabsTrigger>
          <TabsTrigger value="maxpreps">
            <SiMakerbot className="mr-2 h-4 w-4" />
            MaxPreps
          </TabsTrigger>
        </TabsList>

        <TabsContent value="twitter">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaTwitter className="mr-2 h-5 w-5 text-blue-500" />
                Twitter Integration
              </CardTitle>
              <CardDescription>
                Connect your Twitter account to share achievements and stats.
              </CardDescription>
              {status.twitter.connected && (
                <Badge variant="outline" className="ml-auto">
                  Connected
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {status.twitter.connected ? (
                <div>
                  <p className="mb-2">
                    Your Twitter account is connected to GridIron LegacyAI.
                  </p>
                  {status.twitter.lastSynced && (
                    <p className="text-sm text-muted-foreground">
                      Last synced: {new Date(status.twitter.lastSynced).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p>
                    Connect your Twitter account to automatically share your
                    achievements and stats with your followers.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {status.twitter.connected ? (
                <>
                  <Button variant="outline" onClick={syncTwitter}>
                    <ReloadIcon className="mr-2 h-4 w-4" />
                    Sync
                  </Button>
                  <Button variant="outline" onClick={disconnectTwitter}>
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button onClick={connectTwitter} disabled={isTwitterAuthorizing}>
                  {isTwitterAuthorizing ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    "Connect Twitter"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="hudl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SiHuawei className="mr-2 h-5 w-5 text-orange-500" />
                Hudl Integration
              </CardTitle>
              <CardDescription>
                Connect your Hudl account to import videos and highlights.
              </CardDescription>
              {status.hudl.connected && (
                <Badge variant="outline" className="ml-auto">
                  Connected
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {status.hudl.connected ? (
                <div>
                  <p className="mb-2">
                    Your Hudl account is connected to GridIron LegacyAI.
                  </p>
                  {status.hudl.profileUrl && (
                    <p className="mb-2">
                      <a
                        href={status.hudl.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Hudl Profile
                      </a>
                    </p>
                  )}
                  {status.hudl.lastSynced && (
                    <p className="text-sm text-muted-foreground">
                      Last synced: {new Date(status.hudl.lastSynced).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p>
                    Connect your Hudl account to import your game videos and
                    highlights directly into your profile.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {status.hudl.connected ? (
                <>
                  <Button variant="outline" onClick={syncHudl}>
                    <ReloadIcon className="mr-2 h-4 w-4" />
                    Sync Videos
                  </Button>
                  <Button variant="outline" onClick={disconnectHudl}>
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button onClick={connectHudl} disabled={isHudlAuthorizing}>
                  {isHudlAuthorizing ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    "Connect Hudl"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="maxpreps">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SiMakerbot className="mr-2 h-5 w-5 text-red-500" />
                MaxPreps Integration
              </CardTitle>
              <CardDescription>
                Connect your MaxPreps account to import your game stats.
              </CardDescription>
              {status.maxPreps.connected && (
                <Badge variant="outline" className="ml-auto">
                  Connected
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {status.maxPreps.connected ? (
                <div>
                  <p className="mb-2">
                    Your MaxPreps account is connected to GridIron LegacyAI.
                  </p>
                  {status.maxPreps.profileUrl && (
                    <p className="mb-2">
                      <a
                        href={status.maxPreps.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View MaxPreps Profile
                      </a>
                    </p>
                  )}
                  {status.maxPreps.lastSynced && (
                    <p className="text-sm text-muted-foreground">
                      Last synced: {new Date(status.maxPreps.lastSynced).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="mb-4">
                    Connect your MaxPreps account to import your game statistics
                    directly into your profile.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={maxPrepsId}
                      onChange={(e) => setMaxPrepsId(e.target.value)}
                      placeholder="Enter your MaxPreps ID"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {status.maxPreps.connected ? (
                <>
                  <Button variant="outline" onClick={syncMaxPreps}>
                    <ReloadIcon className="mr-2 h-4 w-4" />
                    Sync Stats
                  </Button>
                  <Button variant="outline" onClick={disconnectMaxPreps}>
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button onClick={connectMaxPreps} disabled={isMaxPrepsAuthorizing}>
                  {isMaxPrepsAuthorizing ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    "Connect MaxPreps"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}