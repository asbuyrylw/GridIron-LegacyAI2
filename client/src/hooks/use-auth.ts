import React, { useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthContext, AuthContextType, User } from './auth-context';

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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Provide a default implementation to prevent errors when not in provider
    return {
      user: null,
      isLoading: false,
      error: null,
      login: async (credentials: { username: string; password: string }) => { 
        console.error('Auth provider not found');
        return Promise.reject(new Error('Auth provider not found'));
      },
      logout: async () => {
        console.error('Auth provider not found');
        return Promise.reject(new Error('Auth provider not found'));
      }
    };
  }
  return context;
}