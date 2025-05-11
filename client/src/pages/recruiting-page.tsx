import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Share2, 
  MessageSquare, 
  BarChart3, 
  ChevronRight, 
  Clock, 
  Eye, 
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Mail,
  School,
  ClipboardCopy
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/ui/page-header";
import { Loader2 } from "lucide-react";
import { 
  useRecruitingAnalytics, 
  useRecruitingMessages, 
  useSendRecruitingMessage,
  useMarkMessageAsRead,
  useShareRecruitingProfile,
  type ShareProfileData,
  type SendMessageData
} from "@/hooks/use-recruiting-hooks";

const formSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  subject: z.string().min(5, "Subject is required and must be at least 5 characters"),
  content: z.string().min(10, "Message content is required and must be at least 10 characters")
});

const shareSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  message: z.string().optional()
});

// Sample school data (would come from API in production)
const SCHOOLS = [
  { id: "1", name: "UCLA", division: "Division I" },
  { id: "2", name: "Stanford University", division: "Division I" },
  { id: "3", name: "Ohio State", division: "Division I" },
  { id: "4", name: "Michigan State", division: "Division I" },
  { id: "5", name: "Notre Dame", division: "Division I" }
];

// Sample social platforms
const SOCIAL_PLATFORMS = [
  { id: "twitter", name: "Twitter" },
  { id: "facebook", name: "Facebook" },
  { id: "instagram", name: "Instagram" },
  { id: "email", name: "Email" },
  { id: "text", name: "Text Message" }
];

