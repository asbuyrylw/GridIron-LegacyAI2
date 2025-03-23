import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const mealLogFormSchema = z.object({
  name: z.string().min(2, "Meal name is required"),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack", "pre_workout", "post_workout"]),
  calories: z.coerce.number().min(0, "Calories can't be negative").max(5000, "Maximum 5000 calories"),
  protein: z.coerce.number().min(0, "Protein can't be negative").max(300, "Maximum 300g protein"),
  carbs: z.coerce.number().min(0, "Carbs can't be negative").max(500, "Maximum 500g carbs"),
  fat: z.coerce.number().min(0, "Fat can't be negative").max(200, "Maximum 200g fat"),
  notes: z.string().optional(),
});

type MealLogFormValues = z.infer<typeof mealLogFormSchema>;

interface MealLogFormProps {
  onSubmit: (data: MealLogFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
  defaultValues?: Partial<MealLogFormValues>;
}

export function MealLogForm({ onSubmit, onCancel, isLoading, defaultValues }: MealLogFormProps) {
  const form = useForm<MealLogFormValues>({
    resolver: zodResolver(mealLogFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      mealType: defaultValues?.mealType || "lunch",
      calories: defaultValues?.calories || 0,
      protein: defaultValues?.protein || 0,
      carbs: defaultValues?.carbs || 0,
      fat: defaultValues?.fat || 0,
      notes: defaultValues?.notes || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Name</FormLabel>
              <FormControl>
                <Input placeholder="What did you eat?" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <SelectItem value="pre_workout">Pre-Workout</SelectItem>
                  <SelectItem value="post_workout">Post-Workout</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="calories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calories</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>kcal</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="protein"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protein</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.1" {...field} />
                </FormControl>
                <FormDescription>grams</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="carbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carbs</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.1" {...field} />
                </FormControl>
                <FormDescription>grams</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fat</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.1" {...field} />
                </FormControl>
                <FormDescription>grams</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about this meal..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional notes about ingredients, preparation, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Meal
          </Button>
        </div>
      </form>
    </Form>
  );
}