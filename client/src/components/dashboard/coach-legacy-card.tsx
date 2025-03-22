import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { CoachMessage } from "@shared/schema";

interface CoachLegacyCardProps {
  onRespond: () => void;
}

export function CoachLegacyCard({ onRespond }: CoachLegacyCardProps) {
  const { user } = useAuth();
  const athleteId = user?.athlete?.id;
  
  const [dismissed, setDismissed] = useState(false);
  
  const { data: messages } = useQuery<CoachMessage[]>({
    queryKey: [`/api/athlete/${athleteId}/messages`],
    enabled: !!athleteId,
  });
  
  // Get the last message from Coach Legacy (assistant)
  const latestCoachMessage = messages?.filter(m => m.role === "assistant").pop();
  
  if (dismissed || !latestCoachMessage) {
    return null;
  }
  
  return (
    <Card className="bg-primary text-white mb-6">
      <div className="flex items-start p-4">
        <div className="mr-3 mt-1">
          <Bot className="text-amber-400 h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-montserrat font-bold mb-2">Coach Legacy Says:</h3>
          <p className="text-sm">{latestCoachMessage.message}</p>
          <div className="mt-3 flex justify-end">
            <Button 
              variant="link" 
              className="text-xs text-amber-400" 
              onClick={() => setDismissed(true)}
            >
              Dismiss
            </Button>
            <Button 
              className="text-xs bg-amber-400 hover:bg-amber-500 text-primary font-semibold rounded px-3 py-1 ml-3 h-auto"
              onClick={onRespond}
            >
              Respond
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
