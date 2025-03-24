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
  // Determine color based on progress
  const getProgressColor = () => {
    if (progress >= 90) return "from-green-500 to-green-600";
    if (progress >= 70) return "from-blue-500 to-blue-600";
    if (progress >= 40) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };
  
  const progressColor = getProgressColor();
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <div className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
            {progress}% of goal
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{value}</span>
              <span className="text-sm text-muted-foreground ml-1">{unit}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Goal: {goal}{unit}
            </span>
          </div>
          
          <div className="relative">
            <ProgressRing 
              progress={progress} 
              size={80} 
              strokeWidth={8}
              color="hsl(var(--primary))"
              bgColor="hsl(var(--muted))"
              showText={true}
              textClassName="text-lg font-bold"
            />
          </div>
        </div>
      </div>
      
      {/* Progress bar at bottom */}
      <div className="h-1.5 w-full bg-muted">
        <div 
          className={`h-full bg-gradient-to-r ${progressColor}`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </Card>
  );
}
