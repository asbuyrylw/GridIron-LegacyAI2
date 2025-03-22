import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap as School, 
  Award as Trophy, 
  BarChart3 as ChartLineUp, 
  User as UserCircle,
  Dribbble as Football
} from "lucide-react";
import { ReactNode } from "react";

interface LandingLayoutProps {
  children: ReactNode;
  activeTab?: "players" | "parents" | "coaches" | "schools";
}

export function LandingLayout({ children, activeTab }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 sm:px-6 justify-between">
          <div className="flex items-center gap-2">
            <Football className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl">GridIron LegacyAI</span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/landing/players">
              <a className={`text-sm font-medium transition-colors hover:text-primary ${activeTab === "players" ? "text-primary" : "text-muted-foreground"}`}>
                For Players
              </a>
            </Link>
            <Link href="/landing/parents">
              <a className={`text-sm font-medium transition-colors hover:text-primary ${activeTab === "parents" ? "text-primary" : "text-muted-foreground"}`}>
                For Parents
              </a>
            </Link>
            <Link href="/landing/coaches">
              <a className={`text-sm font-medium transition-colors hover:text-primary ${activeTab === "coaches" ? "text-primary" : "text-muted-foreground"}`}>
                For Coaches
              </a>
            </Link>
            <Link href="/landing/schools">
              <a className={`text-sm font-medium transition-colors hover:text-primary ${activeTab === "schools" ? "text-primary" : "text-muted-foreground"}`}>
                For Schools
              </a>
            </Link>
          </nav>
          
          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Link href="/auth">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/auth">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t fixed bottom-0 left-0 right-0 bg-background z-10">
        <div className="grid grid-cols-4 h-16">
          <Link href="/landing/players">
            <a className={`flex flex-col items-center justify-center h-full ${activeTab === "players" ? "text-primary" : "text-muted-foreground"}`}>
              <Football className="h-5 w-5" />
              <span className="text-xs mt-1">Players</span>
            </a>
          </Link>
          <Link href="/landing/parents">
            <a className={`flex flex-col items-center justify-center h-full ${activeTab === "parents" ? "text-primary" : "text-muted-foreground"}`}>
              <UserCircle className="h-5 w-5" />
              <span className="text-xs mt-1">Parents</span>
            </a>
          </Link>
          <Link href="/landing/coaches">
            <a className={`flex flex-col items-center justify-center h-full ${activeTab === "coaches" ? "text-primary" : "text-muted-foreground"}`}>
              <Trophy className="h-5 w-5" />
              <span className="text-xs mt-1">Coaches</span>
            </a>
          </Link>
          <Link href="/landing/schools">
            <a className={`flex flex-col items-center justify-center h-full ${activeTab === "schools" ? "text-primary" : "text-muted-foreground"}`}>
              <ChartLineUp className="h-5 w-5" />
              <span className="text-xs mt-1">Schools</span>
            </a>
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t py-8 md:py-12">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Football className="w-6 h-6 text-primary" />
                <span className="font-bold">GridIron LegacyAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering football players to achieve their potential with AI-powered coaching and performance tracking.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Case Studies
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} GridIron LegacyAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}