import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface LoginStreak {
  id: number;
  userId: number;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  streakHistory: { date: string; count: number }[];
}

export function useLoginStreak() {
  const { data, isLoading, error, refetch } = useQuery<LoginStreak>({
    queryKey: ['/api/login-streak'],
    queryFn: () => apiRequest('/api/login-streak').then(r => r.json()),
    refetchOnWindowFocus: false
  });

  return {
    streak: data || {
      id: 0,
      userId: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: null,
      streakHistory: []
    },
    isLoading,
    error,
    refetch
  };
}

export function useLoginStreakUpdate() {
  return async () => {
    try {
      const response = await apiRequest('/api/login-streak/update', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update login streak');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating login streak:', error);
      throw error;
    }
  };
}