export default function RecruitingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("analytics");
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [currentMessage, setCurrentMessage] = useState<any>(null);
  
  // Get the athlete ID (in production, this would come from the user object)
  const athleteId = 1; // Hard-coded for demo, would use user?.id in production
  
  // Fetch recruiting data
  const { data: analytics, isLoading: isLoadingAnalytics } = useRecruitingAnalytics(athleteId);
  const { data: messages, isLoading: isLoadingMessages } = useRecruitingMessages(athleteId);
  const markMessageAsRead = useMarkMessageAsRead();
  const sendMessage = useSendRecruitingMessage(athleteId);
  const shareProfile = useShareRecruitingProfile(athleteId);
  
  // Forms
  const messageForm = useForm<SendMessageData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolId: "",
      subject: "",
      content: ""
    }
  });
  
  const shareForm = useForm<ShareProfileData>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      platform: "",
      message: ""
    }
  });
  
  // Handle message selection
  useEffect(() => {
    if (selectedMessageId && messages) {
      const message = messages.find(msg => msg.id === selectedMessageId);
      if (message && !message.read) {
        markMessageAsRead.mutate(selectedMessageId);
      }
      setCurrentMessage(message);
    }
  }, [selectedMessageId, messages, markMessageAsRead]);
  
  // Handle message form submission
  function onSendMessage(data: SendMessageData) {
    sendMessage.mutate(data, {
      onSuccess: () => {
        messageForm.reset();
      }
    });
  }
  
  // Handle profile sharing
  function onShareProfile(data: ShareProfileData) {
    shareProfile.mutate(data, {
      onSuccess: () => {
        shareForm.reset();
      }
    });
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Custom colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#F5B041'];
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Recruiting Dashboard" 
          description="Track your recruiting analytics and manage communications with coaches"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = "/recruiting-profile-builder"}>
            <ClipboardCopy className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/college-matcher"}>
            <School className="h-4 w-4 mr-2" />
            College Matcher
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="profile">
            <Share2 className="h-4 w-4 mr-2" />
            Profile Sharing
          </TabsTrigger>
          <TabsTrigger value="college-matcher">
            <School className="h-4 w-4 mr-2" />
            College Matcher
          </TabsTrigger>
        </TabsList>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {isLoadingAnalytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
              ))}
              <Skeleton className="h-[300px] w-full md:col-span-2 rounded-xl" />
              <Skeleton className="h-[300px] w-full md:col-span-2 rounded-xl" />
            </div>
          ) : analytics ? (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Profile Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold">{analytics.profileViews}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analytics.uniqueViewers} unique viewers
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Interest Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="text-2xl font-bold">{analytics.interestLevel}%</div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${analytics.interestLevel}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Bookmarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Bookmark className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold">{analytics.bookmarksCount}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Coaches saved your profile
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold">{analytics.messagesSent}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Communications sent
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Detailed Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Profile Views Over Time</CardTitle>
                    <CardDescription>
                      Track how your profile visibility has changed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={analytics.viewsOverTime}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Interest By Division Level</CardTitle>
                    <CardDescription>
                      Breakdown of interest across different school types
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.interestBySchoolType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.interestBySchoolType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Interest By Position</CardTitle>
                    <CardDescription>
                      How coaches are evaluating you for different positions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={analytics.interestByPosition}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Interest By Region</CardTitle>
                    <CardDescription>
                      Geographic breakdown of recruiting activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.interestByRegion}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.interestByRegion.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Analytics Available</CardTitle>
                <CardDescription>
                  We don't have any recruiting analytics for you yet. Start sharing your profile to generate interest!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setActiveTab("profile")}>
                  Share your profile
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Messages List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Communications with coaches and programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMessages ? (
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-[72px] w-full rounded-md" />
                    ))}
                  </div>
                ) : messages && messages.length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            selectedMessageId === message.id 
                              ? "bg-primary/10" 
                              : "hover:bg-secondary"
                          } ${!message.read ? "border-l-4 border-blue-500" : ""}`}
                          onClick={() => setSelectedMessageId(message.id)}
                        >
                          <div className="flex justify-between">
                            <div className="font-semibold">{message.schoolName}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(message.sentAt)}
                            </div>
                          </div>
                          <div className="text-sm font-medium truncate">{message.subject}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {message.message.substring(0, 60)}...
                          </div>
                          {!message.read && (
                            <Badge variant="default" className="mt-1">New</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p>No messages to display</p>
                    <p className="text-sm text-muted-foreground">
                      Start a conversation with a coach below
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Message Detail */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {currentMessage ? currentMessage.subject : "Message Details"}
                    </CardTitle>
                    <CardDescription>
                      {currentMessage ? (
                        `From ${currentMessage.schoolName} • ${
                          formatDate(currentMessage.sentAt)
                        }`
                      ) : (
                        "Select a message to view details"
                      )}
                    </CardDescription>
                  </div>
                  {currentMessage && (
                    <Badge variant={currentMessage.read ? "outline" : "default"}>
                      {currentMessage.read ? "Read" : "Unread"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedMessageId && currentMessage ? (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{currentMessage.schoolName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Coach from {currentMessage.schoolName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(currentMessage.sentAt)}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="min-h-[200px]">
                      <p className="whitespace-pre-line">{currentMessage.message}</p>
                      
                      {currentMessage.attachment && (
                        <div className="mt-4 p-2 border rounded-md inline-block">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium">Attachment:</div>
                            <a 
                              href={currentMessage.attachment} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View Attachment
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">
                        Archive
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            Reply
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                          <DialogHeader>
                            <DialogTitle>Reply to {currentMessage.schoolName}</DialogTitle>
                            <DialogDescription>
                              Send a response to the coach's message
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Form {...messageForm}>
                            <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="space-y-4">
                              <FormField
                                control={messageForm.control}
                                name="schoolId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>School</FormLabel>
                                    <FormControl>
                                      <Input value={currentMessage.schoolName} disabled />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={messageForm.control}
                                name="subject"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        defaultValue={`RE: ${currentMessage.subject}`}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={messageForm.control}
                                name="content"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        placeholder="Type your message here..." 
                                        className="min-h-[150px]"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <DialogFooter>
                                <Button type="submit" disabled={sendMessage.isPending}>
                                  {sendMessage.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  )}
                                  Send Reply
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <p>Select a message from the list to view its contents</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Or start a new conversation with a coach
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* New Message */}
          <Card>
            <CardHeader>
              <CardTitle>New Message</CardTitle>
              <CardDescription>
                Initiate contact with a school or coach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...messageForm}>
                <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={messageForm.control}
                      name="schoolId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a school" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SCHOOLS.map((school) => (
                                <SelectItem key={school.id} value={school.id}>
                                  {school.name} ({school.division})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={messageForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., Interested in your football program" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={messageForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Introduce yourself and explain why you're interested in this program..." 
                            className="min-h-[150px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={sendMessage.isPending}>
                      {sendMessage.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Send Message
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Profile Sharing Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Share Your Recruiting Profile</CardTitle>
                <CardDescription>
                  Distribute your profile to coaches and recruiters through different platforms
                </CardDescription>
              </div>
              <Button onClick={() => window.location.href = "/recruiting-profile-builder"} className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Public Profile</h3>
                  <div className="border rounded-lg p-4 bg-card/50">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback>
                          {user?.username?.substring(0, 2).toUpperCase() || "AT"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-lg font-semibold">
                          {user?.username || "Test User"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Quarterback (QB) • Class of 2025
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Height</p>
                        <p className="font-medium">6'2"</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="font-medium">195 lbs</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">40-Yard Dash</p>
                        <p className="font-medium">4.8s</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">GPA</p>
                        <p className="font-medium">3.7</p>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-sm">
                      This is what coaches will see when you share your profile or they discover you.
                    </p>
                    
                    <div className="mt-4">
                      <Button variant="secondary" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview Public Profile
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold">Profile URL</h3>
                  <div className="flex">
                    <Input 
                      value={`https://gridiron.app/athlete/${athleteId}`} 
                      readOnly
                      className="rounded-r-none"
                    />
                    <Button className="rounded-l-none" variant="secondary">
                      Copy
                    </Button>
                  </div>
                  
                  <h3 className="text-lg font-semibold">Share Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Total Shares</p>
                      <p className="text-xl font-semibold">
                        {analytics ? analytics.messagesSent + 15 : "0"}
                      </p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Engagement Rate</p>
                      <p className="text-xl font-semibold">
                        {analytics ? `${(analytics.interestLevel / 2).toFixed(1)}%` : "0%"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Share Options</h3>
                  
                  <Form {...shareForm}>
                    <form onSubmit={shareForm.handleSubmit(onShareProfile)} className="space-y-4">
                      <FormField
                        control={shareForm.control}
                        name="platform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a platform" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SOCIAL_PLATFORMS.map((platform) => (
                                  <SelectItem key={platform.id} value={platform.id}>
                                    {platform.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={shareForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personalized Message (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Add a personal note with your profile link..." 
                                className="min-h-[150px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={shareProfile.isPending}>
                        {shareProfile.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sharing...
                          </>
                        ) : (
                          <>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Profile
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-6 space-y-3">
                    <h3 className="text-lg font-semibold">Quick Share</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {SOCIAL_PLATFORMS.slice(0, 3).map((platform) => (
                        <Button
                          key={platform.id}
                          variant="outline"
                          className="py-6"
                          onClick={() => {
                            shareForm.setValue("platform", platform.id);
                            shareForm.handleSubmit(onShareProfile)();
                          }}
                        >
                          {platform.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/30">
                    <h3 className="flex items-center text-amber-800 dark:text-amber-300 font-medium">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Recruiting Tips
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                        Share your profile early and often to maximize exposure
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                        Personalize messages when contacting specific schools
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                        Follow up within 2 weeks if you don't hear back
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* College Matcher Tab */}
        <TabsContent value="college-matcher" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>College Matcher Tool</CardTitle>
                <CardDescription>
                  Find the right college fit based on your athletic and academic profile
                </CardDescription>
              </div>
              <Button onClick={() => window.location.href = "/college-matcher"} className="flex items-center">
                <School className="mr-2 h-4 w-4" />
                Open College Matcher
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <School className="h-5 w-5 mr-2 text-primary" />
                  Find Your Perfect College Match
                </h3>
                <p className="text-sm mb-4">
                  Our College Matcher tool analyzes your athletic metrics, academic performance, and 
                  preferences to suggest colleges that are the right fit for your football career.
                </p>
                <ul className="mb-4 space-y-2">
                  <li className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5 mr-2">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">Get division recommendations (D1, D2, D3, NAIA, JUCO)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5 mr-2">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">View personalized school matches with compatibility scores</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5 mr-2">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">Receive actionable feedback to improve your recruiting profile</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <a href="/college-matcher">
                    <School className="mr-2 h-4 w-4" />
                    Go to College Matcher
                  </a>
                </Button>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Complete Your Profile for Better Matches</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  To get the most accurate college matches, make sure you've completed the following:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <div className="w-5 h-5 mr-2 flex items-center justify-center">
                      <div className="h-4 w-4 rounded-full border border-amber-500" />
                    </div>
                    <span>Add your GPA and test scores</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-5 h-5 mr-2 flex items-center justify-center">
                      <div className="h-4 w-4 rounded-full border border-amber-500" />
                    </div>
                    <span>Set your school preferences</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-5 h-5 mr-2 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <span>Update your combine metrics</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}