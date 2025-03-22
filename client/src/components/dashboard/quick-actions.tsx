import { Card } from "@/components/ui/card";
import { Dumbbell, BarChart2 } from "lucide-react";
import { Link } from "wouter";

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Link href="/training">
        <Card className="flex flex-col items-center py-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <Dumbbell className="text-primary dark:text-accent h-8 w-8 mb-2" />
          <span className="font-montserrat font-semibold">Today's Workout</span>
        </Card>
      </Link>
      <Link href="/stats">
        <Card className="flex flex-col items-center py-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <BarChart2 className="text-primary dark:text-accent h-8 w-8 mb-2" />
          <span className="font-montserrat font-semibold">Track Progress</span>
        </Card>
      </Link>
    </div>
  );
}
