import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveProgressButtonProps {
  onSave: () => Promise<void>;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function SaveProgressButton({ 
  onSave, 
  className,
  variant = "outline" 
}: SaveProgressButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await onSave();
      setShowSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      // Could add toast notification here
      console.error("Failed to save progress:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      className={cn(
        "gap-2 transition-all", 
        showSuccess && "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800",
        className
      )}
      onClick={handleSave}
      disabled={isSaving}
    >
      {showSuccess ? (
        <>
          <Check className="h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Progress"}
        </>
      )}
    </Button>
  );
}