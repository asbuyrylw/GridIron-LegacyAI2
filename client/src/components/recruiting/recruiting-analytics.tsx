import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, TrendingUp, Award, Mail, UserPlus, CalendarDays } from "lucide-react";

// Define color constants
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#ffc658"];

interface RecruitingAnalyticsProps {
  profileViews?: number;
  interestLevel?: number;
  bookmarksCount?: number;
  messagesSent?: number;
  connectionsCount?: number;
  recruitingActivity?: any[];
  viewsOverTime?: any[];
  interestBySchoolType?: any[];
  interestByPosition?: any[];
  interestByRegion?: any[];
  topSchools?: string[];
}

export function RecruitingAnalytics({
  profileViews = 0,
  interestLevel = 0,
  bookmarksCount = 0,
  messagesSent = 0,
  connectionsCount = 0,
  recruitingActivity = [],
  viewsOverTime = [],
  interestBySchoolType = [],
  interestByPosition = [],
  interestByRegion = [],
  topSchools = []
}: RecruitingAnalyticsProps) {
  // If no data is provided, show demo/sample data
  const demoViewsOverTime = viewsOverTime.length > 0 ? viewsOverTime : [
    { date: "Jan", views: 12 },
    { date: "Feb", views: 19 },
    { date: "Mar", views: 24 },
    { date: "Apr", views: 35 },
    { date: "May", views: 42 },
    { date: "Jun", views: 53 },
    { date: "Jul", views: 49 },
    { date: "Aug", views: 58 },
    { date: "Sep", views: 63 },
    { date: "Oct", views: 72 },
    { date: "Nov", views: 84 },
    { date: "Dec", views: 91 }
  ];
  
  const demoInterestBySchoolType = interestBySchoolType.length > 0 ? interestBySchoolType : [
    { name: "Division I", value: 45 },
    { name: "Division II", value: 28 },
    { name: "Division III", value: 15 },
    { name: "NAIA", value: 8 },
    { name: "Junior College", value: 4 }
  ];
  
  const demoInterestByPosition = interestByPosition.length > 0 ? interestByPosition : [
    { position: "QB", interest: 35 },
    { position: "RB", interest: 20 },
    { position: "WR", interest: 55 },
    { position: "TE", interest: 15 },
    { position: "OL", interest: 10 },
    { position: "DL", interest: 8 },
    { position: "LB", interest: 12 },
    { position: "DB", interest: 18 }
  ];
  
  const demoRecruitingActivity = recruitingActivity.length > 0 ? recruitingActivity : [
    { name: "Profile Views", value: profileViews || 247 },
    { name: "Bookmarks", value: bookmarksCount || 38 },
    { name: "Messages", value: messagesSent || 14 },
    { name: "Connections", value: connectionsCount || 21 }
  ];
  
  const demoTopSchools = topSchools.length > 0 ? topSchools : [
    "Ohio State University",
    "University of Michigan",
    "University of Alabama",
    "Clemson University",
    "University of Georgia"
  ];

  // Function to calculate interest level label
  const getInterestLevelLabel = (level: number) => {
    if (level < 20) return "Low";
    if (level < 50) return "Moderate";
    if (level < 80) return "High";
    return "Very High";
  };
  
  // Function to get interest level color
  const getInterestLevelColor = (level: number) => {
    if (level < 20) return "bg-red-100 text-red-800";
    if (level < 50) return "bg-yellow-100 text-yellow-800";
    if (level < 80) return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  // Interest level display
  const currentInterestLevel = interestLevel || 68;
  const interestLevelLabel = getInterestLevelLabel(currentInterestLevel);
  const interestLevelColor = getInterestLevelColor(currentInterestLevel);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Recruiting Analytics</h2>
        <p className="text-muted-foreground">
          Track your recruiting activity and interest from schools
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center">
              <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{profileViews || demoRecruitingActivity[0].value}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Interest Level</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{currentInterestLevel}%</span>
            </div>
            <Badge className={`${interestLevelColor} mt-2 font-normal`}>
              {interestLevelLabel}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center">
              <Award className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{bookmarksCount || demoRecruitingActivity[1].value}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Coaches saved your profile</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{messagesSent || demoRecruitingActivity[2].value}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Direct inquiries received</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interest">Interest</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Views Over Time</CardTitle>
              <CardDescription>
                Track how many coaches and recruiters view your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={demoViewsOverTime}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest recruiting interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Profile Viewed by Ohio State</p>
                      <p className="text-sm text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <UserPlus className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Connection Request from Michigan</p>
                      <p className="text-sm text-muted-foreground">5 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Message from Alabama</p>
                      <p className="text-sm text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Interested Schools</CardTitle>
                <CardDescription>
                  Schools showing the most interest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {demoTopSchools.map((school, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <span>{school}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Interest Tab */}
        <TabsContent value="interest" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Interest by School Type</CardTitle>
                <CardDescription>
                  Distribution of interest across different divisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demoInterestBySchoolType}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {demoInterestBySchoolType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Interest by Position</CardTitle>
                <CardDescription>
                  How recruiters view your potential by position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={demoInterestByPosition}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="position" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="interest" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Schools Tab */}
        <TabsContent value="schools" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>School Interest Breakdown</CardTitle>
              <CardDescription>
                Detailed analysis of school interest by type and region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="font-medium mb-2">Top 10 Schools Viewing Your Profile</h3>
                  <div className="space-y-2">
                    {demoTopSchools.concat([
                      "Notre Dame University",
                      "Penn State University",
                      "University of Texas",
                      "Florida State University",
                      "LSU"
                    ]).slice(0, 10).map((school, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{school}</span>
                        <div className="w-1/2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${100 - index * 8}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Interest by Region</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { region: "Southeast", count: 42 },
                      { region: "Midwest", count: 38 },
                      { region: "West Coast", count: 24 },
                      { region: "Northeast", count: 19 },
                      { region: "Southwest", count: 15 },
                      { region: "Pacific Northwest", count: 8 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-md border">
                        <span>{item.region}</span>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recruiting Activity</CardTitle>
              <CardDescription>
                Summary of your recruiting interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={demoRecruitingActivity}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>
                Latest communications from coaches and recruiters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    school: "Ohio State University", 
                    message: "Hi there! We're impressed with your highlight film and would like to talk more about your future in college football.", 
                    date: "2 days ago",
                    coach: "Coach Williams"
                  },
                  { 
                    school: "University of Michigan", 
                    message: "Your stats from the last season caught our attention. We'd love to have you visit our campus sometime.", 
                    date: "5 days ago",
                    coach: "Coach Thompson"
                  },
                  { 
                    school: "Notre Dame University", 
                    message: "Your combination of academic excellence and athletic prowess aligns with what we look for in student-athletes.", 
                    date: "1 week ago",
                    coach: "Coach Johnson"
                  }
                ].map((msg, index) => (
                  <div key={index} className="p-3 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{msg.school}</h4>
                      <Badge variant="outline">{msg.date}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{msg.message}</p>
                    <p className="text-xs mt-2 text-right">- {msg.coach}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}