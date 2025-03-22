import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { CombineMetric } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function BodyMetrics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  
  const { data: metrics } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${athleteId}/metrics`],
    enabled: !!athleteId,
  });
  
  const latestMetrics = metrics?.[0];
  
  const handleUpdateStats = () => {
    toast({
      title: "Update Stats",
      description: "Navigate to the Stats page to update your metrics",
    });
  };
  
  const handleViewHistory = () => {
    toast({
      title: "View History",
      description: "Navigate to the Stats page to view your metrics history",
    });
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-montserrat">Current Body Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-xs text-gray-500 dark:text-gray-400">Height</div>
            <div className="font-mono font-semibold text-lg">
              {user?.athlete?.height || "N/A"}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-xs text-gray-500 dark:text-gray-400">Weight</div>
            <div className="font-mono font-semibold text-lg">
              {user?.athlete?.weight ? `${user.athlete.weight} lbs` : "N/A"}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-xs text-gray-500 dark:text-gray-400">Body Fat</div>
            <div className="font-mono font-semibold text-lg">
              {user?.athlete?.bodyFat ? `${user.athlete.bodyFat}%` : "N/A"}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline"
          className="text-sm py-1"
          onClick={handleUpdateStats}
        >
          Update Stats
        </Button>
        <Button 
          className="text-sm py-1"
          onClick={handleViewHistory}
        >
          View History
        </Button>
      </CardFooter>
    </Card>
  );
}
