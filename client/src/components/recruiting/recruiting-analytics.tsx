import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { UserRoundSearch, ArrowBigUp, BookMarked, MessageSquare } from "lucide-react";

interface RecruitingAnalyticsProps {
  profileViews: number;
  interestLevel: number;
  bookmarksCount: number;
  messagesSent: number;
  viewsOverTime?: Array<{ date: string; count: number }>;
  interestBySchoolType?: Array<{ name: string; value: number }>;
  interestByPosition?: Array<{ name: string; value: number }>;
  interestByRegion?: Array<{ name: string; value: number }>;
}

export function RecruitingAnalytics({
  profileViews,
  interestLevel,
  bookmarksCount,
  messagesSent,
  viewsOverTime = [],
  interestBySchoolType = [],
  interestByPosition = [],
  interestByRegion = []
}: RecruitingAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Create sample data for profile views by day if none provided
  const profileViewsData = viewsOverTime.length > 0 
    ? viewsOverTime 
    : [
        { date: '2025-05-01', count: 3 },
        { date: '2025-05-02', count: 5 },
        { date: '2025-05-03', count: 2 },
        { date: '2025-05-04', count: 7 },
        { date: '2025-05-05', count: 9 },
        { date: '2025-05-06', count: 4 },
        { date: '2025-05-07', count: 8 },
      ];
  
  // Create sample data for interest by school type if none provided
  const schoolTypeData = interestBySchoolType.length > 0 
    ? interestBySchoolType 
    : [
        { name: 'Division I', value: 8 },
        { name: 'Division II', value: 15 },
        { name: 'Division III', value: 25 },
        { name: 'NAIA', value: 10 },
        { name: 'JUCO', value: 12 }
      ];
  
  // Create sample data for interest by position if none provided
  const positionData = interestByPosition.length > 0 
    ? interestByPosition 
    : [
        { name: 'Quarterback', value: 5 },
        { name: 'Running Back', value: 12 },
        { name: 'Wide Receiver', value: 18 },
        { name: 'Linebacker', value: 20 },
        { name: 'Defensive Back', value: 15 }
      ];
  
  // Create sample data for interest by region if none provided
  const regionData = interestByRegion.length > 0 
    ? interestByRegion 
    : [
        { name: 'Northeast', value: 15 },
        { name: 'Southeast', value: 25 },
        { name: 'Midwest', value: 18 },
        { name: 'Southwest', value: 12 },
        { name: 'West', value: 10 }
      ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <UserRoundSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileViews}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(profileViews * 0.2)} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Level</CardTitle>
            <ArrowBigUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interestLevel}%</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(interestLevel * 0.1)}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookmarksCount}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(bookmarksCount * 0.15)} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messagesSent}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(messagesSent * 0.25)} from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schools">School Types</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Views Over Time</CardTitle>
            </CardHeader>
            <CardContent className="p-1 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={profileViewsData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any) => [`${value} views`, 'Profile Views']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString();
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Profile Views"
                    stroke="#0171e2"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interest by School Type</CardTitle>
            </CardHeader>
            <CardContent className="p-1 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={schoolTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {schoolTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} schools`, 'Count']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interest by Position</CardTitle>
            </CardHeader>
            <CardContent className="p-1 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={positionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value} schools`, 'Interest']}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Schools Interested" fill="#0171e2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interest by Region</CardTitle>
            </CardHeader>
            <CardContent className="p-1 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} schools`, 'Count']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}