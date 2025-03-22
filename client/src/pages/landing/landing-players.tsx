import { LandingLayout } from "@/components/landing/landing-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Dumbbell, 
  TrendingUp, 
  Target, 
  Brain, 
  Medal, 
  User,
  LineChart,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";

export default function LandingPlayers() {
  return (
    <LandingLayout activeTab="players">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Elevate Your Football Skills with AI-Powered Training
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                GridIron LegacyAI provides personalized training plans, AI coaching, and performance tracking to help you reach your full potential and get noticed by college recruiters.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="font-medium">
                    Start Training Now
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
                  <Dumbbell className="w-16 h-16 text-primary" />
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                    <Brain className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">AI Coach Analysis</h3>
                      <p className="text-xs text-muted-foreground">Get personalized feedback on your technique and performance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                    <LineChart className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">Performance Tracking</h3>
                      <p className="text-xs text-muted-foreground">Monitor your progress and see improvements over time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                    <CalendarClock className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">Daily Training Plans</h3>
                      <p className="text-xs text-muted-foreground">Follow structured workouts designed for your position</p>
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
              Features Designed for Athletes
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform gives you all the tools you need to improve your football skills, track your progress, and boost your recruiting potential.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Position Coach</h3>
              <p className="text-muted-foreground">
                Get personalized coaching advice tailored to your specific position from our AI coach that understands the nuances of football.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Personalized Training</h3>
              <p className="text-muted-foreground">
                Follow custom training plans that adapt to your goals, position requirements, and current performance metrics.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Combine Metrics</h3>
              <p className="text-muted-foreground">
                Track and improve your 40-yard dash, vertical jump, broad jump, 3-cone drill, and other key performance metrics.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Recruiting Profile</h3>
              <p className="text-muted-foreground">
                Create a comprehensive recruiting profile with your stats, metrics, highlights, and academic information for college scouts.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Medal className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Goal Setting</h3>
              <p className="text-muted-foreground">
                Set measurable goals, track your progress, and celebrate achievements as you improve your football skills.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Position-Specific Drills</h3>
              <p className="text-muted-foreground">
                Access a library of drills and exercises designed specifically for your position and skill level.
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
              What Athletes Are Saying
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hear from players who have transformed their performance with GridIron LegacyAI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 border relative">
              <div className="absolute -top-4 -left-4 text-4xl text-primary">"</div>
              <p className="mb-6 text-muted-foreground">
                My 40-yard dash time improved by 0.3 seconds after following the speed training plan for just two months. Coaches are noticing the difference on the field.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Jason M.</h4>
                  <p className="text-sm text-muted-foreground">Wide Receiver, Class of 2024</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-8 border relative">
              <div className="absolute -top-4 -left-4 text-4xl text-primary">"</div>
              <p className="mb-6 text-muted-foreground">
                The AI coach helped me fix flaws in my throwing mechanics that I didn't even know I had. My accuracy and distance have both improved significantly.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Tyler R.</h4>
                  <p className="text-sm text-muted-foreground">Quarterback, Class of 2023</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-8 border relative">
              <div className="absolute -top-4 -left-4 text-4xl text-primary">"</div>
              <p className="mb-6 text-muted-foreground">
                I've received more college interest since creating my recruiting profile. The performance tracking makes it easy to show coaches my improvements.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Marcus J.</h4>
                  <p className="text-sm text-muted-foreground">Linebacker, Class of 2023</p>
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
              How GridIron LegacyAI Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Getting started is simple - follow these steps to begin your journey to football excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-card rounded-lg p-8 border">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Create Your Profile</h3>
                <p className="text-muted-foreground">
                  Sign up and enter your details including position, experience level, height, weight, and specific goals.
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
                <h3 className="text-xl font-bold mb-3">Get Your Training Plan</h3>
                <p className="text-muted-foreground">
                  Receive a position-specific training plan generated by our AI that's tailored to your specific needs and goals.
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
                <h3 className="text-xl font-bold mb-3">Train and Track Progress</h3>
                <p className="text-muted-foreground">
                  Follow your daily workouts, log your metrics, and get AI coaching feedback to continuously improve your performance.
                </p>
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
              Ready to Take Your Game to the Next Level?
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              Join thousands of athletes who are using GridIron LegacyAI to improve their skills, track their progress, and increase their chances of playing at the next level.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Unlimited access to all features</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="font-medium">
                  Start Your Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="font-medium">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}