import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nutritionFormSchema, NutritionForm as NutritionFormType } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BREAKFAST_OPTIONS, COOKING_ACCESS_OPTIONS } from "@/lib/constants";

interface NutritionFormProps {
  onSubmit: (data: { nutrition: NutritionFormType }) => void;
  prevStep: () => void;
  initialData?: NutritionFormType;
}

export default function NutritionForm({
  onSubmit,
  prevStep,
  initialData,
}: NutritionFormProps) {
  const form = useForm<NutritionFormType>({
    resolver: zodResolver(nutritionFormSchema),
    defaultValues: initialData || {
      currentWeight: undefined,
      currentCalories: undefined,
      mealFrequency: undefined,
      waterIntake: undefined,
      dietaryRestrictions: "",
      supplementsUsed: "",
      foodAllergies: "",
      breakfastRoutine: "",
      cookingAccess: [],
    },
  });

  const handleSubmit = (data: NutritionFormType) => {
    onSubmit({ nutrition: data });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Nutrition and Dietary Information</h2>
        <p className="text-sm text-muted-foreground">
          Your nutrition plays a key role in your athletic performance. This information will help us create a personalized nutrition plan.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="currentWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Weight (lbs)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="185"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentCalories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Daily Caloric Intake (estimate)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2500"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Calories per day</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mealFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Meal Frequency</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="3"
                      min={1}
                      max={10}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Number of meals per day</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="waterIntake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Water Intake (oz per day)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="64"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Ounces of water per day</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="dietaryRestrictions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dietary Restrictions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Vegetarian, vegan, gluten-free, dairy-free, etc."
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
            name="supplementsUsed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplements Used</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Protein powder, creatine, pre-workout, vitamins, etc."
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
            name="foodAllergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Known Food Allergies</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nuts, dairy, shellfish, etc."
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
            name="breakfastRoutine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breakfast Routine</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your typical breakfast" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BREAKFAST_OPTIONS.map((option) => (
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
            <FormLabel>Cooking Access (Select all that apply)</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {COOKING_ACCESS_OPTIONS.map((option) => (
                <FormField
                  key={option.value}
                  control={form.control}
                  name="cookingAccess"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={option.value}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const updatedValues = checked
                                ? [...(field.value || []), option.value]
                                : field.value?.filter(
                                    (value) => value !== option.value
                                  ) || [];
                              field.onChange(updatedValues);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {option.label}
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
            <Button type="submit">Next: Recruiting Goals</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}