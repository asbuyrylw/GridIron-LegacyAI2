import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { EmailNotificationType } from '../../shared/parent-access';

// Using the correct enum values from parent-access.ts
const EMAIL_TYPES = EmailNotificationType;
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Info, Award, Utensils, BookOpen, Dumbbell, Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Create a schema for parent notification form
const parentNotificationSchema = z.object({
  parentEmail: z.string().email({ message: 'Please enter a valid email address' }),
  parentName: z.string().min(1, { message: 'Parent name is required' }),
  athleteName: z.string().min(1, { message: 'Athlete name is required' }),
});

type ParentNotificationFormValues = z.infer<typeof parentNotificationSchema>;

export default function ParentNotificationTester() {
  const [activeTab, setActiveTab] = useState<EmailNotificationType>(EmailNotificationType.INVITE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);

  // Setup form with validation
  const form = useForm<ParentNotificationFormValues>({
    resolver: zodResolver(parentNotificationSchema),
    defaultValues: {
      parentEmail: '',
      parentName: 'Parent Test',
      athleteName: 'Athlete Test',
    },
  });

  // Handle form submission
  const onSubmit = async (data: ParentNotificationFormValues) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await apiRequest('/api/email/notification-test', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          notificationType: activeTab,
        }),
      });
      
      setResult({ success: true, message: response.message || 'Notification sent successfully' });
      toast({
        title: 'Notification Sent',
        description: `Successfully sent ${getNotificationTypeName(activeTab)} to ${data.parentEmail}`,
      });
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: error.message || 'Failed to send notification'
      });
      toast({
        title: 'Error',
        description: error.message || 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get a user-friendly name for notification type
  const getNotificationTypeName = (type: EmailNotificationType): string => {
    const notificationNames: Record<EmailNotificationType, string> = {
      [EmailNotificationType.INVITE]: 'Parent Invitation',
      [EmailNotificationType.PERFORMANCE_UPDATE]: 'Performance Update',
      [EmailNotificationType.NUTRITION_SHOPPING_LIST]: 'Nutrition Shopping List',
      [EmailNotificationType.ACHIEVEMENT_NOTIFICATION]: 'Achievement Notification',
      [EmailNotificationType.WEEKLY_SUMMARY]: 'Weekly Summary',
      [EmailNotificationType.TRAINING_PROGRESS]: 'Training Progress',
      [EmailNotificationType.ACADEMIC_UPDATE]: 'Academic Update',
      [EmailNotificationType.EVENT_REMINDER]: 'Event Reminder',
    };
    
    return notificationNames[type] || 'Notification';
  };

  // Get icon for each notification type
  const getNotificationIcon = (type: EmailNotificationType) => {
    switch (type) {
      case EmailNotificationType.INVITE:
        return <Info className="h-5 w-5" />;
      case EmailNotificationType.PERFORMANCE_UPDATE:
        return <Sparkles className="h-5 w-5" />;
      case EmailNotificationType.NUTRITION_SHOPPING_LIST:
        return <Utensils className="h-5 w-5" />;
      case EmailNotificationType.ACHIEVEMENT_NOTIFICATION:
        return <Award className="h-5 w-5" />;
      case EmailNotificationType.WEEKLY_SUMMARY:
        return <BookOpen className="h-5 w-5" />;
      case EmailNotificationType.TRAINING_PROGRESS:
        return <Dumbbell className="h-5 w-5" />;
      case EmailNotificationType.ACADEMIC_UPDATE:
        return <BookOpen className="h-5 w-5" />;
      case EmailNotificationType.EVENT_REMINDER:
        return <Send className="h-5 w-5" />;
      default:
        return <Send className="h-5 w-5" />;
    }
  };

  // Generate example data for each notification type
  const getNotificationDescription = (type: EmailNotificationType): string => {
    switch (type) {
      case EmailNotificationType.INVITE:
        return 'Invitation email sent to parents to receive updates about their athlete';
      case EmailNotificationType.PERFORMANCE_UPDATE:
        return 'Performance metrics and insights for the athlete';
      case EmailNotificationType.NUTRITION_SHOPPING_LIST:
        return 'Shopping list based on the athlete\'s nutrition plan';
      case EmailNotificationType.ACHIEVEMENT_NOTIFICATION:
        return 'Notification about new achievements the athlete has unlocked';
      case EmailNotificationType.WEEKLY_SUMMARY:
        return 'Weekly summary of the athlete\'s activities and progress';
      case EmailNotificationType.TRAINING_PROGRESS:
        return 'Updates about the athlete\'s training progress and programs';
      case EmailNotificationType.ACADEMIC_UPDATE:
        return 'Updates about the athlete\'s academic performance';
      case EmailNotificationType.EVENT_REMINDER:
        return 'Reminder about upcoming team events or games';
      default:
        return 'Email notification';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>Parent Notification Testing | GridIron LegacyAI</title>
      </Helmet>
      
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Parent Notification Testing</h1>
        <p className="text-muted-foreground mt-2">
          Test all types of parent email notifications
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Send Test Notifications</CardTitle>
            <CardDescription>
              Select a notification type and send a test email to any recipient
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as EmailNotificationType)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-4">
                <TabsTrigger value={EmailNotificationType.INVITE}>
                  <span className="hidden md:inline mr-2">Invite</span>
                  <Info className="h-4 w-4 md:hidden" />
                </TabsTrigger>
                <TabsTrigger value={EmailNotificationType.PERFORMANCE_UPDATE}>
                  <span className="hidden md:inline mr-2">Performance</span>
                  <Sparkles className="h-4 w-4 md:hidden" />
                </TabsTrigger>
                <TabsTrigger value={EmailNotificationType.NUTRITION_SHOPPING_LIST}>
                  <span className="hidden md:inline mr-2">Nutrition</span>
                  <Utensils className="h-4 w-4 md:hidden" />
                </TabsTrigger>
                <TabsTrigger value={EmailNotificationType.ACHIEVEMENT_NOTIFICATION}>
                  <span className="hidden md:inline mr-2">Achievements</span>
                  <Award className="h-4 w-4 md:hidden" />
                </TabsTrigger>
                <TabsTrigger value={EmailNotificationType.WEEKLY_SUMMARY}>
                  <span className="hidden md:inline mr-2">Summary</span>
                  <BookOpen className="h-4 w-4 md:hidden" />
                </TabsTrigger>
                <TabsTrigger value={EmailNotificationType.TRAINING_PROGRESS}>
                  <span className="hidden md:inline mr-2">Training</span>
                  <Dumbbell className="h-4 w-4 md:hidden" />
                </TabsTrigger>
                <TabsTrigger value={EmailNotificationType.ACADEMIC_UPDATE}>
                  <span className="hidden md:inline mr-2">Academic</span>
                  <BookOpen className="h-4 w-4 md:hidden" />
                </TabsTrigger>
                <TabsTrigger value={EmailNotificationType.EVENT_REMINDER}>
                  <span className="hidden md:inline mr-2">Event</span>
                  <Send className="h-4 w-4 md:hidden" />
                </TabsTrigger>
              </TabsList>
              
              <div className="p-4 border rounded-md bg-muted/50 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {getNotificationIcon(activeTab)}
                  <h3 className="text-lg font-medium">{getNotificationTypeName(activeTab)}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getNotificationDescription(activeTab)}
                </p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="parentEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="parent@example.com" 
                            type="email" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="parentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Smith" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="athleteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Athlete Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Michael Smith" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {result && (
                    <Alert variant={result.success ? "default" : "destructive"}>
                      <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                      <AlertDescription>{result.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send {getNotificationTypeName(activeTab)}
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col items-start">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>Note:</strong> This tool sends actual emails through SendGrid. Make sure you have the SENDGRID_API_KEY environment variable set.
              </p>
              <p>
                If no API key is set, emails will be simulated in the console logs for development purposes.
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}