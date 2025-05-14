import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyPlaceholder({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      {icon && <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">{icon}</div>}
      <div className="mt-6 space-y-2">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}