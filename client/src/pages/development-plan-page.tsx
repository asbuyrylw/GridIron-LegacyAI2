import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useUser } from '@/hooks/use-user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  GraduationCap,
  LineChart,
  Utensils,
  Trophy,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function DevelopmentPlanPage() {
  const { user, isLoading: userLoading } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const athleteId = user?.athlete?.id;

  // Query to fetch the athlete's development plan
  const { data: developmentPlan, isLoading: planLoading, error } = useQuery({
    queryKey: ['/api/athlete', athleteId, 'development-plan'],
    enabled: !!athleteId,
  });

  // Mutation to generate a new development plan
  const { mutate: generatePlan, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/athlete/${athleteId}/generate-development-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate development plan');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/athlete', athleteId, 'development-plan'] });
      toast({
        title: 'Development Plan Generated',
        description: 'Your personalized development plan has been created successfully.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to generate development plan: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const isLoading = userLoading || planLoading;
  const hasNoPlan = !isLoading && !developmentPlan;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading your development plan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-2xl font-bold text-red-500">Error Loading Development Plan</h2>
        <p className="text-gray-600">{error.message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (hasNoPlan) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Trophy className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">No Development Plan Yet</h2>
        <p className="max-w-md text-lg text-gray-600">
          Generate your personalized long-term development plan to reach your football and academic goals!
        </p>
        <Button 
          size="lg" 
          onClick={() => generatePlan()} 
          disabled={isGenerating}
          className="mt-4"
        >
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LineChart className="mr-2 h-4 w-4" />}
          {isGenerating ? 'Generating Plan...' : 'Generate My Development Plan'}
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          This will analyze your profile data and create a comprehensive roadmap from your current grade through senior year.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">My Development Plan</h1>
          <p className="text-gray-600">
            Your personalized roadmap to achieving your football and academic goals
          </p>
        </div>
        
        <DevelopmentPlanOverview plan={developmentPlan} />
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <LineChart className="mr-2 h-4 w-4" />
              Long-Term Growth
            </TabsTrigger>
            <TabsTrigger value="current-year">
              <Calendar className="mr-2 h-4 w-4" />
              Current Year Plan
            </TabsTrigger>
            <TabsTrigger value="training">
              <Dumbbell className="mr-2 h-4 w-4" />
              Training Program
            </TabsTrigger>
            <TabsTrigger value="nutrition">
              <Utensils className="mr-2 h-4 w-4" />
              Nutrition Plan
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <LongTermPlanSection plan={developmentPlan} />
          </TabsContent>
          
          <TabsContent value="current-year" className="mt-6">
            <CurrentYearPlanSection plan={developmentPlan} />
          </TabsContent>
          
          <TabsContent value="training" className="mt-6">
            <TrainingProgramSection plan={developmentPlan} />
          </TabsContent>
          
          <TabsContent value="nutrition" className="mt-6">
            <NutritionPlanSection plan={developmentPlan} />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-8">
          <Button 
            variant="outline" 
            onClick={() => generatePlan()} 
            disabled={isGenerating}
            className="mr-2"
          >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LineChart className="mr-2 h-4 w-4" />}
            {isGenerating ? 'Regenerating...' : 'Regenerate Plan'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DevelopmentPlanOverview({ plan }: { plan: any }) {
  if (!plan || !plan.longTermPlan) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Development Overview</CardTitle>
        <CardDescription>{plan.longTermPlan.overview}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            title="Next Check-in" 
            value={new Date(plan.nextUpdateDate).toLocaleDateString()} 
            description="12-week progress assessment"
            icon={<Calendar className="h-5 w-5 text-primary" />} 
          />
          <StatCard 
            title="Current Phase" 
            value={getCurrentPhase(plan)}
            description="Focus on growth areas"
            icon={<BarChart3 className="h-5 w-5 text-primary" />} 
          />
          <StatCard 
            title="Progress" 
            value="Just Started"
            description="Track your development journey"
            icon={<Trophy className="h-5 w-5 text-primary" />} 
            progress={5}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function LongTermPlanSection({ plan }: { plan: any }) {
  if (!plan?.longTermPlan?.yearByYearPlan) return null;
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Year-by-Year Development Plan</h2>
      <p className="text-gray-600">{plan.longTermPlan.overview}</p>
      
      <div className="space-y-8 mt-6">
        {plan.longTermPlan.yearByYearPlan.map((year: any, index: number) => (
          <YearlyPlanCard key={index} yearPlan={year} />
        ))}
      </div>
    </div>
  );
}

function YearlyPlanCard({ yearPlan }: { yearPlan: any }) {
  return (
    <Card>
      <CardHeader className="bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <CardTitle>{yearPlan.academicYear}</CardTitle>
          <Badge variant="outline">{`Grade ${yearPlan.grade}`}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Dumbbell className="mr-2 h-4 w-4 text-primary" />
              Physical Development
            </h3>
            <div className="space-y-4">
              <MetricRow 
                label="Target Weight" 
                value={`${yearPlan.bodyDevelopment.targetWeight} lbs`} 
              />
              <MetricRow 
                label="Body Fat %" 
                value={`${yearPlan.bodyDevelopment.targetBodyFat}%`} 
              />
              <MetricRow 
                label="Projected Height" 
                value={yearPlan.bodyDevelopment.heightProjection} 
              />
              <MetricRow 
                label="Muscle Goal" 
                value={yearPlan.bodyDevelopment.muscleGainGoal} 
              />
            </div>
            
            <h3 className="text-lg font-semibold mt-6 mb-3 flex items-center">
              <Trophy className="mr-2 h-4 w-4 text-primary" />
              Combine Targets
            </h3>
            <div className="space-y-4">
              <MetricRow 
                label="40-Yard Dash" 
                value={yearPlan.combineMetrics.fortyYard} 
              />
              <MetricRow 
                label="Bench Press" 
                value={yearPlan.combineMetrics.benchPress} 
              />
              <MetricRow 
                label="Squat" 
                value={yearPlan.combineMetrics.squat} 
              />
              <MetricRow 
                label="Vertical Jump" 
                value={yearPlan.combineMetrics.verticalJump} 
              />
              <MetricRow 
                label="Shuttle" 
                value={yearPlan.combineMetrics.shuttle} 
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <GraduationCap className="mr-2 h-4 w-4 text-primary" />
              Academic Goals
            </h3>
            <div className="space-y-2 mb-4">
              <p className="font-medium">GPA Target: <span className="font-normal">{yearPlan.academicGoals.gpaTarget}</span></p>
              <div className="space-y-1">
                <p className="font-medium">Course Recommendations:</p>
                <ul className="list-disc pl-5">
                  {yearPlan.academicGoals.courseRecommendations.map((course: string, idx: number) => (
                    <li key={idx} className="text-gray-600">{course}</li>
                  ))}
                </ul>
              </div>
              {yearPlan.academicGoals.testPrep && (
                <p className="font-medium">Test Prep: <span className="font-normal">{yearPlan.academicGoals.testPrep}</span></p>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mt-6 mb-3 flex items-center">
              <ArrowUpRight className="mr-2 h-4 w-4 text-primary" />
              Recruiting Milestones
            </h3>
            <div className="space-y-2">
              <p className="font-medium">Film Goals:</p>
              <p className="text-gray-600">{yearPlan.recruitingMilestones.filmGoals}</p>
              
              <p className="font-medium mt-3">Camp Plans:</p>
              <ul className="list-disc pl-5">
                {yearPlan.recruitingMilestones.campPlans.map((camp: string, idx: number) => (
                  <li key={idx} className="text-gray-600">{camp}</li>
                ))}
              </ul>
              
              <p className="font-medium mt-3">Exposure Strategy:</p>
              <p className="text-gray-600">{yearPlan.recruitingMilestones.exposureStrategy}</p>
              
              <p className="font-medium mt-3">Timeline:</p>
              <p className="text-gray-600">{yearPlan.recruitingMilestones.timeline}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CurrentYearPlanSection({ plan }: { plan: any }) {
  if (!plan?.currentYearPlan?.quarterlyBreakdown) return null;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Current Year Plan</h2>
        <p className="text-gray-600 mt-2">{plan.currentYearPlan.overview}</p>
      </div>
      
      <div className="space-y-8 mt-6">
        {plan.currentYearPlan.quarterlyBreakdown.map((quarter: any, index: number) => (
          <QuarterlyPlanCard key={index} quarter={quarter} />
        ))}
      </div>
    </div>
  );
}

function QuarterlyPlanCard({ quarter }: { quarter: any }) {
  return (
    <Card>
      <CardHeader className="bg-gray-50 dark:bg-gray-800">
        <CardTitle>{quarter.period}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {quarter.focusAreas.map((focus: string, idx: number) => (
            <Badge key={idx} variant="secondary">{focus}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center">
            <Dumbbell className="mr-2 h-4 w-4 text-primary" />
            Training Focus
          </h3>
          <p className="text-gray-600">{quarter.trainingProgram.progressionModel}</p>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Weekly Schedule:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(quarter.trainingProgram.weeklySchedule).map(([day, schedule]: [string, any]) => (
                <Card key={day} className="h-full">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base capitalize">{day}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    <p className="font-medium">{schedule.focus}</p>
                    <ul className="mt-2 space-y-1">
                      {schedule.exercises.map((ex: any, idx: number) => (
                        <li key={idx} className="text-sm text-gray-600">
                          {ex.name} ({ex.sets}×{ex.reps})
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Utensils className="mr-2 h-4 w-4 text-primary" />
              Nutrition Plan
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Macronutrient Targets:</h4>
                <div className="grid grid-cols-3 gap-4">
                  <MacroCard 
                    title="Calories" 
                    value={quarter.nutritionPlan.dailyCalories} 
                    unit="kcal" 
                    color="bg-blue-500" 
                  />
                  <MacroCard 
                    title="Protein" 
                    value={quarter.nutritionPlan.macroBreakdown.protein} 
                    unit="g" 
                    color="bg-red-500" 
                  />
                  <MacroCard 
                    title="Carbs" 
                    value={quarter.nutritionPlan.macroBreakdown.carbs} 
                    unit="g" 
                    color="bg-green-500" 
                  />
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Sample Meals:</h4>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Breakfast:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {quarter.nutritionPlan.mealPlan.breakfast.map((meal: string, idx: number) => (
                      <li key={idx}>{meal}</li>
                    ))}
                  </ul>
                  
                  <p className="text-sm font-medium mt-2">Lunch:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {quarter.nutritionPlan.mealPlan.lunch.map((meal: string, idx: number) => (
                      <li key={idx}>{meal}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Trophy className="mr-2 h-4 w-4 text-primary" />
              Recruiting Tasks
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Film Development:</h4>
                <p className="text-gray-600">{quarter.recruitingTasks.filmDevelopment}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Outreach Strategy:</h4>
                <p className="text-gray-600">{quarter.recruitingTasks.outreachStrategy}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Events to Attend:</h4>
                <ul className="list-disc pl-5 text-gray-600">
                  {quarter.recruitingTasks.events.map((event: string, idx: number) => (
                    <li key={idx}>{event}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Monthly Goals:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {Object.entries(quarter.recruitingTasks.monthlyGoals).map(([month, goals]: [string, any]) => (
                    <div key={month} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <p className="font-medium capitalize mb-2">{month}:</p>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        {goals.map((goal: string, idx: number) => (
                          <li key={idx}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrainingProgramSection({ plan }: { plan: any }) {
  if (!plan?.currentYearPlan?.quarterlyBreakdown) return null;
  
  // Get the first quarter's training program as an example
  const currentQuarter = plan.currentYearPlan.quarterlyBreakdown[0];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Current Training Program</h2>
        <p className="text-gray-600 mt-2">{currentQuarter.period}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>{currentQuarter.trainingProgram.progressionModel}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(currentQuarter.trainingProgram.weeklySchedule).map(([day, schedule]: [string, any]) => (
              <div key={day} className="rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium capitalize">{day}: <span className="font-normal text-gray-600">{schedule.focus}</span></h3>
                </div>
                <div className="p-4">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {schedule.exercises.map((exercise: any, idx: number) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{exercise.name}</p>
                            <p className="text-sm text-gray-500">{exercise.sets} sets × {exercise.reps} | {exercise.intensity} | Rest: {exercise.rest}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Log
                          </Button>
                        </div>
                        {exercise.notes && (
                          <p className="text-sm text-gray-600 mt-1 italic">{exercise.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Recovery Protocol:</span> {currentQuarter.trainingProgram.recoveryProtocol}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function NutritionPlanSection({ plan }: { plan: any }) {
  if (!plan?.currentYearPlan?.quarterlyBreakdown) return null;
  
  // Get the first quarter's nutrition plan as an example
  const currentQuarter = plan.currentYearPlan.quarterlyBreakdown[0];
  const nutritionPlan = currentQuarter.nutritionPlan;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Nutrition Plan</h2>
        <p className="text-gray-600 mt-2">{currentQuarter.period}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Targets</CardTitle>
            <CardDescription>Macronutrient goals for optimal performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <MacroCard 
                  title="Daily Calories" 
                  value={nutritionPlan.dailyCalories} 
                  unit="kcal" 
                  color="bg-blue-500"
                  large 
                />
              </div>
              <MacroCard 
                title="Protein" 
                value={nutritionPlan.macroBreakdown.protein} 
                unit="g" 
                color="bg-red-500" 
              />
              <MacroCard 
                title="Carbs" 
                value={nutritionPlan.macroBreakdown.carbs} 
                unit="g" 
                color="bg-green-500" 
              />
              <MacroCard 
                title="Fat" 
                value={nutritionPlan.macroBreakdown.fat} 
                unit="g" 
                color="bg-yellow-500" 
              />
              <MacroCard 
                title="Water" 
                value="1 gallon" 
                unit="daily" 
                color="bg-blue-400" 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Meal Planning</CardTitle>
            <CardDescription>Recommended food choices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Recommended Supplements:</h4>
                <ul className="list-disc pl-5 text-gray-600">
                  {nutritionPlan.supplements.map((supplement: string, idx: number) => (
                    <li key={idx}>{supplement}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Key Grocery Items:</h4>
                <div className="flex flex-wrap gap-2">
                  {nutritionPlan.groceryList.map((item: string, idx: number) => (
                    <Badge key={idx} variant="outline">{item}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sample Meal Plan</CardTitle>
          <CardDescription>Example meals for your current training phase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MealCard 
              title="Breakfast" 
              options={nutritionPlan.mealPlan.breakfast} 
            />
            <MealCard 
              title="Lunch" 
              options={nutritionPlan.mealPlan.lunch} 
            />
            <MealCard 
              title="Dinner" 
              options={nutritionPlan.mealPlan.dinner} 
            />
            <MealCard 
              title="Snacks" 
              options={nutritionPlan.mealPlan.snacks} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, description, icon, progress }: { 
  title: string; 
  value: string; 
  description: string;
  icon: React.ReactNode;
  progress?: number;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-2">
            {icon}
          </div>
        </div>
        {progress !== undefined && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 py-2">
      <span className="font-medium">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function MacroCard({ title, value, unit, color, large = false }: { 
  title: string; 
  value: string | number; 
  unit: string;
  color: string;
  large?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-4 ${large ? 'flex items-center' : ''}`}>
      <div className={`h-3 w-3 rounded-full ${color} ${large ? 'mr-3' : 'mb-2'}`} />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className={`font-bold ${large ? 'text-3xl' : 'text-xl'}`}>
          {value} <span className="text-gray-500 text-sm font-normal">{unit}</span>
        </p>
      </div>
    </div>
  );
}

function MealCard({ title, options }: { title: string; options: string[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {options.map((option, idx) => (
            <li key={idx} className="text-sm">
              <ChevronRight className="h-3 w-3 inline-block text-primary mr-1" />
              {option}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getCurrentPhase(plan: any): string {
  if (!plan?.currentYearPlan?.quarterlyBreakdown?.length) return "Not Set";
  
  const currentQuarter = plan.currentYearPlan.quarterlyBreakdown[0];
  return currentQuarter.period.split(":")[0];
}