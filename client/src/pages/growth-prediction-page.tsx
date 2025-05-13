import React, { useEffect } from "react";
import { HeightPredictor } from "@/components/growth/height-predictor";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export default function GrowthPredictionPage() {
  const { user, isAuthenticated } = useAuth();
  
  const { data, isLoading, isError } = useQuery({
    queryKey: [user?.id ? `/api/athlete/${user.id}/height-prediction` : null],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }
      return apiRequest(`/api/athlete/${user.id}/height-prediction`);
    },
    enabled: !!user?.id && isAuthenticated,
  });
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Growth Prediction</h1>
        <p className="text-muted-foreground mt-2">
          Predict your adult height and track your growth progress.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <p className="font-medium">About the Height Prediction Tool</p>
          <p className="mt-1">
            This tool uses the Khamis-Roche method to predict adult height based on current height, 
            weight, age, and parents' heights. This scientific method is considered one of the most 
            accurate non-invasive height prediction tools available.
          </p>
          <p className="mt-1">
            <strong>Note:</strong> The prediction is an estimate. Many factors including nutrition, 
            exercise, genetics, and other environmental factors can influence your actual adult height.
          </p>
        </div>
        
        <HeightPredictor />
        
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold">How to Use Your Growth Prediction</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-medium text-lg">Training Focus</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use this prediction to develop training plans that complement your body type and position recommendations.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-medium text-lg">Position Selection</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Consider focusing on positions that align with your predicted adult height for optimal performance.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-medium text-lg">Nutrition Planning</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ensure proper nutrition to support healthy growth and maximize your genetic potential.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border mt-6">
            <h3 className="font-medium text-lg">Why This Matters for Football</h3>
            <p className="text-muted-foreground mt-1">
              Different positions in football have ideal height ranges that can affect performance. 
              Understanding your growth trajectory helps with long-term position planning and skill development.
              Coaches and recruiters often consider physical attributes alongside skill when evaluating players.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}