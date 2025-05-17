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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Define the form schema
const mealLogSchema = z.object({
  name: z.string().min(2, {
    message: "Food name must be at least 2 characters.",
  }),
  servingSize: z.coerce.number().min(0.1, {
    message: "Serving size must be greater than 0.",
  }),
  servingUnit: z.string().min(1, {
    message: "Please specify a serving unit.",
  }),
  calories: z.coerce.number().min(0, {
    message: "Calories must be a non-negative number.",
  }),
  protein: z.coerce.number().min(0, {
    message: "Protein must be a non-negative number.",
  }),
  carbs: z.coerce.number().min(0, {
    message: "Carbs must be a non-negative number.",
  }),
  fat: z.coerce.number().min(0, {
    message: "Fat must be a non-negative number.",
  }),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  date: z.string(),
});

type MealLogFormValues = z.infer<typeof mealLogSchema>;

interface MealLogFormProps {
  onSubmit: (values: any) => void;
  nutritionPlanId: number;
  athleteId: number;
  isLoading?: boolean;
}

export function MealLogForm({ 
  onSubmit, 
  nutritionPlanId, 
  athleteId, 
  isLoading = false 
}: MealLogFormProps) {
  // Initialize form with default values
  const form = useForm<MealLogFormValues>({
    resolver: zodResolver(mealLogSchema),
    defaultValues: {
      name: "",
      servingSize: 1,
      servingUnit: "serving",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      mealType: "snack",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = (values: MealLogFormValues) => {
    // Add the athlete ID and nutrition plan ID to the submitted values
    onSubmit({
      ...values,
      athleteId,
      nutritionPlanId
    });
    
    // Reset form after submission
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Food Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Grilled Chicken Breast" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="mealType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meal Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="servingSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serving Size</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value || "0"))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="servingUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., oz, cup, piece" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="calories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calories</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value || "0"))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="protein"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protein (g)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.1" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value || "0"))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="carbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carbs (g)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.1" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value || "0"))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fat (g)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.1" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value || "0"))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging Meal...
            </>
          ) : (
            "Log Meal"
          )}
        </Button>
      </form>
    </Form>
  );
}