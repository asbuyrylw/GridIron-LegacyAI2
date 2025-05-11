import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Types for recruiting analytics
interface RecruitingAnalytics {
  id: number;
  athleteId: number;
  profileViews: number;
  interestLevel: number;
  bookmarksCount: number;
  messagesSent: number;
  viewsOverTime: Array<{ date: string; count: number }>;
  interestBySchoolType: Array<{ name: string; value: number }>;
  interestByPosition: Array<{ name: string; value: number }>;
  interestByRegion: Array<{ name: string; value: number }>;
}

// Types for recruiting messages
interface RecruitingMessage {
  id: number;
  athleteId: number;
  schoolId: number;
  schoolName: string;
  coachName: string;
  sentAt: string;
  read: boolean;
  subject: string;
  content: string;
}

// Types for the share profile mutation
interface ShareProfileData {
  platform: string;
  message?: string;
}

/**
 * Hook to fetch recruiting analytics data
 */
export function useRecruitingAnalytics(athleteId: number) {
  return useQuery<RecruitingAnalytics>({
    queryKey: ["/api/recruiting/analytics", athleteId],
    queryFn: getRecruitingAnalytics,
    enabled: !!athleteId
  });
  
  async function getRecruitingAnalytics() {
    const res = await apiRequest("GET", `/api/recruiting/analytics/${athleteId}`);
    return await res.json();
  }
}

/**
 * Hook to fetch recruiting messages
 */
export function useRecruitingMessages(athleteId: number) {
  return useQuery<RecruitingMessage[]>({
    queryKey: ["/api/recruiting/messages", athleteId],
    queryFn: getRecruitingMessages,
    enabled: !!athleteId
  });
  
  async function getRecruitingMessages() {
    const res = await apiRequest("GET", `/api/recruiting/messages/${athleteId}`);
    return await res.json();
  }
}

/**
 * Hook to mark a recruiting message as read
 */
export function useMarkMessageAsRead() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest("PATCH", `/api/recruiting/messages/${messageId}/read`);
      return await res.json();
    },
    onSuccess: (_, messageId) => {
      // Invalidate messages query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/recruiting/messages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark message as read",
        variant: "destructive"
      });
    }
  });
}

/**
 * Hook to send a new recruiting message
 */
export function useSendRecruitingMessage(athleteId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { schoolId: number; subject: string; content: string }) => {
      const res = await apiRequest("POST", `/api/recruiting/messages/${athleteId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the coach."
      });
      // Invalidate messages query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/recruiting/messages", athleteId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  });
}

/**
 * Hook to share recruiting profile
 */
export function useShareRecruitingProfile(athleteId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: ShareProfileData) => {
      const res = await apiRequest("POST", `/api/recruiting/share/${athleteId}`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      let successMessage = "";
      
      if (variables.platform === "email") {
        successMessage = "Your profile has been shared with coaches via email.";
      } else if (variables.platform === "twitter") {
        successMessage = "Your profile has been shared on Twitter.";
      } else if (variables.platform === "link") {
        successMessage = "Profile link has been copied to clipboard!";
        navigator.clipboard.writeText(`https://yourdomain.com/athletes/${athleteId}`);
      }
      
      toast({
        title: "Profile Shared",
        description: successMessage
      });
      
      // Invalidate analytics to show updated share stats
      queryClient.invalidateQueries({ queryKey: ["/api/recruiting/analytics", athleteId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to share profile",
        variant: "destructive"
      });
    }
  });
}