import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "No new notifications",
    });
  };
  
  return (
    <header className="bg-primary sticky top-0 z-10 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="text-white mr-2 h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="12" rx="8" ry="10" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="12" y1="2" x2="12" y2="22" />
          </svg>
          <h1 className="text-white font-montserrat font-bold text-xl">GridIron LegacyAI</h1>
        </div>
        <button className="text-white" onClick={handleNotificationClick}>
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
