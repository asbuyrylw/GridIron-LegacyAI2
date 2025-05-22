import { createContext } from 'react';

export interface User {
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

export interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: { username: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
}

// Create the default context with mock implementations
const defaultContext: AuthContextType = {
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

export const AuthContext = createContext<AuthContextType>(defaultContext);