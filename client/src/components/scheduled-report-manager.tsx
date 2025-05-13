import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { CalendarIcon, Trash2Icon, PlusIcon } from 'lucide-react';

// Schedule frequency options
const FREQUENCIES = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'biweekly', label: 'Every 2 Weeks' },
  { id: 'monthly', label: 'Monthly' }
];

// Days of the week
const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' }
];

// Report sections
const REPORT_SECTIONS = [
  { id: 'performance', label: 'Performance Metrics' },
  { id: 'training', label: 'Training Summary' },
  { id: 'nutrition', label: 'Nutrition Overview' },
  { id: 'academics', label: 'Academic Progress' },
  { id: 'achievements', label: 'Recent Achievements' },
  { id: 'upcoming', label: 'Upcoming Events' },
  { id: 'recommendations', label: 'Coach Recommendations' },
];

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

export function ScheduledReportManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  
  const [isLoading, setIsLoading] = useState(false);

  // For the new schedule form  
  const [newSchedule, setNewSchedule] = useState<Partial<ScheduledReport>>({
    frequency: 'weekly',
    dayOfWeek: 'friday',
    sections: ['performance', 'achievements', 'recommendations'],
    includeInsights: true,
    active: true
  });
  
  // Fetch existing scheduled reports
  const { data: scheduledReports = [], isLoading: reportsLoading, refetch: refetchReports } = useQuery({
    queryKey: [`/api/athlete/${athleteId}/scheduled-reports`],
    enabled: !!athleteId,
  });
  
  // Get parent access records to show recipient information
  const { data: parentAccess = [], isLoading: parentsLoading } = useQuery({
    queryKey: [`/api/athlete/${athleteId}/parent-access`],
    enabled: !!athleteId,
  });
  
  // Toggle section selection for new schedule
  const toggleSection = (sectionId: string) => {
    setNewSchedule(prev => {
      const currentSections = prev.sections || [];
      return {
        ...prev,
        sections: currentSections.includes(sectionId)
          ? currentSections.filter(id => id !== sectionId)
          : [...currentSections, sectionId]
      };
    });
  };
  
  // Create a new scheduled report
  const handleCreateSchedule = async () => {
    if (!athleteId) {
      toast({
        title: "Error",
        description: "No athlete profile found",
        variant: "destructive",
      });
      return;
    }
    
    if (!newSchedule.sections || newSchedule.sections.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one section to include in reports",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest(
        `/api/athlete/${athleteId}/scheduled-reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...newSchedule,
            athleteId
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create schedule");
      }
      
      toast({
        title: "Schedule Created",
        description: "The scheduled report has been set up successfully",
        variant: "default",
      });
      
      // Reset the form
      setNewSchedule({
        frequency: 'weekly',
        dayOfWeek: 'friday',
        sections: ['performance', 'achievements', 'recommendations'],
        includeInsights: true,
        active: true
      });
      
      // Refresh the list
      refetchReports();
      
    } catch (error: any) {
      toast({
        title: "Error Creating Schedule",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a scheduled report
  const handleDeleteSchedule = async (id: number) => {
    if (!athleteId) return;
    
    try {
      const response = await apiRequest(
        `/api/athlete/${athleteId}/scheduled-reports/${id}`,
        {
          method: 'DELETE'
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete schedule");
      }
      
      toast({
        title: "Schedule Deleted",
        description: "The scheduled report has been removed",
        variant: "default",
      });
      
      // Refresh the list
      refetchReports();
      
    } catch (error: any) {
      toast({
        title: "Error Deleting Schedule",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Toggle active status for a scheduled report
  const handleToggleActive = async (id: number, currentActive: boolean) => {
    if (!athleteId) return;
    
    try {
      const response = await apiRequest(
        `/api/athlete/${athleteId}/scheduled-reports/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            active: !currentActive
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update schedule");
      }
      
      toast({
        title: currentActive ? "Schedule Paused" : "Schedule Activated",
        description: currentActive 
          ? "The scheduled reports have been paused" 
          : "The scheduled reports have been activated",
        variant: "default",
      });
      
      // Refresh the list
      refetchReports();
      
    } catch (error: any) {
      toast({
        title: "Error Updating Schedule",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Format date string for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get count of active parents
  const activeParentsCount = Array.isArray(parentAccess) 
    ? parentAccess.filter((p: any) => p.active && p.receiveUpdates).length 
    : 0;
  
  if (!athleteId) {
    return <div>You need to be logged in as an athlete to use this feature.</div>;
  }
  
  return (
    <div className="space-y-8">
      {/* Parent recipients summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Report Recipients</CardTitle>
          <CardDescription>
            Parents who will receive your scheduled performance reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {parentsLoading ? (
            <p>Loading parent information...</p>
          ) : activeParentsCount === 0 ? (
            <div className="bg-muted p-4 rounded-md text-center">
              <p>No parents are currently set up to receive updates.</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => window.location.href = '/parent-management'}
              >
                Add parent contacts
              </Button>
            </div>
          ) : (
            <div>
              <p>{activeParentsCount} parent{activeParentsCount !== 1 ? 's' : ''} will receive scheduled reports:</p>
              <ul className="list-disc pl-5 mt-2">
                {Array.isArray(parentAccess) && parentAccess
                  .filter((p: any) => p.active && p.receiveUpdates)
                  .map((parent: any, index: number) => (
                    <li key={index} className="text-sm mb-1">
                      {parent.name} ({parent.relationship}) - {parent.email}
                    </li>
                  ))
                }
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Current scheduled reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Scheduled Reports</CardTitle>
          <CardDescription>
            Manage your existing automated report schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <p>Loading your scheduled reports...</p>
          ) : (!Array.isArray(scheduledReports) || scheduledReports.length === 0) ? (
            <div className="text-center py-8 bg-muted rounded-md">
              <p className="text-muted-foreground">You don't have any scheduled reports yet.</p>
              <p className="mt-2">Create one below to automatically send reports to your parents.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(scheduledReports as any[]).map((schedule: any) => (
                <div 
                  key={schedule.id} 
                  className={`p-4 border rounded-md ${schedule.active ? 'border-primary/20' : 'border-muted'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${schedule.active ? 'text-primary' : 'text-muted-foreground'}`}>
                        {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} Report
                        {schedule.active ? '' : ' (Paused)'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Sent every {schedule.dayOfWeek.charAt(0).toUpperCase() + schedule.dayOfWeek.slice(1)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={schedule.active}
                        onCheckedChange={() => handleToggleActive(schedule.id, schedule.active)}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Trash2Icon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Last sent: {formatDate(schedule.lastSent)}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Next: {formatDate(schedule.nextScheduled)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-xs font-medium">Includes:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {schedule.sections.map((section: string) => {
                        const sectionInfo = REPORT_SECTIONS.find(s => s.id === section);
                        return (
                          <span 
                            key={section}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md"
                          >
                            {sectionInfo?.label || section}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create new schedule form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create New Scheduled Report</CardTitle>
          <CardDescription>
            Set up automated performance reports to be sent to your parents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Frequency and day selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select 
                value={newSchedule.frequency}
                onValueChange={(value) => setNewSchedule(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map(freq => (
                    <SelectItem key={freq.id} value={freq.id}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="day-of-week">Day of the Week</Label>
              <Select 
                value={newSchedule.dayOfWeek}
                onValueChange={(value) => setNewSchedule(prev => ({ ...prev, dayOfWeek: value }))}
              >
                <SelectTrigger id="day-of-week">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(day => (
                    <SelectItem key={day.id} value={day.id}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          {/* Report sections */}
          <div>
            <Label className="mb-2 block">Report Sections</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {REPORT_SECTIONS.map((section) => (
                <div key={section.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`new-${section.id}`}
                    checked={newSchedule.sections?.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <Label 
                    htmlFor={`new-${section.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Include AI insights toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="insights-toggle">Include AI Performance Insights</Label>
              <div className="text-sm text-muted-foreground">
                Add AI-generated insights and recommendations based on performance
              </div>
            </div>
            <Switch
              id="insights-toggle"
              checked={newSchedule.includeInsights}
              onCheckedChange={(checked) => setNewSchedule(prev => ({ ...prev, includeInsights: checked }))}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleCreateSchedule} 
            disabled={isLoading || !newSchedule.sections || newSchedule.sections.length === 0}
            className="w-full"
          >
            {isLoading ? 'Creating...' : 'Create Scheduled Report'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}