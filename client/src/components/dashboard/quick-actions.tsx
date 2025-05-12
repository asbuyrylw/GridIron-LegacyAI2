import { Button } from "@/components/ui/button";
import { 
  Dumbbell, 
  BarChart2, 
  Ruler, 
  PenSquare, 
  User
} from "lucide-react";
import { Link } from "wouter";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/stats/update">
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <Ruler className="h-4 w-4" />
          <span>Update Combine Stats</span>
        </Button>
      </Link>
      <Link href="/training/log">
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <PenSquare className="h-4 w-4" />
          <span>Log Training</span>
        </Button>
      </Link>
      <Link href="/profile">
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          <span>Update Profile</span>
        </Button>
      </Link>
      <Link href="/stats">
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <BarChart2 className="h-4 w-4" />
          <span>Track Performance</span>
        </Button>
      </Link>
      <Link href="/training">
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <Dumbbell className="h-4 w-4" />
          <span>Add Workout</span>
        </Button>
      </Link>
    </div>
  );
}
