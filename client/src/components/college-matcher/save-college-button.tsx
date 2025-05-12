import { useState } from 'react';
import { BookmarkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface SaveCollegeButtonProps {
  collegeId: number;
  initialSaved: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Button component for saving/unsaving colleges
 */
export function SaveCollegeButton({ 
  collegeId, 
  initialSaved = false,
  size = 'md'
}: SaveCollegeButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  
  // Define size classes
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-9 w-9'
  };
  
  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Save/unsave college mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const method = isSaved ? 'DELETE' : 'POST';
      const res = await apiRequest(method, `/api/saved-colleges/${collegeId}`);
      return await res.json();
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      // Invalidate saved colleges query if it exists
      queryClient.invalidateQueries({ queryKey: ['/api/saved-colleges'] });
      
      // Show toast
      toast({
        title: isSaved ? 'College removed' : 'College saved',
        description: isSaved 
          ? 'College has been removed from your saved list' 
          : 'College has been added to your saved list',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update saved colleges',
        variant: 'destructive',
      });
    },
  });

  return (
    <Button
      onClick={() => mutate()}
      disabled={isPending}
      variant="outline"
      size="icon"
      className={`${sizeClasses[size]} rounded-full ${isSaved ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
    >
      <BookmarkIcon className={`${iconSizes[size]} ${isPending ? 'animate-pulse' : ''}`} />
      <span className="sr-only">{isSaved ? 'Unsave' : 'Save'} college</span>
    </Button>
  );
}