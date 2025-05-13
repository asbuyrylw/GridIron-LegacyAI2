import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';

const REPORT_SECTIONS = [
  { id: 'performance', label: 'Performance Metrics' },
  { id: 'training', label: 'Training Summary' },
  { id: 'nutrition', label: 'Nutrition Overview' },
  { id: 'academics', label: 'Academic Progress' },
  { id: 'achievements', label: 'Recent Achievements' },
  { id: 'upcoming', label: 'Upcoming Events' },
  { id: 'recommendations', label: 'Coach Recommendations' },
];

export interface ParentReportData {
  sections: string[];
  customMessage?: string;
  parentIds?: number[];
  sendToAll: boolean;
  includeInsights: boolean;
}

interface ParentReportGeneratorProps {
  onSuccess?: (result: any) => void;
}

export function ParentReportGenerator({ onSuccess }: ParentReportGeneratorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(['performance', 'achievements']);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [selectedParents, setSelectedParents] = useState<number[]>([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [includeInsights, setIncludeInsights] = useState(true);
  
  // Get parent access records
  const { data: parentAccess = [], isLoading: parentsLoading } = useQuery({
    queryKey: [`/api/athlete/${athleteId}/parent-access`],
    enabled: !!athleteId,
  });
  
  // Toggle section selection
  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  
  // Toggle parent selection
  const toggleParent = (parentId: number) => {
    setSelectedParents(prev => 
      prev.includes(parentId) 
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    );
  };
  
  const handleSubmit = async () => {
    if (!athleteId) {
      toast({
        title: "Error",
        description: "No athlete profile found",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedSections.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one section to include in the report",
        variant: "destructive",
      });
      return;
    }
    
    if (!sendToAll && selectedParents.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one parent or enable 'Send to all'",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const reportData: ParentReportData = {
      sections: selectedSections,
      customMessage: customMessage.trim() || undefined,
      parentIds: sendToAll ? undefined : selectedParents,
      sendToAll,
      includeInsights,
    };
    
    try {
      const response = await apiRequest(
        `/api/athlete/${athleteId}/parent-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportData)
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send report");
      }
      
      const result = await response.json();
      
      toast({
        title: "Reports Sent",
        description: `Successfully sent reports to ${result.successfulSends?.length || 0} parents`,
        variant: "default",
      });
      
      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (error: any) {
      toast({
        title: "Error Sending Reports",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!athleteId) {
    return <div>You need to be logged in as an athlete to use this feature.</div>;
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Generate Parent Performance Report</CardTitle>
        <CardDescription>
          Create a customized performance report to send to your parents or guardians
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report sections */}
        <div>
          <h3 className="text-md font-medium mb-2">Report Sections</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select which sections to include in the report
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {REPORT_SECTIONS.map((section) => (
              <div key={section.id} className="flex items-start space-x-2">
                <Checkbox 
                  id={section.id}
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={() => toggleSection(section.id)}
                />
                <Label 
                  htmlFor={section.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {section.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Custom message */}
        <div className="space-y-2">
          <Label htmlFor="custom-message">Add a Personal Message (Optional)</Label>
          <Textarea
            id="custom-message"
            placeholder="Add a personal message to include in the report..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <Separator />
        
        {/* AI Insights toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="insights-toggle">Include AI Performance Insights</Label>
            <div className="text-sm text-muted-foreground">
              Add AI-generated insights and recommendations based on performance data
            </div>
          </div>
          <Switch
            id="insights-toggle"
            checked={includeInsights}
            onCheckedChange={setIncludeInsights}
          />
        </div>
        
        <Separator />
        
        {/* Parent selection */}
        <div>
          <h3 className="text-md font-medium mb-2">Select Recipients</h3>
          <div className="flex items-center space-x-2 mb-4">
            <Switch 
              id="send-to-all"
              checked={sendToAll}
              onCheckedChange={(checked) => {
                setSendToAll(checked);
                if (checked) {
                  setSelectedParents([]);
                }
              }}
            />
            <Label 
              htmlFor="send-to-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Send to all parents
            </Label>
          </div>
          
          {!sendToAll && (
            <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto p-2 border rounded-md">
              {parentsLoading ? (
                <p>Loading parents...</p>
              ) : parentAccess.length === 0 ? (
                <p>No parents have been granted access yet.</p>
              ) : (
                parentAccess.map((parent: any) => (
                  <div key={parent.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                    <Checkbox 
                      id={`parent-${parent.id}`}
                      checked={selectedParents.includes(parent.id)}
                      onCheckedChange={() => toggleParent(parent.id)}
                      disabled={!parent.active}
                    />
                    <Label 
                      htmlFor={`parent-${parent.id}`}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${!parent.active ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {parent.name} ({parent.relationship}) 
                      <div className="text-xs text-muted-foreground mt-1">{parent.email}</div>
                    </Label>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || selectedSections.length === 0 || (!sendToAll && selectedParents.length === 0)}
          className="w-full"
        >
          {isSubmitting ? 'Sending...' : 'Send Performance Report'}
        </Button>
      </CardFooter>
    </Card>
  );
}