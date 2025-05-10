import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ProgressRestoreDialogProps {
  open: boolean;
  onRestore: () => void;
  onStartFresh: () => void;
  timestamp: string | undefined;
  step: number | undefined;
  totalSteps: number;
}

export function ProgressRestoreDialog({
  open,
  onRestore,
  onStartFresh,
  timestamp,
  step,
  totalSteps
}: ProgressRestoreDialogProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (timestamp) {
      try {
        const date = new Date(timestamp);
        setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
      } catch (error) {
        console.error("Error formatting timestamp:", error);
        setTimeAgo("previously");
      }
    }
  }, [timestamp]);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Resume Your Onboarding?</AlertDialogTitle>
          <AlertDialogDescription>
            {timestamp ? (
              <>
                <p className="mb-2">
                  We found your saved progress from {timeAgo}. You were on step {step} of {totalSteps}.
                </p>
                <p>
                  Would you like to continue from where you left off or start fresh?
                </p>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading your saved progress...</span>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStartFresh}>Start Fresh</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onRestore}
            className="bg-primary hover:bg-primary/90"
          >
            Resume Progress
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}