import { LandingLayout } from "@/components/landing/landing-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Football, 
  TrendingUp, 
  BrainCircuit, 
  Medal, 
  UserCircle, 
  Target, 
  MessageCircle,
  CheckCircle2
} from "lucide-react";

export default function LandingPlayers() {
  return (
    <LandingLayout activeTab="players">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Elevate Your Game with <span className="text-primary">AI-Powered</span> Training
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Take your football skills to the next level with personalized training plans, AI coaching feedback, and comprehensive performance tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="font-medium">
                    Get Started Free
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="font-medium">
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-lg bg-gradient-to-tr from-primary/20 to-primary/40 overflow-hidden shadow-xl flex items-center justify-center">
                <Football className="w-24 h-24 text-primary/80" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-background rounded-lg shadow-lg p-4 w-48">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-medium">40yd Dash</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last</span>
                  <span>4.85s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current</span>
                  <span className="text-green-500 font-medium">4.72s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Features Built For Athletes
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform helps you train smarter, track progress effectively, and showcase your talents to recruiters.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BrainCircuit className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">AI Coaching Assistant</h3>
              <p className="text-muted-foreground">
                Get personalized coaching advice, form technique analysis, and real-time feedback for your position on the field.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Personalized Training Plans</h3>
              <p className="text-muted-foreground">
                Follow custom workout routines that adapt to your position, goals, and current skill level to maximize improvement.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Combine Metrics Tracking</h3>
              <p className="text-muted-foreground">
                Track and visualize your progress in key metrics like 40-yard dash, vertical jump, and other combine measurements.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Recruiting Profile</h3>
              <p className="text-muted-foreground">
                Showcase your stats, highlights, and achievements to college recruiters in a professional digital profile.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Medal className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Goal Setting & Achievements</h3>
              <p className="text-muted-foreground">
                Set realistic targets for your development, track milestones, and celebrate achievements as you improve.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Community Support</h3>
              <p className="text-muted-foreground">
                Connect with fellow athletes, share progress, and motivate each other to reach your potential.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              How GridIron LegacyAI Benefits Players
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform addresses the real challenges faced by football players looking to improve their game and get noticed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Benefit 1 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Overcome Limited Coaching Access</h3>
                <p className="text-muted-foreground">
                  Get 24/7 access to AI coaching advice when you don't have direct access to position-specific coaching expertise.
                </p>
              </div>
            </div>
            
            {/* Benefit 2 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Structured Training Approach</h3>
                <p className="text-muted-foreground">
                  Replace random workouts with science-backed, progressive training plans that target your specific needs and goals.
                </p>
              </div>
            </div>
            
            {/* Benefit 3 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Objective Progress Tracking</h3>
                <p className="text-muted-foreground">
                  See real, measurable improvement with data-driven metrics rather than subjective feelings about your development.
                </p>
              </div>
            </div>
            
            {/* Benefit 4 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Increased Recruiting Visibility</h3>
                <p className="text-muted-foreground">
                  Stand out to college programs with a professional digital profile showcasing your verified performance metrics.
                </p>
              </div>
            </div>
            
            {/* Benefit 5 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Injury Prevention Focus</h3>
                <p className="text-muted-foreground">
                  Follow balanced training plans that incorporate proper recovery and technique to reduce injury risk.
                </p>
              </div>
            </div>
            
            {/* Benefit 6 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Position-Specific Development</h3>
                <p className="text-muted-foreground">
                  Focus on the skills that matter most for your specific position instead of generic football training.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 sm:px-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to Elevate Your Game?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join thousands of players who are taking their football skills to the next level with GridIron LegacyAI.
            </p>
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