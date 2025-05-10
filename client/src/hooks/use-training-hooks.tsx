import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ExerciseLibrary, WorkoutSession, InsertWorkoutSession } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to fetch exercise library entries with optional filters
 */
export function useExercises(filters?: {
  category?: string;
  difficulty?: string;
  position?: string;
}) {
  const queryKey = ["/api/exercises"];
  
  // Add filters to the query key if they exist
  if (filters) {
    if (filters.category) queryKey.push(`category=${filters.category}`);
    if (filters.difficulty) queryKey.push(`difficulty=${filters.difficulty}`);
    if (filters.position) queryKey.push(`position=${filters.position}`);
  }
  
  return useQuery<ExerciseLibrary[]>({
    queryKey,
    enabled: true,
  });
}

/**
 * Hook to fetch a single exercise by ID
 */
export function useExercise(id: string | number) {
  return useQuery<ExerciseLibrary>({
    queryKey: [`/api/exercises/${id}`],
    enabled: !!id,
  });
}

/**
 * Hook to fetch workout sessions for an athlete
 */
export function useWorkoutSessions(athleteId: number) {
  return useQuery<WorkoutSession[]>({
    queryKey: [`/api/athlete/${athleteId}/workout-sessions`],
    enabled: !!athleteId,
  });
}

/**
 * Hook to fetch a single workout session by ID
 */
export function useWorkoutSession(athleteId: number, sessionId: number) {
  return useQuery<WorkoutSession>({
    queryKey: [`/api/athlete/${athleteId}/workout-sessions/${sessionId}`],
    enabled: !!athleteId && !!sessionId,
  });
}

/**
 * Hook to create a new workout session
 */
export function useCreateWorkoutSession(athleteId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (workoutData: Omit<InsertWorkoutSession, 'athleteId'>) => {
      const data = {
        ...workoutData,
        athleteId
      };
      
      const res = await apiRequest(
        "POST", 
        `/api/athlete/${athleteId}/workout-sessions`, 
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate workout sessions query to refresh the list
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${athleteId}/workout-sessions`]
      });
      
      toast({
        title: "Workout saved",
        description: "Your workout has been successfully recorded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save workout",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

/**
 * Hook to update an existing workout session
 */
export function useUpdateWorkoutSession(athleteId: number, sessionId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (workoutData: Partial<WorkoutSession>) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/athlete/${athleteId}/workout-sessions/${sessionId}`, 
        workoutData
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate both the list and the specific workout session
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${athleteId}/workout-sessions`]
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${athleteId}/workout-sessions/${sessionId}`]
      });
      
      toast({
        title: "Workout updated",
        description: "Your workout has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update workout",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

/**
 * Hook to delete a workout session
 */
export function useDeleteWorkoutSession(athleteId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await apiRequest(
        "DELETE", 
        `/api/athlete/${athleteId}/workout-sessions/${sessionId}`
      );
      return res.ok;
    },
    onSuccess: () => {
      // Invalidate workout sessions query to refresh the list
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${athleteId}/workout-sessions`]
      });
      
      toast({
        title: "Workout deleted",
        description: "The workout has been successfully removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete workout",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}