import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  centered?: boolean;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  className, 
  size = "md", 
  centered = false,
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };
  
  const spinner = (
    <Loader2 className={cn(
      "animate-spin text-primary", 
      sizeMap[size],
      className
    )} />
  );
  
  if (centered || fullScreen) {
    return (
      <div className={cn(
        "flex items-center justify-center",
        fullScreen ? "fixed inset-0 bg-background/80 z-50" : "w-full h-full",
      )}>
        {spinner}
      </div>
    );
  }
  
  return spinner;
}