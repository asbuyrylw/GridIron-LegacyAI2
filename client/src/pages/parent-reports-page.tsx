import { useState } from 'react';
import { ParentReportGenerator } from '@/components/parent-report-generator';
import { ScheduledReportManager } from '@/components/scheduled-report-manager';
import { ScheduledReportProcessor } from '@/components/scheduled-report-processor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';

export default function ParentReportsPage() {
  const { user } = useAuth();
  const isAdmin = user?.userType === 'admin' || user?.userType === 'coach';
  
  const [lastSentReport, setLastSentReport] = useState<{
    successfulSends: any[];
    failedSends: any[];
  } | null>(null);

  const handleReportSent = (result: any) => {
    setLastSentReport({
      successfulSends: result.successfulSends || [],
      failedSends: result.failedSends || []
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold mb-2">Parent Reports</h1>
      <p className="text-muted-foreground mb-6">
        Keep parents updated on training progress, achievements, and performance metrics
      </p>
      
      {/* Information alert */}
      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Parent Email Updates</AlertTitle>
        <AlertDescription>
          GridIron LegacyAI sends all parent updates via email. Parents do not need to create accounts 
          or log in to receive information about your progress. You can customize what information is 
          included in each update.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual">Send Manual Report</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Automatic Reports</TabsTrigger>
          <TabsTrigger value="process">Process Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="mt-6">
          <ParentReportGenerator onSuccess={handleReportSent} />
          
          {lastSentReport && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Report Delivery Results</h3>
              
              {lastSentReport.successfulSends.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-green-600 mb-2">
                    Successfully sent to {lastSentReport.successfulSends.length} recipient(s):
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {lastSentReport.successfulSends.map((recipient, index) => (
                      <li key={index} className="text-sm">
                        {recipient.name} ({recipient.email})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {lastSentReport.failedSends.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-red-600 mb-2">
                    Failed to send to {lastSentReport.failedSends.length} recipient(s):
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {lastSentReport.failedSends.map((recipient, index) => (
                      <li key={index} className="text-sm">
                        {recipient.email} - {recipient.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="schedule" className="mt-6">
          <ScheduledReportManager />
        </TabsContent>
        
        <TabsContent value="process" className="mt-6">
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
              <h3 className="text-amber-800 font-medium text-sm">Development Feature</h3>
              <p className="text-sm text-amber-700 mt-1">
                This tab allows you to manually trigger the processing of scheduled reports for testing purposes. 
                In production, these reports would be automatically processed by a scheduled task.
              </p>
            </div>
            
            <ScheduledReportProcessor />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}