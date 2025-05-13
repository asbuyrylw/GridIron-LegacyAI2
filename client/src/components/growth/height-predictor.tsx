import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { heightPredictionSchema } from "@shared/schema";
import { z } from "zod";
import { predictAdultHeight, HeightPredictionInputs } from "@/lib/height-prediction";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

type HeightPredictorFormValues = z.infer<typeof heightPredictionSchema>;

export function HeightPredictor() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const { data: existingPrediction, isLoading: isPredictionLoading } = useQuery({
    queryKey: ['/api/athlete', user?.athlete?.id, 'height-prediction'],
    enabled: !!user?.athlete?.id,
  });

  const form = useForm<HeightPredictorFormValues>({
    resolver: zodResolver(heightPredictionSchema),
    defaultValues: {
      gender: "male",
      age: 0,
      currentHeight: 0,
      currentHeightUnit: "in",
      currentWeight: 0,
      currentWeightUnit: "lb",
      motherHeight: 0,
      motherHeightUnit: "in",
      fatherHeight: 0,
      fatherHeightUnit: "in",
      birthMonth: new Date().getMonth() + 1,
      birthDay: new Date().getDate(),
      birthYear: new Date().getFullYear() - 14, // Default to 14 years old
    },
  });

  // If we have existing data, populate the form
  useState(() => {
    if (existingPrediction) {
      setResult(existingPrediction);
    }
  });

  function onSubmit(data: HeightPredictorFormValues) {
    setIsCalculating(true);
    try {
      // Calculate birthdate from components
      const birthDate = new Date(data.birthYear, data.birthMonth - 1, data.birthDay);
      
      // Prepare inputs for height prediction
      const predictorInputs: HeightPredictionInputs = {
        gender: data.gender,
        age: data.age,
        currentHeight: data.currentHeight,
        currentWeight: data.currentWeight, 
        motherHeight: data.motherHeight,
        fatherHeight: data.fatherHeight,
        birthDate: birthDate
      };
      
      // Make prediction calculation
      const prediction = predictAdultHeight(predictorInputs);
      setResult(prediction);
      
      // Save the prediction to the server if user is logged in
      if (user?.athlete?.id) {
        saveHeightPrediction(user.athlete.id, prediction);
      }
      
      toast({
        title: "Height Prediction Calculated",
        description: `Predicted adult height: ${prediction.predictedHeight}`,
      });
    } catch (error) {
      console.error("Height prediction error:", error);
      toast({
        title: "Calculation Error",
        description: "There was an error calculating the height prediction. Please check your inputs.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  }
  
  async function saveHeightPrediction(athleteId: number, prediction: any) {
    try {
      await apiRequest(`/api/athlete/${athleteId}/height-prediction`, {
        method: "POST",
        body: prediction,
      });
    } catch (error) {
      console.error("Error saving height prediction:", error);
      toast({
        title: "Save Error",
        description: "Your prediction was calculated but could not be saved.",
        variant: "destructive",
      });
    }
  }
  
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle>Height Prediction Calculator</CardTitle>
          <CardDescription>
            Enter your information to predict your adult height using the Khamis-Roche method.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="birthMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Month</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
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
                      <FormLabel>Birth Day</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
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
                      <FormLabel>Birth Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Age (years)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-row gap-3">
                <div className="flex-grow">
                  <FormField
                    control={form.control}
                    name="currentHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Height</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-24">
                  <FormField
                    control={form.control}
                    name="currentHeightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in">inches</SelectItem>
                            <SelectItem value="cm">cm</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex flex-row gap-3">
                <div className="flex-grow">
                  <FormField
                    control={form.control}
                    name="currentWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Weight</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-24">
                  <FormField
                    control={form.control}
                    name="currentWeightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lb">lbs</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex flex-row gap-3">
                <div className="flex-grow">
                  <FormField
                    control={form.control}
                    name="motherHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Height</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-24">
                  <FormField
                    control={form.control}
                    name="motherHeightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in">inches</SelectItem>
                            <SelectItem value="cm">cm</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex flex-row gap-3">
                <div className="flex-grow">
                  <FormField
                    control={form.control}
                    name="fatherHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Height</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-24">
                  <FormField
                    control={form.control}
                    name="fatherHeightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in">inches</SelectItem>
                            <SelectItem value="cm">cm</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCalculating}
              >
                {isCalculating ? "Calculating..." : "Calculate Predicted Height"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle>Prediction Results</CardTitle>
          <CardDescription>
            Your predicted adult height based on the Khamis-Roche method.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPredictionLoading ? (
            <div className="text-center py-8">Loading previous prediction...</div>
          ) : result ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {result.predictedHeight}
                </div>
                <div className="text-muted-foreground">
                  Predicted Adult Height
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg text-center">
                  <div className="text-2xl font-semibold">
                    {result.percentComplete}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Growth Completed
                  </div>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg text-center">
                  <div className="text-2xl font-semibold">
                    {result.growthRemaining.toFixed(1)}" 
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Growth Remaining
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Prediction Range:</h4>
                <div className="text-lg">{result.predictedRange}</div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recommended Positions:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.recommendedPositions.map((position: string) => (
                    <div key={position} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {position}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>This prediction uses the Khamis-Roche method which is considered one of the most accurate non-radiographic height prediction methods.</p>
                <p className="mt-1">Last calculated: {new Date(result.calculatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Fill out the form and click "Calculate" to see your predicted adult height.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}