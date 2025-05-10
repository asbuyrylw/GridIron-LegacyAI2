import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExerciseLibrary, WorkoutSession, InsertWorkoutSession } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Exercise Library Hooks
export function useExercises(filters?: { 
  category?: string;
  difficulty?: string;
  position?: string;
}) {
  const queryParams = filters 
    ? `?${Object.entries(filters)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
        .join('&')}`
    : '';

  return useQuery<ExerciseLibrary[]>({
    queryKey: ['/api/exercises', filters],
    queryFn: async () => {
      const res = await fetch(`/api/exercises${queryParams}`);
      if (!res.ok) {
        throw new Error('Failed to fetch exercises');
      }
      return res.json();
    },
  });
}

export function useExercise(id: number) {
  return useQuery<ExerciseLibrary>({
    queryKey: ['/api/exercises', id],
    queryFn: async () => {
      const res = await fetch(`/api/exercises/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch exercise');
      }
      return res.json();
    },
    enabled: !!id,
  });
}

// Workout Sessions Hooks
export function useWorkoutSessions(athleteId: number) {
  return useQuery<WorkoutSession[]>({
    queryKey: ['/api/athlete', athleteId, 'workouts'],
    queryFn: async () => {
      const res = await fetch(`/api/athlete/${athleteId}/workouts`);
      if (!res.ok) {
        throw new Error('Failed to fetch workout sessions');
      }
      return res.json();
    },
    enabled: !!athleteId,
  });
}

export function useWorkoutSession(athleteId: number, workoutId: number) {
  return useQuery<WorkoutSession>({
    queryKey: ['/api/athlete', athleteId, 'workouts', workoutId],
    queryFn: async () => {
      const res = await fetch(`/api/athlete/${athleteId}/workouts/${workoutId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch workout session');
      }
      return res.json();
    },
    enabled: !!athleteId && !!workoutId,
  });
}

export function useCreateWorkoutSession(athleteId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workout: Omit<InsertWorkoutSession, 'athleteId'>) => {
      const res = await apiRequest("POST", `/api/athlete/${athleteId}/workouts`, workout);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create workout session');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/athlete', athleteId, 'workouts'] });
      toast({
        title: "Workout saved",
        description: "Your workout session has been recorded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving workout",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateWorkoutSession(athleteId: number, workoutId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<InsertWorkoutSession>) => {
      const res = await apiRequest("PATCH", `/api/athlete/${athleteId}/workouts/${workoutId}`, updates);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update workout session');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/athlete', athleteId, 'workouts', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['/api/athlete', athleteId, 'workouts'] });
      toast({
        title: "Workout updated",
        description: "Your workout session has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating workout",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}