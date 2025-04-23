import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { academicProfileSchema, AcademicProfile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface AcademicProfileFormProps {
  onSubmit: (data: { academicProfile: AcademicProfile }) => void;
  prevStep: () => void;
  initialData?: AcademicProfile;
}

export default function AcademicProfileForm({
  onSubmit,
  prevStep,
  initialData,
}: AcademicProfileFormProps) {
  const form = useForm<AcademicProfile>({
    resolver: zodResolver(academicProfileSchema),
    defaultValues: initialData || {
      gpa: undefined,
      weightedGpa: undefined,
      satScore: undefined,
      actScore: undefined,
      ncaaEligibility: false,
      coreGpa: undefined,
      apHonorsClasses: "",
      volunteerWork: "",
      intendedMajors: "",
    },
  });

  const handleSubmit = (data: AcademicProfile) => {
    onSubmit({ academicProfile: data });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Academic Profile</h2>
        <p className="text-sm text-muted-foreground">
          Your academic information plays a crucial role in college recruiting. Fill out what's available now - you can update later.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gpa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GPA (Unweighted)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="3.5"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Scale: 0.0 - 4.0</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weightedGpa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GPA (Weighted)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="4.2"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Scale: 0.0 - 5.0</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="satScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SAT Score (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1200"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Scale: 400 - 1600</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ACT Score (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="24"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Scale: 1 - 36</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="ncaaEligibility"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">NCAA Eligibility Status</FormLabel>
                  <FormDescription>Are you registered with the NCAA Eligibility Center?</FormDescription>
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
            name="coreGpa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Core GPA (if known)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="3.2"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>NCAA Core GPA for eligibility</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apHonorsClasses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AP/Honors Classes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="List your AP and Honors classes here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="volunteerWork"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volunteer Work/Community Involvement</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your volunteer experiences and community involvement"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="intendedMajors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intended Major(s)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Business, Engineering, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
            <Button type="submit">Next: Strength & Conditioning</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}