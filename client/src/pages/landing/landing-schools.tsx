import { LandingLayout } from "@/components/landing/landing-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  School,
  Award,
  Users,
  TrendingUp,
  BarChart4,
  Building,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";

export default function LandingSchools() {
  return (
    <LandingLayout activeTab="schools">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Elevate Your Athletic Program with <span className="text-primary">Data-Driven</span> Excellence
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Enhance your football program's performance, improve athlete development, and showcase your school's commitment to athletic innovation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="font-medium">
                    Schedule Consultation
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="font-medium">
                  View School Packages
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-lg bg-gradient-to-tr from-primary/20 to-primary/40 overflow-hidden shadow-xl flex items-center justify-center">
                <School className="w-24 h-24 text-primary/80" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-background rounded-lg shadow-lg p-4 w-48">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Program Results</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recruits</span>
                  <span className="text-green-500">+35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scholarships</span>
                  <span className="text-green-500">+42%</span>
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
              Comprehensive School Athletic Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform offers a complete solution for school athletic departments looking to enhance their football program's performance and reputation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Program-Wide Implementation</h3>
              <p className="text-muted-foreground">
                Deploy across your entire football program with custom roles for coaches, athletes, and administrators for seamless coordination.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Performance Analytics</h3>
              <p className="text-muted-foreground">
                Access comprehensive program metrics and benchmarks to track development across teams and identify areas for improvement.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Recruiting Enhancement</h3>
              <p className="text-muted-foreground">
                Showcase your athletes to college programs with professional digital profiles and verified performance metrics.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">School Branding Integration</h3>
              <p className="text-muted-foreground">
                Customize the platform with your school colors, logo, and mascot to reinforce your athletic program's identity.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Administrative Dashboard</h3>
              <p className="text-muted-foreground">
                Provide athletic directors with oversight and comprehensive reporting on program performance and athlete development.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BarChart4 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Multi-Year Tracking</h3>
              <p className="text-muted-foreground">
                Monitor athlete development throughout their high school career with long-term data analysis and progression tracking.
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
              How GridIron LegacyAI Benefits Schools
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform addresses the unique challenges faced by school athletic departments and football programs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Benefit 1 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Limited Budget Maximization</h3>
                <p className="text-muted-foreground">
                  Get more value from your athletic budget with a comprehensive solution that costs less than multiple point solutions or additional coaching staff.
                </p>
              </div>
            </div>
            
            {/* Benefit 2 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">College Placement Success</h3>
                <p className="text-muted-foreground">
                  Increase the number of athletes receiving college opportunities by providing verified metrics and professional profiles to recruiters.
                </p>
              </div>
            </div>
            
            {/* Benefit 3 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Coaching Staff Enhancement</h3>
                <p className="text-muted-foreground">
                  Amplify your existing coaching staff's capabilities with AI assistance that provides individualized attention to each athlete.
                </p>
              </div>
            </div>
            
            {/* Benefit 4 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Injury Reduction</h3>
                <p className="text-muted-foreground">
                  Protect your athletes with science-backed training methods and workload monitoring that minimizes injury risks and keeps more players on the field.
                </p>
              </div>
            </div>
            
            {/* Benefit 5 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Program Reputation Enhancement</h3>
                <p className="text-muted-foreground">
                  Build your school's reputation as a forward-thinking athletic program that invests in cutting-edge development tools for student-athletes.
                </p>
              </div>
            </div>
            
            {/* Benefit 6 */}
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Standardized Development</h3>
                <p className="text-muted-foreground">
                  Implement consistent training methodologies across all levels of your program from freshman to varsity for better long-term athlete development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Case Study Section */}
      <section className="py-20">
        <div className="container px-4 sm:px-6">
          <div className="bg-card rounded-lg overflow-hidden shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-primary/10 p-8 md:p-12 flex items-center justify-center">
                <School className="w-32 h-32 text-primary/80" />
              </div>
              <div className="p-8 md:p-12">
                <h3 className="text-2xl font-bold mb-4">Case Study: Wilson High School</h3>
                <p className="text-muted-foreground mb-6">
                  After implementing GridIron LegacyAI across their football program, Wilson High School saw remarkable improvements in just one season:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>42% increase in college scholarship offers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>35% reduction in non-contact injuries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Improved team performance with 3 more wins than previous season</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Significant improvement in athlete retention from freshman to senior year</span>
                  </li>
                </ul>
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
              Transform Your Football Program
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join forward-thinking schools that are leveraging technology to build championship programs and develop college-ready athletes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="font-medium">
                  Request School Demo
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="font-medium">
                Download Program Guide
                </Button>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}