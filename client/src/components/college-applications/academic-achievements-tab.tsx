import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { apiRequest } from '@/lib/query-client';
import { Loader2, Award, GraduationCap, Plus, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { queryClient } from '@/lib/query-client';

interface AcademicAchievement {
  id: number;
  athleteId: number;
  title: string;
  description: string;
  date: string;
  type: string; // 'award', 'honor', 'course', 'certification', 'project', 'other'
  institution?: string;
  grade?: string;
}

interface AcademicAchievementsTabProps {
  athleteId: number;
}

export default function AcademicAchievementsTab({ athleteId }: AcademicAchievementsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Partial<AcademicAchievement>>({
    athleteId,
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'award',
    institution: '',
    grade: '',
  });
  
  const { data: achievements, isLoading, error } = useQuery({
    queryKey: ['/api/academic-achievements', athleteId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/academic-achievements?athleteId=${athleteId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch academic achievements');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching academic achievements:', error);
        return [];
      }
    },
    enabled: !!athleteId,
  });
  
  // Mock achievements for development
  const mockAchievements: AcademicAchievement[] = [
    {
      id: 1,
      athleteId,
      title: 'National Honor Society Member',
      description: 'Selected based on scholarship, leadership, service, and character.',
      date: '2023-04-15',
      type: 'honor',
      institution: 'Central High School',
    },
    {
      id: 2,
      athleteId,
      title: 'AP Scholar with Distinction',
      description: 'Earned an average score of 3.5 on all AP exams taken, and scores of 3 or higher on five or more of these exams.',
      date: '2024-07-10',
      type: 'award',
      institution: 'College Board',
    },
    {
      id: 3,
      athleteId,
      title: 'AP Calculus BC',
      description: 'College-level calculus course covering limits, derivatives, integrals, and series.',
      date: '2024-05-20',
      type: 'course',
      institution: 'Central High School',
      grade: 'A'
    },
    {
      id: 4,
      athleteId,
      title: 'Academic All-State Football Team',
      description: 'Recognized for excellence in both academics and athletics.',
      date: '2023-12-15',
      type: 'award',
      institution: 'State High School Athletic Association',
    }
  ];

  const achievementsList = achievements && achievements.length > 0 ? achievements : mockAchievements;

  const createAchievement = useMutation({
    mutationFn: async (achievement: Omit<AcademicAchievement, 'id'>) => {
      const response = await apiRequest('POST', '/api/academic-achievements', achievement);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create achievement');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Achievement added',
        description: 'Your academic achievement has been added successfully',
      });
      // Invalidate the achievements query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/academic-achievements', athleteId] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add achievement',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateAchievement = useMutation({
    mutationFn: async (achievement: Partial<AcademicAchievement>) => {
      const response = await apiRequest('PATCH', `/api/academic-achievements/${achievement.id}`, achievement);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update achievement');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Achievement updated',
        description: 'Your academic achievement has been updated successfully',
      });
      // Invalidate the achievements query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/academic-achievements', athleteId] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update achievement',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteAchievement = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/academic-achievements/${id}`, null);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete achievement');
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Achievement deleted',
        description: 'Academic achievement has been removed successfully',
      });
      // Invalidate the achievements query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/academic-achievements', athleteId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete achievement',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!currentAchievement.title || !currentAchievement.description) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (isEditing && currentAchievement.id) {
      updateAchievement.mutate(currentAchievement);
    } else {
      createAchievement.mutate(currentAchievement as Omit<AcademicAchievement, 'id'>);
    }
    
    setDialogOpen(false);
  };

  const handleEditAchievement = (achievement: AcademicAchievement) => {
    setCurrentAchievement(achievement);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDeleteAchievement = (id: number) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      deleteAchievement.mutate(id);
    }
  };

  const resetForm = () => {
    setCurrentAchievement({
      athleteId,
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'award',
      institution: '',
      grade: '',
    });
    setIsEditing(false);
  };

  const getAchievementTypeLabel = (type: string) => {
    switch (type) {
      case 'award':
        return { label: 'Award', color: 'bg-amber-100 text-amber-800', icon: <Award className="h-4 w-4" /> };
      case 'honor':
        return { label: 'Honor', color: 'bg-purple-100 text-purple-800', icon: <Award className="h-4 w-4" /> };
      case 'course':
        return { label: 'Course', color: 'bg-blue-100 text-blue-800', icon: <GraduationCap className="h-4 w-4" /> };
      case 'certification':
        return { label: 'Certification', color: 'bg-green-100 text-green-800', icon: <GraduationCap className="h-4 w-4" /> };
      case 'project':
        return { label: 'Project', color: 'bg-pink-100 text-pink-800', icon: <GraduationCap className="h-4 w-4" /> };
      default:
        return { label: 'Other', color: 'bg-gray-100 text-gray-800', icon: <Award className="h-4 w-4" /> };
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
        title="Failed to load achievements"
        description="There was an error loading your academic achievements. Please try again later."
        icon={<Award className="h-12 w-12 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Academic Achievements</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Achievement' : 'Add New Achievement'}</DialogTitle>
              <DialogDescription>
                Document your academic achievements to strengthen your college applications.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="col-span-1 sm:col-span-2">
                  <Label htmlFor="title">Achievement Title *</Label>
                  <Input
                    id="title"
                    value={currentAchievement.title}
                    onChange={(e) => setCurrentAchievement({ ...currentAchievement, title: e.target.value })}
                    placeholder="e.g. National Honor Society"
                    required
                  />
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[80px] p-2 border rounded"
                    value={currentAchievement.description}
                    onChange={(e) => setCurrentAchievement({ ...currentAchievement, description: e.target.value })}
                    placeholder="Describe your achievement..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <select
                    id="type"
                    className="w-full p-2 border rounded"
                    value={currentAchievement.type}
                    onChange={(e) => setCurrentAchievement({ ...currentAchievement, type: e.target.value })}
                    required
                  >
                    <option value="award">Award</option>
                    <option value="honor">Honor/Recognition</option>
                    <option value="course">Advanced Course</option>
                    <option value="certification">Certification</option>
                    <option value="project">Academic Project</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={currentAchievement.date}
                    onChange={(e) => setCurrentAchievement({ ...currentAchievement, date: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="institution">Institution/Organization</Label>
                  <Input
                    id="institution"
                    value={currentAchievement.institution || ''}
                    onChange={(e) => setCurrentAchievement({ ...currentAchievement, institution: e.target.value })}
                    placeholder="e.g. Central High School"
                  />
                </div>
                
                <div>
                  <Label htmlFor="grade">Grade/Score (if applicable)</Label>
                  <Input
                    id="grade"
                    value={currentAchievement.grade || ''}
                    onChange={(e) => setCurrentAchievement({ ...currentAchievement, grade: e.target.value })}
                    placeholder="e.g. A, 4.0, 5"
                  />
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
                  disabled={createAchievement.isPending || updateAchievement.isPending}
                >
                  {(createAchievement.isPending || updateAchievement.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? 'Update' : 'Add Achievement'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {achievementsList.length === 0 ? (
        <EmptyPlaceholder
          title="No achievements added yet"
          description="Add your academic achievements, awards, honors, and advanced coursework to highlight your academic excellence."
          icon={<GraduationCap className="h-12 w-12 text-muted-foreground" />}
        >
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Achievement
          </Button>
        </EmptyPlaceholder>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {achievementsList.map((achievement) => {
            const { label, color, icon } = getAchievementTypeLabel(achievement.type);
            return (
              <Card key={achievement.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <Badge className={`${color} flex items-center gap-1 py-1 px-2`}>
                        {icon}
                        {label}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditAchievement(achievement)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteAchievement(achievement.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.institution && `${achievement.institution}`}
                        {achievement.institution && achievement.grade && ' • '}
                        {achievement.grade && `Grade: ${achievement.grade}`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(achievement.date).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    
                    <p className="text-sm mt-2">{achievement.description}</p>
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