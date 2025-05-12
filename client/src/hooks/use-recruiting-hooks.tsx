import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "./use-toast";

// Types for recruiting features
export interface RecruitingAnalytics {
  id: number;
  athleteId: number;
  profileViews: number;
  uniqueViewers: number;
  interestLevel: number;
  bookmarksCount: number;
  messagesSent: number;
  connectionsCount: number;
  viewsOverTime: Array<{ date: string; count: number }>;
  interestBySchoolType: Array<{ name: string; value: number }>;
  interestByPosition: Array<{ name: string; value: number }>;
  interestByRegion: Array<{ name: string; value: number }>;
  topSchools: Array<{ name: string; interest: number }>;
  lastUpdated: Date;
}

export interface RecruitingMessage {
  id: number;
  senderId: number;
  recipientId: number;
  schoolName: string | null;
  subject: string;
  message: string;
  attachment: string | null;
  isReply: boolean;
  parentMessageId: number | null;
  sentAt: string;
  read: boolean;
}

export interface SendMessageData {
  schoolId: number;
  subject: string;
  content: string;
  attachment?: string;
}

export interface ShareProfileData {
  platform: string;
  message?: string;
}

/**
 * Hook to fetch recruiting analytics data
 */
export function useRecruitingAnalytics(athleteId: number) {
  const { toast } = useToast();
  
  const query = useQuery({
    queryKey: ['/api/recruiting/analytics', athleteId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/recruiting/analytics/${athleteId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch recruiting analytics");
      }
      return await response.json() as RecruitingAnalytics;
    }
  });
  
  // Don't show toast notifications during rendering as it causes infinite loops
  // The error will be available to the component to handle
  
  return query;
}

/**
 * Hook to fetch recruiting messages
 */
export function useRecruitingMessages(athleteId: number) {
  const { toast } = useToast();
  
  const query = useQuery({
    queryKey: ['/api/recruiting/messages', athleteId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/recruiting/messages/${athleteId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch recruiting messages");
      }
      return await response.json() as RecruitingMessage[];
    }
  });
  
  // Don't show toast notifications during rendering as it causes infinite loops
  // The error will be available to the component to handle
  
  return query;
}

/**
 * Hook to fetch a single recruiting message details
 */
export function useRecruitingMessageDetails(messageId: number) {
  const { toast } = useToast();
  
  const query = useQuery({
    queryKey: ['/api/recruiting/messages/detail', messageId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/recruiting/messages/detail/${messageId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch message details");
      }
      return await response.json() as RecruitingMessage;
    },
    enabled: !!messageId // Only run if messageId is provided
  });
  
  // Don't show toast notifications during rendering as it causes infinite loops
  // The error will be available to the component to handle
  
  return query;
}

/**
 * Hook to mark a recruiting message as read
 */
export function useMarkMessageAsRead() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest('PATCH', `/api/recruiting/messages/${messageId}/read`, {});
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to mark message as read");
      }
      return await response.json() as RecruitingMessage;
    },
    onSuccess: (data) => {
      // Invalidate messages query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['/api/recruiting/messages']
      });
      
      // Update the specific message in the cache
      queryClient.setQueryData(['/api/recruiting/messages/detail', data.id], data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error marking message as read",
        description: error.message,
        variant: "destructive",
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
    mutationFn: async (data: SendMessageData) => {
      const response = await apiRequest('POST', `/api/recruiting/messages/${athleteId}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully",
        description: "Your message has been sent to the coach.",
      });
      
      // Invalidate messages and analytics queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/recruiting/messages']
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/recruiting/analytics']
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
 * Hook to share recruiting profile
 */
export function useShareRecruitingProfile(athleteId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: ShareProfileData) => {
      const response = await apiRequest('POST', `/api/recruiting/share/${athleteId}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to share profile");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile shared successfully",
        description: `Your profile has been shared via ${data.platform || 'social media'}.`,
      });
      
      // Invalidate analytics to update interest level
      queryClient.invalidateQueries({
        queryKey: ['/api/recruiting/analytics']
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