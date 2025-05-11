import { useMutation, useQuery } from "@tanstack/react-query";
import { RecruitingAnalytics, RecruitingMessage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to fetch an athlete's recruiting profile analytics
 */
export function useRecruitingAnalytics(athleteId: number) {
  return useQuery<RecruitingAnalytics>({
    queryKey: [`/api/athlete/${athleteId}/recruiting/analytics`],
    enabled: !!athleteId
  });
}

/**
 * Hook to fetch recruiting messages for an athlete
 */
export function useRecruitingMessages(athleteId: number) {
  return useQuery<RecruitingMessage[]>({
    queryKey: [`/api/athlete/${athleteId}/recruiting/messages`],
    enabled: !!athleteId
  });
}

/**
 * Hook to send a recruiting message
 */
export function useSendRecruitingMessage(athleteId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { subject: string; content: string; attachments?: string[] }) => {
      const res = await apiRequest("POST", `/api/athlete/${athleteId}/recruiting/messages`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/recruiting/messages`] });
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

/**
 * Hook to mark a message as read
 */
export function useMarkMessageAsRead() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ messageId, athleteId }: { messageId: number; athleteId: number }) => {
      const res = await apiRequest("PATCH", `/api/recruiting/messages/${messageId}/read`, {});
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${variables.athleteId}/recruiting/messages`] });
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
 * Hook to share a recruiting profile
 */
export function useShareRecruitingProfile(athleteId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { platform: string; message?: string }) => {
      // This would normally call an API endpoint, but for now it's a mock
      // that would handle sharing to social media or generating a shareable link
      return { success: true, url: `https://gridironlegacy.app/athletes/${athleteId}` };
    },
    onSuccess: (data) => {
      // Copy the URL to clipboard
      navigator.clipboard.writeText(data.url);
      
      toast({
        title: "Profile shared",
        description: "Profile link copied to clipboard.",
      });
      
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Error sharing profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}