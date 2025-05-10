import { Check, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center justify-center">
        <ol className="flex items-center w-full max-w-3xl">
          {steps.slice(0, -1).map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = index < currentStep;
            
            return (
              <li key={step.id} className="flex items-center w-full">
                <div className="flex flex-col items-center">
                  <div 
                    className={cn(
                      "z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 border-2",
                      isCompleted 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : isCurrent 
                          ? "bg-primary/10 text-primary border-primary" 
                          : "bg-background border-muted-foreground/20 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span 
                    className={cn(
                      "absolute mt-14 text-xs whitespace-nowrap", 
                      isCurrent 
                        ? "font-medium text-primary"
                        : isCompleted 
                          ? "font-medium text-foreground" 
                          : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                
                {index < steps.length - 2 && (
                  <div 
                    className={cn(
                      "w-full h-0.5 border-t",
                      isCompleted ? "border-primary" : "border-muted-foreground/20"
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}