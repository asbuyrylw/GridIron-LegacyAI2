import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Calendar, Bell, Edit, Check, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Types
export interface ScheduledReport {
  id?: number;
  athleteId: number;
  frequency: string;
  dayOfWeek: string;
  sections: string[];
  includeInsights: boolean;
  active: boolean;
  lastSent?: string;
  nextScheduled?: string;
}

// Form schema
const reportFormSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly'], {
    required_error: "Please select a frequency",
  }),
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], {
    required_error: "Please select a day of the week",
  }),
  sections: z.array(z.string()).min(1, {
    message: "Please select at least one section to include in the report",
  }),
  includeInsights: z.boolean().default(true),
  active: z.boolean().default(true),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

const availableSections = [
  { id: 'performance', label: 'Performance Metrics' },
  { id: 'achievements', label: 'Achievements & Progress' },
  { id: 'training', label: 'Training Activity' },
  { id: 'nutrition', label: 'Nutrition Plan' },
  { id: 'attendance', label: 'Team Attendance' },
  { id: 'social', label: 'Social Activity' }
];

export function ScheduledReportManager() {
  const { user, athlete } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);

  // Form setup
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      frequency: 'weekly',
      dayOfWeek: 'monday',
      sections: ['performance', 'achievements'],
      includeInsights: true,
      active: true,
    },
  });

  // Query to fetch scheduled reports
  const { 
    data: reports = [],
    isLoading,
    isError,
    error
  } = useQuery<ScheduledReport[]>({
    queryKey: [`/api/athlete/${athlete?.id}/scheduled-reports`],
    enabled: !!athlete?.id,
  });

  // Mutation to create report
  const createReport = useMutation({
    mutationFn: (newReport: ScheduledReport) => {
      return apiRequest('POST', `/api/athlete/${athlete?.id}/scheduled-reports`, newReport);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${athlete?.id}/scheduled-reports`],
      });
      toast({
        title: "Report scheduled",
        description: "Your parent report has been scheduled successfully.",
      });
      setIsCreating(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error scheduling report",
        description: error.message || "There was an error scheduling your report. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation to update report
  const updateReport = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<ScheduledReport> }) => {
      return apiRequest('PATCH', `/api/athlete/${athlete?.id}/scheduled-reports/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${athlete?.id}/scheduled-reports`],
      });
      toast({
        title: "Report updated",
        description: "Your scheduled report has been updated successfully.",
      });
      setEditingReport(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating report",
        description: error.message || "There was an error updating your report. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation to delete report
  const deleteReport = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/athlete/${athlete?.id}/scheduled-reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/athlete/${athlete?.id}/scheduled-reports`],
      });
      toast({
        title: "Report deleted",
        description: "Your scheduled report has been deleted.",
      });
      setReportToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting report",
        description: error.message || "There was an error deleting your report. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: ReportFormValues) => {
    if (editingReport?.id) {
      updateReport.mutate({
        id: editingReport.id,
        data: {
          ...values,
          athleteId: athlete!.id
        }
      });
    } else {
      createReport.mutate({
        ...values,
        athleteId: athlete!.id
      });
    }
  };

  // Set form values when editing
  useEffect(() => {
    if (editingReport) {
      form.reset({
        frequency: editingReport.frequency as any,
        dayOfWeek: editingReport.dayOfWeek as any,
        sections: editingReport.sections,
        includeInsights: editingReport.includeInsights,
        active: editingReport.active
      });
    }
  }, [editingReport, form]);

  // Cancel form
  const handleCancel = () => {
    setIsCreating(false);
    setEditingReport(null);
    form.reset();
  };

  // Toggle active status
  const toggleActive = (report: ScheduledReport) => {
    updateReport.mutate({
      id: report.id!,
      data: {
        active: !report.active
      }
    });
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get frequency display
  const getFrequencyDisplay = (frequency: string) => {
    const frequencies = {
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Every two weeks',
      monthly: 'Monthly'
    };
    return frequencies[frequency as keyof typeof frequencies] || frequency;
  };

  // Get day of week display
  const getDayOfWeekDisplay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading scheduled reports...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
        <h3 className="text-lg font-medium">Error loading reports</h3>
        <p>{(error as any)?.message || "There was an error loading your scheduled reports."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isCreating && !editingReport && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Scheduled Reports</h2>
          <Button onClick={() => setIsCreating(true)} className="flex gap-2 items-center">
            <Plus size={16} />
            New Schedule
          </Button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingReport) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingReport ? 'Edit Scheduled Report' : 'Create New Scheduled Report'}</CardTitle>
            <CardDescription>
              Configure how often and what information to include in automatic parent reports
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Every two weeks</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often reports will be sent
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dayOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                            <SelectItem value="saturday">Saturday</SelectItem>
                            <SelectItem value="sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Which day to send the report
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="sections"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel>Report Sections</FormLabel>
                        <FormDescription>
                          Select which information to include in the report
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availableSections.map((section) => (
                          <FormField
                            key={section.id}
                            control={form.control}
                            name="sections"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={section.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(section.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, section.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== section.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {section.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="includeInsights"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">AI Insights</FormLabel>
                          <FormDescription>
                            Include AI-generated insights and recommendations
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription>
                            Toggle to enable or disable this scheduled report
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createReport.isPending || updateReport.isPending}
                >
                  {(createReport.isPending || updateReport.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingReport ? 'Update Schedule' : 'Create Schedule'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}

      {/* Report List */}
      {!isCreating && !editingReport && (
        <>
          {reports && reports.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Sections</TableHead>
                      <TableHead>Last Sent</TableHead>
                      <TableHead>Next Scheduled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report: ScheduledReport) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="font-medium">{getFrequencyDisplay(report.frequency)}</div>
                          <div className="text-xs text-muted-foreground">{getDayOfWeekDisplay(report.dayOfWeek)}s</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {report.sections.map(sectionId => {
                              const section = availableSections.find(s => s.id === sectionId);
                              return section ? (
                                <Badge key={sectionId} variant="outline" className="text-xs">
                                  {section.label}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.lastSent ? formatDate(report.lastSent) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatDate(report.nextScheduled)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.active ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title={report.active ? "Deactivate" : "Activate"}
                              onClick={() => toggleActive(report)}
                            >
                              {report.active ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setEditingReport(report)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Scheduled Report</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this scheduled report? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => deleteReport.mutate(report.id!)}
                                  >
                                    {deleteReport.isPending && report.id === reportToDelete ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Scheduled Reports</CardTitle>
                <CardDescription>
                  You haven't set up any automatic parent reports yet. Create your first schedule to keep parents informed regularly.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Button onClick={() => setIsCreating(true)} className="flex gap-2 items-center">
                  <Plus size={16} />
                  Create Your First Schedule
                </Button>
              </CardContent>
            </Card>
          )}
          
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="info">
              <AccordionTrigger>About Scheduled Reports</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  Scheduled reports automatically send updates to parents or guardians who have been invited to receive notifications
                  about your training and progress. These reports help keep your support network informed without manual effort.
                </p>
                <p>
                  Reports are sent via email to all active parent accounts that have been set up to receive updates.
                  You can customize which information is included and how frequently reports are sent.
                </p>
                <p className="font-medium text-orange-600">
                  Note: You must have at least one parent/guardian account set up with an email to use this feature.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </div>
  );
}