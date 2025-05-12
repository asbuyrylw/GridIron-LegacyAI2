import React from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail } from "lucide-react";

// Form validation schema
const inviteSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  relationship: z.string().min(1, { message: "Please select a relationship" }),
  receiveUpdates: z.boolean().default(true),
  receiveNutritionInfo: z.boolean().default(true),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteParentForm() {
  const { toast } = useToast();
  
  // Define form with validation
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: "",
      email: "",
      relationship: "",
      receiveUpdates: true,
      receiveNutritionInfo: true
    },
  });
  
  // Mutation for sending invitation
  const inviteMutation = useMutation({
    mutationFn: async (data: InviteFormValues) => {
      const response = await apiRequest("POST", "/api/athlete/parent-invite", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/athlete", "parent-access"] });
      toast({
        title: "Invitation sent",
        description: "Your parent/guardian will receive an email with access instructions.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  function onSubmit(data: InviteFormValues) {
    inviteMutation.mutate(data);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent/Guardian Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Email field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="parent@example.com" {...field} />
              </FormControl>
              <FormDescription>
                We'll send performance updates and reports directly to this email. No account or login required.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Relationship field */}
        <FormField
          control={form.control}
          name="relationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Stepmother">Stepmother</SelectItem>
                  <SelectItem value="Stepfather">Stepfather</SelectItem>
                  <SelectItem value="Guardian">Legal Guardian</SelectItem>
                  <SelectItem value="Grandparent">Grandparent</SelectItem>
                  <SelectItem value="Other">Other Family Member</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Notification options */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Notification Options</h3>
          
          <FormField
            control={form.control}
            name="receiveUpdates"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Performance Updates</FormLabel>
                  <FormDescription>
                    Receive email notifications about performance milestones and achievements.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="receiveNutritionInfo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Nutrition Shopping Lists</FormLabel>
                  <FormDescription>
                    Receive shopping lists based on nutrition plan recommendations.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={inviteMutation.isPending}>
          {inviteMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Invitation...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}