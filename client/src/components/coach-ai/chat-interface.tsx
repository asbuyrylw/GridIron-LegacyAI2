import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bot, Send, X, User } from "lucide-react";
import { CoachMessage } from "@shared/schema";
import { format } from "date-fns";

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const { user } = useAuth();
  const athleteId = user?.athlete?.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  
  const { data: messages = [], isLoading } = useQuery<CoachMessage[]>({
    queryKey: [`/api/athlete/${athleteId}/messages`],
    enabled: !!athleteId && isOpen,
  });
  
  const messageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!athleteId) throw new Error("Athlete ID is required");
      
      const data = {
        message: content,
        role: "user",
        read: true
      };
      
      const res = await apiRequest("POST", `/api/athlete/${athleteId}/messages`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/messages`] });
      setMessage("");
    }
  });
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    messageMutation.mutate(message);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
      <Card className="bg-white dark:bg-gray-800 rounded-t-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-primary text-white p-4 rounded-t-xl z-10">
          <div className="flex justify-between items-center">
            <CardTitle className="font-montserrat font-bold">Coach Legacy AI</CardTitle>
            <Button variant="ghost" size="icon" className="text-white" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-3 text-primary" />
              <p>Start a conversation with Coach Legacy AI.</p>
              <p className="text-sm mt-2">Ask questions about training, recruiting, or your progress!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const time = format(new Date(msg.createdAt), "h:mm a");
              
              if (msg.role === "assistant") {
                return (
                  <div key={index} className="flex">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="max-w-[80%] bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm">{msg.message}</p>
                      <span className="text-xs text-gray-500 mt-1">{time}</span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={index} className="flex justify-end">
                    <div className="max-w-[80%] bg-primary text-white p-3 rounded-lg">
                      <p className="text-sm">{msg.message}</p>
                      <span className="text-xs text-white text-opacity-70 mt-1">{time}</span>
                    </div>
                  </div>
                );
              }
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        
        <CardFooter className="p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <div className="flex w-full">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Coach Legacy..."
              className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-l-lg"
            />
            <Button 
              className="bg-primary text-white rounded-r-lg flex items-center"
              onClick={handleSendMessage}
              disabled={messageMutation.isPending || !message.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
