import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { CombineMetricsForm } from "@/components/training/combine-metrics-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { CombineMetric } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export default function StatsPage() {
  const { user } = useAuth();
  const athleteId = user?.athlete?.id;
  
  const { data: metrics } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${athleteId}/metrics`],
    enabled: !!athleteId,
  });
  
  // Transform metrics data for charts
  const chartData = metrics?.map(metric => ({
    date: format(new Date(metric.dateRecorded), 'MM/dd'),
    fortyYard: metric.fortyYard,
    shuttle: metric.shuttle,
    verticalJump: metric.verticalJump,
    broadJump: metric.broadJump,
    benchPress: metric.benchPress
  })).reverse();
  
  return (
    <div className="min-h-screen pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold mb-6">Performance Stats</h1>
        
        <Tabs defaultValue="current">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="current" className="flex-1">Current Metrics</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">History & Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            <CombineMetricsForm />
          </TabsContent>
          
          <TabsContent value="history">
            {!chartData || chartData.length < 2 ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Not Enough Data</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Update your metrics more than once to see your progress over time.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="p-4">
                  <h3 className="font-montserrat font-semibold mb-4">40-Yard Dash Progress</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={['dataMin', 'dataMax']} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="fortyYard" 
                          name="40-Yard (sec)" 
                          stroke="hsl(var(--primary))" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-montserrat font-semibold mb-4">Strength Progress</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="benchPress" 
                          name="Bench Press (reps)" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-montserrat font-semibold mb-4">Jump Metrics</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="verticalJump" 
                          name="Vertical Jump (in)" 
                          stroke="#82ca9d" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
