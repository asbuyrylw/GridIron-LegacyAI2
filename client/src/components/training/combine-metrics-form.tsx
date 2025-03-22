import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertCombineMetricsSchema, InsertCombineMetric, CombineMetric } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";

// D1 benchmarks for comparison
const D1_BENCHMARKS = {
  fortyYard: 4.5,    // seconds
  shuttle: 4.2,      // seconds
  verticalJump: 34,  // inches
  broadJump: 120,    // inches
  benchPress: 18     // reps
};

// Extended schema with validation
const extendedSchema = insertCombineMetricsSchema.omit({ athleteId: true });

export function CombineMetricsForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  
  const { data: metricsHistory, isLoading } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${athleteId}/metrics`],
    enabled: !!athleteId,
  });
  
  const latestMetrics = metricsHistory?.[0];
  
  const form = useForm<z.infer<typeof extendedSchema>>({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      fortyYard: latestMetrics?.fortyYard || undefined,
      shuttle: latestMetrics?.shuttle || undefined,
      verticalJump: latestMetrics?.verticalJump || undefined,
      broadJump: latestMetrics?.broadJump || undefined,
      benchPress: latestMetrics?.benchPress || undefined,
    }
  });
  
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof extendedSchema>) => {
      if (!athleteId) throw new Error("Athlete ID is required");
      
      const data: InsertCombineMetric = {
        ...values,
        athleteId,
      };
      
      const res = await apiRequest("POST", `/api/athlete/${athleteId}/metrics`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/metrics`] });
      toast({
        title: "Metrics saved",
        description: "Your combine metrics have been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save metrics",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: z.infer<typeof extendedSchema>) => {
    mutation.mutate(values);
  };
  
  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-montserrat font-bold">Combine Metrics</h2>
        <Button 
          type="submit"
          form="metrics-form"
          variant="ghost" 
          className="text-primary dark:text-accent font-semibold text-sm"
          disabled={mutation.isPending}
        >
          Update
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form id="metrics-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fortyYard"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between mb-1">
                      <FormLabel className="text-sm font-semibold">40-Yard Dash</FormLabel>
                      {latestMetrics?.fortyYard && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Last: {latestMetrics.fortyYard}s
                        </span>
                      )}
                    </div>
                    <div className="flex">
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01"
                          placeholder="Enter time" 
                          className="font-mono rounded-r-none"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 font-mono">
                        seconds
                      </div>
                    </div>
                    <FormMessage />
                    {field.value && (
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">D1 Benchmark: {D1_BENCHMARKS.fortyYard}s</span>
                        <span className={`text-xs ${Number(field.value) <= D1_BENCHMARKS.fortyYard ? 'text-green-500' : 'text-amber-500'}`}>
                          {Number(field.value) <= D1_BENCHMARKS.fortyYard 
                            ? `${(Number(field.value) - D1_BENCHMARKS.fortyYard).toFixed(2)}s under goal`
                            : `${(Number(field.value) - D1_BENCHMARKS.fortyYard).toFixed(2)}s to goal`}
                        </span>
                      </div>
                    )}
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="shuttle"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between mb-1">
                      <FormLabel className="text-sm font-semibold">5-10-5 Shuttle</FormLabel>
                      {latestMetrics?.shuttle && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Last: {latestMetrics.shuttle}s
                        </span>
                      )}
                    </div>
                    <div className="flex">
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01"
                          placeholder="Enter time" 
                          className="font-mono rounded-r-none"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 font-mono">
                        seconds
                      </div>
                    </div>
                    <FormMessage />
                    {field.value && (
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">D1 Benchmark: {D1_BENCHMARKS.shuttle}s</span>
                        <span className={`text-xs ${Number(field.value) <= D1_BENCHMARKS.shuttle ? 'text-green-500' : 'text-amber-500'}`}>
                          {Number(field.value) <= D1_BENCHMARKS.shuttle 
                            ? `${(Number(field.value) - D1_BENCHMARKS.shuttle).toFixed(2)}s under goal`
                            : `${(Number(field.value) - D1_BENCHMARKS.shuttle).toFixed(2)}s to goal`}
                        </span>
                      </div>
                    )}
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="verticalJump"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between mb-1">
                      <FormLabel className="text-sm font-semibold">Vertical Jump</FormLabel>
                      {latestMetrics?.verticalJump && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Last: {latestMetrics.verticalJump}"
                        </span>
                      )}
                    </div>
                    <div className="flex">
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.5"
                          placeholder="Enter height" 
                          className="font-mono rounded-r-none"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 font-mono">
                        inches
                      </div>
                    </div>
                    <FormMessage />
                    {field.value && (
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">D1 Benchmark: {D1_BENCHMARKS.verticalJump}"</span>
                        <span className={`text-xs ${Number(field.value) >= D1_BENCHMARKS.verticalJump ? 'text-green-500' : 'text-amber-500'}`}>
                          {Number(field.value) >= D1_BENCHMARKS.verticalJump 
                            ? `${(Number(field.value) - D1_BENCHMARKS.verticalJump).toFixed(1)}" above goal`
                            : `${(D1_BENCHMARKS.verticalJump - Number(field.value)).toFixed(1)}" to goal`}
                        </span>
                      </div>
                    )}
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="benchPress"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between mb-1">
                      <FormLabel className="text-sm font-semibold">Bench Press (225 lbs)</FormLabel>
                      {latestMetrics?.benchPress && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Last: {latestMetrics.benchPress} reps
                        </span>
                      )}
                    </div>
                    <div className="flex">
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Enter reps" 
                          className="font-mono rounded-r-none"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 font-mono">
                        reps
                      </div>
                    </div>
                    <FormMessage />
                    {field.value && (
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">D1 Benchmark: {D1_BENCHMARKS.benchPress} reps</span>
                        <span className={`text-xs ${Number(field.value) >= D1_BENCHMARKS.benchPress ? 'text-green-500' : 'text-amber-500'}`}>
                          {Number(field.value) >= D1_BENCHMARKS.benchPress 
                            ? `${Number(field.value) - D1_BENCHMARKS.benchPress} reps above goal`
                            : `${D1_BENCHMARKS.benchPress - Number(field.value)} reps to goal`}
                        </span>
                      </div>
                    )}
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full mt-6"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save Metrics"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
