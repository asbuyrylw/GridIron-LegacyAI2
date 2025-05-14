import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { LoginData, AthleteRegistration, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/query-client";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export type AuthContextType = {
  user: User | null;
  athlete: any | null; // The athlete property from the user object
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, AthleteRegistration>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      console.log("Fetching user data...");
      try {
        const userData = await apiRequest("GET", "/api/user");
        console.log("User data fetched successfully:", userData);
        return userData;
      } catch (error) {
        console.error("Error fetching user data:", error);
        if ((error as any).message?.includes("401")) {
          console.log("Authentication error 401, returning null");
          return null;
        }
        throw error;
      }
    },
    retry: 0, // Don't retry on error
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Attempting login with:", credentials.username);
      try {
        const result = await apiRequest("POST", "/api/login", { body: credentials });
        console.log("Login API response success:", result);
        return result;
      } catch (error) {
        console.error("Login API error:", error);
        throw error;
      }
    },
    onSuccess: (userData: User) => {
      console.log("Login successful, user data:", userData);
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.athlete?.firstName || userData.username}!`,
      });
      // Immediately refetch user data to ensure it's up to date
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Navigate to the dashboard after successful login
      navigate("/");
    },
    onError: (error: Error) => {
      console.error("Login mutation error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: AthleteRegistration) => {
      return await apiRequest("POST", "/api/register", { body: credentials });
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Registration successful",
        description: `Welcome to GridIron LegacyAI, ${userData.athlete?.firstName || userData.username}!`,
      });
      // Navigate to the dashboard after successful registration
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        athlete: user?.athlete || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
