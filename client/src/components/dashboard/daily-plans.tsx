import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Utensils, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DailyPlans() {
  // This would typically be fetched from the API
  const plans = {
    training: {
      title: "Speed & Agility Development",
      description: "Focus on improving your first step and lateral movement.",
      items: [
        "Dynamic warm-up (10 minutes)",
        "Sprint ladder drills (3 sets)",
        "Shuttle run variations (5 x 20 yards)",
        "Box jump progression (3 sets x 8 reps)",
        "Cool down and mobility work (10 minutes)"
      ]
    },
    nutrition: {
      title: "Game Day Preparation",
      description: "Maximize energy and focus with proper nutrition timing.",
      items: [
        "Pre-workout: Oatmeal with banana and protein (2 hours before)",
        "Hydration: 16-20oz water with electrolytes",
        "Post-workout: Protein shake with 40g protein",
        "Dinner: Lean protein, sweet potato, green vegetables",
        "Evening: Casein protein before bed"
      ]
    },
    recruiting: {
      title: "College Connection Tasks",
      description: "Daily actions to improve your recruiting visibility.",
      items: [
        "Follow up with coach from weekend camp",
        "Update stats in online profile",
        "Request film review from position coach",
        "Research West Coast D2 programs",
        "Prepare questions for upcoming college call"
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="training" className="flex items-center gap-1.5">
            <Dumbbell className="h-4 w-4" />
            <span>Training</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-1.5">
            <Utensils className="h-4 w-4" />
            <span>Nutrition</span>
          </TabsTrigger>
          <TabsTrigger value="recruiting" className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" />
            <span>Recruiting</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="training">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{plans.training.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{plans.training.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm mb-4">
                {plans.training.items.map((item, index) => (
                  <li key={index} className="flex items-baseline gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/training">
                <Button size="sm" variant="outline" className="w-full flex items-center justify-center gap-1">
                  <span>View Full Plan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="nutrition">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{plans.nutrition.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{plans.nutrition.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm mb-4">
                {plans.nutrition.items.map((item, index) => (
                  <li key={index} className="flex items-baseline gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/nutrition">
                <Button size="sm" variant="outline" className="w-full flex items-center justify-center gap-1">
                  <span>View Full Plan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recruiting">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{plans.recruiting.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{plans.recruiting.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm mb-4">
                {plans.recruiting.items.map((item, index) => (
                  <li key={index} className="flex items-baseline gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/recruiting">
                <Button size="sm" variant="outline" className="w-full flex items-center justify-center gap-1">
                  <span>View Full Plan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}