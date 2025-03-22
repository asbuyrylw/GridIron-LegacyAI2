import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/utils";

interface ProgressMetricProps {
  title: string;
  value: string | number;
  goal: string | number;
  progress: number; // 0-100
  unit?: string;
  className?: string;
}

export function ProgressMetric({
  title,
  value,
  goal,
  progress,
  unit = "",
  className,
}: ProgressMetricProps) {
  return (
    <Card className={cn("relative p-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-montserrat font-bold">{title}</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-mono font-semibold text-primary dark:text-accent">
              {value}{unit}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              Goal: {goal}{unit}
            </span>
          </div>
        </div>
        <ProgressRing 
          progress={progress} 
          size={64} 
          strokeWidth={6}
          color="hsl(var(--primary))"
          bgColor="hsl(var(--muted))"
        />
      </div>
    </Card>
  );
}
