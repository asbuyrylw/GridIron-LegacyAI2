import { Check, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description?: string;
  label?: string; // For backward compatibility
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ 
  steps, 
  currentStep,
  className 
}: StepIndicatorProps) {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center space-y-2">
              <div className="relative flex items-center justify-center">
                {/* Connecting line between steps */}
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "absolute w-full h-1 top-1/2 transform -translate-y-1/2 right-0 -mr-[50%]",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                    style={{ width: "100%" }}
                  />
                )}
                
                {/* Step circle */}
                <div 
                  className={cn(
                    "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                    isCurrent ? "bg-primary/20 border-primary text-primary" : 
                    "bg-background border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
              </div>
              
              <div className={cn(
                "text-xs font-medium text-center max-w-[70px]",
                isCurrent ? "text-primary" : 
                isCompleted ? "text-foreground" : 
                "text-muted-foreground"
              )}>
                {step.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}