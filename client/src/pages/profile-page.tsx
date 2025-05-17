import { useState } from "react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { ProfileExport } from "@/components/profile/profile-export";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Camera, 
  Link as LinkIcon, 
  Share2, 
  Trophy, 
  Save, 
  UserCircle,
  Edit,
  Calendar,
  Building,
  GraduationCap,
  BookOpen,
  Loader2,
  Ruler,
  Users,
  LineChart
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertAthlete } from "@shared/schema";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  position: z.string().min(1, "Position is required"),
  school: z.string().optional(),
  teamLevel: z.string().optional(), // replacing grade with teamLevel
  graduationYear: z.coerce.number().optional(),
  height: z.string().optional(),
  weight: z.coerce.number().optional(),
  bodyFat: z.coerce.number().optional(),
  gpa: z.coerce.number().optional(),
  actScore: z.coerce.number().optional(),
  preferredDivision: z.string().optional(), // replacing targetDivision
  hudlLink: z.string().url().optional().or(z.string().length(0)),
  maxPrepsLink: z.string().url().optional().or(z.string().length(0)),
  profileVisibility: z.boolean().default(true)
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  
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
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.athlete?.firstName || "",
      lastName: user?.athlete?.lastName || "",
      position: user?.athlete?.position || "",
      school: user?.athlete?.school || "",
      teamLevel: user?.athlete?.teamLevel || "",
      graduationYear: user?.athlete?.graduationYear || undefined,
      height: user?.athlete?.height || "",
      weight: user?.athlete?.weight || undefined,
      bodyFat: user?.athlete?.bodyFat || undefined,
      gpa: user?.athlete?.gpa || undefined,
      actScore: user?.athlete?.actScore || undefined,
      preferredDivision: "", // No direct field, would come from recruitingPreferences
      hudlLink: user?.athlete?.hudlLink || "",
      maxPrepsLink: user?.athlete?.maxPrepsLink || "",
      profileVisibility: user?.athlete?.profileVisibility !== false
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!athleteId) throw new Error("Athlete ID is required");
      
      const res = await apiRequest("PATCH", `/api/athlete/${athleteId}`, values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: ProfileFormValues) => {
    updateMutation.mutate(values);
  };
  
  const handleShareProfile = () => {
    toast({
      title: "Share Profile",
      description: "Profile sharing feature coming soon!",
    });
  };
  
  return (
    <div className="min-h-screen pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-montserrat font-bold">Recruiting Profile</h1>
          <div className="flex gap-2">
            <ProfileExport />
            <Button 
              onClick={handleShareProfile}
              size="sm"
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-300 mr-4 flex items-center justify-center overflow-hidden relative">
                <UserCircle className="h-16 w-16 text-gray-500" />
                <Button 
                  size="sm" 
                  className="absolute bottom-0 right-0 h-7 w-7 p-0 rounded-full"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              <div>
                <h3 className="font-montserrat font-bold text-xl">
                  {user?.athlete?.firstName} {user?.athlete?.lastName}
                </h3>
                <div className="text-muted-foreground">
                  {user?.athlete?.position} | {user?.athlete?.school}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="overview">
          <TabsList className="w-full mb-6 grid grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="overview">
              <UserCircle className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="development">
              <Ruler className="h-4 w-4 mr-2" />
              Development
            </TabsTrigger>
            <TabsTrigger value="teamsocial">
              <Users className="h-4 w-4 mr-2" />
              Teams & Social
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Camera className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCircle className="h-5 w-5 mr-2" />
                  Athlete Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Name:</dt>
                          <dd className="font-medium">{user?.athlete?.firstName} {user?.athlete?.lastName}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Position:</dt>
                          <dd className="font-medium">{user?.athlete?.position}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Height:</dt>
                          <dd className="font-medium">{user?.athlete?.height || "Not specified"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Weight:</dt>
                          <dd className="font-medium">{user?.athlete?.weight ? `${user.athlete.weight} lbs` : "Not specified"}</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Academic Information</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">School:</dt>
                          <dd className="font-medium">{user?.athlete?.school || "Not specified"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Graduation Year:</dt>
                          <dd className="font-medium">{user?.athlete?.graduationYear || "Not specified"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">GPA:</dt>
                          <dd className="font-medium">{user?.athlete?.gpa || "Not specified"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">ACT Score:</dt>
                          <dd className="font-medium">{user?.athlete?.actScore || "Not specified"}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">View your latest performance metrics and achievements.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-primary/5">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">40-Yard Dash</p>
                        <p className="text-2xl font-bold">{(user?.athlete as any)?.metrics?.fortyYard || "--"}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">Vertical Jump</p>
                        <p className="text-2xl font-bold">{(user?.athlete as any)?.metrics?.verticalJump || "--"}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">Bench Press</p>
                        <p className="text-2xl font-bold">{(user?.athlete as any)?.metrics?.benchPress || "--"}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">Squat</p>
                        <p className="text-2xl font-bold">{(user?.athlete as any)?.metrics?.squat || "--"}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Button className="w-full sm:w-auto mt-4" variant="outline">
                    <LineChart className="h-4 w-4 mr-2" />
                    View Full Stats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="development">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Ruler className="h-5 w-5 mr-2" />
                  Growth Prediction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Our AI-powered growth prediction model uses your current metrics, family history, and development patterns to estimate your future physical attributes.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Card className="bg-primary/5">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">Current Height</p>
                        <p className="text-2xl font-bold">{user?.athlete?.height || "--"}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-500/10">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">Predicted Height (18 years)</p>
                        <p className="text-2xl font-bold text-green-600">6'3"</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-500/10">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">Predicted Weight (18 years)</p>
                        <p className="text-2xl font-bold text-green-600">195 lbs</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Button className="w-full sm:w-auto mt-6">
                    Update Growth Factors
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Skill Progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Track your progress in key skills and abilities over time.
                  </p>
                  
                  <div className="space-y-4 mt-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Speed</span>
                        <span className="text-sm text-muted-foreground">75%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Strength</span>
                        <span className="text-sm text-muted-foreground">65%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Agility</span>
                        <span className="text-sm text-muted-foreground">80%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Game IQ</span>
                        <span className="text-sm text-muted-foreground">70%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full sm:w-auto mt-6" variant="outline">
                    View Development Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="teamsocial">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  My Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Manage your team memberships and connections.
                  </p>
                  
                  <div className="mt-4 space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Lincoln High Lions</h4>
                              <p className="text-sm text-muted-foreground">Varsity Football</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Elite QB Training</h4>
                              <p className="text-sm text-muted-foreground">Skills Development</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Button className="w-full sm:w-auto mt-4">
                    Join New Team
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Social Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Connect with teammates, coaches, and follow your network's activity.
                  </p>
                  
                  <div className="mt-4 space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center">
                              <p className="font-medium">Coach Williams</p>
                              <span className="text-xs text-muted-foreground ml-2">2 hours ago</span>
                            </div>
                            <p className="text-sm">Shared new training videos for the team. Check them out!</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center">
                              <p className="font-medium">Michael Johnson</p>
                              <span className="text-xs text-muted-foreground ml-2">1 day ago</span>
                            </div>
                            <p className="text-sm">Just set a new personal record in the 40-yard dash! 4.5 seconds!</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Button className="w-full sm:w-auto mt-6" variant="outline">
                    View Full Social Feed
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="branding">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Media & Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Upload and manage your game highlights, photos, and media to showcase your talents.
                  </p>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-muted aspect-video flex items-center justify-center">
                      <div className="text-center p-4">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Upload Game Highlights</p>
                      </div>
                    </Card>
                    
                    <Card className="bg-muted aspect-video flex items-center justify-center">
                      <div className="text-center p-4">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Upload Photos</p>
                      </div>
                    </Card>
                    
                    <Card className="bg-muted aspect-video flex items-center justify-center">
                      <div className="text-center p-4">
                        <LinkIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Link External Media</p>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">External Media Links</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Hudl Profile</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{user?.athlete?.hudlLink || "Not connected"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>MaxPreps Profile</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{user?.athlete?.maxPrepsLink || "Not connected"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Brand Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Manage your personal brand and social media presence.
                  </p>
                  
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Bio & Description</h3>
                      <p className="text-sm text-muted-foreground mb-2">Write a compelling bio that highlights your skills and achievements.</p>
                      <Card className="bg-muted p-3">
                        <p className="text-sm italic">
                          Quarterback with 3 years varsity experience. Strong arm, quick decision-making, and natural leadership abilities. 28 TDs in junior year with 3,200 passing yards.
                        </p>
                      </Card>
                      <Button size="sm" variant="outline" className="mt-2">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit Bio
                      </Button>
                    </div>
                    
                    <div className="pt-2">
                      <h3 className="font-semibold mb-2">Social Media Accounts</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Twitter/X</span>
                          <Button variant="outline" size="sm">Connect</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Instagram</span>
                          <Button variant="outline" size="sm">Connect</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>TikTok</span>
                          <Button variant="outline" size="sm">Connect</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserCircle className="h-5 w-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="QB, RB, WR, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height</FormLabel>
                            <FormControl>
                              <Input placeholder="6'2&quot;" {...field} />
                            </FormControl>
                            <FormDescription>Format: 6'2"</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (lbs)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="185" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bodyFat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Body Fat %</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="14" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      School Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="school"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Lincoln High School" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="teamLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team Level</FormLabel>
                            <FormControl>
                              <Input placeholder="Varsity Starter, JV, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="graduationYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Graduation Year</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2024" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gpa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GPA</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="3.8" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="actScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ACT Score</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="28" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="preferredDivision"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Division</FormLabel>
                          <FormControl>
                            <Input placeholder="D1, D2, D3, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2" />
                      Film & Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="hudlLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hudl Profile URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.hudl.com/profile/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxPrepsLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MaxPreps Profile URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.maxpreps.com/athlete/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LinkIcon className="h-5 w-5 mr-2" />
                      Profile Visibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="profileVisibility"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Public Profile
                            </FormLabel>
                            <FormDescription>
                              Make your profile visible to coaches and recruiters
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
                  </CardContent>
                </Card>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Recruiting Profile Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                        <UserCircle className="h-24 w-24 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="w-full md:w-2/3 space-y-4">
                      <div>
                        <h2 className="text-2xl font-montserrat font-bold">
                          {form.watch("firstName")} {form.watch("lastName")}
                        </h2>
                        <div className="text-lg text-muted-foreground">
                          {form.watch("position")} | Class of {form.watch("graduationYear")}
                        </div>
                        <div className="text-sm font-medium text-primary">
                          {form.watch("school")}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-md p-3">
                          <div className="text-xs text-muted-foreground uppercase font-semibold">Height</div>
                          <div className="font-mono text-lg">{form.watch("height") || "N/A"}</div>
                        </div>
                        <div className="border rounded-md p-3">
                          <div className="text-xs text-muted-foreground uppercase font-semibold">Weight</div>
                          <div className="font-mono text-lg">{form.watch("weight") ? `${form.watch("weight")} lbs` : "N/A"}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-md p-3">
                          <div className="text-xs text-muted-foreground uppercase font-semibold">GPA</div>
                          <div className="font-mono text-lg">{form.watch("gpa") || "N/A"}</div>
                        </div>
                        <div className="border rounded-md p-3">
                          <div className="text-xs text-muted-foreground uppercase font-semibold">ACT</div>
                          <div className="font-mono text-lg">{form.watch("actScore") || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-montserrat text-lg font-semibold mb-3">Film & Highlights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {form.watch("hudlLink") ? (
                        <a 
                          href={form.watch("hudlLink")} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <LinkIcon className="h-4 w-4 mr-2 text-primary" />
                          <span>Hudl Highlights</span>
                        </a>
                      ) : (
                        <div className="flex items-center p-3 border rounded-md text-muted-foreground">
                          <LinkIcon className="h-4 w-4 mr-2" />
                          <span>No Hudl profile linked</span>
                        </div>
                      )}
                      
                      {form.watch("maxPrepsLink") ? (
                        <a 
                          href={form.watch("maxPrepsLink")} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <LinkIcon className="h-4 w-4 mr-2 text-primary" />
                          <span>MaxPreps Stats</span>
                        </a>
                      ) : (
                        <div className="flex items-center p-3 border rounded-md text-muted-foreground">
                          <LinkIcon className="h-4 w-4 mr-2" />
                          <span>No MaxPreps profile linked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center text-sm">
                    <div className={`h-2 w-2 rounded-full mr-2 ${form.watch("profileVisibility") ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span>{form.watch("profileVisibility") ? "Public Profile" : "Private Profile"}</span>
                  </div>
                  <Button onClick={handleShareProfile} size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
