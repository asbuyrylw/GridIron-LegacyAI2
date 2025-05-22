import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, School, CheckCircle, XCircle, Clock, ChevronRight, GraduationCap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface SchoolApplication {
  id: number;
  athleteId: number;
  schoolName: string;
  schoolType: 'division1' | 'division2' | 'division3' | 'naia' | 'juco';
  applicationStatus: 'planning' | 'started' | 'submitted' | 'accepted' | 'waitlisted' | 'rejected';
  dueDate?: string;
  submissionDate?: string;
  notes?: string;
  progress: number;
}

interface SchoolApplicationsTabProps {
  athleteId: number;
}

export default function SchoolApplicationsTab({ athleteId }: SchoolApplicationsTabProps) {
  // Fetch school applications
  const { data: applications, isLoading, error, refetch } = useQuery({ 
    queryKey: ['/api/college-applications/applications', athleteId],
    queryFn: async () => {
      const response = await apiRequest(
        'GET', 
        `/api/college-applications/applications/${athleteId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch school applications');
      }
      
      return response.json();
    },
    enabled: !!athleteId
  });

  // Sample applications to display if none exist yet
  const sampleApplications = [
    {
      id: 1,
      athleteId,
      schoolName: 'University of Michigan',
      schoolType: 'division1',
      applicationStatus: 'submitted',
      dueDate: '2025-01-01',
      submissionDate: '2024-12-15',
      notes: 'Applied for early action. Strong football program with good academic support.',
      progress: 100
    },
    {
      id: 2,
      athleteId,
      schoolName: 'Ohio State University',
      schoolType: 'division1',
      applicationStatus: 'started',
      dueDate: '2025-01-15',
      notes: 'Need to complete personal statement and request coach recommendation.',
      progress: 60
    },
    {
      id: 3,
      athleteId,
      schoolName: 'Notre Dame',
      schoolType: 'division1',
      applicationStatus: 'planning',
      dueDate: '2025-02-01',
      notes: 'Great academic program. Need to contact coach about recruitment.',
      progress: 10
    }
  ];

  // Delete application mutation
  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(
        'DELETE',
        `/api/college-applications/applications/${id}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete application');
      }
      
      return id;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: 'Application deleted',
        description: 'Your application has been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest(
        'PATCH',
        `/api/college-applications/applications/${id}`,
        { applicationStatus: status }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: 'Status updated',
        description: 'Application status has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-gray-100 text-gray-800';
      case 'started':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-amber-100 text-amber-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'waitlisted':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning':
        return 'Planning';
      case 'started':
        return 'In Progress';
      case 'submitted':
        return 'Submitted';
      case 'accepted':
        return 'Accepted';
      case 'waitlisted':
        return 'Waitlisted';
      case 'rejected':
        return 'Rejected';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getSchoolTypeLabel = (type: string) => {
    switch (type) {
      case 'division1':
        return 'NCAA Division I';
      case 'division2':
        return 'NCAA Division II';
      case 'division3':
        return 'NCAA Division III';
      case 'naia':
        return 'NAIA';
      case 'juco':
        return 'Junior College';
      default:
        return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Clock className="h-5 w-5 text-gray-500" />;
      case 'started':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'submitted':
        return <CheckCircle className="h-5 w-5 text-amber-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'waitlisted':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyPlaceholder
        title="Error Loading Applications"
        description="There was a problem loading your school applications."
        icon={<Loader2 className="h-12 w-12 text-muted-foreground" />}
      >
        <Button onClick={() => refetch()}>Try Again</Button>
      </EmptyPlaceholder>
    );
  }

  const applicationsToDisplay = applications && applications.length > 0 ? applications : sampleApplications;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">School Applications</h2>
          <p className="text-muted-foreground">
            Track the status of your college applications.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add School
        </Button>
      </div>

      <div className="grid gap-6">
        {applicationsToDisplay.map((app) => (
          <Card key={app.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <School className="h-5 w-5 text-primary" />
                  <CardTitle>{app.schoolName}</CardTitle>
                </div>
                <Badge className={getStatusColor(app.applicationStatus)}>
                  {getStatusLabel(app.applicationStatus)}
                </Badge>
              </div>
              <CardDescription>
                {getSchoolTypeLabel(app.schoolType)}
                {app.dueDate && ` • Due: ${new Date(app.dueDate).toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Application Progress</span>
                    <span>{app.progress}%</span>
                  </div>
                  <Progress value={app.progress} className="h-2" />
                </div>
                {app.notes && (
                  <div className="text-sm text-muted-foreground">
                    <p>{app.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                {app.submissionDate && (
                  <span className="text-xs text-muted-foreground">
                    Submitted: {new Date(app.submissionDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteApplicationMutation.mutate(app.id)}
                >
                  Remove
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {applicationsToDisplay.length === 0 && (
        <EmptyPlaceholder
          title="No Applications"
          description="Start tracking your college applications."
          icon={<School className="h-12 w-12 text-muted-foreground" />}
        >
          <Button 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add First Application
          </Button>
        </EmptyPlaceholder>
      )}
    </div>
  );
}