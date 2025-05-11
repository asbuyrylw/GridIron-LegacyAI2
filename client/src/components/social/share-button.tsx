import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Link2, Copy, Check, Twitter, Facebook, Linkedin, Mail, Clipboard } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareButton({ title, text, url, size = "default" }: ShareButtonProps) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState(url || window.location.href);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard"
      });
      
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    });
  };
  
  // Handle share via Web Share API
  const handleShareAPI = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: shareUrl
      }).then(() => {
        setIsDialogOpen(false);
      }).catch((error) => {
        console.error("Error sharing:", error);
      });
    } else {
      setIsDialogOpen(true);
    }
  };
  
  // Handle share via platforms
  const handlePlatformShare = (platform: string) => {
    let platformUrl = "";
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);
    const encodedTitle = encodeURIComponent(title);
    
    switch (platform) {
      case "twitter":
        platformUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "facebook":
        platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        platformUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "email":
        platformUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      default:
        break;
    }
    
    if (platformUrl) {
      window.open(platformUrl, "_blank");
      setIsDialogOpen(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="ghost" 
        size={size} 
        className="flex items-center gap-1"
        onClick={handleShareAPI}
      >
        <Share2 className="h-4 w-4" />
        {size !== "icon" && <span>{size === "sm" ? "Share" : "Share"}</span>}
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share</DialogTitle>
            <DialogDescription>
              Share this {title.toLowerCase()} with others via social media or direct link
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 mt-2">
            <div className="grid flex-1 gap-2">
              <label className="text-sm font-medium leading-none">
                Share link
              </label>
              <Input
                value={shareUrl}
                onChange={(e) => setShareUrl(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <Button 
              type="button" 
              size="sm" 
              className="px-3 h-10"
              onClick={handleCopy}
            >
              {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-2">Share via</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => handlePlatformShare("twitter")}
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => handlePlatformShare("facebook")}
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => handlePlatformShare("linkedin")}
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => handlePlatformShare("email")}
              >
                <Mail className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={handleCopy}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <DialogTrigger asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogTrigger>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}