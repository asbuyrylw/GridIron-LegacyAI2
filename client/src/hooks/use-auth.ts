import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  username: string;
  email: string;
  userType: string;
  createdAt: string;
  athlete?: {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    position: string;
    height?: number;
    weight?: number;
    school?: string;
    grade?: string;
    graduationYear?: number;
    [key: string]: any;
  };
}

export function useAuth() {
  const {
    data: user,
    isLoading,
    error
  } = useQuery<User | null>({
    queryKey: ['/api/user'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user,
    isLoading,
    error
  };
}