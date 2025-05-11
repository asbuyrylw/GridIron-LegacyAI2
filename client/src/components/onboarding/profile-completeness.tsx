import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProfileSection {
  name: string;
  isComplete: boolean;
  weight: number; // Weight/importance of this section in the overall percentage
}

interface ProfileCompletenessProps {
  sections: ProfileSection[];
  className?: string;
}

export function ProfileCompleteness({ 
  sections, 
  className 
}: ProfileCompletenessProps) {
  // Calculate the completeness percentage
  const totalWeight = sections.reduce((acc, section) => acc + section.weight, 0);
  const completedWeight = sections
    .filter(section => section.isComplete)
    .reduce((acc, section) => acc + section.weight, 0);
  
  const percentage = Math.round((completedWeight / totalWeight) * 100);
  
  // Determine the status color based on percentage
  const getStatusColor = (percent: number) => {
    if (percent < 30) return "text-red-500";
    if (percent < 70) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">Profile Completeness</div>
        <div className={cn("text-sm font-bold", getStatusColor(percentage))}>
          {percentage}%
        </div>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2"
        indicatorClassName={cn(
          percentage < 30 ? "bg-red-500" : 
          percentage < 70 ? "bg-amber-500" : 
          "bg-green-500"
        )}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
        {sections.map((section) => (
          <div key={section.name} className="flex items-center gap-2">
            <div 
              className={cn(
                "w-2 h-2 rounded-full",
                section.isComplete ? "bg-green-500" : "bg-muted"
              )} 
            />
            <span className="text-xs">
              {section.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}