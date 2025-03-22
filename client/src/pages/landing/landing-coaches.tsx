import { LandingLayout } from "@/components/landing/landing-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Award,
  Brain,
  Users,
  LineChart,
  Clock,
  ClipboardCheck,
  BarChart3,
  CheckCircle2,
  Presentation,
} from "lucide-react";

export default function LandingCoaches() {
  return (
    <LandingLayout activeTab="coaches">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Enhance Your Coaching with AI-Powered Insights
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                GridIron LegacyAI provides coaches with comprehensive player analytics, personalized training plan management, and AI assistance to elevate your team's performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="font-medium">
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="font-medium">
                  View Demo
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-2xl border border-primary/10 max-w-md">
                <div className="aspect-video bg-card rounded-lg flex items-center justify-center">
                  <Award className="w-16 h-16 text-primary" />
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                    <Users className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">Team-Wide Insights</h3>
                      <p className="text-xs text-muted-foreground">Track progress across your entire roster</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                    <Brain className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">AI Coaching Assistant</h3>
                      <p className="text-xs text-muted-foreground">Get position-specific training recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                    <LineChart className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">Performance Analytics</h3>
                      <p className="text-xs text-muted-foreground">Data-driven insights to optimize training</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Features Designed for Football Coaches
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform gives you powerful tools to develop your players, manage your team, and track progress throughout the season.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Team Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                View comprehensive metrics for your entire team, identify strengths, weaknesses, and track improvements over time.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <ClipboardCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Training Plan Management</h3>
              <p className="text-muted-foreground">
                Create, assign, and monitor individualized training plans for each player based on position, skill level, and development needs.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Coaching Assistant</h3>
              <p className="text-muted-foreground">
                Get AI-powered recommendations for drills, exercises, and training progressions tailored to your team's needs.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Combine Metrics Tracking</h3>
              <p className="text-muted-foreground">
                Track key performance indicators like 40-yard dash, vertical jump, and position-specific skills to measure athletic development.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Time-Efficient Coaching</h3>
              <p className="text-muted-foreground">
                Maximize practice time with automated progress tracking, pre-built training templates, and data-driven coaching insights.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Presentation className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">College Recruitment Support</h3>
              <p className="text-muted-foreground">
                Help your players showcase their abilities with recruiting profiles that highlight their metrics, skills, and achievements.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              What Coaches Are Saying
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hear from coaches who have transformed their programs with GridIron LegacyAI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 border relative">
              <div className="absolute -top-4 -left-4 text-4xl text-primary">"</div>
              <p className="mb-6 text-muted-foreground">
                The analytics dashboard has revolutionized how I evaluate player development. I can now make data-driven decisions about our training focus and see measurable improvements.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Coach Williams</h4>
                  <p className="text-sm text-muted-foreground">Offensive Coordinator, Hamilton High</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-8 border relative">
              <div className="absolute -top-4 -left-4 text-4xl text-primary">"</div>
              <p className="mb-6 text-muted-foreground">
                The AI coaching assistant provides drill recommendations I wouldn't have thought of. The position-specific training plans have accelerated the development of our younger players.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Coach Rodriguez</h4>
                  <p className="text-sm text-muted-foreground">Head Coach, Westfield Academy</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-8 border relative">
              <div className="absolute -top-4 -left-4 text-4xl text-primary">"</div>
              <p className="mb-6 text-muted-foreground">
                The recruiting profile feature has helped six of my players secure college scholarships this year. It lets us showcase their progress and abilities in a way that gets noticed.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Coach Thompson</h4>
                  <p className="text-sm text-muted-foreground">Head Coach, Lincoln High</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              How GridIron LegacyAI Works for Coaches
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform seamlessly integrates into your coaching workflow, providing value at every step.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-card rounded-lg p-8 border">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Set Up Your Team</h3>
                <p className="text-muted-foreground">
                  Create your team profile, add players, and input baseline metrics. Our system will generate initial training recommendations.
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                <div className="w-8 h-8 text-muted-foreground">→</div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-card rounded-lg p-8 border">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Implement Training Plans</h3>
                <p className="text-muted-foreground">
                  Use our AI-generated training plans or customize your own. Assign specific plans to players based on position and goals.
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                <div className="w-8 h-8 text-muted-foreground">→</div>
              </div>
            </div>
            
            <div>
              <div className="bg-card rounded-lg p-8 border">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background font-bold mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Track Results and Adjust</h3>
                <p className="text-muted-foreground">
                  Monitor progress through the analytics dashboard, receive AI insights, and refine training plans for continuous improvement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits */}
      <section className="py-20">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Benefits for Football Coaches
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              GridIron LegacyAI transforms your coaching approach with powerful tools and insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Data-Driven Coaching</h3>
                  <p className="text-muted-foreground">
                    Make better decisions with comprehensive performance analytics that highlight patterns and areas for improvement.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Increased Efficiency</h3>
                  <p className="text-muted-foreground">
                    Save time with automated planning, tracking, and reporting so you can focus on direct player interaction.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Improved Player Development</h3>
                  <p className="text-muted-foreground">
                    Accelerate player growth with personalized training plans that adapt based on individual progress and needs.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Better College Opportunities</h3>
                  <p className="text-muted-foreground">
                    Increase the visibility of your players to college programs with detailed performance profiles and metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/5 border-y border-primary/20">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-6">
              Elevate Your Coaching Today
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join coaches across the country who are using GridIron LegacyAI to transform their programs and develop better football players.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="font-medium">
                  Start Your Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="font-medium">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}