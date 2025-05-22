import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { apiRequest } from '@/lib/query-client';
import { Loader2, Plus, School, Calendar, PlusCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { queryClient } from '@/lib/query-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';

interface SchoolApplication {
  id: number;
  athleteId: number;
  schoolName: string;
  division: string;
  location: string;
  deadline: string;
  applicationStatus: 'not_started' | 'in_progress' | 'submitted' | 'accepted' | 'denied' | 'waitlisted';
  notes?: string;
  academicFit?: number; // 1-100
  athleticFit?: number; // 1-100
  priority: 'high' | 'medium' | 'low';
  programsOfInterest?: string[];
}

interface SchoolApplicationsTabProps {
  athleteId: number;
}

export default function SchoolApplicationsTab({ athleteId }: SchoolApplicationsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<Partial<SchoolApplication>>({
    athleteId,
    schoolName: '',
    division: 'D1',
    location: '',
    deadline: '',
    applicationStatus: 'not_started',
    notes: '',
    academicFit: 50,
    athleticFit: 50,
    priority: 'medium',
    programsOfInterest: [],
  });
  
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['/api/school-applications', athleteId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/school-applications?athleteId=${athleteId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch school applications');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching school applications:', error);
        return [];
      }
    },
    enabled: !!athleteId,
  });
  
  // Mock applications for development
  const mockApplications: SchoolApplication[] = [
    {
      id: 1,
      athleteId,
      schoolName: 'University of Alabama',
      division: 'D1',
      location: 'Tuscaloosa, AL',
      deadline: '2024-12-01',
      applicationStatus: 'in_progress',
      notes: 'Need to request coach recommendation',
      academicFit: 75,
      athleticFit: 65,
      priority: 'high',
      programsOfInterest: ['Business Administration', 'Sports Management']
    },
    {
      id: 2,
      athleteId,
      schoolName: 'Ohio State University',
      division: 'D1',
      location: 'Columbus, OH',
      deadline: '2024-11-15',
      applicationStatus: 'not_started',
      academicFit: 80,
      athleticFit: 70,
      priority: 'medium',
      programsOfInterest: ['Economics', 'Communication']
    },
    {
      id: 3,
      athleteId,
      schoolName: 'University of Michigan',
      division: 'D1',
      location: 'Ann Arbor, MI',
      deadline: '2024-12-15',
      applicationStatus: 'submitted',
      notes: 'Application submitted on 10/25/2024',
      academicFit: 85,
      athleticFit: 60,
      priority: 'high',
      programsOfInterest: ['Engineering', 'Computer Science']
    }
  ];

  const applicationsList = applications && applications.length > 0 ? applications : mockApplications;

  const createApplication = useMutation({
    mutationFn: async (application: Omit<SchoolApplication, 'id'>) => {
      const response = await apiRequest('POST', '/api/school-applications', application);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create application');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Application added',
        description: 'School application has been added successfully',
      });
      // Invalidate the applications query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/school-applications', athleteId] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add application',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateApplication = useMutation({
    mutationFn: async (application: Partial<SchoolApplication>) => {
      const response = await apiRequest('PATCH', `/api/school-applications/${application.id}`, application);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update application');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Application updated',
        description: 'School application has been updated successfully',
      });
      // Invalidate the applications query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/school-applications', athleteId] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update application',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteApplication = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/school-applications/${id}`, null);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete application');
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Application deleted',
        description: 'School application has been removed successfully',
      });
      // Invalidate the applications query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/school-applications', athleteId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete application',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!currentApplication.schoolName || !currentApplication.deadline) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (isEditing && currentApplication.id) {
      updateApplication.mutate(currentApplication);
    } else {
      createApplication.mutate(currentApplication as Omit<SchoolApplication, 'id'>);
    }
    
    setDialogOpen(false);
  };

  const handleEditApplication = (application: SchoolApplication) => {
    setCurrentApplication(application);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDeleteApplication = (id: number) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      deleteApplication.mutate(id);
    }
  };

  const handleAddProgram = () => {
    const programInput = document.getElementById('program-interest') as HTMLInputElement;
    if (programInput && programInput.value.trim()) {
      const program = programInput.value.trim();
      setCurrentApplication({
        ...currentApplication,
        programsOfInterest: [...(currentApplication.programsOfInterest || []), program]
      });
      programInput.value = '';
    }
  };

  const handleRemoveProgram = (program: string) => {
    setCurrentApplication({
      ...currentApplication,
      programsOfInterest: currentApplication.programsOfInterest?.filter(p => p !== program)
    });
  };

  const resetForm = () => {
    setCurrentApplication({
      athleteId,
      schoolName: '',
      division: 'D1',
      location: '',
      deadline: '',
      applicationStatus: 'not_started',
      notes: '',
      academicFit: 50,
      athleticFit: 50,
      priority: 'medium',
      programsOfInterest: [],
    });
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_started':
        return { label: 'Not Started', color: 'bg-gray-100 text-gray-800' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-blue-100 text-blue-800' };
      case 'submitted':
        return { label: 'Submitted', color: 'bg-purple-100 text-purple-800' };
      case 'accepted':
        return { label: 'Accepted', color: 'bg-green-100 text-green-800' };
      case 'denied':
        return { label: 'Denied', color: 'bg-red-100 text-red-800' };
      case 'waitlisted':
        return { label: 'Waitlisted', color: 'bg-amber-100 text-amber-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return { label: 'High Priority', color: 'bg-red-100 text-red-800' };
      case 'medium':
        return { label: 'Medium Priority', color: 'bg-amber-100 text-amber-800' };
      case 'low':
        return { label: 'Low Priority', color: 'bg-blue-100 text-blue-800' };
      default:
        return { label: 'Medium Priority', color: 'bg-amber-100 text-amber-800' };
    }
  };

  const getDivisionBadge = (division: string) => {
    switch (division) {
      case 'D1':
        return { label: 'Division I', color: 'bg-green-100 text-green-800' };
      case 'D2':
        return { label: 'Division II', color: 'bg-purple-100 text-purple-800' };
      case 'D3':
        return { label: 'Division III', color: 'bg-blue-100 text-blue-800' };
      case 'NAIA':
        return { label: 'NAIA', color: 'bg-indigo-100 text-indigo-800' };
      case 'JUCO':
        return { label: 'Junior College', color: 'bg-orange-100 text-orange-800' };
      default:
        return { label: division, color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyPlaceholder
        title="Failed to load applications"
        description="There was an error loading your school applications. Please try again later."
        icon={<School className="h-12 w-12 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">College Applications</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit School Application' : 'Add New School Application'}</DialogTitle>
              <DialogDescription>
                Track your college applications and deadlines in one place.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="col-span-1 sm:col-span-2">
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    value={currentApplication.schoolName}
                    onChange={(e) => setCurrentApplication({ ...currentApplication, schoolName: e.target.value })}
                    placeholder="e.g. University of Alabama"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="division">Division *</Label>
                  <select
                    id="division"
                    className="w-full p-2 border rounded"
                    value={currentApplication.division}
                    onChange={(e) => setCurrentApplication({ ...currentApplication, division: e.target.value })}
                    required
                  >
                    <option value="D1">Division I</option>
                    <option value="D2">Division II</option>
                    <option value="D3">Division III</option>
                    <option value="NAIA">NAIA</option>
                    <option value="JUCO">Junior College</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={currentApplication.location || ''}
                    onChange={(e) => setCurrentApplication({ ...currentApplication, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
                
                <div>
                  <Label htmlFor="deadline">Application Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={currentApplication.deadline}
                    onChange={(e) => setCurrentApplication({ ...currentApplication, deadline: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Application Status *</Label>
                  <select
                    id="status"
                    className="w-full p-2 border rounded"
                    value={currentApplication.applicationStatus}
                    onChange={(e) => setCurrentApplication({ 
                      ...currentApplication, 
                      applicationStatus: e.target.value as SchoolApplication['applicationStatus']
                    })}
                    required
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="accepted">Accepted</option>
                    <option value="denied">Denied</option>
                    <option value="waitlisted">Waitlisted</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <select
                    id="priority"
                    className="w-full p-2 border rounded"
                    value={currentApplication.priority}
                    onChange={(e) => setCurrentApplication({ 
                      ...currentApplication, 
                      priority: e.target.value as SchoolApplication['priority']
                    })}
                    required
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="academicFit">Academic Fit</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="academicFit"
                      type="range"
                      min="0"
                      max="100"
                      value={currentApplication.academicFit}
                      onChange={(e) => setCurrentApplication({ 
                        ...currentApplication, 
                        academicFit: parseInt(e.target.value) 
                      })}
                      className="w-full"
                    />
                    <span className="text-sm">{currentApplication.academicFit}%</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="athleticFit">Athletic Fit</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="athleticFit"
                      type="range"
                      min="0"
                      max="100"
                      value={currentApplication.athleticFit}
                      onChange={(e) => setCurrentApplication({ 
                        ...currentApplication, 
                        athleticFit: parseInt(e.target.value) 
                      })}
                      className="w-full"
                    />
                    <span className="text-sm">{currentApplication.athleticFit}%</span>
                  </div>
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    className="w-full min-h-[80px] p-2 border rounded"
                    value={currentApplication.notes || ''}
                    onChange={(e) => setCurrentApplication({ ...currentApplication, notes: e.target.value })}
                    placeholder="Add any notes about this application..."
                  />
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <Label>Programs of Interest</Label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      id="program-interest"
                      placeholder="e.g. Business Administration"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleAddProgram}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentApplication.programsOfInterest?.map((program) => (
                      <Badge key={program} className="px-2 py-1 flex items-center gap-1">
                        {program}
                        <button 
                          type="button" 
                          className="ml-1 hover:text-red-500"
                          onClick={() => handleRemoveProgram(program)}
                        >
                          &times;
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createApplication.isPending || updateApplication.isPending}
                >
                  {(createApplication.isPending || updateApplication.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? 'Update' : 'Add Application'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {applicationsList.length === 0 ? (
        <EmptyPlaceholder
          title="No school applications added yet"
          description="Add schools you're applying to in order to track deadlines and application status."
          icon={<School className="h-12 w-12 text-muted-foreground" />}
        >
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First School
          </Button>
        </EmptyPlaceholder>
      ) : (
        <div className="grid gap-4">
          {applicationsList.map((application: SchoolApplication) => {
            const statusBadge = getStatusBadge(application.applicationStatus);
            const priorityBadge = getPriorityBadge(application.priority);
            const divisionBadge = getDivisionBadge(application.division);
            const deadlineDate = new Date(application.deadline);
            const isDeadlineSoon = 
              (new Date().getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24) > -14; // Less than 14 days
                
            return (
              <Card key={application.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-5 flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-lg">{application.schoolName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {application.location}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={statusBadge.color}>
                            {statusBadge.label}
                          </Badge>
                          <Badge className={priorityBadge.color}>
                            {priorityBadge.label}
                          </Badge>
                          <Badge className={divisionBadge.color}>
                            {divisionBadge.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium">Deadline</p>
                            <p className={`text-sm ${isDeadlineSoon ? 'text-red-500 font-semibold' : ''}`}>
                              {new Date(application.deadline).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          
                          {application.programsOfInterest && application.programsOfInterest.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">Programs of Interest</p>
                              <div className="flex flex-wrap gap-1">
                                {application.programsOfInterest.map((program: string) => (
                                  <Badge key={program} variant="outline" className="text-xs">
                                    {program}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {application.notes && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">Notes</p>
                              <p className="text-sm">{application.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Academic Fit</p>
                              <div className="flex items-center space-x-2">
                                <Progress value={application.academicFit} className="h-2" />
                                <span className="text-sm">{application.academicFit}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Athletic Fit</p>
                              <div className="flex items-center space-x-2">
                                <Progress value={application.athleticFit} className="h-2" />
                                <span className="text-sm">{application.athleticFit}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditApplication(application)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteApplication(application.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}