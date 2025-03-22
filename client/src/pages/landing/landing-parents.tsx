import { LandingLayout } from "@/components/landing/landing-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Users,
  TrendingUp,
  FileText,
  DollarSign,
  Shield,
  GraduationCap,
  Clock,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

export default function LandingParents() {
  return (
    <LandingLayout activeTab="parents">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Support Your Athlete's Dreams with Smart Training
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                GridIron LegacyAI helps parents stay informed about their athlete's development, provides safe and effective training guidance, and helps navigate the recruiting process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="font-medium">
                    Get Started
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="font-medium">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-2xl border border-primary/10 max-w-md">
                <div className="aspect-video bg-card rounded-lg flex items-center justify-center">
                  <Users className="w-16 h-16 text-primary" />
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                    <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">Performance Tracking</h3>
                      <p className="text-xs text-muted-foreground">Monitor progress and celebrate improvements</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">Safe Training Guidance</h3>
                      <p className="text-xs text-muted-foreground">Science-backed training plans appropriate for young athletes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                    <GraduationCap className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">College Recruiting Support</h3>
                      <p className="text-xs text-muted-foreground">Navigate the complex world of athletic scholarships</p>
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
              How GridIron LegacyAI Helps Parents
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We provide the tools and insights parents need to support their athlete's football journey from high school to college.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Progress Transparency</h3>
              <p className="text-muted-foreground">
                Access detailed dashboards showing your athlete's performance metrics, achievements, and areas for improvement.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Injury Prevention</h3>
              <p className="text-muted-foreground">
                Training plans designed with proper progression, recovery periods, and form guidance to minimize injury risk.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Recruiting Guidance</h3>
              <p className="text-muted-foreground">
                Learn about the recruiting process, scholarship opportunities, and how to effectively showcase your athlete's abilities.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cost-Effective Training</h3>
              <p className="text-muted-foreground">
                Save money on expensive private coaching while still providing professional-level training through our AI-powered platform.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Time Management</h3>
              <p className="text-muted-foreground">
                Help your athlete balance academics, training, and personal time with structured, efficient workout schedules.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Performance Analytics</h3>
              <p className="text-muted-foreground">
                View detailed reports comparing your athlete's metrics to position benchmarks and college recruitment standards.
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
              What Parents Are Saying
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hear from parents who have supported their athletes with GridIron LegacyAI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 border relative">
              <div className="absolute -top-4 -left-4 text-4xl text-primary">"</div>
              <p className="mb-6 text-muted-foreground">
                The structured training plans have given my son consistency and direction. His confidence has improved along with his skills, and I've seen real growth in his leadership on the field.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Karen W.</h4>
                  <p className="text-sm text-muted-foreground">Parent of Defensive End</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-8 border relative">
              <div className="absolute -top-4 -left-4 text-4xl text-primary">"</div>
              <p className="mb-6 text-muted-foreground">
                The recruiting guidance helped us understand what college coaches are looking for. My daughter now has interest from several Division II schools that we weren't even aware of before.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Michael T.</h4>
                  <p className="text-sm text-muted-foreground">Parent of Kicker</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-8 border relative">
              <div className="absolute -top-4 -left-4 text-4xl text-primary">"</div>
              <p className="mb-6 text-muted-foreground">
                We've saved thousands on private coaching. The AI feedback is surprisingly effective, and my son is getting the personalized attention he needs without the hefty price tag.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Jennifer L.</h4>
                  <p className="text-sm text-muted-foreground">Parent of Quarterback</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Common Concerns */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Common Parent Concerns
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We understand the challenges parents face when supporting their football athletes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Injury Risk</h3>
                  <p className="text-muted-foreground">
                    Our training plans emphasize proper form, appropriate progression, and adequate recovery to minimize injury risk while maximizing performance gains.
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
                  <h3 className="text-lg font-bold mb-2">Academic Balance</h3>
                  <p className="text-muted-foreground">
                    Our platform helps athletes manage their time efficiently, ensuring they can balance athletic development with academic success.
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
                  <h3 className="text-lg font-bold mb-2">College Opportunities</h3>
                  <p className="text-muted-foreground">
                    We provide tools to create standout recruiting profiles and insights into the college recruitment process to maximize scholarship opportunities.
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
                  <h3 className="text-lg font-bold mb-2">Training Costs</h3>
                  <p className="text-muted-foreground">
                    Our subscription model provides professional-level training at a fraction of the cost of private coaching, camps, and specialized training programs.
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
              Support Your Athlete's Football Journey
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of parents who are helping their athletes achieve their football dreams with GridIron LegacyAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="font-medium">
                  Sign Up Today
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