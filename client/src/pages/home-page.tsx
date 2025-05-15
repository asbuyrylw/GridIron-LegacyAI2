import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Header } from "@/components/layout/header";
import { CombineMetric } from "@shared/schema";
import { Redirect } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useLoginStreakUpdate } from "@/hooks/use-login-streak";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Dashboard Components
import { MilestoneTrackers } from "@/components/dashboard/milestone-trackers";
import { DailyPlans } from "@/components/dashboard/daily-plans";
import { DailyQuote } from "@/components/dashboard/daily-quote";
import { PlanCalendar } from "@/components/dashboard/plan-calendar";
import { LoginStreak } from "@/components/dashboard/login-streak";
import { AchievementsSummary } from "@/components/dashboard/achievements-summary";
import { HeroHeader } from "@/components/dashboard/hero-header";
import { Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const athleteId = user?.athlete?.id;
  const updateLoginStreak = useLoginStreakUpdate();
  const hasUpdatedLoginStreak = useRef(false);
  
  // Update login streak when user logs in and reaches the home page - only once
  useEffect(() => {
    if (user && !isLoading && !hasUpdatedLoginStreak.current) {
      updateLoginStreak.mutate();
      hasUpdatedLoginStreak.current = true;
    }
  }, [user, isLoading, updateLoginStreak]);
  
  const { data: metrics } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${athleteId}/metrics`],
    enabled: !!athleteId,
  });
  
  const latestMetrics = metrics?.[0];
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" />;
  }
  
  // Redirect if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Redirect to onboarding if not completed
  if (user?.athlete && !user.athlete.onboardingCompleted) {
    return <Redirect to="/onboarding" />;
  }

  // Mock player stats for the table (will come from API)
  const playerStats = [
    { year: "2023", passYds: "3,528", tds: "28", ints: "7", rating: "98.5" },
    { year: "2022", passYds: "2,986", tds: "23", ints: "9", rating: "92.7" },
    { year: "2021", passYds: "2,386", tds: "19", ints: "12", rating: "85.3" },
  ];

  // Mock target colleges data (will come from API)
  const targetColleges = [
    { year: "2023", fortyYd: "4.7s", bench: "18 reps", broadJump: "9ft 5in", shuttle: "4.3s", threeCone: "7.1s", height: "6ft 2in", weight: "195 lbs" },
    { year: "2022", fortyYd: "4.8s", bench: "16 reps", broadJump: "9ft 2in", shuttle: "4.4s", threeCone: "7.2s", height: "6ft 2in", weight: "190 lbs" },
    { year: "2021", fortyYd: "4.9s", bench: "15 reps", broadJump: "8ft 11in", shuttle: "4.5s", threeCone: "7.4s", height: "6ft 1in", weight: "185 lbs" },
  ];

  // Define reminder items for the hero header
  const reminderItems = [
    { 
      time: "4:00 PM", 
      title: "Team Practice",
      icon: <Clock className="h-4 w-4 text-primary" />
    },
    { 
      time: "6:00 PM", 
      title: "Film Review", 
      icon: <Clock className="h-4 w-4 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen pb-16 relative bg-gradient-to-b from-blue-50/50 to-white">
      <Header />
      
      {/* Full-width Hero Header with Stadium Background */}
      <HeroHeader reminderItems={reminderItems} />
      
      <main className="container mx-auto px-4 pb-20">
        
        {/* Performance Metrics Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {/* Metrics cards with circular progress */}
            <MetricCard 
              title="40-Yard Dash" 
              value="4.8s" 
              progress={75} 
              target="Target: 4.6s"
              comparison="▲ 0.1s from last"
              comparison2="Avg: 4.8s"
            />
            
            <MetricCard 
              title="Bench Press" 
              value="18" 
              progress={60} 
              target="Target: 22 reps"
              comparison="▲ 2 from last"
              comparison2="Avg: 18 reps"
            />
            
            <MetricCard 
              title="Broad Jump" 
              value="9ft 5in" 
              progress={80} 
              target="Target: 9ft 8in"
              comparison="▲ 3in from last"
              comparison2="Avg: 9ft 2in"
            />
            
            <MetricCard 
              title="Shuttle" 
              value="4.2s" 
              progress={85} 
              target="Target: 4.1s"
              comparison="▼ 0.1s from last"
              comparison2="Avg: 4.3s"
            />
            
            <MetricCard 
              title="3-10-3" 
              value="7.1s" 
              progress={70} 
              target="Target: 6.9s"
              comparison="▼ 0.1s from last"
              comparison2="Avg: 7.2s"
            />
            
            <MetricCard 
              title="Height" 
              value="6ft 2in" 
              progress={100} 
              target="Growing"
              comparison=""
              comparison2=""
            />
          </div>
        </section>
        
        {/* Player Stats Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Player Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Pass Yds</TableHead>
                    <TableHead>TDs</TableHead>
                    <TableHead>INTs</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerStats.map((stat, index) => (
                    <TableRow key={`player-stat-${index}`}>
                      <TableCell>{stat.year}</TableCell>
                      <TableCell>{stat.passYds}</TableCell>
                      <TableCell>{stat.tds}</TableCell>
                      <TableCell>{stat.ints}</TableCell>
                      <TableCell>{stat.rating}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
        
        {/* Target College Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Target College: D1</CardTitle>
              <span className="text-sm text-muted-foreground">Yearly Performance Progress</span>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>40-Yard</TableHead>
                    <TableHead>Bench</TableHead>
                    <TableHead>Broad Jump</TableHead>
                    <TableHead>Shuttle</TableHead>
                    <TableHead>3-10-3</TableHead>
                    <TableHead>Height</TableHead>
                    <TableHead>Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetColleges.map((stat, index) => (
                    <TableRow key={`college-stat-${index}`}>
                      <TableCell>{stat.year}</TableCell>
                      <TableCell>{stat.fortyYd}</TableCell>
                      <TableCell>{stat.bench}</TableCell>
                      <TableCell>{stat.broadJump}</TableCell>
                      <TableCell>{stat.shuttle}</TableCell>
                      <TableCell>{stat.threeCone}</TableCell>
                      <TableCell>{stat.height}</TableCell>
                      <TableCell>{stat.weight}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
        
        {/* Training Calendar */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Player Calendar</h2>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Weekly Schedule</CardTitle>
                <div>
                  <Button size="sm" variant="outline" className="mr-2">Today</Button>
                  <Button size="sm" variant="outline">Weekly</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className={`p-2 rounded ${index === 3 ? 'bg-blue-100' : ''}`}>
                    <div className="text-center mb-1">
                      <p className="text-sm font-medium">{day}</p>
                      <p className="text-xs text-muted-foreground">{index + 15}</p>
                    </div>
                    <div className={`rounded p-1 text-xs mb-1 ${index === 0 ? 'bg-blue-500 text-white' : index === 3 ? 'bg-blue-300' : index === 6 ? 'bg-red-200' : ''}`}>
                      {index === 0 ? 'Weight Room' : 
                       index === 3 ? 'Team Practice' : 
                       index === 6 ? 'Rest' : ''}
                    </div>
                    {index === 2 && (
                      <div className="bg-green-200 rounded p-1 text-xs">
                        Medical Check
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Today's Training Plan */}
        <section className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today's Plan</CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" variant="default">Training</Button>
                <Button size="sm" variant="outline">Nutrition</Button>
                <Button size="sm" variant="outline">Recruiting</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-lg p-2 h-10 w-10 flex items-center justify-center">
                  <span className="font-semibold text-primary text-lg">ST</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Speed Training</h3>
                  <p className="text-sm text-muted-foreground mb-2">Focus on acceleration and footwork</p>
                  <DailyPlans />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Achievements and Login Streak Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <AchievementsSummary />
          <LoginStreak />
        </section>
      </main>
    </div>
  );
}

// Utility component for metrics with circular progress
function MetricCard({ 
  title, 
  value, 
  progress, 
  target, 
  comparison, 
  comparison2 
}: { 
  title: string; 
  value: string; 
  progress: number;
  target: string;
  comparison: string;
  comparison2: string;
}) {
  return (
    <Card className="text-center">
      <CardContent className="p-4">
        <div className="mx-auto w-16 h-16 rounded-full border-[6px] border-gray-100 flex items-center justify-center relative mb-2">
          <div 
            className="absolute inset-0 rounded-full" 
            style={{
              background: `conic-gradient(rgb(59, 130, 246) 0deg, rgb(59, 130, 246) ${progress * 3.6}deg, rgb(243, 244, 246) ${progress * 3.6}deg, rgb(243, 244, 246) 360deg)`,
              clipPath: 'circle(50% at 50% 50%)'
            }}
          />
          <div className="w-[calc(100%-(6px*2))] h-[calc(100%-(6px*2))] rounded-full bg-white flex items-center justify-center z-10">
            <span className="text-sm font-bold">{progress}%</span>
          </div>
        </div>
        
        <h3 className="text-sm font-medium mb-1">{title}</h3>
        <p className="text-lg font-bold text-primary">{value}</p>
        <p className="text-xs text-muted-foreground">{target}</p>
        
        {comparison && (
          <p className="text-xs mt-1">{comparison}</p>
        )}
        
        {comparison2 && (
          <p className="text-xs text-muted-foreground">{comparison2}</p>
        )}
      </CardContent>
    </Card>
  );
}
