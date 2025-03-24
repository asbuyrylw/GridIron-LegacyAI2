import { LandingLayout } from "@/components/landing/landing-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FootballIcon } from "@/components/ui/football-icon";
import { 
  Dumbbell, 
  TrendingUp, 
  Brain as BrainCircuit, 
  Award as Trophy, 
  Users, 
  GraduationCap as School,
  Target, 
  ArrowRight,
  FileText,
  DollarSign,
  Clipboard as ClipboardList,
  Award,
  BarChart3 as BarChart4
} from "lucide-react";

export default function LandingIndex() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Your Football Legacy Starts with <span className="text-primary">AI-Powered</span> Training
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              GridIron LegacyAI combines cutting-edge AI technology with sports science to help football players at all levels achieve their maximum potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              AI-Powered Football Training & Recruiting
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform serves the entire football ecosystem with specialized tools for athletes, parents, coaches, and schools.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Athletes Section */}
            <div className="bg-card rounded-lg p-8 border group hover:border-primary transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-primary" />
                </div>
                <Link href="/landing/players">
                  <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
              <h3 className="text-2xl font-bold mb-3">For Athletes</h3>
              <p className="text-muted-foreground mb-6">
                Personalized training plans, AI coaching feedback, performance tracking, and recruiting profile management - everything you need to take your game to the next level.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <BrainCircuit className="w-5 h-5 text-primary mt-0.5" />
                  <span>AI position-specific coaching</span>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-primary mt-0.5" />
                  <span>Personalized training plans</span>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                  <span>Combine metrics tracking</span>
                </div>
              </div>
            </div>
            
            {/* Parents Section */}
            <div className="bg-card rounded-lg p-8 border group hover:border-primary transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <Link href="/landing/parents">
                  <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
              <h3 className="text-2xl font-bold mb-3">For Parents</h3>
              <p className="text-muted-foreground mb-6">
                Stay informed about your athlete's progress, ensure their training is safe and effective, and gain insights into the college recruiting process.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                  <span>Transparent progress tracking</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-primary mt-0.5" />
                  <span>College recruiting guidance</span>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                  <span>Cost-effective training solution</span>
                </div>
              </div>
            </div>
            
            {/* Coaches Section */}
            <div className="bg-card rounded-lg p-8 border group hover:border-primary transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <Link href="/landing/coaches">
                  <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
              <h3 className="text-2xl font-bold mb-3">For Coaches</h3>
              <p className="text-muted-foreground mb-6">
                Enhance your coaching with data-driven insights, manage team and individual progress, and optimize player development with AI assistance.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <span>Team-wide analytics</span>
                </div>
                <div className="flex items-start gap-2">
                  <ClipboardList className="w-5 h-5 text-primary mt-0.5" />
                  <span>Training plan management</span>
                </div>
                <div className="flex items-start gap-2">
                  <BrainCircuit className="w-5 h-5 text-primary mt-0.5" />
                  <span>AI coaching assistance</span>
                </div>
              </div>
            </div>
            
            {/* Schools Section */}
            <div className="bg-card rounded-lg p-8 border group hover:border-primary transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <School className="w-6 h-6 text-primary" />
                </div>
                <Link href="/landing/schools">
                  <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
              <h3 className="text-2xl font-bold mb-3">For Schools</h3>
              <p className="text-muted-foreground mb-6">
                Elevate your entire football program with comprehensive tools for athlete development, performance tracking, and college recruitment enhancement.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <span>Program-wide implementation</span>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-primary mt-0.5" />
                  <span>Recruiting enhancement</span>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart4 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Multi-year tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/5 border-y border-primary/20">
        <div className="container px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to Elevate Your Football Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of athletes, parents, coaches, and schools who are transforming football development with GridIron LegacyAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="font-medium">
                  Start Your Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="font-medium">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}