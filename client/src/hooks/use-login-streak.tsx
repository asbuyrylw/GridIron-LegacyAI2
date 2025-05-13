import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { queryClient } from '@/lib/queryClient';

export interface LoginStreak {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  streakHistory: { date: string; count: number }[];
}

export function useLoginStreak() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [streak, setStreak] = useState<LoginStreak>({
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: null,
    streakHistory: []
  });
  
  // Fetch the user's login streak data
  const { data: streakData, isLoading, error } = useQuery({
    queryKey: ['/api/user/login-streak'],
    queryFn: async () => {
      const response = await fetch('/api/user/login-streak');
      if (!response.ok) {
        throw new Error('Failed to fetch login streak data');
      }
      return response.json() as Promise<LoginStreak>;
    },
    enabled: !!user,
  });
  
  // Update login streak mutation
  const updateLoginStreakMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user/login-streak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update login streak');
      }
      
      return response.json() as Promise<LoginStreak>;
    },
    onSuccess: (data) => {
      // Update local state with the new streak data
      setStreak(data);
      
      // If the streak increased, show a toast notification
      if (streakData && data.currentStreak > streakData.currentStreak) {
        toast({
          title: `${data.currentStreak} Day Streak!`,
          description: `You've logged in ${data.currentStreak} days in a row. Keep it up!`,
          variant: 'default',
        });
        
        // Check if this is a new record
        if (data.currentStreak > streakData.longestStreak) {
          toast({
            title: 'New Record!',
            description: `You've achieved your longest login streak yet. Amazing!`,
            variant: 'default',
          });
        }
      }
      
      // Invalidate the cache to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/user/login-streak'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update login streak: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update streak data when it loads
  useEffect(() => {
    if (streakData) {
      setStreak(streakData);
    }
  }, [streakData]);
  
  // Record login on initial load
  useEffect(() => {
    if (user && !isLoading && !error) {
      updateLoginStreakMutation.mutate();
    }
  }, [user]);
  
  return {
    streak,
    isLoading,
    error,
    updateStreak: updateLoginStreakMutation.mutate,
    isPending: updateLoginStreakMutation.isPending
  };
}