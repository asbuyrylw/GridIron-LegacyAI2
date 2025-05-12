import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 24 }: IconProps) {
  // Get the icon component from Lucide
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  
  return (
    <IconComponent 
      className={cn(className)} 
      size={size} 
    />
  );
}