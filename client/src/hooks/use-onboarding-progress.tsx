import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OnboardingProgressData {
  step: number;
  data: any;
  timestamp: string;
  exists: boolean;
}

type SaveProgressFn = (step: number, data: any) => Promise<void>;

export function useOnboardingProgress() {
  const { user } = useAuth();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  const [isLoading, setIsLoading] = useState(false);
  
  // Query to fetch saved progress
  const { 
    data: savedProgress,
    isLoading: isLoadingProgress,
    error: loadError
  } = useQuery<OnboardingProgressData>({
    queryKey: [`/api/athlete/${athleteId}/onboarding/progress`],
    enabled: !!athleteId,
    retry: 1,
    // Don't refetch automatically
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: Infinity
  });
  
  // Mutation to save progress
  const { mutateAsync: saveProgressMutation } = useMutation({
    mutationFn: async ({ step, data }: { step: number; data: any }) => {
      const response = await apiRequest(
        "POST", 
        `/api/athlete/${athleteId}/onboarding/progress`, 
        { step, data }
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/onboarding/progress`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save progress",
        description: "Your progress couldn't be saved. Please try again.",
        variant: "destructive"
      });
      console.error("Error saving onboarding progress:", error);
    }
  });
  
  // Save progress function with loading state
  const saveProgress: SaveProgressFn = useCallback(async (step: number, data: any) => {
    if (!athleteId) {
      console.error("Cannot save progress: No athlete ID found");
      return;
    }
    
    setIsLoading(true);
    try {
      await saveProgressMutation({ step, data });
    } finally {
      setIsLoading(false);
    }
  }, [athleteId, saveProgressMutation]);
  
  return {
    savedProgress,
    saveProgress,
    isLoading: isLoading || isLoadingProgress,
    error: loadError
  };
}