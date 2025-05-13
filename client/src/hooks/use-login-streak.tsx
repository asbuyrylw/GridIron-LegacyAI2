import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface LoginStreak {
  id: number;
  userId: number;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  streakHistory: { date: string; count: number }[];
}

// Function to handle the API call with proper TypeScript types
const fetchLoginStreak = async (): Promise<LoginStreak> => {
  const response = await apiRequest('/api/login-streak');
  if (!response.ok) {
    throw new Error('Failed to fetch login streak data');
  }
  return response.json();
};

// Function to update the login streak
const updateLoginStreak = async (): Promise<LoginStreak> => {
  const response = await apiRequest('/api/login-streak/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({}) // Empty body but proper JSON format
  });
  
  if (!response.ok) {
    throw new Error('Failed to update login streak');
  }
  
  return response.json();
};

export function useLoginStreak() {
  const { data, isLoading, error, refetch } = useQuery<LoginStreak>({
    queryKey: ['/api/login-streak'],
    queryFn: fetchLoginStreak,
    refetchOnWindowFocus: false,
    retry: 1,
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
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: updateLoginStreak,
    onSuccess: () => {
      // Invalidate login streak data to force a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/login-streak'] });
    }
  });

  return mutation;
}