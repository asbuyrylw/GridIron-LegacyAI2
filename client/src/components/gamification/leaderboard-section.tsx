import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import Leaderboard from './leaderboard';

interface LeaderboardSectionProps {
  title?: string;
  description?: string;
  limit?: number;
  showTabs?: boolean;
}

interface Leaderboard {
  id: number;
  name: string;
  description: string;
  metric: string;
  period: string;
  active: boolean;
}

export default function LeaderboardSection({ 
  title = "Leaderboards", 
  description = "See how you stack up against other athletes", 
  limit = 5,
  showTabs = true
}: LeaderboardSectionProps) {
  // Fetch all available leaderboards
  const { 
    data: leaderboards, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/leaderboards'],
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            An error occurred while loading leaderboards. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboards || leaderboards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No leaderboards are currently available.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter active leaderboards
  const activeLeaderboards = leaderboards.filter((lb: Leaderboard) => lb.active);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {showTabs && activeLeaderboards.length > 1 ? (
          <Tabs defaultValue={activeLeaderboards[0].id.toString()}>
            <TabsList className="grid grid-cols-3 mb-4 w-full">
              {activeLeaderboards.slice(0, 3).map((lb: Leaderboard) => (
                <TabsTrigger key={lb.id} value={lb.id.toString()}>
                  {lb.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {activeLeaderboards.slice(0, 3).map((lb: Leaderboard) => (
              <TabsContent key={lb.id} value={lb.id.toString()}>
                <Leaderboard 
                  leaderboardId={lb.id} 
                  title={lb.name}
                  description={lb.description}
                  limit={limit}
                  showAllLeaderboards={false}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          // If only one leaderboard or tabs not needed, show the first one directly
          <Leaderboard 
            leaderboardId={activeLeaderboards[0]?.id} 
            title={activeLeaderboards[0]?.name}
            description={activeLeaderboards[0]?.description}
            limit={limit}
            showAllLeaderboards={!showTabs && activeLeaderboards.length > 1}
          />
        )}
      </CardContent>
    </Card>
  );
}