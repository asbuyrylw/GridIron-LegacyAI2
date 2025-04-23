import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recruitingGoalsSchema, RecruitingGoals } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DIVISION_OPTIONS, DAYS_OF_WEEK } from "@/lib/constants";
import { Switch } from "@/components/ui/switch";

// This would be fetched from an API in a real application
const SCHOOLS_OF_INTEREST = [
  { value: "alabama", label: "University of Alabama" },
  { value: "ohiostate", label: "Ohio State University" },
  { value: "georgia", label: "University of Georgia" },
  { value: "clemson", label: "Clemson University" },
  { value: "pennstate", label: "Penn State University" },
  { value: "michigan", label: "University of Michigan" },
  { value: "notredame", label: "Notre Dame" },
  { value: "lsu", label: "Louisiana State University" },
  { value: "oklahoma", label: "University of Oklahoma" },
  { value: "texasam", label: "Texas A&M University" },
  { value: "florida", label: "University of Florida" },
  { value: "usc", label: "University of Southern California" },
  { value: "oregon", label: "University of Oregon" },
  // Add more schools as needed
];

interface RecruitingGoalsFormProps {
  onSubmit: (data: { recruitingGoals: RecruitingGoals }) => void;
  prevStep: () => void;
  initialData?: RecruitingGoals;
}

export default function RecruitingGoalsForm({
  onSubmit,
  prevStep,
  initialData,
}: RecruitingGoalsFormProps) {
  const form = useForm<RecruitingGoals>({
    resolver: zodResolver(recruitingGoalsSchema),
    defaultValues: initialData || {
      desiredDivision: "",
      schoolsOfInterest: [],
      hasHighlightFilm: false,
      attendedCamps: false,
      footballSeasonStart: undefined,
      footballSeasonEnd: undefined,
      preferredTrainingDays: [],
    },
  });

  const handleSubmit = (data: RecruitingGoals) => {
    onSubmit({ recruitingGoals: data });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Recruiting Goals and Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Share your recruiting goals and preferences to help us create a personalized recruiting roadmap.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="desiredDivision"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desired College Division</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your target division" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIVISION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <FormLabel>Schools of Interest (Select all that apply)</FormLabel>
            <div className="h-40 overflow-y-auto border rounded-md p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SCHOOLS_OF_INTEREST.map((school) => (
                  <FormField
                    key={school.value}
                    control={form.control}
                    name="schoolsOfInterest"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={school.value}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(school.value)}
                              onCheckedChange={(checked) => {
                                const updatedValues = checked
                                  ? [...(field.value || []), school.value]
                                  : field.value?.filter(
                                      (value) => value !== school.value
                                    ) || [];
                                field.onChange(updatedValues);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {school.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </div>
            <FormMessage />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hasHighlightFilm"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Highlight Film</FormLabel>
                    <FormMessage />
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
              name="attendedCamps"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Attended Football Camps</FormLabel>
                    <FormMessage />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="footballSeasonStart"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Football Season Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="footballSeasonEnd"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Football Season End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <FormLabel>Preferred Training Days</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <FormField
                  key={day.value}
                  control={form.control}
                  name="preferredTrainingDays"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={day.value}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(day.value)}
                            onCheckedChange={(checked) => {
                              const updatedValues = checked
                                ? [...(field.value || []), day.value]
                                : field.value?.filter(
                                    (value) => value !== day.value
                                  ) || [];
                              field.onChange(updatedValues);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {day.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
            <Button type="submit">Review & Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}