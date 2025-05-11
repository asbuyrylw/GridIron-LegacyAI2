import React from "react";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import { useLocation, Link } from "wouter";
import { 
  Home, 
  Dumbbell, 
  LineChart, 
  User, 
  Award, 
  CandlestickChart, 
  Share2,
  Settings,
  Users,
  GraduationCap,
  School
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();
  
  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      active: location === "/"
    },
    {
      label: "Training",
      href: "/training",
      icon: Dumbbell,
      active: location === "/training"
    },
    {
      label: "Stats",
      href: "/stats",
      icon: LineChart,
      active: location === "/stats"
    },
    {
      label: "Nutrition",
      href: "/nutrition",
      icon: CandlestickChart,
      active: location === "/nutrition"
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      active: location === "/profile"
    },
    {
      label: "Social",
      href: "/social-feed",
      icon: Share2,
      active: location.includes("/social")
    },
    {
      label: "Achievements",
      href: "/achievements",
      icon: Award,
      active: location === "/achievements"
    },
    {
      label: "Teams",
      href: "/teams",
      icon: Users,
      active: location.includes("/teams")
    },
    {
      label: "College",
      href: "/college-matcher",
      icon: School,
      active: location === "/college-matcher"
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      active: location === "/settings"
    }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border py-2 md:hidden">
      <div className="container max-w-md mx-auto px-2">
        <div className="grid grid-cols-5 gap-1">
          {navItems.slice(0, 5).map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
        <div className="mt-1 grid grid-cols-5 gap-1">
          {navItems.slice(5).map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </div>
    </nav>
  );
}

interface NavItemProps {
  label: string;
  href: string;
  icon: React.ComponentType;
  active: boolean;
}

function NavItem({ label, href, icon: Icon, active }: NavItemProps) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center justify-center p-1 rounded-md transition-colors hover:bg-muted/50">
        <div 
          className={cn(
            "p-1 rounded-md mb-1", 
            active ? "bg-primary/10 text-primary" : "text-muted-foreground"
          )}
        >
          <IconWrapper icon={Icon} className="h-5 w-5" />
        </div>
        <span className={cn(
          "text-[10px] font-medium",
          active ? "text-primary" : "text-muted-foreground"
        )}>
          {label}
        </span>
      </div>
    </Link>
  );
}