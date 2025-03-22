import { LandingLayout } from "@/components/landing/landing-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Trophy,
  Users,
  ClipboardList,
  Binoculars,
  HeartPulse,
  BrainCircuit,
  CheckCircle2,
  TrendingUp
} from "lucide-react";

export default function LandingCoaches() {
  return (
    <LandingLayout activeTab="coaches">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Elevate Your Team with <span className="text-primary">Data-Driven</span> Coaching
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Enhance team performance, track individual player development, and optimize your coaching strategy with advanced analytics and AI assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="font-medium">
                    Get Started Free
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="font-medium">
                  Book a Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-lg bg-gradient-to-tr from-primary/20 to-primary/40 overflow-hidden shadow-xl flex items-center justify-center">
                <Trophy className="w-24 h-24 text-primary/80" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-background rounded-lg shadow-lg p-4 w-48">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Team Progress</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speed</span>
                  <span className="text-green-500">+12%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Strength</span>
                  <span className="text-green-500">+8%</span>
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
              Coaching Tools That Make a Difference
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform provides comprehensive tools designed specifically for football coaches to enhance player development and team performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Team-Wide Analytics</h3>
              <p className="text-muted-foreground">
                Access comprehensive data on your entire roster with customizable views to identify team strengths and weaknesses.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Training Plan Management</h3>
              <p className="text-muted-foreground">
                Create, assign, and monitor position-specific training plans to maximize each player's development.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BrainCircuit className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">AI Coaching Assistance</h3>
              <p className="text-muted-foreground">
                Get AI-powered suggestions for player development, drill recommendations, and position-specific training advice.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <HeartPulse className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Load Management</h3>
              <p className="text-muted-foreground">
                Monitor player workloads to optimize performance and minimize injury risk with intelligent tracking systems.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Progress Visualization</h3>
              <p className="text-muted-foreground">
                Track player development over time with intuitive charts and reports showing quantifiable improvement.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Binoculars className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Talent Identification</h3>
              <p className="text-muted-foreground">
                Objectively evaluate player potential with standardized metrics and development trajectories to identify emerging talent.
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
              How GridIron LegacyAI Solves Coaching Challenges
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We understand the real problems coaches face and have built solutions to address your most pressing needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Benefit 1 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Limited Staff Resources</h3>
                <p className="text-muted-foreground">
                  Extend your coaching capacity with AI assistance that provides personalized feedback to each player when you can't be everywhere at once.
                </p>
              </div>
            </div>
            
            {/* Benefit 2 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Objective Player Evaluation</h3>
                <p className="text-muted-foreground">
                  Make roster decisions based on concrete data rather than subjective impressions, helping ensure fairness and maximizing team potential.
                </p>
              </div>
            </div>
            
            {/* Benefit 3 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Off-Season Development</h3>
                <p className="text-muted-foreground">
                  Maintain player progress year-round with structured programs players can follow even when they're not under direct supervision.
                </p>
              </div>
            </div>
            
            {/* Benefit 4 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Injury Prevention</h3>
                <p className="text-muted-foreground">
                  Reduce team injuries by identifying imbalances, monitoring workload, and implementing science-backed training protocols.
                </p>
              </div>
            </div>
            
            {/* Benefit 5 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Time Management</h3>
                <p className="text-muted-foreground">
                  Streamline administrative tasks and training planning so you can focus more time on direct coaching and strategy development.
                </p>
              </div>
            </div>
            
            {/* Benefit 6 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Player Accountability</h3>
                <p className="text-muted-foreground">
                  Encourage greater player responsibility with transparent tracking of workout completion and progress toward goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quote Section */}
      <section className="py-20">
        <div className="container px-4 sm:px-6">
          <div className="bg-card rounded-lg p-8 md:p-12 border">
            <div className="max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl italic mb-6">
                "GridIron LegacyAI has revolutionized how I approach player development. The data insights help me make better coaching decisions, and the AI assistance ensures every player gets personalized feedback even with limited staff. My team's performance metrics have improved across the board."
              </p>
              <div>
                <p className="font-medium">Coach James Wilson</p>
                <p className="text-muted-foreground">Head Football Coach, Jefferson High School</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to Transform Your Coaching?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join forward-thinking coaches who are leveraging technology to develop winning programs with GridIron LegacyAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="font-medium">
                  Start Free Team Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="font-medium">
                Request Team Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}