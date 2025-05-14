import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/query-client';
import { Loader2, PlusCircle, Award, Calendar, Edit, Trash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/query-client';
import { format } from 'date-fns';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const achievementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(['Award', 'Honor', 'Certification', 'Course', 'Competition', 'Project', 'Other']),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  issuingOrganization: z.string().optional(),
  relevance: z.enum(['Low', 'Medium', 'High']).optional(),
  notes: z.string().optional(),
});

type AcademicAchievement = z.infer<typeof achievementSchema> & {
  id: number;
  athleteId: number;
  createdAt: string;
  updatedAt: string;
};

interface AcademicAchievementsTabProps {
  athleteId: number;
}

export default function AcademicAchievementsTab({ athleteId }: AcademicAchievementsTabProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<AcademicAchievement | null>(null);

  const { data: achievements, isLoading, isError } = useQuery({
    queryKey: ['/api/college-applications/achievements', athleteId],
    enabled: !!athleteId,
  });

  const createAchievementMutation = useMutation({
    mutationFn: (values: z.infer<typeof achievementSchema>) => 
      apiRequest('/api/college-applications/achievements', {
        method: 'POST',
        body: {
          ...values,
          athleteId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college-applications/achievements', athleteId] });
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Academic achievement created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create academic achievement.',
        variant: 'destructive',
      });
    },
  });

  const updateAchievementMutation = useMutation({
    mutationFn: (values: AcademicAchievement) => 
      apiRequest(`/api/college-applications/achievements/${values.id}`, {
        method: 'PATCH',
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college-applications/achievements', athleteId] });
      setIsEditDialogOpen(false);
      setSelectedAchievement(null);
      toast({
        title: 'Success',
        description: 'Academic achievement updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update academic achievement.',
        variant: 'destructive',
      });
    },
  });

  const deleteAchievementMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/college-applications/achievements/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college-applications/achievements', athleteId] });
      toast({
        title: 'Success',
        description: 'Academic achievement deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete academic achievement.',
        variant: 'destructive',
      });
    },
  });

  const createForm = useForm<z.infer<typeof achievementSchema>>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: '',
      type: 'Award',
      description: '',
      date: '',
      issuingOrganization: '',
      relevance: 'Medium',
      notes: '',
    },
  });

  const editForm = useForm<z.infer<typeof achievementSchema>>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: '',
      type: 'Award',
      description: '',
      date: '',
      issuingOrganization: '',
      relevance: 'Medium',
      notes: '',
    },
  });

  function onCreateSubmit(values: z.infer<typeof achievementSchema>) {
    createAchievementMutation.mutate(values);
  }

  function onEditSubmit(values: z.infer<typeof achievementSchema>) {
    if (selectedAchievement) {
      updateAchievementMutation.mutate({
        ...selectedAchievement,
        ...values,
      });
    }
  }

  function handleEdit(achievement: AcademicAchievement) {
    setSelectedAchievement(achievement);
    editForm.reset({
      title: achievement.title,
      type: achievement.type,
      description: achievement.description || '',
      date: achievement.date,
      issuingOrganization: achievement.issuingOrganization || '',
      relevance: achievement.relevance || 'Medium',
      notes: achievement.notes || '',
    });
    setIsEditDialogOpen(true);
  }

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this academic achievement?')) {
      deleteAchievementMutation.mutate(id);
    }
  }

  function getAchievementTypeIcon(type: string) {
    return <Award className="h-5 w-5 text-primary" />;
  }

  function getRelevanceBadge(relevance: string) {
    switch (relevance) {
      case 'High':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High Relevance</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium Relevance</Badge>;
      case 'Low':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Low Relevance</Badge>;
      default:
        return null;
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyPlaceholder
        title="Failed to load data"
        description="There was an error loading your academic achievements. Please try again."
        icon={<X className="h-12 w-12 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Academic Achievements</h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Achievement
        </Button>
      </div>

      {achievements && achievements.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement: AcademicAchievement) => (
            <Card key={achievement.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getAchievementTypeIcon(achievement.type)}
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  </div>
                  <Badge>{achievement.type}</Badge>
                </div>
                {achievement.description && (
                  <CardDescription>{achievement.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(achievement.date), 'MMM dd, yyyy')}
                </div>
                
                {achievement.issuingOrganization && (
                  <div className="text-sm mb-2">
                    <span className="font-medium">Issuing Organization:</span> {achievement.issuingOrganization}
                  </div>
                )}
                
                {achievement.relevance && (
                  <div className="mb-2">
                    {getRelevanceBadge(achievement.relevance)}
                  </div>
                )}
                
                {achievement.notes && (
                  <div className="mt-2 text-sm">
                    <p className="font-medium">Notes:</p>
                    <p>{achievement.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(achievement)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => handleDelete(achievement.id)}
                >
                  <Trash className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyPlaceholder
          title="No academic achievements yet"
          description="Add your academic achievements, awards, and honors to showcase in your college applications."
          icon={<Award className="h-12 w-12 text-muted-foreground" />}
          action={
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Your First Achievement
            </Button>
          }
        />
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Academic Achievement</DialogTitle>
            <DialogDescription>
              Record a new academic achievement for your college applications
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., National Merit Scholar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Achievement Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select achievement type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Award">Award</SelectItem>
                        <SelectItem value="Honor">Honor</SelectItem>
                        <SelectItem value="Certification">Certification</SelectItem>
                        <SelectItem value="Course">Course</SelectItem>
                        <SelectItem value="Competition">Competition</SelectItem>
                        <SelectItem value="Project">Project</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a description of this achievement..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Received</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="issuingOrganization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuing Organization (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., College Board" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="relevance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevance to Applications (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relevance level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createAchievementMutation.isPending}>
                  {createAchievementMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Achievement
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Academic Achievement</DialogTitle>
            <DialogDescription>
              Update this academic achievement
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., National Merit Scholar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Achievement Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select achievement type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Award">Award</SelectItem>
                        <SelectItem value="Honor">Honor</SelectItem>
                        <SelectItem value="Certification">Certification</SelectItem>
                        <SelectItem value="Course">Course</SelectItem>
                        <SelectItem value="Competition">Competition</SelectItem>
                        <SelectItem value="Project">Project</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a description of this achievement..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Received</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="issuingOrganization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuing Organization (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., College Board" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="relevance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevance to Applications (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relevance level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateAchievementMutation.isPending}>
                  {updateAchievementMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Achievement
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}