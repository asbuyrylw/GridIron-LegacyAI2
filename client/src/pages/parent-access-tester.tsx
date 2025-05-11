import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

export default function ParentAccessTester() {
  const { user } = useAuth();
  const [athleteId, setAthleteId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resultToken, setResultToken] = useState<string>("");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const { toast } = useToast();

  // Default to current athlete if user is an athlete
  const currentAthleteId = user?.athlete?.id;

  async function generateParentAccess(e: React.FormEvent) {
    e.preventDefault();
    
    if (!athleteId) {
      toast({
        title: "Error",
        description: "Please enter an athlete ID",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/test/generate-parent-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ athleteId: parseInt(athleteId) }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate parent access");
      }
      
      const data = await response.json();
      setResultToken(data.token);
      setShowDialog(true);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate parent access",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function getParentViewUrl() {
    const baseUrl = window.location.origin;
    return `${baseUrl}/parent-view?token=${resultToken}`;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Parent Access Tester</CardTitle>
          <CardDescription>
            Generate a test parent access token for an athlete to view the parent dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateParentAccess} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="athleteId">Athlete ID</Label>
              <Input
                id="athleteId"
                placeholder="Enter athlete ID"
                value={athleteId || (currentAthleteId?.toString() || "")}
                onChange={(e) => setAthleteId(e.target.value)}
                disabled={loading}
              />
              {currentAthleteId && (
                <p className="text-xs text-muted-foreground">
                  Using your athlete ID: {currentAthleteId}
                </p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Parent Access Token"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Parent Access Token Generated</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-2">
                <p>A test parent access token has been created.</p>
                
                <div className="space-y-2">
                  <Label htmlFor="token">Access Token:</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="token" 
                      value={resultToken} 
                      readOnly 
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parentUrl">Parent View URL:</Label>
                  <Input
                    id="parentUrl"
                    value={getParentViewUrl()}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Open this URL to see the parent's view of the athlete profile.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowDialog(false)}>Close</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}