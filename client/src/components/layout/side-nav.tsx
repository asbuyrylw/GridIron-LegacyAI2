import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, 
  Dumbbell, 
  LineChart, 
  User, 
  Award, 
  Brain,
  CandlestickChart, 
  Share2,
  Settings,
  Users,
  School,
  ClipboardCopy,
  Menu,
  X,
  FileText,
  Ruler,
  Mail,
  GraduationCapIcon as GraduationCap,
  Camera,
  ClipboardCheck,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SideNav() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user } = useAuth();
  
  const isCoach = user?.userType === "coach";
  const isAthlete = user?.userType === "athlete";
  const isParent = user?.userType === "parent";
  
  const athleteNavItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      active: location === "/"
    },
    {
      label: "Training & Nutrition",
      href: "/training-nutrition",
      icon: Dumbbell,
      active: location === "/training-nutrition"
    },
    {
      label: "Performance",
      href: "/stats",
      icon: LineChart,
      active: location === "/stats"
    },
    {
      label: "Development Plan",
      href: "/development-plan",
      icon: BarChart3,
      active: location === "/development-plan"
    },
    {
      label: "Recruiting",
      href: "/recruiting",
      icon: ClipboardCopy,
      active: location.includes("/recruiting")
    },
    {
      label: "College Matcher",
      href: "/college-matcher",
      icon: School,
      active: location === "/college-matcher"
    },
    {
      label: "College Applications",
      href: "/college-application-hub",
      icon: GraduationCap,
      active: location === "/college-application-hub"
    },
    {
      label: "Achievements",
      href: "/achievements",
      icon: Award,
      active: location === "/achievements"
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      active: location === "/profile" || 
              location === "/growth-prediction" || 
              location === "/player-branding" || 
              location.includes("/teams") || 
              location.includes("/social")
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      active: location === "/settings"
    }
  ];
  
  const coachNavItems = [
    {
      label: "Dashboard",
      href: "/coach-dashboard",
      icon: Home,
      active: location === "/coach-dashboard"
    },
    {
      label: "Team Management",
      href: "/teams",
      icon: Users,
      active: location.includes("/teams")
    },
    {
      label: "Coach Evaluations",
      href: "/coach-evaluations",
      icon: ClipboardCheck,
      active: location === "/coach-evaluations"
    },
    {
      label: "Parent Reports",
      href: "/parent-reports",
      icon: FileText,
      active: location === "/parent-reports"
    },
    {
      label: "Email Test",
      href: "/email-test",
      icon: Mail,
      active: location === "/email-test"
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      active: location === "/profile"
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      active: location === "/settings"
    }
  ];
  
  // Select the correct navigation items based on user type
  const navItems = isCoach ? coachNavItems : athleteNavItems;
  
  // For mobile, use a Sheet component
  const MobileNav = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 z-50 md:hidden bg-background shadow"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 max-w-[250px]">
        <div className="flex flex-col h-full">
          <div className="py-4 px-3 border-b">
            <h2 className="text-xl font-bold">GridIron Legacy</h2>
          </div>
          <nav className="flex-1 py-2 overflow-y-auto">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <button
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md w-full",
                        item.active 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-muted-foreground hover:bg-muted"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
  
  // For desktop, use a sidebar
  const DesktopNav = () => {
    return (
      <div 
        className={cn(
          "hidden md:flex h-screen fixed left-0 top-0 flex-col border-r transition-all duration-300 z-30 bg-background",
          isCollapsed ? "w-[70px]" : "w-[240px]"
        )}
      >
        <div className="p-4 flex justify-between items-center border-b">
          {!isCollapsed && <h2 className="text-xl font-bold">GridIron</h2>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(isCollapsed && "mx-auto")}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <button
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md w-full",
                      item.active 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  };
  
  return (
    <>
      <MobileNav />
      <DesktopNav />
      {/* Create a wrapper div that adjusts based on sidebar state */}
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "md:ml-[70px]" : "md:ml-[240px]"
      )} />
    </>
  );
}