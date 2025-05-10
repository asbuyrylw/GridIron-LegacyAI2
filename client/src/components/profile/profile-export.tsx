import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { generateAthletePDF } from "@/lib/pdf-generator";
import { CombineMetric } from "@shared/schema";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileExportProps {
  onExport?: () => void;
}

export function ProfileExport({ onExport }: ProfileExportProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const athleteId = user?.athlete?.id;
  
  const { data: metrics } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${athleteId}/metrics`],
    enabled: !!athleteId,
  });
  
  const handleGeneratePDF = async () => {
    if (!user?.athlete) {
      toast({
        title: "Error",
        description: "Athlete profile not found",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const pdfUrl = await generateAthletePDF(user.athlete, metrics);
      
      // Create a link element and trigger the download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${user.athlete.firstName}_${user.athlete.lastName}_Profile.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Your profile has been exported to PDF",
      });
      
      if (onExport) {
        onExport();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF profile",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Button 
      onClick={handleGeneratePDF}
      variant="outline"
      className="flex items-center gap-2"
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span>Export PDF Profile</span>
    </Button>
  );
}