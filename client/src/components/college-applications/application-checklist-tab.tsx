import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { apiRequest } from '@/lib/queryClient';

interface ChecklistItem {
  id: number;
  athleteId: number;
  task: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface ApplicationChecklistTabProps {
  athleteId: number;
}

export default function ApplicationChecklistTab({ athleteId }: ApplicationChecklistTabProps) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    task: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'general'
  });

  // Fetch checklist items
  const { data: checklistItems, isLoading, error, refetch } = useQuery({ 
    queryKey: ['/api/college-applications/checklist', athleteId],
    queryFn: async () => {
      const response = await apiRequest(
        'GET', 
        `/api/college-applications/checklist/${athleteId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch checklist items');
      }
      
      return response.json();
    },
    enabled: !!athleteId
  });

  // Toggle checklist item completion
  const toggleCompleteMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const response = await apiRequest(
        'PATCH',
        `/api/college-applications/checklist/${id}`,
        { completed }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update checklist item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: 'Checklist updated',
        description: 'Your application checklist has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Default items to display when no items exist yet
  const defaultItems = [
    {
      id: 1,
      task: 'Research Target Schools',
      description: 'Create a list of schools that match your academic profile and athletic goals',
      priority: 'high',
      category: 'research',
      completed: false
    },
    {
      id: 2,
      task: 'Prepare Academic Transcripts',
      description: 'Request official transcripts from your high school',
      priority: 'high',
      category: 'documents',
      completed: false
    },
    {
      id: 3,
      task: 'Complete Personal Statement Draft',
      description: 'Write a compelling personal statement (500-650 words)',
      priority: 'medium',
      category: 'writing',
      completed: false
    },
    {
      id: 4,
      task: 'Contact Coaches',
      description: 'Reach out to coaches at your target schools with your athletic profile',
      priority: 'high',
      category: 'recruiting',
      completed: false
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 border-red-500';
      case 'medium':
        return 'text-amber-500 border-amber-500';
      case 'low':
        return 'text-green-500 border-green-500';
      default:
        return 'text-blue-500 border-blue-500';
    }
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
        title="Error Loading Checklist"
        description="There was a problem loading your application checklist."
        icon={<Loader2 className="h-12 w-12 text-muted-foreground" />}
      >
        <Button onClick={() => refetch()}>Try Again</Button>
      </EmptyPlaceholder>
    );
  }

  const items = checklistItems && checklistItems.length > 0 ? checklistItems : defaultItems;

  // Group items by category
  const groupedItems = items.reduce((acc: Record<string, ChecklistItem[]>, item: ChecklistItem) => {
    const category = item.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'research':
        return 'Research & Planning';
      case 'documents':
        return 'Required Documents';
      case 'writing':
        return 'Essays & Writing';
      case 'recruiting':
        return 'Recruiting Tasks';
      case 'general':
      default:
        return 'General Tasks';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Application Checklist</h2>
          <p className="text-muted-foreground">
            Track your application tasks and deadlines.
          </p>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-15rem)]">
        <div className="space-y-6">
          {Object.keys(groupedItems).map(category => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold">{getCategoryTitle(category)}</h3>
              <div className="grid gap-3">
                {groupedItems[category].map((item: ChecklistItem) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox 
                          checked={item.completed} 
                          onCheckedChange={() => toggleCompleteMutation.mutate({
                            id: item.id,
                            completed: !item.completed
                          })}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {item.task}
                            </div>
                            <div className={`text-xs border rounded-full px-2 py-0.5 ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                          {item.dueDate && (
                            <p className="text-xs text-muted-foreground">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}