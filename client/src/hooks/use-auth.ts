import React, { createContext, useContext, ReactNode } from 'react';
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
    onboardingCompleted?: boolean;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: { username: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery<User | null>({
    queryKey: ['/api/user'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const login = async (credentials: { username: string; password: string }): Promise<User> => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const userData = await response.json();
    refetch(); // Refetch user data after login
    return userData;
  };

  const logout = async (): Promise<void> => {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Logout failed');
    }

    refetch(); // Refetch user data after logout
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}