import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export interface User {
  id: number;
  username: string;
  email: string;
  userType: "athlete" | "parent" | "coach" | "admin";
  athlete?: {
    id: number;
    firstName: string;
    lastName: string;
    position: string;
    school?: string;
    grade?: number;
    height?: string;
    weight?: number;
    onboardingCompleted: boolean;
    [key: string]: any;
  };
}

export function useUser() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  
  const { data, isLoading: profileLoading, error } = useQuery({
    queryKey: ["/api/user/profile", authUser?.id],
    enabled: !!authUser?.id,
  });
  
  // Combine auth user with profile data
  const user = authUser ? {
    ...authUser,
    ...data
  } : undefined;
  
  return {
    user,
    isLoading: authLoading || profileLoading,
    error
  };
}