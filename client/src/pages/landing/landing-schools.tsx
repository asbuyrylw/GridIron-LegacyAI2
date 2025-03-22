import { LandingLayout } from "@/components/landing/landing-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  GraduationCap,
  Building,
  Users,
  BarChart3,
  Trophy,
  Medal,
  Clock,
  LineChart,
  CheckCircle2,
} from "lucide-react";

export default function LandingSchools() {
  return (
    <LandingLayout activeTab="schools">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Elevate Your Football Program with AI Technology
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                GridIron LegacyAI provides schools with comprehensive tools to develop athletes, enhance recruiting visibility, and build a stronger football program.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="font-medium">
                    Request School Demo
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="font-medium">
                  Contact Sales
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-2xl border border-primary/10 max-w-md">
                <div className="aspect-video bg-card rounded-lg flex items-center justify-center">
                  <Building className="w-16 h-16 text-primary" />
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                    <GraduationCap className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">Enhanced Recruiting</h3>
                      <p className="text-xs text-muted-foreground">Increase college opportunities for your athletes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                    <Users className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">Program-Wide Implementation</h3>
                      <p className="text-xs text-muted-foreground">Tools for coaches, athletes, and administrators</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                    <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">Multi-Year Analytics</h3>
                      <p className="text-xs text-muted-foreground">Track program development across seasons</p>
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
              Complete Solution for School Football Programs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              GridIron LegacyAI provides comprehensive tools designed specifically for high school and college football programs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Program-Wide Implementation</h3>
              <p className="text-muted-foreground">
                Provide access to every coach and athlete in your program with bulk accounts and centralized administration.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Program Development</h3>
              <p className="text-muted-foreground">
                Build a stronger football program with consistent, high-quality training methodologies across all levels and positions.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Medal className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Recruiting Enhancement</h3>
              <p className="text-muted-foreground">
                Increase college opportunities for your athletes with comprehensive recruiting profiles and performance metrics.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Year Tracking</h3>
              <p className="text-muted-foreground">
                Monitor athlete development across multiple seasons to identify program strengths and areas for improvement.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Efficient Resource Allocation</h3>
              <p className="text-muted-foreground">
                Maximize your program's resources with AI-powered training plans that reduce the need for expensive equipment or specialized staff.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <LineChart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Administrative Analytics</h3>
              <p className="text-muted-foreground">
                Gain insights into program performance with comprehensive analytics dashboards for athletic directors and administrators.
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
              Success Stories from School Programs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hear from schools that have transformed their football programs with GridIron LegacyAI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 border relative">
              <div className="absolute -top-4 -left-4 text-4xl text-primary">"</div>
              <p className="mb-6 text-muted-foreground">
                Since implementing GridIron LegacyAI across our program, we've seen a 40% increase in college recruitment interest. The data-driven approach has elevated our entire program.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Westlake High School</h4>
                  <p className="text-sm text-muted-foreground">Richard Martinez, Athletic Director</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-8 border relative">
              <div className="absolute -top-4 -left-4 text-4xl text-primary">"</div>
              <p className="mb-6 text-muted-foreground">
                The consistency in training methodology across our JV and Varsity teams has created a much stronger development pipeline. Players are better prepared as they move up.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Central Valley Academy</h4>
                  <p className="text-sm text-muted-foreground">Sarah Thompson, Principal</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-8 border relative">
              <div className="absolute -top-4 -left-4 text-4xl text-primary">"</div>
              <p className="mb-6 text-muted-foreground">
                The cost-effectiveness of this platform has allowed us to provide elite-level training to all of our athletes, regardless of our limited budget as a small school.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Oakridge High School</h4>
                  <p className="text-sm text-muted-foreground">Michael Jackson, Football Program Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Implementation Process */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              School Implementation Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We make it easy to roll out GridIron LegacyAI across your entire football program.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative">
              <div className="bg-card rounded-lg p-8 border">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Initial Consultation</h3>
                <p className="text-muted-foreground">
                  Our team meets with your athletic directors and coaching staff to understand your program's specific needs and goals.
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
                <h3 className="text-xl font-bold mb-3">Customized Setup</h3>
                <p className="text-muted-foreground">
                  We configure the platform for your school, set up administrative accounts, and customize features to match your program structure.
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                <div className="w-8 h-8 text-muted-foreground">→</div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-card rounded-lg p-8 border">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background font-bold mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Staff Training</h3>
                <p className="text-muted-foreground">
                  We provide comprehensive training for coaches and staff on how to use the platform effectively to develop athletes.
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                <div className="w-8 h-8 text-muted-foreground">→</div>
              </div>
            </div>
            
            <div>
              <div className="bg-card rounded-lg p-8 border">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background font-bold mb-6">
                  4
                </div>
                <h3 className="text-xl font-bold mb-3">Ongoing Support</h3>
                <p className="text-muted-foreground">
                  Our dedicated school support team provides continuous assistance, regular check-ins, and program optimization guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ROI Section */}
      <section className="py-20">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Return on Investment for Schools
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              GridIron LegacyAI delivers exceptional value for school athletic programs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Increased College Placements</h3>
                  <p className="text-muted-foreground">
                    Schools using our platform report a 30-50% increase in athletes receiving college scholarship opportunities.
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
                  <h3 className="text-lg font-bold mb-2">Cost-Effective Training</h3>
                  <p className="text-muted-foreground">
                    Reduce costs associated with specialized coaching staff while providing elite-level training through our AI platform.
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
                  <h3 className="text-lg font-bold mb-2">Program Reputation</h3>
                  <p className="text-muted-foreground">
                    Enhance your school's football program reputation with state-of-the-art training technology and improved athlete outcomes.
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
                  <h3 className="text-lg font-bold mb-2">Athletic Achievement</h3>
                  <p className="text-muted-foreground">
                    Schools using our platform report improved on-field performance and athletic achievements through consistent development.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              School Program Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We offer flexible pricing options designed to accommodate schools of all sizes and budget requirements.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card rounded-lg p-8 border">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">Small Program</h3>
                <p className="text-muted-foreground mb-4">Up to 50 Athletes</p>
                <div className="text-4xl font-bold">$1,999<span className="text-base font-normal text-muted-foreground">/year</span></div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Full access for all athletes and coaches</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>AI training plan generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Basic analytics dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Email support</span>
                </li>
              </ul>
              <Button className="w-full">Contact Sales</Button>
            </div>
            
            <div className="bg-card rounded-lg p-8 border border-primary relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">Medium Program</h3>
                <p className="text-muted-foreground mb-4">Up to 100 Athletes</p>
                <div className="text-4xl font-bold">$3,499<span className="text-base font-normal text-muted-foreground">/year</span></div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Everything in Small Program</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Advanced analytics dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Staff training session</span>
                </li>
              </ul>
              <Button className="w-full">Contact Sales</Button>
            </div>
            
            <div className="bg-card rounded-lg p-8 border">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">Large Program</h3>
                <p className="text-muted-foreground mb-4">Unlimited Athletes</p>
                <div className="text-4xl font-bold">$5,999<span className="text-base font-normal text-muted-foreground">/year</span></div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Everything in Medium Program</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Executive dashboard for administration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Customized implementation</span>
                </li>
              </ul>
              <Button className="w-full">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/5 border-y border-primary/20">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-6">
              Transform Your Football Program Today
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join schools across the country that are using GridIron LegacyAI to develop better athletes and build stronger football programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="font-medium">
                Request a School Demo
              </Button>
              <Button size="lg" variant="outline" className="font-medium">
                Download School Brochure
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}