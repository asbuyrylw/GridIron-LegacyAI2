import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { heightPredictionSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  cmToInches, 
  inchesToCm, 
  kgToLbs,
  lbsToKg,
  formatHeight,
  calculateAge,
  predictAdultHeight,
  type HeightPredictionInputs
} from "@/lib/height-prediction";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { GrowthPrediction } from "@shared/schema";

type HeightPredictorFormValues = z.infer<typeof heightPredictionSchema>;

export function HeightPredictor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [prediction, setPrediction] = useState<GrowthPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  
  const form = useForm<HeightPredictorFormValues>({
    resolver: zodResolver(heightPredictionSchema),
    defaultValues: {
      gender: "male",
      age: 16,
      currentHeight: 70, // 5'10"
      currentHeightUnit: "in",
      currentWeight: 160,
      currentWeightUnit: "lb",
      motherHeight: 64, // 5'4"
      motherHeightUnit: "in",
      fatherHeight: 72, // 6'0"
      fatherHeightUnit: "in",
      birthMonth: new Date().getMonth() + 1,
      birthDay: new Date().getDate(),
      birthYear: new Date().getFullYear() - 16
    }
  });
  
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return apiRequest(`/api/athlete/${user.id}/height-prediction`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/athlete/${user.id}/height-prediction`] });
      }
      toast({
        title: "Growth prediction saved",
        description: "Your growth prediction has been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save prediction",
        description: "There was an error saving your growth prediction.",
        variant: "destructive"
      });
    }
  });

  function onSubmit(data: HeightPredictorFormValues) {
    setLoading(true);
    
    try {
      // Convert to height and weight to inches and pounds
      let heightInches = data.currentHeight;
      if (data.currentHeightUnit === "cm") {
        heightInches = cmToInches(data.currentHeight);
      }
      
      let weightLbs = data.currentWeight;
      if (data.currentWeightUnit === "kg") {
        weightLbs = kgToLbs(data.currentWeight);
      }
      
      let motherHeightInches = data.motherHeight;
      if (data.motherHeightUnit === "cm") {
        motherHeightInches = cmToInches(data.motherHeight);
      }
      
      let fatherHeightInches = data.fatherHeight;
      if (data.fatherHeightUnit === "cm") {
        fatherHeightInches = cmToInches(data.fatherHeight);
      }
      
      // Create birth date from form data
      const birthDate = new Date(data.birthYear, data.birthMonth - 1, data.birthDay);
      
      // Calculate age (as a backup to the entered age)
      const calculatedAge = calculateAge(birthDate);
      
      // Prepare inputs for prediction
      const predictorInputs: HeightPredictionInputs = {
        gender: data.gender,
        age: data.age || calculatedAge,
        currentHeight: heightInches,
        currentWeight: weightLbs,
        motherHeight: motherHeightInches,
        fatherHeight: fatherHeightInches,
        birthDate: birthDate
      };
      
      // Calculate prediction
      const predictionResult = predictAdultHeight(predictorInputs);
      setPrediction(predictionResult);
      
      // Save prediction data
      saveMutation.mutate({
        ...data,
        ...predictionResult
      });
    } catch (error) {
      console.error("Error calculating height prediction:", error);
      toast({
        title: "Calculation error",
        description: "There was an error calculating your growth prediction. Please check your inputs.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Height Prediction Calculator</CardTitle>
          <CardDescription>
            Enter your information to predict your adult height using the Khamis-Roche method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Biological Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="font-normal">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal">Female</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Age</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={5} max={18} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="birthMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Month</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={1} max={12} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="birthDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={1} max={31} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="birthYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={2000} max={new Date().getFullYear() - 5} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="currentHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Height</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} step="0.1" onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <FormField
                    control={form.control}
                    name="currentHeightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in">Inches</SelectItem>
                            <SelectItem value="cm">Centimeters</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="currentWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Weight</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} step="0.1" onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <FormField
                    control={form.control}
                    name="currentWeightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lb">Pounds</SelectItem>
                            <SelectItem value="kg">Kilograms</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="motherHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Height</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} step="0.1" onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <FormField
                    control={form.control}
                    name="motherHeightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in">Inches</SelectItem>
                            <SelectItem value="cm">Centimeters</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="fatherHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Height</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} step="0.1" onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <FormField
                    control={form.control}
                    name="fatherHeightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in">Inches</SelectItem>
                            <SelectItem value="cm">Centimeters</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Calculating..." : "Calculate Height Prediction"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {prediction ? (
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Your Height Prediction</CardTitle>
            <CardDescription>
              Results based on the Khamis-Roche method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold">{prediction.predictedHeight}</h3>
              <p className="text-sm text-muted-foreground">({prediction.predictedHeightCm} cm)</p>
              <p className="text-sm mt-2">Predicted adult height range: {prediction.predictedRange}</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs">Growth Progress</span>
                <span className="text-xs font-bold">{prediction.percentComplete}%</span>
              </div>
              <Progress value={prediction.percentComplete} className="h-2" />
              <p className="text-xs mt-1">Approximately {prediction.growthRemaining.toFixed(1)} inches of growth remaining</p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Recommended Football Positions</h3>
              {prediction.recommendedPositions.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {prediction.recommendedPositions.map((position, index) => (
                    <li key={index} className="text-sm">{position}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No position recommendations available.</p>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground mt-4">
              <p>Note: This prediction is an estimate based on the Khamis-Roche method. Many factors including nutrition, exercise, genetics, and other environmental factors can influence actual adult height.</p>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Last calculated: {new Date(prediction.calculatedAt).toLocaleDateString()}
            </p>
          </CardFooter>
        </Card>
      ) : (
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Your Height Prediction</CardTitle>
            <CardDescription>
              Fill out the form to see your predicted adult height
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <p className="text-muted-foreground">Enter your information and click "Calculate" to see your predicted adult height and growth progress.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}