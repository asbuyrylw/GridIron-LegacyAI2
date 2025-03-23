import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Dumbbell,
  Apple,
  BarChart2, 
  User, 
  Settings,
} from "lucide-react";

export function BottomNavigation() {
  const [location] = useLocation();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Dumbbell, label: "Training", path: "/training" },
    { icon: Apple, label: "Nutrition", path: "/nutrition" },
    { icon: BarChart2, label: "Stats", path: "/stats" },
    { icon: User, label: "Profile", path: "/profile" },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-10">
      <div className="flex justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center justify-center text-xs font-medium">
              <div 
                className={cn(
                  "flex flex-col items-center justify-center text-xs font-medium",
                  isActive 
                    ? "text-primary dark:text-accent" 
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                <item.icon 
                  className="h-5 w-5 mb-1" 
                  aria-hidden="true" 
                />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
