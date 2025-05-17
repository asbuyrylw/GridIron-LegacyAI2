import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

/**
 * Hook to fetch workout sessions for an athlete
 */
export function useWorkoutSessions(athleteId: number) {
  return useQuery({
    queryKey: [`/api/athlete/${athleteId}/workout-sessions`],
    enabled: athleteId > 0,
  });
}

/**
 * Hook to fetch a specific workout session
 */
export function useWorkoutSession(athleteId: number, sessionId: number) {
  return useQuery({
    queryKey: [`/api/athlete/${athleteId}/workout-sessions/${sessionId}`],
    enabled: athleteId > 0 && sessionId > 0,
  });
}

/**
 * Hook to create a new workout session
 */
export function useCreateWorkoutSession(athleteId: number) {
  return useMutation({
    mutationFn: async (workout: any) => {
      return apiRequest(`/api/athlete/${athleteId}/workout-sessions`, {
        method: 'POST',
        data: workout
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/workout-sessions`] });
    }
  });
}

/**
 * Hook to update a workout session
 */
export function useUpdateWorkoutSession(athleteId: number, sessionId: number) {
  return useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest(`/api/athlete/${athleteId}/workout-sessions/${sessionId}`, {
        method: 'PATCH',
        data: updates
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/workout-sessions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/workout-sessions/${sessionId}`] });
    }
  });
}

/**
 * Hook to mark a workout session as complete
 */
export function useCompleteWorkoutSession(athleteId: number, sessionId: number) {
  return useMutation({
    mutationFn: async (completionData: any) => {
      return apiRequest(`/api/athlete/${athleteId}/workout-sessions/${sessionId}/complete`, {
        method: 'POST',
        data: completionData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/workout-sessions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/workout-sessions/${sessionId}`] });
    }
  });
}