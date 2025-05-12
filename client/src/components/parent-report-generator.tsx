import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2, Send, Calendar, FileText, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface ParentReportGeneratorProps {
  athleteId: number;
}

interface ParentAccess {
  id: number;
  email: string;
  name: string;
  relationship: string;
  active: boolean;
}

// Define report sections
const reportSections = [
  { id: 'performance', label: 'Performance Metrics' },
  { id: 'academics', label: 'Academic Progress' },
  { id: 'training', label: 'Training Summary' },
  { id: 'achievements', label: 'Recent Achievements' },
  { id: 'upcoming', label: 'Upcoming Events' },
  { id: 'nutrition', label: 'Nutrition Overview' },
  { id: 'recommendations', label: 'Coach Recommendations' },
];

export function ParentReportGenerator({ athleteId }: ParentReportGeneratorProps) {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<'full' | 'summary'>('full');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'custom'>('month');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedParents, setSelectedParents] = useState<number[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>(reportSections.map(section => section.id));
  const [scheduleRecurring, setScheduleRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly');
  
  // Fetch parent access list
  const { data: parentAccessList, isLoading: loadingParents } = useQuery({
    queryKey: ['/api/athlete', athleteId, 'parent-access'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/athlete/${athleteId}/parent-access`);
      return response.json();
    }
  });
  
  // Select all parents by default when list loads
  useEffect(() => {
    if (parentAccessList?.parents && parentAccessList.parents.length > 0) {
      setSelectedParents(parentAccessList.parents
        .filter((parent: ParentAccess) => parent.active)
        .map((parent: ParentAccess) => parent.id));
    }
  }, [parentAccessList]);
  
  // Handle date range changes
  useEffect(() => {
    const now = new Date();
    let start = new Date();
    
    switch(dateRange) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'custom':
        // Don't update dates for custom range
        return;
    }
    
    setStartDate(start);
    setEndDate(now);
  }, [dateRange]);
  
  // Toggle section selection
  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter(id => id !== sectionId));
    } else {
      setSelectedSections([...selectedSections, sectionId]);
    }
  };
  
  // Toggle parent selection
  const toggleParent = (parentId: number) => {
    if (selectedParents.includes(parentId)) {
      setSelectedParents(selectedParents.filter(id => id !== parentId));
    } else {
      setSelectedParents([...selectedParents, parentId]);
    }
  };
  
  // Select all sections
  const selectAllSections = () => {
    setSelectedSections(reportSections.map(section => section.id));
  };
  
  // Clear all sections
  const clearSections = () => {
    setSelectedSections([]);
  };
  
  // Select all parents
  const selectAllParents = () => {
    if (parentAccessList?.parents) {
      setSelectedParents(parentAccessList.parents
        .filter((parent: ParentAccess) => parent.active)
        .map((parent: ParentAccess) => parent.id));
    }
  };
  
  // Clear all parents
  const clearParents = () => {
    setSelectedParents([]);
  };
  
  // Generate and send report mutation
  const generateReportMutation = useMutation({
    mutationFn: async () => {
      if (!startDate || !endDate) {
        throw new Error('Please select a date range for the report');
      }
      
      if (selectedParents.length === 0) {
        throw new Error('Please select at least one parent to receive the report');
      }
      
      if (selectedSections.length === 0) {
        throw new Error('Please select at least one section to include in the report');
      }
      
      const reportData = {
        athleteId,
        parentIds: selectedParents,
        reportType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        sections: selectedSections,
        recurring: scheduleRecurring,
        recurringFrequency: scheduleRecurring ? recurringFrequency : undefined
      };
      
      const response = await apiRequest('POST', `/api/athlete/${athleteId}/parent-report`, reportData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report sent successfully",
        description: scheduleRecurring 
          ? `Recurring reports will be sent ${recurringFrequency}` 
          : "The report has been sent to the selected parents",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send report",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Generate Parent Report
        </CardTitle>
        <CardDescription>
          Create and send reports to keep parents updated on your progress
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Report Type */}
        <div className="space-y-3">
          <h3 className="font-medium">Report Type</h3>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="full-report"
                checked={reportType === 'full'}
                onChange={() => setReportType('full')}
                className="h-4 w-4 rounded-full text-primary"
              />
              <Label htmlFor="full-report">Full Report</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="summary-report"
                checked={reportType === 'summary'}
                onChange={() => setReportType('summary')}
                className="h-4 w-4 rounded-full text-primary"
              />
              <Label htmlFor="summary-report">Summary Report</Label>
            </div>
          </div>
        </div>
        
        {/* Date Range */}
        <div className="space-y-3">
          <h3 className="font-medium">Time Period</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="quarter">Past Quarter</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            {dateRange === 'custom' && (
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date" className="mb-2 block">Start Date</Label>
                  <DatePicker date={startDate} setDate={setStartDate} label="Start date" />
                </div>
                <div>
                  <Label htmlFor="end-date" className="mb-2 block">End Date</Label>
                  <DatePicker date={endDate} setDate={setEndDate} label="End date" />
                </div>
              </div>
            )}
          </div>
          
          {startDate && endDate && (
            <div className="text-sm text-muted-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Report Sections */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Report Sections</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={selectAllSections}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSections}>
                Clear
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {reportSections.map((section) => (
              <div key={section.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`section-${section.id}`}
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={() => toggleSection(section.id)}
                />
                <Label htmlFor={`section-${section.id}`}>{section.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Parents */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Recipients</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={selectAllParents}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearParents}>
                Clear
              </Button>
            </div>
          </div>
          
          {loadingParents ? (
            <div className="py-2 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading parents...</span>
            </div>
          ) : parentAccessList?.parents && parentAccessList.parents.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {parentAccessList.parents
                .filter((parent: ParentAccess) => parent.active)
                .map((parent: ParentAccess) => (
                  <div key={parent.id} className="flex items-center space-x-2 p-2 rounded-md border">
                    <Checkbox 
                      id={`parent-${parent.id}`}
                      checked={selectedParents.includes(parent.id)}
                      onCheckedChange={() => toggleParent(parent.id)}
                    />
                    <div>
                      <Label htmlFor={`parent-${parent.id}`} className="font-medium">{parent.name}</Label>
                      <div className="text-sm text-muted-foreground">{parent.email} • {parent.relationship}</div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
              <p>No parents have access yet. Invite a parent first.</p>
              <p className="text-xs text-muted-foreground mt-2">Parents will receive reports via email - no login required.</p>
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Recurring settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Schedule Recurring Reports</h3>
              <p className="text-sm text-muted-foreground">Send reports automatically on a regular schedule</p>
            </div>
            <Switch
              checked={scheduleRecurring}
              onCheckedChange={setScheduleRecurring}
            />
          </div>
          
          {scheduleRecurring && (
            <Select 
              value={recurringFrequency} 
              onValueChange={(value) => setRecurringFrequency(value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline">Preview Report</Button>
        <Button 
          onClick={() => generateReportMutation.mutate()}
          disabled={generateReportMutation.isPending || selectedParents.length === 0 || selectedSections.length === 0}
        >
          {generateReportMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {!generateReportMutation.isPending && (
            <Send className="mr-2 h-4 w-4" />
          )}
          {scheduleRecurring ? 'Schedule Reports' : 'Send Report'}
        </Button>
      </CardFooter>
    </Card>
  );
}