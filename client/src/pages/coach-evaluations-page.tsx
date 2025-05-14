import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Skeleton } from '@/components/ui/skeleton';

export default function CoachEvaluationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('evaluations');
  
  // Fetch evaluation templates
  const templatesQuery = useQuery({
    queryKey: ['/api/coach/templates'],
    enabled: !!user && user.userType === 'coach',
  });
  
  // Fetch evaluations (when in coach view)
  const evaluationsQuery = useQuery({
    queryKey: ['/api/coach/evaluations'],
    enabled: !!user && user.userType === 'coach' && activeTab === 'evaluations',
  });
  
  // Fetch depth charts
  const depthChartsQuery = useQuery({
    queryKey: ['/api/coach/depth-charts'],
    enabled: !!user && user.userType === 'coach' && activeTab === 'depth-charts',
  });
  
  // Determine if user is a coach
  const isCoach = user?.userType === 'coach';
  
  // Handle non-coach access
  if (user && !isCoach) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Coach Evaluations & Depth Chart</h1>
        <Card>
          <CardHeader>
            <CardTitle>Athlete View</CardTitle>
            <CardDescription>
              View your coach evaluations and position on the depth chart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Features for athletes will be coming soon...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Coach Evaluations & Depth Chart</h1>
      </div>
      
      <Tabs defaultValue="evaluations" className="w-full"
        onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="evaluations">Player Evaluations</TabsTrigger>
          <TabsTrigger value="depth-charts">Depth Charts</TabsTrigger>
        </TabsList>
        
        {/* Player Evaluations Tab */}
        <TabsContent value="evaluations" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Player Evaluations</h2>
            <Button>Create New Evaluation</Button>
          </div>
          
          {evaluationsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="w-full h-24 rounded-lg" />
              <Skeleton className="w-full h-24 rounded-lg" />
              <Skeleton className="w-full h-24 rounded-lg" />
            </div>
          ) : evaluationsQuery.isError ? (
            <EmptyPlaceholder
              title="Error loading evaluations"
              description="There was a problem loading the player evaluations. Please try again."
              action={<Button onClick={() => evaluationsQuery.refetch()}>Retry</Button>}
            />
          ) : evaluationsQuery.data?.length === 0 ? (
            <EmptyPlaceholder
              title="No evaluations yet"
              description="Start by creating evaluations for your athletes."
              action={<Button>Create First Evaluation</Button>}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {evaluationsQuery.data?.map((evaluation: any) => (
                <Card key={evaluation.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{evaluation.athleteName}</CardTitle>
                        <CardDescription>
                          {evaluation.position} - {evaluation.season}
                        </CardDescription>
                      </div>
                      <Badge>{evaluation.overall_rating?.toFixed(1)}/10</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 flex-grow">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Athleticism: <span className="font-medium">{evaluation.athleticism}/10</span></div>
                      <div>Technique: <span className="font-medium">{evaluation.technique}/10</span></div>
                      <div>Football IQ: <span className="font-medium">{evaluation.football_iq}/10</span></div>
                      <div>Leadership: <span className="font-medium">{evaluation.leadership}/10</span></div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Depth Charts Tab */}
        <TabsContent value="depth-charts" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Depth Charts</h2>
            <Button>Create New Depth Chart</Button>
          </div>
          
          {depthChartsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="w-full h-24 rounded-lg" />
              <Skeleton className="w-full h-24 rounded-lg" />
            </div>
          ) : depthChartsQuery.isError ? (
            <EmptyPlaceholder
              title="Error loading depth charts"
              description="There was a problem loading the depth charts. Please try again."
              action={<Button onClick={() => depthChartsQuery.refetch()}>Retry</Button>}
            />
          ) : depthChartsQuery.data?.length === 0 ? (
            <EmptyPlaceholder
              title="No depth charts yet"
              description="Start by creating a depth chart for your team."
              action={<Button>Create First Depth Chart</Button>}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {depthChartsQuery.data?.map((chart: any) => (
                <Card key={chart.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{chart.name}</CardTitle>
                        <CardDescription>
                          Team: {chart.teamName}
                        </CardDescription>
                      </div>
                      {chart.isActive && <Badge variant="outline" className="bg-green-50">Active</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-2">
                      Created: {new Date(chart.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full">View Depth Chart</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}