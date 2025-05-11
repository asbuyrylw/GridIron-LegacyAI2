import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { Wifi, WifiOff, MessageSquare, RotateCw } from "lucide-react";

export default function WebSocketTester() {
  const [token, setToken] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const { toast } = useToast();
  const { isConnected, lastMessage, sendMessage, authenticateParentView } = useWebSocket();

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage) {
      setMessages(prev => [...prev, lastMessage]);
      
      // Show toast for important messages
      if (lastMessage.type === 'error') {
        toast({
          title: "WebSocket Error",
          description: lastMessage.message,
          variant: "destructive",
        });
      } else if (lastMessage.type === 'parent_view_success') {
        toast({
          title: "Authentication Success",
          description: `Connected to athlete ID: ${lastMessage.data.athleteId}`,
        });
      }
    }
  }, [lastMessage, toast]);

  const handleSendPing = () => {
    sendMessage({ type: 'ping' });
    toast({
      title: "Ping Sent",
      description: "Sent ping to WebSocket server",
    });
  };

  const handleAuthenticate = () => {
    if (!token.trim()) {
      toast({
        title: "Missing Token",
        description: "Please enter a parent access token",
        variant: "destructive",
      });
      return;
    }
    
    authenticateParentView(token);
    toast({
      title: "Authentication Request Sent",
      description: "Sent authentication request with token",
    });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">WebSocket Tester</CardTitle>
              <CardDescription>
                Test parent view WebSocket functionality
              </CardDescription>
            </div>
            <Badge variant={isConnected ? "success" : "destructive"} className="text-sm">
              {isConnected ? (
                <div className="flex items-center">
                  <Wifi className="h-3 w-3 mr-1" />
                  <span>Connected</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <WifiOff className="h-3 w-3 mr-1" />
                  <span>Disconnected</span>
                </div>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-4">
                <Input 
                  placeholder="Enter parent access token" 
                  value={token} 
                  onChange={(e) => setToken(e.target.value)} 
                />
              </div>
              <Button onClick={handleAuthenticate}>Authenticate</Button>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleSendPing}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Ping
              </Button>
              <Button variant="outline" onClick={clearMessages}>
                <RotateCw className="h-4 w-4 mr-2" />
                Clear Messages
              </Button>
            </div>
            
            <div className="mt-4 border rounded-md p-4 bg-muted/20 max-h-[400px] overflow-y-auto">
              <h3 className="text-sm font-medium mb-2">Message Log:</h3>
              {messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <div key={index} className="p-2 border rounded bg-card text-xs font-mono">
                      <div className="flex justify-between mb-1">
                        <Badge variant="outline" className="text-xs">{msg.type}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                      </div>
                      <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(msg, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No messages received yet
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}