import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { insertTeamSchema } from "@shared/schema";
import { useCreateTeam } from "@/hooks/use-team-hooks";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Extend the team schema to include validations
const createTeamSchema = insertTeamSchema.extend({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  level: z.string().min(1, "Level is required"),
  season: z.string().min(1, "Season is required"),
  sport: z.string().default("football"),
});

// Allow a subset of fields for the form
type CreateTeamFormValues = z.infer<typeof createTeamSchema>;

interface CreateTeamFormProps {
  onSuccess?: () => void;
}

export function CreateTeamForm({ onSuccess }: CreateTeamFormProps) {
  const { user } = useAuth();
  const createTeam = useCreateTeam();
  const { toast } = useToast();
  
  const form = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      level: "",
      season: `Spring ${new Date().getFullYear()}`,
      sport: "football",
      description: "",
      location: "",
      homeField: "",
      website: "",
      isActive: true,
      // Set the current user as coach
      coachId: user?.id
    }
  });

  const onSubmit = (data: CreateTeamFormValues) => {
    createTeam.mutate(data, {
      onSuccess: () => {
        form.reset();
        if (onSuccess) {
          onSuccess();
        }
      }
    });
  };

  const isSubmitting = createTeam.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Team name" {...field} />
                </FormControl>
                <FormDescription>
                  The full name of your team
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Varsity">Varsity</SelectItem>
                    <SelectItem value="JV">JV</SelectItem>
                    <SelectItem value="Freshman">Freshman</SelectItem>
                    <SelectItem value="Middle School">Middle School</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The competitive level of your team
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="season"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Season*</FormLabel>
                <FormControl>
                  <Input placeholder="Spring 2025" {...field} />
                </FormControl>
                <FormDescription>
                  The current competitive season
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sport</FormLabel>
                <FormControl>
                  <Input placeholder="Football" disabled {...field} />
                </FormControl>
                <FormDescription>
                  Currently only football teams are supported
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of your team"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide details about your team's mission, goals, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="City, State" {...field} />
                </FormControl>
                <FormDescription>
                  Where your team is based
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="homeField"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Home Field</FormLabel>
                <FormControl>
                  <Input placeholder="Stadium or practice field name" {...field} />
                </FormControl>
                <FormDescription>
                  Your team's home field for games and practice
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://yourteam.com" {...field} />
              </FormControl>
              <FormDescription>
                Your team's official website or social media page
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Team...
            </>
          ) : (
            "Create Team"
          )}
        </Button>
      </form>
    </Form>
  );
}