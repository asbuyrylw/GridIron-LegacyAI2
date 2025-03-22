import { LandingLayout } from "@/components/landing/landing-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Shield, 
  LineChart, 
  FileText, 
  TrendingUp,
  CalendarClock,
  DollarSign,
  EyeIcon,
  CheckCircle2
} from "lucide-react";

export default function LandingParents() {
  return (
    <LandingLayout activeTab="parents">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Support Your Athlete's Journey with <span className="text-primary">Confidence</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Stay informed, track progress, and help your young athlete achieve their football dreams with transparent metrics and proven training methods.
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
                <Shield className="w-24 h-24 text-primary/80" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-background rounded-lg shadow-lg p-4 w-48">
                <div className="flex items-center gap-2 mb-2">
                  <LineChart className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Progress Report</span>
                </div>
                <div className="text-muted-foreground text-sm mb-2">
                  Latest achievement:
                </div>
                <div className="font-medium">
                  10% Increase in Speed & Agility
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
              Features for Involved Parents
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform helps you stay involved in your child's athletic development with transparency and actionable insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Transparent Progress Tracking</h3>
              <p className="text-muted-foreground">
                Access detailed reports on your child's athletic development with clear metrics showing improvement over time.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Safety-Focused Training</h3>
              <p className="text-muted-foreground">
                Rest easy knowing training plans are designed with proper form and injury prevention as top priorities.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CalendarClock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Scheduling & Reminders</h3>
              <p className="text-muted-foreground">
                Keep track of training sessions, team practices, and upcoming events in one convenient calendar.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">College Recruiting Tools</h3>
              <p className="text-muted-foreground">
                Access resources to navigate the recruiting process with guidance on creating highlight reels and contacting programs.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Cost-Effective Training</h3>
              <p className="text-muted-foreground">
                Provide professional-level coaching and development at a fraction of the cost of private coaching sessions.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <EyeIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Parent Dashboard Access</h3>
              <p className="text-muted-foreground">
                Get visibility into your athlete's activities with appropriate privacy controls for teenage independence.
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
              How GridIron LegacyAI Helps Parents
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We understand the challenges parents face in supporting their young athletes, and we're here to help.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Benefit 1 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Navigating the Recruiting Landscape</h3>
                <p className="text-muted-foreground">
                  Get clear guidance on the often confusing college recruiting process with timeline checklists and requirements.
                </p>
              </div>
            </div>
            
            {/* Benefit 2 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Reducing Injury Risk</h3>
                <p className="text-muted-foreground">
                  Help your athlete train with proper technique and balanced workouts to minimize the chance of sports injuries.
                </p>
              </div>
            </div>
            
            {/* Benefit 3 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Making Informed Investments</h3>
                <p className="text-muted-foreground">
                  Spend wisely on your child's athletic development with a cost-effective alternative to expensive camps and private coaches.
                </p>
              </div>
            </div>
            
            {/* Benefit 4 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Supporting Self-Motivation</h3>
                <p className="text-muted-foreground">
                  Foster your athlete's intrinsic motivation with goal-setting tools and achievement tracking that builds confidence.
                </p>
              </div>
            </div>
            
            {/* Benefit 5 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Balancing Sports and Academics</h3>
                <p className="text-muted-foreground">
                  Help your student-athlete manage their time with structured training schedules that accommodate academic priorities.
                </p>
              </div>
            </div>
            
            {/* Benefit 6 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Building Life Skills</h3>
                <p className="text-muted-foreground">
                  Watch your athlete develop discipline, goal-setting abilities, and resilience through structured athletic development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="py-20">
        <div className="container px-4 sm:px-6">
          <div className="bg-card rounded-lg p-8 md:p-12 border">
            <div className="max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl italic mb-6">
                "GridIron LegacyAI has transformed how I support my son's football journey. The detailed progress reports help me understand his development, and the AI coaching gives him position-specific training I couldn't provide myself. The cost savings compared to private coaching is incredible."
              </p>
              <div>
                <p className="font-medium">Michael Carter</p>
                <p className="text-muted-foreground">Father of High School Quarterback</p>
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
              Give Your Athlete the Edge They Deserve
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join the community of parents helping their athletes reach their full potential with GridIron LegacyAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="font-medium">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="font-medium">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}