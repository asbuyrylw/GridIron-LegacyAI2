import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Calendar, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DevelopmentPlanPage() {
  const [activeTab, setActiveTab] = useState("long-term");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Simple mock data (this would come from an API in a real implementation)
  const handleGeneratePlan = () => {
    setIsGenerating(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Development Plan</h1>
          <p className="text-muted-foreground">
            Track your long-term development and quarterly training plans
          </p>
        </div>
        <Button 
          onClick={handleGeneratePlan} 
          disabled={isGenerating}
          className="mt-4 md:mt-0"
        >
          {isGenerating ? (
            <>Generating Plan...</>
          ) : (
            <>Generate Development Plan</>
          )}
        </Button>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This plan is AI-generated based on your profile data and will be updated quarterly. 
          Focus on the key activities in your current quarter for optimal development.
        </AlertDescription>
      </Alert>

      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="long-term">Long-Term Plan</TabsTrigger>
          <TabsTrigger value="current-year">Current Year</TabsTrigger>
        </TabsList>
        
        <TabsContent value="long-term" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Long-Term Development Overview</h2>
            <p className="mb-6">Long-term development plan focused on comprehensive growth as a football player from current grade through senior year.</p>
            
            <h3 className="text-xl font-semibold mb-3">Year-by-Year Plan</h3>
            
            <div className="space-y-6">
              {/* Sophomore Year */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-medium">2025-2026 (Sophomore)</h4>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">In Progress</span>
                </div>
                <p className="mb-3">Focus on mastering fundamentals and building core strength</p>
                
                <h5 className="font-medium mb-2">Key Goals:</h5>
                <ul className="list-disc pl-5 mb-3 space-y-1">
                  <li>Increase weight by 10lbs</li>
                  <li>Improve 40-yard dash time</li>
                  <li>Master position fundamentals</li>
                </ul>
              </div>
              
              {/* Junior Year */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-medium">2026-2027 (Junior)</h4>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Upcoming</span>
                </div>
                <p className="mb-3">Develop advanced skills and begin college recruitment process</p>
                
                <h5 className="font-medium mb-2">Key Goals:</h5>
                <ul className="list-disc pl-5 mb-3 space-y-1">
                  <li>Earn starting position</li>
                  <li>Create highlight film</li>
                  <li>Begin contacting college coaches</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="current-year" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Current Year Plan</h2>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">Next update: August 15, 2025</span>
              </div>
            </div>
            
            <p className="mb-6">Detailed quarterly breakdown focusing on progressive skill development</p>
            
            <div className="space-y-6">
              {/* Q1 */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-medium">Off-Season Strength Building</h4>
                  <span className="flex items-center text-green-600 text-sm gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Current Quarter
                  </span>
                </div>
                <p className="mb-3">Focus on building base strength and conditioning</p>
                
                <h5 className="font-medium mb-2">Key Activities:</h5>
                <ul className="list-disc pl-5 mb-3 space-y-1">
                  <li>Weight training 4x/week</li>
                  <li>Position drills 2x/week</li>
                  <li>Flexibility work daily</li>
                </ul>
              </div>
              
              {/* Q2 */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-medium">Pre-Season Speed & Agility</h4>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Upcoming</span>
                </div>
                <p className="mb-3">Transition to explosive power and sport-specific training</p>
                
                <h5 className="font-medium mb-2">Key Activities:</h5>
                <ul className="list-disc pl-5 mb-3 space-y-1">
                  <li>Sprint training 3x/week</li>
                  <li>Scrimmages</li>
                  <li>Film study</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}