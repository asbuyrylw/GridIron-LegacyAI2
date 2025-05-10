import { useState } from "react";
import { SOCIAL_PLATFORMS, SocialPlatform } from "@/lib/social-platforms";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CheckIcon, ImageIcon, Calendar, Image, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Toggle } from "@/components/ui/toggle";

interface SocialConnection {
  platform: string;
  username: string;
  connected: boolean;
}

interface SocialPostCreatorProps {
  connections: SocialConnection[];
}

export function SocialPostCreator({ connections }: SocialPostCreatorProps) {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const charactersRemaining = 280 - content.length;
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Toggle platform selection
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };
  
  // Clear the form
  const clearForm = () => {
    setContent("");
    setSelectedPlatforms([]);
    setMediaFile(null);
    setMediaPreview(null);
    setScheduledDate(undefined);
  };
  
  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("platforms", JSON.stringify(selectedPlatforms));
      
      if (scheduledDate) {
        formData.append("scheduledFor", scheduledDate.toISOString());
      }
      
      if (mediaFile) {
        formData.append("media", mediaFile);
      }
      
      const response = await fetch("/api/social/posts", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: scheduledDate ? "Post scheduled" : "Post created",
        description: scheduledDate 
          ? `Your post has been scheduled for ${format(scheduledDate, "PPP")}` 
          : "Your post has been created and will be shared shortly",
        duration: 5000,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/social/posts"] });
      clearForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    },
  });
  
  // Check if form is valid
  const isValid = content.trim().length > 0 && selectedPlatforms.length > 0;

  // Get connected platforms
  const connectedPlatforms = connections
    .filter(conn => conn.connected)
    .map(conn => SOCIAL_PLATFORMS.find(p => p.id === conn.platform))
    .filter(Boolean) as SocialPlatform[];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Social Media Post</CardTitle>
        <CardDescription>
          Share your football journey with coaches, teammates, and fans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Text Area */}
          <div>
            <Textarea
              placeholder="What's on your mind? Share your football journey..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={280}
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-end mt-1">
              <span 
                className={cn(
                  "text-xs", 
                  charactersRemaining < 0 ? "text-red-500" : 
                  charactersRemaining < 20 ? "text-amber-500" : 
                  "text-muted-foreground"
                )}
              >
                {charactersRemaining} characters remaining
              </span>
            </div>
          </div>
          
          {/* Media Preview */}
          {mediaPreview && (
            <div className="relative rounded-md overflow-hidden border">
              <img 
                src={mediaPreview} 
                alt="Upload preview" 
                className="w-full h-auto max-h-[200px] object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={() => {
                  setMediaFile(null);
                  setMediaPreview(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </Button>
            </div>
          )}
          
          {/* Platform Selection */}
          <div>
            <div className="text-sm font-medium mb-2">Share to</div>
            <div className="flex flex-wrap gap-2">
              {connectedPlatforms.length > 0 ? (
                connectedPlatforms.map(platform => (
                  <Toggle
                    key={platform.id}
                    pressed={selectedPlatforms.includes(platform.id)}
                    onPressedChange={() => togglePlatform(platform.id)}
                    className={cn(
                      "data-[state=on]:bg-white data-[state=on]:text-primary-foreground border",
                      selectedPlatforms.includes(platform.id) && `border-${platform.id} bg-${platform.id}/10`
                    )}
                    style={{
                      borderColor: selectedPlatforms.includes(platform.id) ? platform.color : undefined,
                      backgroundColor: selectedPlatforms.includes(platform.id) ? `${platform.color}20` : undefined
                    }}
                  >
                    <platform.icon className="h-4 w-4 mr-2" style={{ color: platform.color }} />
                    {platform.name}
                  </Toggle>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No social platforms connected. Please connect your accounts in settings.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          {/* Media Upload Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => document.getElementById("media-upload")?.click()}
            title="Add image or video"
          >
            <Image className="h-4 w-4" />
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </Button>
          
          {/* Schedule Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                title="Schedule post"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
              {scheduledDate && (
                <div className="p-3 border-t">
                  <div className="text-sm font-medium mb-1">Scheduled for:</div>
                  <div className="text-sm">{format(scheduledDate, "PPP")}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setScheduledDate(undefined)}
                  >
                    Clear schedule
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearForm}
          >
            Clear
          </Button>
          <Button
            disabled={!isValid || createPostMutation.isPending}
            onClick={() => createPostMutation.mutate()}
          >
            {createPostMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {scheduledDate ? 'Scheduling...' : 'Posting...'}
              </>
            ) : (
              <>
                {scheduledDate ? 'Schedule Post' : 'Post Now'}
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}