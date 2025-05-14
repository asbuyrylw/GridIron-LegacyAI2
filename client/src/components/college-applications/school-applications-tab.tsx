import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/query-client';
import { Loader2, PlusCircle, School, Calendar, Check, Clock, X, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/query-client';
import { format } from 'date-fns';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const applicationSchema = z.object({
  schoolName: z.string().min(3, 'School name must be at least 3 characters'),
  applicationDeadline: z.string().min(1, 'Application deadline is required'),
  status: z.enum(['Not Started', 'In Progress', 'Submitted', 'Decision Received']),
  decisionStatus: z.enum(['Undecided', 'Accepted', 'Rejected', 'Waitlisted', 'Deferred']).optional(),
  applicationPlatform: z.enum(['Common App', 'Coalition App', 'Direct to School', 'Other']),
  applicationFee: z.number().optional(),
  isFeePaid: z.boolean().optional(),
  isScholarshipApplied: z.boolean().optional(),
  isFinancialAidApplied: z.boolean().optional(),
  applicationNotes: z.string().optional(),
});

type SchoolApplication = z.infer<typeof applicationSchema> & {
  id: number;
  athleteId: number;
  createdAt: string;
  updatedAt: string;
};

interface SchoolApplicationsTabProps {
  athleteId: number;
}

export default function SchoolApplicationsTab({ athleteId }: SchoolApplicationsTabProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<SchoolApplication | null>(null);

  const { data: applications, isLoading, isError } = useQuery({
    queryKey: ['/api/college-applications/applications', athleteId],
    queryFn: async () => {
      try {
        return await apiRequest('GET', `/api/college-applications/applications/${athleteId}`);
      } catch (error) {
        console.error('Error fetching school applications:', error);
        throw new Error('Failed to load school applications');
      }
    },
    enabled: !!athleteId,
  });

  const createApplicationMutation = useMutation({
    mutationFn: (values: z.infer<typeof applicationSchema>) => 
      apiRequest('/api/college-applications/applications', {
        method: 'POST',
        body: {
          ...values,
          athleteId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college-applications/applications', athleteId] });
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'School application created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create school application.',
        variant: 'destructive',
      });
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: (values: SchoolApplication) => 
      apiRequest(`/api/college-applications/applications/${values.id}`, {
        method: 'PATCH',
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college-applications/applications', athleteId] });
      setIsEditDialogOpen(false);
      setSelectedApplication(null);
      toast({
        title: 'Success',
        description: 'School application updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update school application.',
        variant: 'destructive',
      });
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/college-applications/applications/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college-applications/applications', athleteId] });
      toast({
        title: 'Success',
        description: 'School application deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete school application.',
        variant: 'destructive',
      });
    },
  });

  const createForm = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      schoolName: '',
      applicationDeadline: '',
      status: 'Not Started',
      decisionStatus: 'Undecided',
      applicationPlatform: 'Common App',
      applicationFee: 0,
      isFeePaid: false,
      isScholarshipApplied: false,
      isFinancialAidApplied: false,
      applicationNotes: '',
    },
  });

  const editForm = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      schoolName: '',
      applicationDeadline: '',
      status: 'Not Started',
      decisionStatus: 'Undecided',
      applicationPlatform: 'Common App',
      applicationFee: 0,
      isFeePaid: false,
      isScholarshipApplied: false,
      isFinancialAidApplied: false,
      applicationNotes: '',
    },
  });

  function onCreateSubmit(values: z.infer<typeof applicationSchema>) {
    createApplicationMutation.mutate(values);
  }

  function onEditSubmit(values: z.infer<typeof applicationSchema>) {
    if (selectedApplication) {
      updateApplicationMutation.mutate({
        ...selectedApplication,
        ...values,
      });
    }
  }

  function handleEdit(application: SchoolApplication) {
    setSelectedApplication(application);
    editForm.reset({
      schoolName: application.schoolName,
      applicationDeadline: application.applicationDeadline,
      status: application.status,
      decisionStatus: application.decisionStatus || 'Undecided',
      applicationPlatform: application.applicationPlatform,
      applicationFee: application.applicationFee || 0,
      isFeePaid: application.isFeePaid || false,
      isScholarshipApplied: application.isScholarshipApplied || false,
      isFinancialAidApplied: application.isFinancialAidApplied || false,
      applicationNotes: application.applicationNotes || '',
    });
    setIsEditDialogOpen(true);
  }

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this school application?')) {
      deleteApplicationMutation.mutate(id);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'Not Started':
        return <Badge variant="outline" className="bg-gray-100">Not Started</Badge>;
      case 'In Progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
      case 'Submitted':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Submitted</Badge>;
      case 'Decision Received':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Decision Received</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  function getDecisionBadge(decision: string) {
    switch (decision) {
      case 'Accepted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'Waitlisted':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Waitlisted</Badge>;
      case 'Deferred':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Deferred</Badge>;
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
        description="There was an error loading your school applications. Please try again."
        icon={<X className="h-12 w-12 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">School Applications</h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add School
        </Button>
      </div>

      {applications && applications.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app: SchoolApplication) => (
            <Card key={app.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <School className="h-5 w-5 text-primary" />
                    {app.schoolName}
                  </CardTitle>
                  {getStatusBadge(app.status)}
                </div>
                <CardDescription>
                  {app.applicationPlatform} 
                  {app.applicationFee ? ` • $${app.applicationFee} fee` : ''}
                  {app.isFeePaid ? ' (Paid)' : app.applicationFee ? ' (Unpaid)' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  Deadline: {format(new Date(app.applicationDeadline), 'MMM dd, yyyy')}
                </div>
                
                {app.status === 'Decision Received' && app.decisionStatus && (
                  <div className="mb-2">
                    Decision: {getDecisionBadge(app.decisionStatus)}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {app.isScholarshipApplied && (
                    <Badge variant="outline" className="bg-green-50">Scholarship Applied</Badge>
                  )}
                  {app.isFinancialAidApplied && (
                    <Badge variant="outline" className="bg-blue-50">Financial Aid Applied</Badge>
                  )}
                </div>
                
                {app.applicationNotes && (
                  <div className="mt-2 text-sm">
                    <p className="font-medium">Notes:</p>
                    <p>{app.applicationNotes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(app)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => handleDelete(app.id)}
                >
                  <Trash className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyPlaceholder
          title="No school applications yet"
          description="Start tracking your college applications by adding schools you're applying to."
          icon={<School className="h-12 w-12 text-muted-foreground" />}
          action={
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Your First School
            </Button>
          }
        />
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New School Application</DialogTitle>
            <DialogDescription>
              Track a new school you're applying to
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., University of Michigan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="applicationPlatform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Platform</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select application platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Common App">Common App</SelectItem>
                        <SelectItem value="Coalition App">Coalition App</SelectItem>
                        <SelectItem value="Direct to School">Direct to School</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select application status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="Decision Received">Decision Received</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createForm.watch('status') === 'Decision Received' && (
                <FormField
                  control={createForm.control}
                  name="decisionStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decision Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select decision status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Undecided">Undecided</SelectItem>
                          <SelectItem value="Accepted">Accepted</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                          <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                          <SelectItem value="Deferred">Deferred</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={createForm.control}
                name="applicationFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Fee (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="isFeePaid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Fee Paid</FormLabel>
                        <FormDescription>
                          Mark if application fee is paid
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="isScholarshipApplied"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Scholarship Applied</FormLabel>
                        <FormDescription>
                          Applied for scholarships
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="isFinancialAidApplied"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Financial Aid Applied</FormLabel>
                      <FormDescription>
                        Applied for financial aid (FAFSA, CSS Profile, etc.)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="applicationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about this application..."
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
                <Button type="submit" disabled={createApplicationMutation.isPending}>
                  {createApplicationMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add School
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
            <DialogTitle>Edit School Application</DialogTitle>
            <DialogDescription>
              Update this school application's information
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., University of Michigan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="applicationPlatform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Platform</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select application platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Common App">Common App</SelectItem>
                        <SelectItem value="Coalition App">Coalition App</SelectItem>
                        <SelectItem value="Direct to School">Direct to School</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select application status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="Decision Received">Decision Received</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {editForm.watch('status') === 'Decision Received' && (
                <FormField
                  control={editForm.control}
                  name="decisionStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decision Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select decision status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Undecided">Undecided</SelectItem>
                          <SelectItem value="Accepted">Accepted</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                          <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                          <SelectItem value="Deferred">Deferred</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={editForm.control}
                name="applicationFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Fee (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="isFeePaid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Fee Paid</FormLabel>
                        <FormDescription>
                          Mark if application fee is paid
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="isScholarshipApplied"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Scholarship Applied</FormLabel>
                        <FormDescription>
                          Applied for scholarships
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="isFinancialAidApplied"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Financial Aid Applied</FormLabel>
                      <FormDescription>
                        Applied for financial aid (FAFSA, CSS Profile, etc.)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="applicationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about this application..."
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
                <Button type="submit" disabled={updateApplicationMutation.isPending}>
                  {updateApplicationMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update School
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}