import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckCircle, Info, Loader2, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

// Define the schema for the recruiting profile form
const recruitingProfileSchema = z.object({
  desiredDivision: z.string().optional(),
  schoolsOfInterest: z.array(z.string()).optional(),
  personalStatement: z.string().optional(),
  hasHighlightFilm: z.boolean().default(false),
  attendedCamps: z.boolean().default(false),
  footballSeasonStart: z.date().optional(),
  footballSeasonEnd: z.date().optional(),
  preferredTrainingDays: z.array(z.string()).optional(),
  recruitingGoals: z.string().optional(),
  collegePreferences: z.object({
    academicPrograms: z.array(z.string()).optional(),
    location: z.string().optional(),
    schoolSize: z.string().optional(),
  }).optional(),
});

type RecruitingProfileValues = z.infer<typeof recruitingProfileSchema>;

interface RecruitingProfileProps {
  currentProfile?: any;
  athleteId: number;
  onSave: (data: RecruitingProfileValues) => void;
  isLoading?: boolean;
}

export function RecruitingProfile({ 
  currentProfile, 
  athleteId, 
  onSave, 
  isLoading = false 
}: RecruitingProfileProps) {
  const { toast } = useToast();
  const [selectedDays, setSelectedDays] = useState<string[]>(
    currentProfile?.preferredTrainingDays || []
  );
  const [selectedSchools, setSelectedSchools] = useState<string[]>(
    currentProfile?.schoolsOfInterest || []
  );
  const [newSchool, setNewSchool] = useState("");
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const divisions = ["NCAA Division I", "NCAA Division II", "NCAA Division III", "NAIA", "NJCAA", "Undecided"];
  
  const form = useForm<RecruitingProfileValues>({
    resolver: zodResolver(recruitingProfileSchema),
    defaultValues: {
      desiredDivision: currentProfile?.desiredDivision || "",
      schoolsOfInterest: currentProfile?.schoolsOfInterest || [],
      personalStatement: currentProfile?.personalStatement || "",
      hasHighlightFilm: currentProfile?.hasHighlightFilm || false,
      attendedCamps: currentProfile?.attendedCamps || false,
      footballSeasonStart: currentProfile?.footballSeasonStart ? new Date(currentProfile.footballSeasonStart) : undefined,
      footballSeasonEnd: currentProfile?.footballSeasonEnd ? new Date(currentProfile.footballSeasonEnd) : undefined,
      preferredTrainingDays: currentProfile?.preferredTrainingDays || [],
      recruitingGoals: currentProfile?.recruitingGoals || "",
      collegePreferences: currentProfile?.collegePreferences || {
        academicPrograms: [],
        location: "",
        schoolSize: "",
      },
    },
  });
  
  function onSubmit(data: RecruitingProfileValues) {
    // Update with selected schools and days
    data.preferredTrainingDays = selectedDays;
    data.schoolsOfInterest = selectedSchools;
    
    // Save profile
    onSave(data);
    
    toast({
      title: "Profile updated",
      description: "Your recruiting profile has been updated successfully.",
    });
  }
  
  const handleAddSchool = () => {
    if (newSchool && !selectedSchools.includes(newSchool)) {
      const updatedSchools = [...selectedSchools, newSchool];
      setSelectedSchools(updatedSchools);
      setNewSchool("");
    }
  };
  
  const handleRemoveSchool = (school: string) => {
    setSelectedSchools(selectedSchools.filter(s => s !== school));
  };
  
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Recruiting Profile</h2>
        <p className="text-muted-foreground">
          Complete your recruiting profile to help coaches and recruiters find you.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Division Preference */}
              <FormField
                control={form.control}
                name="desiredDivision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Division</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {divisions.map((division) => (
                          <SelectItem key={division} value={division}>
                            {division}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the division level you're interested in playing at.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Schools of Interest */}
              <FormItem>
                <FormLabel>Schools of Interest</FormLabel>
                <div className="flex gap-2">
                  <Input 
                    value={newSchool}
                    onChange={(e) => setNewSchool(e.target.value)}
                    placeholder="Add a school"
                  />
                  <Button type="button" onClick={handleAddSchool}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSchools.map((school) => (
                    <Badge key={school} variant="secondary" className="px-2 py-1">
                      {school}
                      <button
                        type="button"
                        className="ml-2 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveSchool(school)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <FormDescription>
                  Add schools you're interested in being recruited by.
                </FormDescription>
              </FormItem>
              
              {/* Personal Statement */}
              <FormField
                control={form.control}
                name="personalStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Statement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share what makes you unique as an athlete..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Write a brief personal statement to introduce yourself to recruiters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Season & Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Season Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="footballSeasonStart"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Season Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When does your football season start?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="footballSeasonEnd"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Season End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When does your football season end?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Preferred Training Days */}
              <FormItem>
                <FormLabel>Preferred Training Days</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {days.map((day) => (
                    <Badge
                      key={day}
                      variant={selectedDays.includes(day) ? "default" : "outline"}
                      className="px-3 py-1 cursor-pointer"
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
                <FormDescription>
                  Select the days you prefer to train.
                </FormDescription>
              </FormItem>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recruiting Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Highlight Film */}
              <FormField
                control={form.control}
                name="hasHighlightFilm"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Highlight Film</FormLabel>
                      <FormDescription>
                        Do you have a highlight film ready for recruiters?
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
              
              {/* Camps Attended */}
              <FormField
                control={form.control}
                name="attendedCamps"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Football Camps</FormLabel>
                      <FormDescription>
                        Have you attended any football camps or showcases?
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
              
              {/* Recruiting Goals */}
              <FormField
                control={form.control}
                name="recruitingGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recruiting Goals</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What are your goals for the recruiting process?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Share your goals and what you're looking for in a college program.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Save Recruiting Profile
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}