import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Team, TeamMember, TeamEvent, TeamEventAttendance, TeamAnnouncement, InsertTeam, InsertTeamEvent, InsertTeamAnnouncement } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to fetch all teams
 */
export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });
}

/**
 * Hook to fetch a single team by ID
 */
export function useTeam(teamId: number) {
  return useQuery<Team>({
    queryKey: [`/api/teams/${teamId}`],
    enabled: !!teamId,
  });
}

/**
 * Hook to fetch teams that an athlete belongs to
 */
export function useAthleteTeams(athleteId: number) {
  return useQuery<Team[]>({
    queryKey: [`/api/athlete/${athleteId}/teams`],
    enabled: !!athleteId,
  });
}

/**
 * Hook to fetch team members for a team
 */
export function useTeamMembers(teamId: number) {
  return useQuery<TeamMember[]>({
    queryKey: [`/api/teams/${teamId}/members`],
    enabled: !!teamId,
  });
}

/**
 * Hook to create a new team
 */
export function useCreateTeam() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (teamData: InsertTeam) => {
      const res = await apiRequest("POST", "/api/teams", teamData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/teams"]
      });
      
      toast({
        title: "Team created",
        description: `${data.name} has been successfully created`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create team",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

/**
 * Hook to join a team as an athlete
 */
export function useJoinTeam(athleteId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (teamId: number) => {
      const res = await apiRequest("POST", `/api/teams/${teamId}/members`, {
        athleteId,
        role: "player"
      });
      return await res.json();
    },
    onSuccess: (data, teamId) => {
      // Invalidate both the global teams list and the specific athlete teams
      queryClient.invalidateQueries({
        queryKey: ["/api/teams"]
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${athleteId}/teams`]
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/teams/${teamId}/members`]
      });
      
      toast({
        title: "Team joined",
        description: "You have successfully joined the team",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join team",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

/**
 * Hook to leave a team as an athlete
 */
export function useLeaveTeam(athleteId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (teamId: number) => {
      const res = await apiRequest("DELETE", `/api/teams/${teamId}/members/${athleteId}`);
      return res.ok;
    },
    onSuccess: (_, teamId) => {
      // Invalidate both the global teams list and the specific athlete teams
      queryClient.invalidateQueries({
        queryKey: ["/api/teams"]
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${athleteId}/teams`]
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/teams/${teamId}/members`]
      });
      
      toast({
        title: "Team left",
        description: "You have successfully left the team",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to leave team",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

/**
 * Hook to fetch team events
 */
export function useTeamEvents(teamId: number) {
  return useQuery<TeamEvent[]>({
    queryKey: [`/api/teams/${teamId}/events`],
    enabled: !!teamId,
  });
}

/**
 * Hook to create a team event
 */
export function useCreateTeamEvent(teamId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (eventData: Omit<InsertTeamEvent, "teamId" | "createdBy">) => {
      const res = await apiRequest("POST", `/api/teams/${teamId}/events`, {
        ...eventData,
        teamId
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/teams/${teamId}/events`]
      });
      
      toast({
        title: "Event created",
        description: "Team event has been successfully created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

/**
 * Hook to update event attendance
 */
export function useUpdateEventAttendance(teamId: number, eventId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ athleteId, status }: { athleteId: number, status: string }) => {
      const res = await apiRequest("POST", `/api/teams/${teamId}/events/${eventId}/attendance`, {
        athleteId,
        status
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/teams/${teamId}/events/${eventId}/attendance`]
      });
      
      toast({
        title: "Attendance updated",
        description: "Your attendance status has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update attendance",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

/**
 * Hook to fetch attendance for an event
 */
export function useEventAttendance(teamId: number, eventId: number) {
  return useQuery<TeamEventAttendance[]>({
    queryKey: [`/api/teams/${teamId}/events/${eventId}/attendance`],
    enabled: !!teamId && !!eventId,
  });
}

/**
 * Hook to fetch team announcements
 */
export function useTeamAnnouncements(teamId: number) {
  return useQuery<TeamAnnouncement[]>({
    queryKey: [`/api/teams/${teamId}/announcements`],
    enabled: !!teamId,
  });
}

/**
 * Hook to create a team announcement
 */
export function useCreateTeamAnnouncement(teamId: number) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (announcementData: Omit<InsertTeamAnnouncement, "teamId" | "publishedBy">) => {
      const res = await apiRequest("POST", `/api/teams/${teamId}/announcements`, {
        ...announcementData,
        teamId
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/teams/${teamId}/announcements`]
      });
      
      toast({
        title: "Announcement posted",
        description: "Team announcement has been successfully posted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post announcement",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}