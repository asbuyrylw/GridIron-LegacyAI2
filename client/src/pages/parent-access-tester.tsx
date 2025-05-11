import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyIcon, CheckIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ParentAccessTester() {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateTestToken = async () => {
    try {
      setLoading(true);
      // Using the first test user (athlete)
      const response = await apiRequest(
        "POST",
        "/api/test/generate-parent-access",
        { athleteId: 1 }
      );
      
      const data = await response.json();
      setToken(data.token);
      
      toast({
        title: "Success",
        description: "Test parent access token generated",
      });
    } catch (error) {
      console.error("Error generating token:", error);
      toast({
        title: "Failed to generate token",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!token) return;
    
    navigator.clipboard.writeText(window.location.origin + "/parent-view?token=" + token);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Parent access link copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Parent Access Tester</CardTitle>
          <CardDescription>
            Generate a token to test the parent access view
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={generateTestToken} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Test Token"}
          </Button>
          
          {token && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Parent Access Link:</div>
              <div className="flex space-x-2">
                <Input 
                  value={window.location.origin + "/parent-view?token=" + token} 
                  readOnly 
                  className="flex-1"
                />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the button above to test the parent view with this token
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}