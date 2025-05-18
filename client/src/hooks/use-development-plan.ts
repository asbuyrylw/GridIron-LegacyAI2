import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useDevelopmentPlan(athleteId?: number) {
  // Only fetch if we have a valid athleteId
  const enabled = Boolean(athleteId);

  // Get the current development plan
  const developmentPlanQuery = useQuery({
    queryKey: ['/api/athlete', athleteId, 'development-plan'],
    queryFn: () => {
      if (!athleteId) {
        throw new Error("No athlete ID provided");
      }
      return apiRequest(`/api/athlete/${athleteId}/development-plan`).then(res => res.json());
    },
    enabled
  });

  // Generate a new development plan
  const generateDevelopmentPlanMutation = useMutation({
    mutationFn: () => {
      if (!athleteId) {
        throw new Error("No athlete ID provided");
      }
      return apiRequest('POST', `/api/athlete/${athleteId}/generate-development-plan`).then(res => res.json());
    },
    onSuccess: () => {
      // Invalidate the cache and refetch the development plan
      if (athleteId) {
        queryClient.invalidateQueries({
          queryKey: ['/api/athlete', athleteId, 'development-plan']
        });
      }
    }
  });

  // Generate a progress report
  const generateProgressReportMutation = useMutation({
    mutationFn: () => {
      if (!athleteId) {
        throw new Error("No athlete ID provided");
      }
      return apiRequest('POST', `/api/athlete/${athleteId}/generate-progress-report`).then(res => res.json());
    }
  });

  // Generate an annual review
  const generateAnnualReviewMutation = useMutation({
    mutationFn: () => {
      if (!athleteId) {
        throw new Error("No athlete ID provided");
      }
      return apiRequest('POST', `/api/athlete/${athleteId}/generate-annual-review`).then(res => res.json());
    }
  });

  return {
    developmentPlan: developmentPlanQuery.data || null,
    isLoading: developmentPlanQuery.isLoading,
    error: developmentPlanQuery.error,
    generateDevelopmentPlan: generateDevelopmentPlanMutation.mutate,
    isGenerating: generateDevelopmentPlanMutation.isPending,
    generateProgressReport: generateProgressReportMutation.mutate,
    progressReport: generateProgressReportMutation.data || null,
    isGeneratingProgressReport: generateProgressReportMutation.isPending,
    generateAnnualReview: generateAnnualReviewMutation.mutate,
    annualReview: generateAnnualReviewMutation.data || null,
    isGeneratingAnnualReview: generateAnnualReviewMutation.isPending,
  };
}