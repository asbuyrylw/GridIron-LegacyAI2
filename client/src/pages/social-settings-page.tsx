import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { SocialLinks } from "@/components/social/social-links";
import { SOCIAL_PLATFORMS } from "@/lib/social-platforms";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, Settings, Link2, Shield, InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

// Form schema for social profile settings
const socialProfileSchema = z.object({
  connections: z.array(
    z.object({
      platform: z.string(),
      username: z.string().optional(),
      connected: z.boolean().default(false),
    })
  ),
  autoShare: z.object({
    achievements: z.boolean().default(true),
    combineMetrics: z.boolean().default(false),
    trainingPlans: z.boolean().default(false),
  }),
  privacySettings: z.object({
    showRealName: z.boolean().default(true),
    showSchool: z.boolean().default(true),
    allowTagging: z.boolean().default(true),
    allowComments: z.boolean().default(true),
  }),
});

type SocialProfileFormValues = z.infer<typeof socialProfileSchema>;

export default function SocialSettingsPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("connections");
  
  // Query social connections
  const { data: socialProfile, isLoading: isLoadingSocial } = useQuery<SocialProfileFormValues>({
    queryKey: ["/api/athlete/social-profile"],
    enabled: !!user?.athlete?.id,
  });
  
  // Form setup
  const form = useForm<SocialProfileFormValues>({
    resolver: zodResolver(socialProfileSchema),
    defaultValues: socialProfile || {
      connections: [],
      autoShare: {
        achievements: true,
        combineMetrics: false,
        trainingPlans: false,
      },
      privacySettings: {
        showRealName: true,
        showSchool: true,
        allowTagging: true,
        allowComments: true,
      },
    },
  });
  
  // Update form values when data is loaded
  useState(() => {
    if (socialProfile) {
      form.reset(socialProfile);
    }
  });
  
  // Update social profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: SocialProfileFormValues) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/athlete/${user?.athlete?.id}/social-profile`,
        values
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/athlete/social-profile"] 
      });
      toast({
        title: "Settings saved",
        description: "Your social media settings have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Submit handler
  const onSubmit = (values: SocialProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  // Format connections for the SocialLinks component
  const formatConnections = () => {
    const connections = form.watch("connections") || [];
    return connections.map(conn => ({
      platform: conn.platform,
      username: conn.username || "",
    }));
  };
  
  // Handle saving social links from the SocialLinks component
  const handleSaveSocialLinks = (links: { platform: string, username: string }[]) => {
    const currentConnections = form.getValues("connections") || [];
    
    // Map the links to connections
    const newConnections = links.map(link => {
      const existing = currentConnections.find(c => c.platform === link.platform);
      return {
        platform: link.platform,
        username: link.username,
        connected: !!link.username || (existing?.connected || false),
      };
    });
    
    // Add any existing platforms that weren't in the links array
    SOCIAL_PLATFORMS.forEach(platform => {
      if (!newConnections.some(c => c.platform === platform.id)) {
        const existing = currentConnections.find(c => c.platform === platform.id);
        if (existing) {
          newConnections.push(existing);
        } else {
          newConnections.push({
            platform: platform.id,
            username: "",
            connected: false,
          });
        }
      }
    });
    
    // Update the form
    form.setValue("connections", newConnections);
    
    // Save the changes
    onSubmit(form.getValues());
  };
  
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
    <div className="min-h-screen pb-16 relative bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 pt-6 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Social Media Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your social media profiles and sharing preferences
          </p>
        </div>
        
        <Tabs 
          defaultValue="connections" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="connections">
              <Link2 className="h-4 w-4 mr-2" />
              Social Connections
            </TabsTrigger>
            <TabsTrigger value="auto-share">
              <Settings className="h-4 w-4 mr-2" />
              Auto-Share Settings
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacy Settings
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="connections" className="space-y-6">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Connect Your Accounts</AlertTitle>
                  <AlertDescription>
                    Add your social media accounts to share your football journey with coaches, teammates, and fans.
                  </AlertDescription>
                </Alert>
                
                <SocialLinks 
                  links={formatConnections()} 
                  editable={true}
                  onSave={handleSaveSocialLinks}
                  title="Your Social Media Accounts"
                  description="Connect and manage your social media profiles"
                />
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Authenticate Accounts</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Authenticate Social Accounts</DialogTitle>
                      <DialogDescription>
                        Connect to your social media accounts to allow automatic posting.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        For each platform you want to connect, click the button below and follow the authentication process.
                      </p>
                      
                      <div className="space-y-2">
                        {SOCIAL_PLATFORMS.filter(p => p.needsAuthentication).map(platform => (
                          <Button
                            key={platform.id}
                            variant="outline"
                            className="w-full justify-start gap-2"
                            style={{ 
                              borderColor: platform.color,
                              color: platform.color
                            }}
                          >
                            <platform.icon className="h-5 w-5" />
                            Connect {platform.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="secondary">Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
              
              <TabsContent value="auto-share" className="space-y-6">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Auto-Share Settings</AlertTitle>
                  <AlertDescription>
                    Configure what updates are automatically shared to your social media accounts.
                  </AlertDescription>
                </Alert>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Automatic Sharing Preferences</CardTitle>
                    <CardDescription>
                      Choose what updates to automatically share to your social media accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="autoShare.achievements"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Achievement Updates
                              </FormLabel>
                              <FormDescription>
                                Share when you earn new achievements
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="autoShare.combineMetrics"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Combine Metrics
                              </FormLabel>
                              <FormDescription>
                                Share when you update your 40-yard dash, vertical jump, etc.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="autoShare.trainingPlans"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Training Completion
                              </FormLabel>
                              <FormDescription>
                                Share when you complete training plans
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="privacy" className="space-y-6">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Privacy Settings</AlertTitle>
                  <AlertDescription>
                    Control what information is shared on your social media posts and profiles.
                  </AlertDescription>
                </Alert>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Privacy</CardTitle>
                    <CardDescription>
                      Configure what information is shared on your social profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="privacySettings.showRealName"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Show Real Name
                              </FormLabel>
                              <FormDescription>
                                Display your real name on social media posts
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="privacySettings.showSchool"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Show School Information
                              </FormLabel>
                              <FormDescription>
                                Display your school in posts and profile
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="privacySettings.allowTagging"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Allow Tagging
                              </FormLabel>
                              <FormDescription>
                                Allow other users to tag you in posts
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="privacySettings.allowComments"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Allow Comments
                              </FormLabel>
                              <FormDescription>
                                Allow comments on your social media posts
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}