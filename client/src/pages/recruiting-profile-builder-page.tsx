import { useState } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Check, 
  Edit2, 
  FileText, 
  GraduationCap, 
  HelpCircle, 
  Image as ImageIcon, 
  Info, 
  Loader2, 
  MailQuestion, 
  MessageCircle, 
  PlusCircle, 
  Save, 
  Share2,
  Upload,
  Video,
  X
} from "lucide-react";

// Form schema
const recruitingProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  position: z.string().min(1, "Position is required"),
  height: z.string().optional(),
  weight: z.number().positive().optional(),
  graduationYear: z.number().positive().optional(),
  gpa: z.number().min(0).max(4).optional(),
  actScore: z.number().min(0).max(36).optional(),
  school: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  hudlLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  maxPrepsLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  achievements: z.array(z.string()).optional(),
  personalStatement: z.string().max(1000, "Personal statement must be less than 1000 characters").optional(),
  coachReferenceEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  coachReferenceName: z.string().optional(),
  highlightVideoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

// Corresponding type
type RecruitingProfileData = z.infer<typeof recruitingProfileSchema>;

export default function RecruitingProfileBuilderPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch athlete profile data
  const { data: athlete, isLoading: isLoadingAthlete } = useQuery({
    queryKey: ["/api/athlete/me"],
    enabled: Boolean(user),
  });

  // Fetch recruiting profile specific data
  const { data: recruitingProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/recruiting/profile"],
    enabled: Boolean(user),
  });

  // Calculate profile completeness
  const calculateProfileCompleteness = (data: any) => {
    const fields = Object.keys(data);
    const requiredFields = [
      "firstName", "lastName", "position", "height", "weight", 
      "graduationYear", "gpa", "school", "personalStatement", 
      "hudlLink", "achievements"
    ];
    
    let completedFields = 0;
    requiredFields.forEach(field => {
      if (data[field] && 
         (typeof data[field] === 'string' ? data[field].length > 0 : true) &&
         (Array.isArray(data[field]) ? data[field].length > 0 : true)) {
        completedFields++;
      }
    });
    
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  // Form setup with default values
  const form = useForm<RecruitingProfileData>({
    resolver: zodResolver(recruitingProfileSchema),
    defaultValues: {
      firstName: athlete?.firstName || "",
      lastName: athlete?.lastName || "",
      position: athlete?.position || "",
      height: athlete?.height || "",
      weight: athlete?.weight || undefined,
      graduationYear: athlete?.graduationYear || undefined,
      gpa: athlete?.gpa || undefined,
      actScore: athlete?.actScore || undefined,
      school: athlete?.school || "",
      city: "",
      state: "",
      hudlLink: athlete?.hudlLink || "",
      maxPrepsLink: athlete?.maxPrepsLink || "",
      achievements: recruitingProfile?.achievements || [],
      personalStatement: recruitingProfile?.personalStatement || "",
      coachReferenceEmail: recruitingProfile?.coachReferenceEmail || "",
      coachReferenceName: recruitingProfile?.coachReferenceName || "",
      highlightVideoUrl: recruitingProfile?.highlightVideoUrl || "",
    },
  });

  // Update form values when data is loaded
  React.useEffect(() => {
    if (athlete && recruitingProfile) {
      form.reset({
        ...form.getValues(),
        firstName: athlete.firstName || "",
        lastName: athlete.lastName || "",
        position: athlete.position || "",
        height: athlete.height || "",
        weight: athlete.weight || undefined,
        graduationYear: athlete.graduationYear || undefined,
        gpa: athlete.gpa || undefined,
        actScore: athlete.actScore || undefined,
        school: athlete.school || "",
        city: recruitingProfile.city || "",
        state: recruitingProfile.state || "",
        hudlLink: athlete.hudlLink || "",
        maxPrepsLink: athlete.maxPrepsLink || "",
        achievements: recruitingProfile.achievements || [],
        personalStatement: recruitingProfile.personalStatement || "",
        coachReferenceEmail: recruitingProfile.coachReferenceEmail || "",
        coachReferenceName: recruitingProfile.coachReferenceName || "",
        highlightVideoUrl: recruitingProfile.highlightVideoUrl || "",
      });

      // Calculate profile completeness
      const combinedData = {
        ...athlete,
        ...recruitingProfile
      };
      const completeness = calculateProfileCompleteness(combinedData);
      setProfileCompleteness(completeness);
    }
  }, [athlete, recruitingProfile, form]);

  // Save profile mutation
  const saveProfile = useMutation({
    mutationFn: async (data: RecruitingProfileData) => {
      // Save athlete basic info
      const athleteData = {
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        height: data.height,
        weight: data.weight,
        graduationYear: data.graduationYear,
        gpa: data.gpa,
        actScore: data.actScore,
        school: data.school,
        hudlLink: data.hudlLink,
        maxPrepsLink: data.maxPrepsLink,
      };
      
      await apiRequest("PATCH", "/api/athlete/me", athleteData);
      
      // Save recruiting profile specific data
      const recruitingData = {
        city: data.city,
        state: data.state,
        achievements: data.achievements,
        personalStatement: data.personalStatement,
        coachReferenceEmail: data.coachReferenceEmail,
        coachReferenceName: data.coachReferenceName,
        highlightVideoUrl: data.highlightVideoUrl,
      };
      
      return await apiRequest("PATCH", "/api/recruiting/profile", recruitingData);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your recruiting profile has been successfully updated!",
        variant: "default",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/athlete/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recruiting/profile"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    },
  });

  // Submit handler
  const onSubmit = (data: RecruitingProfileData) => {
    saveProfile.mutate(data);
  };

  // Add achievement
  const [newAchievement, setNewAchievement] = useState("");
  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      const currentAchievements = form.getValues("achievements") || [];
      form.setValue("achievements", [...currentAchievements, newAchievement]);
      setNewAchievement("");
    }
  };

  // Remove achievement
  const handleRemoveAchievement = (index: number) => {
    const currentAchievements = form.getValues("achievements") || [];
    const updatedAchievements = [...currentAchievements];
    updatedAchievements.splice(index, 1);
    form.setValue("achievements", updatedAchievements);
  };

  if (isLoadingAthlete || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Recruiting Profile Builder | GridIron LegacyAI</title>
      </Helmet>

      <div className="container py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Recruiting Profile Builder</h1>
              <p className="text-muted-foreground">
                Create a compelling profile to showcase your talents to college recruiters
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <a href="/recruiting">
                  <Share2 className="h-4 w-4 mr-2" />
                  Back to Recruiting Dashboard
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Completeness */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Profile Completeness</CardTitle>
                <CardDescription>
                  Complete your profile to increase visibility to college coaches
                </CardDescription>
              </div>
              <div>
                <Badge variant={profileCompleteness >= 80 ? "success" : profileCompleteness >= 50 ? "warning" : "destructive"}>
                  {profileCompleteness}% Complete
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={profileCompleteness} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginning</span>
              <span>In Progress</span>
              <span>Complete</span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Recruiting Profile</CardTitle>
                <CardDescription>
                  Manage all aspects of your recruiting profile
                </CardDescription>
              </div>
              <div>
                <Button 
                  variant={isEditing ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="personal">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="athletic">
                      <Video className="h-4 w-4 mr-2" />
                      Athletic
                    </TabsTrigger>
                    <TabsTrigger value="academic">
                      <FileText className="h-4 w-4 mr-2" />
                      Academic
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing} 
                                placeholder="Your first name" 
                              />
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
                              <Input 
                                {...field} 
                                disabled={!isEditing} 
                                placeholder="Your last name" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="school"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>High School</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing} 
                                placeholder="Your high school name" 
                              />
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
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value || ''} 
                                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                disabled={!isEditing} 
                                placeholder="Year you'll graduate" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing} 
                                placeholder="Your city" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing} 
                                placeholder="Your state" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="personalStatement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personal Statement</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              disabled={!isEditing} 
                              placeholder="Tell coaches about yourself, your goals, and why you'd be a good fit for their program" 
                              className="min-h-32"
                            />
                          </FormControl>
                          <FormDescription>
                            Limit: 1000 characters. Currently: {field.value?.length || 0}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="coachReferenceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coach Reference Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing} 
                                placeholder="Your coach's name" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="coachReferenceEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coach Reference Email</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing} 
                                placeholder="Your coach's email" 
                                type="email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="athletic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Position</FormLabel>
                            <Select
                              disabled={!isEditing}
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Quarterback (QB)">Quarterback (QB)</SelectItem>
                                <SelectItem value="Running Back (RB)">Running Back (RB)</SelectItem>
                                <SelectItem value="Wide Receiver (WR)">Wide Receiver (WR)</SelectItem>
                                <SelectItem value="Tight End (TE)">Tight End (TE)</SelectItem>
                                <SelectItem value="Offensive Line (OL)">Offensive Line (OL)</SelectItem>
                                <SelectItem value="Defensive Line (DL)">Defensive Line (DL)</SelectItem>
                                <SelectItem value="Linebacker (LB)">Linebacker (LB)</SelectItem>
                                <SelectItem value="Cornerback (CB)">Cornerback (CB)</SelectItem>
                                <SelectItem value="Safety (S)">Safety (S)</SelectItem>
                                <SelectItem value="Kicker (K)">Kicker (K)</SelectItem>
                                <SelectItem value="Punter (P)">Punter (P)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (inches)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={!isEditing} 
                                  placeholder="Height in inches" 
                                />
                              </FormControl>
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
                                <Input 
                                  type="number" 
                                  {...field} 
                                  value={field.value || ''} 
                                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  disabled={!isEditing} 
                                  placeholder="Weight in lbs" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Achievements & Awards</h3>
                      
                      {isEditing && (
                        <div className="flex gap-2 mb-3">
                          <Input 
                            value={newAchievement}
                            onChange={(e) => setNewAchievement(e.target.value)}
                            placeholder="Add an achievement, award, or honor" 
                            className="flex-1"
                          />
                          <Button type="button" onClick={handleAddAchievement}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {form.getValues("achievements")?.length ? (
                          form.getValues("achievements")?.map((achievement, index) => (
                            <div key={index} className="flex items-center justify-between border rounded-md p-2">
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2">
                                  {index + 1}
                                </Badge>
                                {achievement}
                              </div>
                              {isEditing && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveAchievement(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-muted-foreground text-sm italic">
                            No achievements added yet
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">External Links</h3>
                      
                      <FormField
                        control={form.control}
                        name="hudlLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              Hudl Profile
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Add your Hudl profile link for recruiters to view your highlights</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing} 
                                placeholder="https://www.hudl.com/profile/..." 
                              />
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
                            <FormLabel className="flex items-center">
                              MaxPreps Profile
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Add your MaxPreps profile link to showcase your statistics</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing} 
                                placeholder="https://www.maxpreps.com/athlete/..." 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="highlightVideoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              Highlight Video URL
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Add a direct link to your YouTube or Vimeo highlight video</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing} 
                                placeholder="https://www.youtube.com/watch?v=..." 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="academic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gpa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              GPA
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Enter your unweighted GPA on a 4.0 scale</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                min="0"
                                max="4"
                                {...field} 
                                value={field.value || ''} 
                                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={!isEditing} 
                                placeholder="e.g. 3.5" 
                              />
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
                            <FormLabel className="flex items-center">
                              ACT Score
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Enter your composite ACT score (1-36)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                max="36"
                                {...field} 
                                value={field.value || ''} 
                                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                disabled={!isEditing} 
                                placeholder="e.g. 26" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 mt-0.5 mr-2 text-blue-500" />
                        <div>
                          <h4 className="font-medium mb-1">Academic Eligibility</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            D1 and D2 programs have minimum GPA and test score requirements. These scores are key factors in your eligibility.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="bg-background p-3 rounded-md border">
                              <h5 className="text-sm font-medium mb-1">NCAA Division I</h5>
                              <ul className="text-xs space-y-1 text-muted-foreground">
                                <li>• 2.3 GPA in core courses</li>
                                <li>• ACT sum score of 75</li>
                                <li>• SAT score of 900 (math + reading)</li>
                                <li>• 16 core courses</li>
                              </ul>
                            </div>
                            <div className="bg-background p-3 rounded-md border">
                              <h5 className="text-sm font-medium mb-1">NCAA Division II</h5>
                              <ul className="text-xs space-y-1 text-muted-foreground">
                                <li>• 2.2 GPA in core courses</li>
                                <li>• ACT sum score of 70</li>
                                <li>• SAT score of 840 (math + reading)</li>
                                <li>• 16 core courses</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {isEditing && (
                  <div className="mt-6 flex justify-end">
                    <Button 
                      type="submit" 
                      className="min-w-24"
                      disabled={saveProfile.isPending}
                    >
                      {saveProfile.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}