import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page container with proper padding and responsive width
 * This ensures content is properly positioned with the sidebar
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn(
      "container px-4 sm:px-6 py-4 mx-auto max-w-5xl w-full",
      className
    )}>
      {children}
    </main>
  );
}