import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap as School, 
  Award as Trophy, 
  BarChart3 as ChartLineUp, 
  User as UserCircle,
  ChevronDown
} from "lucide-react";
import { FootballIcon } from "@/components/ui/football-icon";
import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            <FootballIcon width={32} height={32} />
            <span className="font-bold text-xl">GridIron LegacyAI</span>
          </div>
          
          {/* Navigation - Dropdown */}
          <nav className="hidden md:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none">
                {activeTab ? `For ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` : "Explore"} <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <Link href="/landing/players">
                  <DropdownMenuItem className={`cursor-pointer flex items-center gap-2 ${activeTab === "players" ? "text-primary" : ""}`}>
                    <FootballIcon width={16} height={16} />
                    <span>For Players</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/landing/parents">
                  <DropdownMenuItem className={`cursor-pointer flex items-center gap-2 ${activeTab === "parents" ? "text-primary" : ""}`}>
                    <UserCircle className="h-4 w-4" />
                    <span>For Parents</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/landing/coaches">
                  <DropdownMenuItem className={`cursor-pointer flex items-center gap-2 ${activeTab === "coaches" ? "text-primary" : ""}`}>
                    <Trophy className="h-4 w-4" />
                    <span>For Coaches</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/landing/schools">
                  <DropdownMenuItem className={`cursor-pointer flex items-center gap-2 ${activeTab === "schools" ? "text-primary" : ""}`}>
                    <School className="h-4 w-4" />
                    <span>For Schools</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Link href="/auth">
              <div>
                <Button variant="outline">Log In</Button>
              </div>
            </Link>
            <Link href="/auth">
              <div>
                <Button>Sign Up</Button>
              </div>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t fixed bottom-0 left-0 right-0 bg-background z-10">
        <div className="grid grid-cols-4 h-16">
          <Link href="/landing/players" className={`flex flex-col items-center justify-center h-full ${activeTab === "players" ? "text-primary" : "text-muted-foreground"}`}>
            <FootballIcon width={20} height={20} />
            <span className="text-xs mt-1">Players</span>
          </Link>
          <Link href="/landing/parents" className={`flex flex-col items-center justify-center h-full ${activeTab === "parents" ? "text-primary" : "text-muted-foreground"}`}>
            <UserCircle className="h-5 w-5" />
            <span className="text-xs mt-1">Parents</span>
          </Link>
          <Link href="/landing/coaches" className={`flex flex-col items-center justify-center h-full ${activeTab === "coaches" ? "text-primary" : "text-muted-foreground"}`}>
            <Trophy className="h-5 w-5" />
            <span className="text-xs mt-1">Coaches</span>
          </Link>
          <Link href="/landing/schools" className={`flex flex-col items-center justify-center h-full ${activeTab === "schools" ? "text-primary" : "text-muted-foreground"}`}>
            <ChartLineUp className="h-5 w-5" />
            <span className="text-xs mt-1">Schools</span>
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
                <FootballIcon width={24} height={24} />
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