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
  Loader2
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
        
        <Tabs defaultValue="edit">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="edit" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              <UserCircle className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit">
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
