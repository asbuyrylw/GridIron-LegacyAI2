import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to fetch an athlete's recruiting profile
 */
export function useRecruitingProfile(athleteId: number) {
  return useQuery({
    queryKey: [`/api/athlete/${athleteId}/recruiting-profile`],
    enabled: !!athleteId,
  });
}

/**
 * Hook to update an athlete's recruiting profile
 */
export function useUpdateRecruitingProfile(athleteId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/athlete/${athleteId}/recruiting-profile`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate recruiting profile query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${athleteId}/recruiting-profile`]
      });
      
      toast({
        title: "Profile updated",
        description: "Your recruiting profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

/**
 * Hook to fetch recruiting analytics data
 */
export function useRecruitingAnalytics(athleteId: number) {
  return useQuery({
    queryKey: [`/api/athlete/${athleteId}/recruiting-analytics`],
    enabled: !!athleteId,
  });
}

/**
 * Hook to fetch schools interested in an athlete
 */
export function useInterestedSchools(athleteId: number) {
  return useQuery({
    queryKey: [`/api/athlete/${athleteId}/interested-schools`],
    enabled: !!athleteId,
  });
}

/**
 * Hook to fetch recruiting messages
 */
export function useRecruitingMessages(athleteId: number) {
  return useQuery({
    queryKey: [`/api/athlete/${athleteId}/recruiting-messages`],
    enabled: !!athleteId,
  });
}

/**
 * Hook to send a recruiting message
 */
export function useSendRecruitingMessage(athleteId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { recipientId: number; message: string }) => {
      const res = await apiRequest(
        "POST", 
        `/api/athlete/${athleteId}/recruiting-messages`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate messages query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${athleteId}/recruiting-messages`]
      });
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

/**
 * Hook to share a recruiting profile
 */
export function useShareRecruitingProfile(athleteId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { recipientIds: number[]; message?: string }) => {
      const res = await apiRequest(
        "POST", 
        `/api/athlete/${athleteId}/share-profile`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile shared",
        description: "Your profile has been shared successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to share profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}