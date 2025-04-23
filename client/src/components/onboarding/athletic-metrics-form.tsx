import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { athleticMetricsSchema, AthleticMetrics } from "@shared/schema";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AthleticMetricsFormProps {
  onSubmit: (data: { athleticMetrics: AthleticMetrics }) => void;
  prevStep: () => void;
  initialData?: AthleticMetrics;
}

export default function AthleticMetricsForm({
  onSubmit,
  prevStep,
  initialData,
}: AthleticMetricsFormProps) {
  const form = useForm<AthleticMetrics>({
    resolver: zodResolver(athleticMetricsSchema),
    defaultValues: initialData || {
      height: "",
      weight: undefined,
      projectedHeight: "",
      fortyYard: undefined,
      tenYardSplit: undefined,
      shuttle: undefined,
      threeCone: undefined,
      verticalJump: undefined,
      broadJump: undefined,
      benchPress: undefined,
      benchPressReps: undefined,
      squatMax: undefined,
      powerClean: undefined,
      deadlift: undefined,
      pullUps: undefined,
    },
  });

  const handleSubmit = (data: AthleticMetrics) => {
    onSubmit({ athleticMetrics: data });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Verified Athletic Metrics</h2>
        <p className="text-sm text-muted-foreground">
          Enter your athletic metrics below. These will be used to track your progress and provide
          personalized recommendations. Enter the metrics you have available - others can be added later.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (ft and inches)</FormLabel>
                  <FormControl>
                    <Input placeholder="6'2\"" {...field} />
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
          </div>

          <FormField
            control={form.control}
            name="projectedHeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projected Height at 18 (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="6'3\"" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Accordion type="single" collapsible defaultValue="speed">
            <AccordionItem value="speed">
              <AccordionTrigger className="text-lg font-semibold">
                Speed & Agility Metrics
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <FormField
                    control={form.control}
                    name="fortyYard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>40-Yard Dash (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="4.65"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tenYardSplit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>10-Yard Split (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="1.62"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shuttle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>5-10-5 Shuttle (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="4.21"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="threeCone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>3-Cone Drill (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="6.85"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="explosive">
              <AccordionTrigger className="text-lg font-semibold">
                Explosive Power Metrics
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <FormField
                    control={form.control}
                    name="verticalJump"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vertical Jump (inches)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="32"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="broadJump"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Broad Jump (inches)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="118"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="strength">
              <AccordionTrigger className="text-lg font-semibold">
                Strength Metrics
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <FormField
                    control={form.control}
                    name="benchPress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bench Press Max (lbs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="225"
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
                    name="benchPressReps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bench Press Reps at 225 lbs</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="12"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Number of repetitions at 225 lbs
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="squatMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Squat Max (lbs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="315"
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
                    name="powerClean"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Power Clean (lbs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="225"
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
                    name="deadlift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadlift (lbs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="400"
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
                    name="pullUps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pull-Ups (max reps)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="15"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
            <Button type="submit">Next: Academic Profile</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}