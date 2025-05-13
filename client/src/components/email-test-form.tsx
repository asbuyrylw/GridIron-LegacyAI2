import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Form validation schema for basic email test
const emailTestSchema = z.object({
  to: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(1, { message: 'Subject is required' }),
  text: z.string().optional(),
  html: z.string().optional(),
});

// Form validation schema for parent invite test
const parentInviteSchema = z.object({
  parentEmail: z.string().email({ message: 'Please enter a valid email address' }),
  parentName: z.string().min(1, { message: 'Parent name is required' }),
  athleteName: z.string().min(1, { message: 'Athlete name is required' }),
});

type EmailTestFormValues = z.infer<typeof emailTestSchema>;
type ParentInviteFormValues = z.infer<typeof parentInviteSchema>;

export function EmailTestForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);

  // Basic Email Test Form
  const emailForm = useForm<EmailTestFormValues>({
    resolver: zodResolver(emailTestSchema),
    defaultValues: {
      to: '',
      subject: 'Test Email from GridIron LegacyAI',
      text: 'This is a test email from the GridIron LegacyAI application.',
      html: '<h1>GridIron LegacyAI Test</h1><p>This is a test email from the <strong>GridIron LegacyAI</strong> application.</p>',
    },
  });

  // Parent Invite Form
  const parentInviteForm = useForm<ParentInviteFormValues>({
    resolver: zodResolver(parentInviteSchema),
    defaultValues: {
      parentEmail: '',
      parentName: '',
      athleteName: '',
    },
  });

  // Submit basic email test
  const onSubmitEmailTest = async (values: EmailTestFormValues) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/email/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: data.message });
        toast({
          title: 'Email Sent',
          description: data.message,
          variant: 'default',
        });
      } else {
        setResult({ success: false, message: data.message || 'Failed to send email' });
        toast({
          title: 'Error',
          description: data.message || 'Failed to send email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      });
      toast({
        title: 'Error',
        description: 'Failed to send email. Check console for details.',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Submit parent invite test
  const onSubmitParentInvite = async (values: ParentInviteFormValues) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/email/test-parent-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: data.message });
        toast({
          title: 'Invite Sent',
          description: data.message,
          variant: 'default',
        });
      } else {
        setResult({ success: false, message: data.message || 'Failed to send parent invite' });
        toast({
          title: 'Error',
          description: data.message || 'Failed to send parent invite',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      });
      toast({
        title: 'Error',
        description: 'Failed to send invite. Check console for details.',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Email Test Center</CardTitle>
          <CardDescription>Test sending emails with SendGrid integration</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Email Test</TabsTrigger>
              <TabsTrigger value="parent">Parent Invite Test</TabsTrigger>
            </TabsList>
            
            {/* Basic Email Test Form */}
            <TabsContent value="basic">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onSubmitEmailTest)} className="space-y-4 mt-4">
                  <FormField
                    control={emailForm.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Email</FormLabel>
                        <FormControl>
                          <Input placeholder="recipient@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={emailForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Email subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={emailForm.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plain Text Content</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Plain text email content" {...field} rows={3} />
                        </FormControl>
                        <FormDescription>
                          Text version of the email (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={emailForm.control}
                    name="html"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HTML Content</FormLabel>
                        <FormControl>
                          <Textarea placeholder="<p>HTML email content</p>" {...field} rows={5} />
                        </FormControl>
                        <FormDescription>
                          HTML version of the email (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                        Send Test Email
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            {/* Parent Invite Test Form */}
            <TabsContent value="parent">
              <Form {...parentInviteForm}>
                <form onSubmit={parentInviteForm.handleSubmit(onSubmitParentInvite)} className="space-y-4 mt-4">
                  <FormField
                    control={parentInviteForm.control}
                    name="parentEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Email</FormLabel>
                        <FormControl>
                          <Input placeholder="parent@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={parentInviteForm.control}
                    name="parentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={parentInviteForm.control}
                    name="athleteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Athlete Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Mike Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                        Send Parent Invite
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
          
          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          This tool tests the SendGrid email integration. Please ensure you have configured the SENDGRID_API_KEY.
        </CardFooter>
      </Card>
    </div>
  );
}