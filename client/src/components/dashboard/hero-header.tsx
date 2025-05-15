import { useAuth } from "@/hooks/use-auth";
import { DailyQuote } from "./daily-quote";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Upload, Edit } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface HeroHeaderProps {
  backgroundImage?: string;
  reminderItems?: { time: string; title: string; icon?: React.ReactNode }[];
  onImageChange?: (imageUrl: string) => void;
}

export function HeroHeader({ backgroundImage = "/assets/bengals-stadium.jpg", reminderItems = [], onImageChange }: HeroHeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Handle image uploads by converting to base64 data URLs
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Convert the file to a data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      // Close the dialog
      setUploadDialogOpen(false);
      
      // Call parent handler if provided
      if (onImageChange) {
        onImageChange(dataUrl);
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  const firstName = user?.athlete?.firstName || user?.firstName || "Athlete";
  
  return (
    <section className="w-full mb-8 relative">
      <div 
        className="w-full h-64 relative rounded-none overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        
        {/* Content */}
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="relative z-10 max-w-5xl flex flex-col md:flex-row items-start md:items-center justify-between w-full">
            {/* Welcome message */}
            <div className="text-white mb-4 md:mb-0">
              <h1 className="text-3xl font-bold mb-4">Welcome back, {firstName}!</h1>
              
              <div className="max-w-md">
                <div className="bg-blue-100/90 backdrop-blur-sm p-3 rounded-lg shadow-sm max-w-xs">
                  <DailyQuote customClasses="text-gray-800 text-sm" />
                </div>
              </div>
            </div>
            
            {/* Reminders */}
            {reminderItems.length > 0 && (
              <div className="flex flex-col gap-2 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <h2 className="font-semibold text-gray-800">Reminders</h2>
                {reminderItems.map((item, index) => (
                  <div key={`reminder-${index}`} className="flex items-center gap-2 text-sm">
                    {item.icon || <Clock className="h-4 w-4 text-primary" />}
                    <span className="text-gray-700">{item.title}</span>
                    <span className="font-semibold">{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Edit/Upload button */}
        <Button 
          variant="secondary" 
          size="xs"
          className="absolute bottom-3 right-3 opacity-70 hover:opacity-100 transition-opacity text-xs py-1 px-2"
          onClick={() => setUploadDialogOpen(true)}
        >
          <Edit className="h-3 w-3 mr-1" />
          Change BG
        </Button>
      </div>
      
      {/* Upload dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogTitle>Change Stadium Background</DialogTitle>
          <DialogDescription>
            Upload an image of your favorite stadium or football field. For best results, use a landscape-oriented image.
          </DialogDescription>
          
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-3">
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                </div>
                <input 
                  id="image-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}