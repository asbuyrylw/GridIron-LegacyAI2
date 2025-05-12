import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Timer, Target, Weight, ArrowUp } from "lucide-react";
import { CombineMetric } from "@shared/schema";

interface MilestoneTrackersProps {
  metrics: CombineMetric | undefined;
}

interface Milestone {
  id: string;
  name: string;
  icon: React.ReactNode;
  current: number | null;
  target: number;
  unit: string;
  daysLeft: number;
  isLowerBetter?: boolean;
}

export function MilestoneTrackers({ metrics }: MilestoneTrackersProps) {
  // Define quarterly milestones based on current metrics
  const milestones: Milestone[] = [
    {
      id: "forty",
      name: "40-Yard Dash",
      icon: <Timer className="h-4 w-4 text-blue-500" />,
      current: metrics?.fortyYard || null,
      target: 4.7, // Target for this quarter
      unit: "sec",
      daysLeft: 42,
      isLowerBetter: true, // Lower is better for time-based metrics
    },
    {
      id: "bench",
      name: "Bench Press",
      icon: <Weight className="h-4 w-4 text-red-500" />,
      current: metrics?.benchPressReps || null,
      target: 15, // Target for this quarter
      unit: "reps",
      daysLeft: 42,
    },
    {
      id: "vertical",
      name: "Vertical Jump",
      icon: <ArrowUp className="h-4 w-4 text-green-500" />,
      current: metrics?.verticalJump || null,
      target: 35, // Target for this quarter
      unit: "in",
      daysLeft: 42,
    },
    {
      id: "shuttle",
      name: "Shuttle",
      icon: <Target className="h-4 w-4 text-purple-500" />,
      current: metrics?.shuttle || null,
      target: 4.1, // Target for this quarter
      unit: "sec",
      daysLeft: 42,
      isLowerBetter: true,
    },
  ];

  // Calculate progress percentage
  const calculateProgress = (current: number | null, target: number, isLowerBetter = false): number => {
    if (current === null) return 0;

    if (isLowerBetter) {
      // For metrics where lower is better (like 40-yard dash)
      const startValue = target * 1.2; // 20% slower than target is 0% progress
      if (current >= startValue) return 0;
      if (current <= target) return 100;
      return Math.round(100 - ((current - target) / (startValue - target)) * 100);
    } else {
      // For metrics where higher is better (like bench press)
      const startValue = target * 0.7; // 70% of target is 0% progress
      if (current <= startValue) return 0;
      if (current >= target) return 100;
      return Math.round(((current - startValue) / (target - startValue)) * 100);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {milestones.map((milestone) => (
        <Card key={milestone.id} className="p-3 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            {milestone.icon}
            <span className="font-semibold text-sm">{milestone.name}</span>
          </div>
          
          <div className="flex justify-between text-xs mb-1">
            <span>Current: {milestone.current || 'N/A'}{milestone.unit}</span>
            <span className="font-medium">Target: {milestone.target}{milestone.unit}</span>
          </div>
          
          <div className="relative mb-2">
            <Progress 
              value={calculateProgress(milestone.current, milestone.target, milestone.isLowerBetter)} 
              className="h-3 mb-2"
            />
            <div 
              className="absolute -top-1 text-xs font-semibold bg-primary text-white rounded-full px-1.5 flex items-center justify-center transform -translate-y-full"
              style={{ 
                left: `${Math.min(Math.max(calculateProgress(milestone.current, milestone.target, milestone.isLowerBetter) - 5, 0), 95)}%`,
                display: milestone.current ? 'flex' : 'none'
              }}
            >
              {calculateProgress(milestone.current, milestone.target, milestone.isLowerBetter)}%
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-auto">
            {milestone.daysLeft} days to reach goal
          </div>
        </Card>
      ))}
    </div>
  );
}