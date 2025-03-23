import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const nutritionPlanFormSchema = z.object({
  dailyCalories: z.coerce.number().min(1000, "Minimum 1000 calories").max(10000, "Maximum 10000 calories"),
  proteinTarget: z.coerce.number().min(20, "Minimum 20g").max(500, "Maximum 500g"),
  carbTarget: z.coerce.number().min(20, "Minimum 20g").max(800, "Maximum 800g"),
  fatTarget: z.coerce.number().min(10, "Minimum 10g").max(300, "Maximum 300g"),
  goal: z.enum(["lose_weight", "gain_weight", "maintain", "performance", "recovery"]),
  restrictions: z.string().optional(),
  preferredMeals: z.string().optional(),
  mealFrequency: z.enum(["3", "4", "5", "6"]).default("3"),
  active: z.boolean().default(true),
});

type NutritionPlanFormValues = z.infer<typeof nutritionPlanFormSchema>;

interface NutritionPlanFormProps {
  onSubmit: (data: NutritionPlanFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
  defaultValues?: Partial<NutritionPlanFormValues>;
}

export function NutritionPlanForm({ onSubmit, onCancel, isLoading, defaultValues }: NutritionPlanFormProps) {
  const [weightGoal, setWeightGoal] = useState<string>(defaultValues?.goal || "maintain");

  const form = useForm<NutritionPlanFormValues>({
    resolver: zodResolver(nutritionPlanFormSchema),
    defaultValues: {
      dailyCalories: defaultValues?.dailyCalories || 2500,
      proteinTarget: defaultValues?.proteinTarget || 150,
      carbTarget: defaultValues?.carbTarget || 300,
      fatTarget: defaultValues?.fatTarget || 80,
      goal: defaultValues?.goal || "maintain",
      restrictions: defaultValues?.restrictions || "",
      preferredMeals: defaultValues?.preferredMeals || "",
      mealFrequency: defaultValues?.mealFrequency || "3",
      active: true,
    },
  });

  // Calculate macro distribution percentages
  const calculatePercentage = (value: number, total: number) => {
    return Math.round((value * 4 / total) * 100); // Protein and carbs are 4 calories per gram
  };

  const calculateFatPercentage = (value: number, total: number) => {
    return Math.round((value * 9 / total) * 100); // Fat is 9 calories per gram
  };

  const dailyCalories = form.watch("dailyCalories");
  const proteinTarget = form.watch("proteinTarget");
  const carbTarget = form.watch("carbTarget");
  const fatTarget = form.watch("fatTarget");

  const proteinPercentage = calculatePercentage(proteinTarget, dailyCalories);
  const carbPercentage = calculatePercentage(carbTarget, dailyCalories);
  const fatPercentage = calculateFatPercentage(fatTarget, dailyCalories);
  const totalPercentage = proteinPercentage + carbPercentage + fatPercentage;

  const handleWeightGoalChange = (value: string) => {
    setWeightGoal(value);
    form.setValue("goal", value as NutritionPlanFormValues["goal"]);
    
    // Adjust macro targets based on selected goal
    switch(value) {
      case "lose_weight":
        form.setValue("dailyCalories", 2000);
        form.setValue("proteinTarget", 180);
        form.setValue("carbTarget", 180);
        form.setValue("fatTarget", 60);
        break;
      case "gain_weight":
        form.setValue("dailyCalories", 3000);
        form.setValue("proteinTarget", 200);
        form.setValue("carbTarget", 350);
        form.setValue("fatTarget", 90);
        break;
      case "maintain":
        form.setValue("dailyCalories", 2500);
        form.setValue("proteinTarget", 150);
        form.setValue("carbTarget", 300);
        form.setValue("fatTarget", 80);
        break;
      case "performance":
        form.setValue("dailyCalories", 2800);
        form.setValue("proteinTarget", 180);
        form.setValue("carbTarget", 350);
        form.setValue("fatTarget", 70);
        break;
      case "recovery":
        form.setValue("dailyCalories", 2600);
        form.setValue("proteinTarget", 200);
        form.setValue("carbTarget", 280);
        form.setValue("fatTarget", 80);
        break;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Nutrition Goal</h3>
          <RadioGroup
            value={weightGoal}
            onValueChange={handleWeightGoalChange}
            className="grid grid-cols-2 gap-4 sm:grid-cols-5"
          >
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <RadioGroupItem value="lose_weight" />
              </FormControl>
              <FormLabel className="cursor-pointer">Lose Weight</FormLabel>
            </FormItem>
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <RadioGroupItem value="gain_weight" />
              </FormControl>
              <FormLabel className="cursor-pointer">Gain Weight</FormLabel>
            </FormItem>
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <RadioGroupItem value="maintain" />
              </FormControl>
              <FormLabel className="cursor-pointer">Maintain</FormLabel>
            </FormItem>
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <RadioGroupItem value="performance" />
              </FormControl>
              <FormLabel className="cursor-pointer">Performance</FormLabel>
            </FormItem>
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <RadioGroupItem value="recovery" />
              </FormControl>
              <FormLabel className="cursor-pointer">Recovery</FormLabel>
            </FormItem>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">Daily Macro Targets</h3>
          
          <FormField
            control={form.control}
            name="dailyCalories"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between">
                  <FormLabel>Daily Calories</FormLabel>
                  <span>{field.value} kcal</span>
                </div>
                <FormControl>
                  <Slider
                    min={1000}
                    max={5000}
                    step={50}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="proteinTarget"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between">
                  <FormLabel>Protein Target</FormLabel>
                  <span>{field.value}g ({proteinPercentage}%)</span>
                </div>
                <FormControl>
                  <Slider
                    min={20}
                    max={300}
                    step={5}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="carbTarget"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between">
                  <FormLabel>Carbohydrate Target</FormLabel>
                  <span>{field.value}g ({carbPercentage}%)</span>
                </div>
                <FormControl>
                  <Slider
                    min={20}
                    max={500}
                    step={5}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fatTarget"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between">
                  <FormLabel>Fat Target</FormLabel>
                  <span>{field.value}g ({fatPercentage}%)</span>
                </div>
                <FormControl>
                  <Slider
                    min={10}
                    max={200}
                    step={5}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {totalPercentage > 105 && (
            <div className="text-destructive text-sm mt-2">
              Macro distribution exceeds 100% of calories. Please adjust your targets.
            </div>
          )}
          {totalPercentage < 95 && (
            <div className="text-amber-500 text-sm mt-2">
              Macro distribution is less than 100% of calories. Consider adjusting your targets.
            </div>
          )}
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="mealFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="3">3 meals per day</SelectItem>
                  <SelectItem value="4">4 meals per day</SelectItem>
                  <SelectItem value="5">5 meals per day</SelectItem>
                  <SelectItem value="6">6 meals per day</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="restrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Restrictions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any dietary restrictions or allergies..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                List any food allergies, intolerances, or dietary restrictions
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredMeals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Meals</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your preferred meals or foods..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                List any preferred foods or meals you enjoy eating
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
            Save Nutrition Plan
          </Button>
        </div>
      </form>
    </Form>
  );
}