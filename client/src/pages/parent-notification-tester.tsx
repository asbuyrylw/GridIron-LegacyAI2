import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { sendAchievementNotifications } from '@/lib/parent-notification-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';

// Define types
interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  category: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
}

interface ParentAccess {
  id: number;
  name: string;
  email: string;
  relationship: string;
  active: boolean;
}

// Page component
export default function ParentNotificationTester() {
  const { user } = useAuth();
  const { toast } = useToast();
  const athleteId = user?.athlete?.id;
  
  const [selectedAchievements, setSelectedAchievements] = useState<string[]>([]);
  const [selectedParents, setSelectedParents] = useState<number[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get available achievements
  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
    enabled: !!athleteId,
  });
  
  // Get parent access records
  const { data: parentAccess = [], isLoading: parentsLoading } = useQuery<ParentAccess[]>({
    queryKey: [`/api/athlete/${athleteId}/parent-access`],
    enabled: !!athleteId,
  });
  
  // Toggle achievement selection
  const toggleAchievement = (achievementId: string) => {
    setSelectedAchievements(prev => 
      prev.includes(achievementId) 
        ? prev.filter(id => id !== achievementId)
        : [...prev, achievementId]
    );
  };
  
  // Toggle parent selection
  const toggleParent = (parentId: number) => {
    setSelectedParents(prev => 
      prev.includes(parentId) 
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    );
  };
  
  // Handle send notification
  const handleSendNotification = async () => {
    if (!athleteId) {
      toast({
        title: "Error",
        description: "No athlete profile found",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedAchievements.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one achievement",
        variant: "destructive",
      });
      return;
    }
    
    if (!sendToAll && selectedParents.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one parent or enable 'Send to all'",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await sendAchievementNotifications(
        athleteId,
        selectedAchievements,
        {
          parentIds: sendToAll ? undefined : selectedParents,
          sendToAll
        }
      );
      
      toast({
        title: "Notifications Sent",
        description: `Successfully sent notifications to ${result.successfulSends?.length || 0} parents`,
        variant: "default",
      });
      
      // Log detailed results
      console.log('Notification results:', result);
      
    } catch (error: any) {
      toast({
        title: "Error Sending Notifications",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Group achievements by category
  const groupedAchievements = achievements.reduce((groups, achievement) => {
    const category = achievement.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(achievement);
    return groups;
  }, {} as Record<string, Achievement[]>);
  
  if (!athleteId) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Parent Notification Tester</h1>
        <p>You need to be logged in as an athlete to use this feature.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Parent Notification Tester</h1>
      <p className="mb-6">
        Use this page to test sending achievement notifications to parents. 
        Select achievements and parents to notify.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Achievement selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Achievements</CardTitle>
            <CardDescription>
              Choose which achievements to include in the notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[400px] overflow-y-auto">
            {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-medium">{category}</h3>
                <div className="space-y-1">
                  {categoryAchievements.map(achievement => (
                    <div key={achievement.achievementId} className="flex items-center space-x-2">
                      <Checkbox 
                        id={achievement.achievementId}
                        checked={selectedAchievements.includes(achievement.achievementId)}
                        onCheckedChange={() => toggleAchievement(achievement.achievementId)}
                      />
                      <label 
                        htmlFor={achievement.achievementId}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {achievement.name} 
                        <span className="text-xs ml-1 text-muted-foreground">
                          ({achievement.level.toUpperCase()}) - {achievement.points} pts
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              {selectedAchievements.length} achievements selected
            </div>
          </CardFooter>
        </Card>
        
        {/* Parent selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Parents</CardTitle>
            <CardDescription>
              Choose which parents should receive the notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox 
                id="send-to-all"
                checked={sendToAll}
                onCheckedChange={(checked) => {
                  setSendToAll(!!checked);
                  if (checked) {
                    setSelectedParents([]);
                  }
                }}
              />
              <label 
                htmlFor="send-to-all"
                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Send to all parents
              </label>
            </div>
            
            <div className={`space-y-2 ${sendToAll ? 'opacity-50' : ''}`}>
              {parentsLoading ? (
                <p>Loading parents...</p>
              ) : parentAccess.length === 0 ? (
                <p>No parents have been granted access yet.</p>
              ) : (
                parentAccess.map(parent => (
                  <div key={parent.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`parent-${parent.id}`}
                      checked={selectedParents.includes(parent.id)}
                      onCheckedChange={() => toggleParent(parent.id)}
                      disabled={sendToAll || !parent.active}
                    />
                    <label 
                      htmlFor={`parent-${parent.id}`}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${!parent.active ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {parent.name} ({parent.relationship}) 
                      <div className="text-xs text-muted-foreground">{parent.email}</div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSendNotification} 
              disabled={isLoading || selectedAchievements.length === 0 || (!sendToAll && selectedParents.length === 0)}
            >
              {isLoading ? 'Sending...' : 'Send Notification'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}