import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { InviteParentForm } from "@/components/invite-parent-form";
import { ParentAccessList } from "@/components/parent-access-list";
import { ParentReportGenerator } from "@/components/parent-report-generator";
import { NutritionShoppingListGenerator } from "@/components/nutrition-shopping-list-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail, Shield, FileText, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

export default function ParentManagementPage() {
  const { user, isLoading } = useAuth();
  
  // Get athlete information
  const { data: athlete, isLoading: isLoadingAthlete, error } = useQuery({
    queryKey: ["/api/athlete/me"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/athlete/me");
      return response.json();
    },
    enabled: !!user && user.userType === 'athlete'
  });
  
  if (isLoading || isLoadingAthlete) {
    return (
      <div className="container max-w-screen-lg mx-auto py-8">
        <div className="text-center py-12">
          <div className="spinner"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container max-w-screen-lg mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to login to access this page</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Button asChild className="mt-4">
              <Link to="/auth">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (user.userType !== 'athlete') {
    return (
      <div className="container max-w-screen-lg mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only athletes can manage parent access</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  if (error || !athlete) {
    return (
      <div className="container max-w-screen-lg mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error instanceof Error 
                ? error.message 
                : "Could not load athlete information"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-lg mx-auto py-8">
      <div className="flex items-center mb-6">
        <Mail className="mr-2 h-6 w-6" />
        <h1 className="text-2xl font-bold">Parent Access</h1>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Give your parents read-only access to track your progress, get shopping lists for your nutrition plan, 
        and receive updates about your achievements.
      </p>
      
      <Tabs defaultValue="existing">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="existing">Current Access</TabsTrigger>
          <TabsTrigger value="invite">Invite Parent</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="nutrition">Shopping Lists</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing" className="space-y-4">
          <ParentAccessList athleteId={athlete.id} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                About Parent Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Parents with access can:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>View your performance stats and progress through a secure link</li>
                <li>Receive email updates about your achievements and improvements</li>
                <li>Get shopping lists based on your nutrition plan</li>
                <li>View academic and athletic progress reports</li>
              </ul>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                Parents cannot edit your profile or make changes to your account. 
                You can revoke access at any time.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invite">
          <Card>
            <CardHeader>
              <CardTitle>Invite a Parent or Guardian</CardTitle>
              <CardDescription>
                Send an invitation with a secure access link to your parent or guardian.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InviteParentForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <ParentReportGenerator athleteId={athlete.id} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                About Parent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Parent reports help keep your family informed about your progress:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Detailed performance metrics and improvement trends</li>
                <li>Recent achievements and milestones</li>
                <li>Training and workout summary</li>
                <li>Academic standing and eligibility status</li>
                <li>Upcoming games and events</li>
              </ul>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                You can set up one-time reports or schedule recurring reports to be sent automatically.
                Only parents who have been given access will receive reports.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="nutrition" className="space-y-4">
          <NutritionShoppingListGenerator athleteId={athlete.id} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5" />
                About Nutrition Shopping Lists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Nutrition shopping lists help your parents support your meal plan:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Generate lists based on your custom nutrition plan</li>
                <li>Categorized items for easy shopping</li>
                <li>Include quantities needed for your caloric targets</li>
                <li>Automatically exclude items that don't match your dietary restrictions</li>
              </ul>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                Only parents who have opted in to receive nutrition information will get shopping lists.
                You can customize the shopping list before sending it.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}