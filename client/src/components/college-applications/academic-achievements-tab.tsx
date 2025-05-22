import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Award, Sparkles, Bookmark, Medal, Star, Trash } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AcademicAchievement {
  id: number;
  athleteId: number;
  title: string;
  type: string;
  date: string;
  description?: string;
  institution?: string;
}

interface AcademicAchievementsTabProps {
  athleteId: number;
}

export default function AcademicAchievementsTab({ athleteId }: AcademicAchievementsTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    type: 'award',
    date: new Date().toISOString().split('T')[0],
    description: '',
    institution: ''
  });

  // Fetch academic achievements
  const { data: achievements, isLoading, error, refetch } = useQuery({ 
    queryKey: ['/api/college-applications/achievements/academic', athleteId],
    queryFn: async () => {
      const response = await apiRequest(
        'GET', 
        `/api/college-applications/achievements/academic/${athleteId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch academic achievements');
      }
      
      return response.json();
    },
    enabled: !!athleteId
  });

  // Sample achievements to display if none exist yet
  const sampleAchievements = [
    {
      id: 1,
      athleteId,
      title: 'National Honor Society',
      type: 'membership',
      date: '2024-01-15',
      description: 'Selected for membership based on scholarship, leadership, service, and character',
      institution: 'National Honor Society'
    },
    {
      id: 2,
      athleteId,
      title: 'AP Scholar with Distinction',
      type: 'award',
      date: '2023-07-05',
      description: 'Granted to students who receive an average score of at least 3.5 on all AP exams taken, and scores of 3 or higher on five or more of these exams',
      institution: 'College Board'
    },
    {
      id: 3,
      athleteId,
      title: 'Science Olympiad - 1st Place Physics',
      type: 'competition',
      date: '2024-03-20',
      description: 'First place in regional Science Olympiad physics competition',
      institution: 'State Science Olympiad'
    }
  ];

  // Delete achievement mutation
  const deleteAchievementMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(
        'DELETE',
        `/api/college-applications/achievements/academic/${id}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete achievement');
      }
      
      return id;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: 'Achievement deleted',
        description: 'Your academic achievement has been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'award':
        return <Award className="h-10 w-10 text-amber-500" />;
      case 'honor':
        return <Medal className="h-10 w-10 text-yellow-600" />;
      case 'competition':
        return <Star className="h-10 w-10 text-blue-500" />;
      case 'membership':
        return <Bookmark className="h-10 w-10 text-green-600" />;
      default:
        return <Sparkles className="h-10 w-10 text-purple-500" />;
    }
  };

  const getAchievementTypeName = (type: string) => {
    switch (type) {
      case 'award':
        return 'Award';
      case 'honor':
        return 'Honor';
      case 'competition':
        return 'Competition';
      case 'membership':
        return 'Membership';
      case 'certificate':
        return 'Certificate';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAchievement(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewAchievement(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyPlaceholder
        title="Error Loading Achievements"
        description="There was a problem loading your academic achievements."
        icon={<Loader2 className="h-12 w-12 text-muted-foreground" />}
      >
        <Button onClick={() => refetch()}>Try Again</Button>
      </EmptyPlaceholder>
    );
  }

  const achievementsToDisplay = achievements && achievements.length > 0 ? achievements : sampleAchievements;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Academic Achievements</h2>
          <p className="text-muted-foreground">
            Showcase your academic accomplishments for college applications.
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Academic Achievement</DialogTitle>
              <DialogDescription>
                Add details about your academic accomplishment to showcase in applications.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Achievement Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={newAchievement.title}
                  onChange={handleInputChange}
                  placeholder="e.g., National Merit Scholar"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Achievement Type</Label>
                <Select
                  value={newAchievement.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="award">Award</SelectItem>
                    <SelectItem value="honor">Honor</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="membership">Membership</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date Received</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={newAchievement.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="institution">Awarding Institution</Label>
                <Input
                  id="institution"
                  name="institution"
                  value={newAchievement.institution}
                  onChange={handleInputChange}
                  placeholder="e.g., National Science Foundation"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newAchievement.description}
                  onChange={handleInputChange}
                  placeholder="Describe the achievement and its significance..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Add Achievement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {achievementsToDisplay.map((achievement) => (
          <Card key={achievement.id} className="overflow-hidden">
            <div className="flex p-6">
              <div className="mr-4 flex-shrink-0">
                {getAchievementIcon(achievement.type)}
              </div>
              <div className="flex-1">
                <CardHeader className="p-0 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{achievement.title}</CardTitle>
                      <CardDescription>
                        {achievement.institution && (
                          <span>{achievement.institution} • </span>
                        )}
                        <span>{new Date(achievement.date).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {getAchievementTypeName(achievement.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  {achievement.description && (
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end p-0 pt-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteAchievementMutation.mutate(achievement.id)}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {achievementsToDisplay.length === 0 && (
        <EmptyPlaceholder
          title="No Academic Achievements"
          description="Add your academic accomplishments to showcase in your applications."
          icon={<Award className="h-12 w-12 text-muted-foreground" />}
        >
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add First Achievement
          </Button>
        </EmptyPlaceholder>
      )}
    </div>
  );
}