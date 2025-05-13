import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Loader2, RefreshCcw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export function ScheduledReportProcessor() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessingResult, setLastProcessingResult] = useState<any>(null);

  const processScheduledReports = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/scheduled-reports/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process scheduled reports');
      }

      const result = await response.json();
      setLastProcessingResult(result);
      
      toast({
        title: 'Reports Processed',
        description: `Successfully processed ${result.processed} scheduled reports`,
      });
    } catch (error: any) {
      toast({
        title: 'Error Processing Reports',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Scheduled Reports</CardTitle>
        <CardDescription>
          Manually trigger the processing of scheduled reports. 
          In a production environment, this would be handled by an automated task scheduler.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={processScheduledReports}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Process Scheduled Reports
              </>
            )}
          </Button>

          {lastProcessingResult && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Last Processing Results</h3>
              <div className="bg-muted p-3 rounded-md">
                <p>Processed: {lastProcessingResult.processed} reports</p>
                {lastProcessingResult.reports.length > 0 ? (
                  <div className="mt-2">
                    <p className="font-medium">Reports:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {lastProcessingResult.reports.map((report: any, index: number) => (
                        <li key={index} className="text-sm">
                          Report ID: {report.reportId} - 
                          Athlete: {report.athleteName} -
                          Successful: {report.successfulSends.length},
                          Failed: {report.failedSends.length}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm mt-2">No reports were due for processing.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}