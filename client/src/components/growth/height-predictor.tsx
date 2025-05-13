import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calculator, Info, HelpCircle, ArrowRight, ChevronsUpDown, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { 
  predictAdultHeight, 
  formatHeight, 
  convertToInches, 
  getHeightPredictionInterpretation,
  getPositionRecommendations,
  HeightPredictionInputs,
  HeightPredictionResult
} from "@/lib/height-prediction";

// Validation schema
const heightPredictorSchema = z.object({
  feet: z.number().min(3).max(7),
  inches: z.number().min(0).max(11.9),
  weightLbs: z.number().min(50).max(350),
  age: z.number().min(8).max(18),
  gender: z.enum(["male", "female"]),
  motherHeightFeet: z.number().min(4).max(7),
  motherHeightInches: z.number().min(0).max(11.9),
  fatherHeightFeet: z.number().min(4).max(7),
  fatherHeightInches: z.number().min(0).max(11.9),
});

type HeightPredictorFormValues = z.infer<typeof heightPredictorSchema>;

export function HeightPredictor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [prediction, setPrediction] = useState<HeightPredictionResult | null>(null);
  const [positionRecommendations, setPositionRecommendations] = useState<string[]>([]);
  const [savingPrediction, setSavingPrediction] = useState(false);

  // Get athlete data if available
  const { data: athlete, isLoading: athleteLoading } = useQuery({
    queryKey: ["/api/athlete/me"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/athlete/me");
      return res.json();
    },
    enabled: !!user && user.userType === "athlete",
  });

  // Form setup
  const form = useForm<HeightPredictorFormValues>({
    resolver: zodResolver(heightPredictorSchema),
    defaultValues: {
      feet: 5,
      inches: 10,
      weightLbs: 160,
      age: 16,
      gender: "male",
      motherHeightFeet: 5,
      motherHeightInches: 5,
      fatherHeightFeet: 5,
      fatherHeightInches: 11,
    },
  });

  // Update form with athlete data if available
  useEffect(() => {
    if (athlete) {
      if (athlete.height) {
        // Expected format: "5'10"" - need to parse
        try {
          const heightParts = athlete.height.split("'");
          const feet = parseInt(heightParts[0]);
          const inches = parseInt(heightParts[1]);
          
          if (!isNaN(feet)) {
            form.setValue("feet", feet);
          }
          
          if (!isNaN(inches)) {
            form.setValue("inches", inches);
          }
        } catch (error) {
          console.error("Error parsing height:", error);
        }
      }
      
      if (athlete.weight) {
        form.setValue("weightLbs", athlete.weight);
      }
      
      // Calculate age from dateOfBirth if available
      if (athlete.dateOfBirth) {
        const birthDate = new Date(athlete.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        form.setValue("age", age);
      }
      
      // Set gender based on athlete data if available
      if (athlete.gender) {
        form.setValue("gender", athlete.gender.toLowerCase() as "male" | "female");
      }
    }
  }, [athlete, form]);

  // Form submission handler
  function onSubmit(data: HeightPredictorFormValues) {
    // Convert form values to height predictor inputs
    const predictorInputs: HeightPredictionInputs = {
      currentHeight: convertToInches(data.feet, data.inches),
      currentWeight: data.weightLbs,
      ageInYears: data.age,
      isMale: data.gender === "male",
      motherHeight: convertToInches(data.motherHeightFeet, data.motherHeightInches),
      fatherHeight: convertToInches(data.fatherHeightFeet, data.fatherHeightInches),
    };

    // Calculate prediction
    const result = predictAdultHeight(predictorInputs);
    setPrediction(result);
    
    // Get position recommendations
    const recommendations = getPositionRecommendations(
      result.predictedAdultHeight, 
      predictorInputs.isMale
    );
    setPositionRecommendations(recommendations);

    // Show success toast
    toast({
      title: "Height Prediction Calculated",
      description: `Predicted adult height: ${formatHeight(result.predictedAdultHeight)}`,
    });
  }

  // Save prediction to athlete profile
  const savePrediction = async () => {
    if (!prediction || !user || !athlete) return;
    
    setSavingPrediction(true);
    
    try {
      // Format the prediction data for saving
      const predictionData = {
        predictedHeight: formatHeight(prediction.predictedAdultHeight),
        predictedHeightCm: prediction.predictedAdultHeightCm,
        percentComplete: prediction.percentOfAdultHeight,
        growthRemaining: prediction.heightRemainingInches,
        predictedRange: `${formatHeight(prediction.predictedRange.min)} - ${formatHeight(prediction.predictedRange.max)}`,
        recommendedPositions: positionRecommendations,
        calculatedAt: prediction.predictionTimestamp
      };
      
      // Send to API
      await apiRequest("POST", `/api/athlete/${athlete.id}/height-prediction`, predictionData);
      
      // Update athlete data
      queryClient.invalidateQueries({ queryKey: ["/api/athlete/me"] });
      
      // Success toast
      toast({
        title: "Prediction Saved",
        description: "Height prediction has been saved to your profile",
      });
    } catch (error) {
      console.error("Error saving prediction:", error);
      toast({
        title: "Error Saving Prediction",
        description: "There was a problem saving your height prediction",
        variant: "destructive",
      });
    } finally {
      setSavingPrediction(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-5 w-5" />
          Khamis-Roche Height Predictor
        </CardTitle>
        <CardDescription>
          Predict your adult height based on your current metrics and genetics
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="calculator">
          <TabsList className="mb-4">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="results" disabled={!prediction}>Results</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Current Height */}
                  <div className="grid gap-3 grid-cols-2">
                    <FormField
                      control={form.control}
                      name="feet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (ft)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={3}
                              max={7}
                              step={1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="inches"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inches</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={11.9}
                              step={0.1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Weight */}
                  <FormField
                    control={form.control}
                    name="weightLbs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (lbs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={50}
                            max={350}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Age and Gender */}
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (years)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={8}
                            max={18}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center mb-3">
                    <h3 className="text-md font-medium">Parents' Heights</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="ml-2 h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Genetic height potential is a significant factor in predicting adult height.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Mother's Height */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Mother's Height</div>
                      <div className="grid gap-3 grid-cols-2">
                        <FormField
                          control={form.control}
                          name="motherHeightFeet"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={4}
                                  max={7}
                                  placeholder="Feet"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="motherHeightInches"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={11.9}
                                  placeholder="Inches"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Father's Height */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Father's Height</div>
                      <div className="grid gap-3 grid-cols-2">
                        <FormField
                          control={form.control}
                          name="fatherHeightFeet"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={4}
                                  max={7}
                                  placeholder="Feet"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="fatherHeightInches"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={11.9}
                                  placeholder="Inches"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Calculate Prediction
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="results">
            {prediction ? (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Predicted Adult Height</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">
                        {formatHeight(prediction.predictedAdultHeight)}
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          ({prediction.predictedAdultHeightCm} cm)
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Range: {formatHeight(prediction.predictedRange.min)} - {formatHeight(prediction.predictedRange.max)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Growth Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current Progress</span>
                          <span className="font-medium">{prediction.percentOfAdultHeight}%</span>
                        </div>
                        <Progress value={prediction.percentOfAdultHeight} />
                        <div className="text-sm text-muted-foreground">
                          Estimated growth remaining: {prediction.heightRemainingInches}" ({prediction.heightRemainingCm} cm)
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Interpretation</h3>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-line">
                    {getHeightPredictionInterpretation(prediction, form.getValues("age"))}
                  </div>
                </div>
                
                {positionRecommendations.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <Award className="h-5 w-5 mr-2 text-amber-500" />
                      Recommended Positions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {positionRecommendations.map((position) => (
                        <div key={position} className="px-3 py-1.5 bg-secondary rounded-full text-sm font-medium">
                          {position}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        These position recommendations are based on height projections and general
                        positional fit. Many other factors like speed, agility, strength, and skill
                        development also influence positional success.
                      </p>
                    </div>
                  </div>
                )}
                
                {user && user.userType === "athlete" && (
                  <Button 
                    onClick={savePrediction} 
                    disabled={savingPrediction}
                    className="w-full"
                  >
                    {savingPrediction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save to Profile
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Complete the calculator form to see your height prediction
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="about">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">About the Khamis-Roche Method</h3>
                <p className="text-muted-foreground">
                  The Khamis-Roche method is a scientifically validated height prediction formula
                  developed by pediatric researchers. It uses current height, weight, age, and parent
                  heights to predict adult stature with reasonable accuracy.
                </p>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="accuracy">
                  <AccordionTrigger>How accurate is this prediction?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      The Khamis-Roche method has a standard error of approximately 1.7 inches
                      for boys and 1.5 inches for girls. This means:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>About 68% of predictions will be within this range of the actual adult height</li>
                      <li>The accuracy is highest for children between 9-17 years old</li>
                      <li>Other factors like nutrition, sleep, and overall health also influence growth</li>
                      <li>The prediction range provided gives a more realistic picture of potential outcomes</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="growth-factors">
                  <AccordionTrigger>What factors affect growth potential?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      While genetics play a major role in determining height, several other factors can influence growth:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Nutrition:</strong> Adequate protein, calcium, and overall calories</li>
                      <li><strong>Sleep:</strong> Growth hormone is released during deep sleep</li>
                      <li><strong>Physical Activity:</strong> Appropriate exercise supports healthy development</li>
                      <li><strong>Health:</strong> Chronic illness or certain medications can affect growth</li>
                      <li><strong>Stress:</strong> Chronic stress can impact growth hormone production</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="training">
                  <AccordionTrigger>How should training adjust during growth?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Training should be adapted based on growth stage:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>During growth spurts:</strong> Focus on flexibility and technique as body proportions change</li>
                      <li><strong>Early adolescence:</strong> Emphasize proper movement patterns and bodyweight exercises</li>
                      <li><strong>Late adolescence:</strong> Gradually increase strength training as growth stabilizes</li>
                      <li><strong>Near adult height:</strong> Tailored position-specific training becomes more effective</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                  This tool provides estimates only and should not replace medical advice.
                  Growth patterns can vary significantly between individuals, and many factors
                  besides genetics influence final adult height.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}