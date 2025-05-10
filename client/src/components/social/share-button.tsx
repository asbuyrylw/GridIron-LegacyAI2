import React, { useState } from 'react';
import { Share2, CheckIcon, CopyIcon, Facebook, Twitter, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconWrapper } from "@/components/ui/icon-wrapper";
import { SOCIAL_PLATFORMS } from "@/lib/social-platforms";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareButton({ 
  title, 
  text, 
  url = window.location.href,
  variant = "outline",
  size = "default"
}: ShareButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const shareData = {
    title,
    text,
    url
  };
  
  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Content has been shared through your device",
        });
        setIsOpen(false);
      } else {
        throw new Error("Web Share API not supported");
      }
    } catch (error) {
      // Fall back to showing the popover
      setIsOpen(true);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Link has been copied to clipboard",
      action: (
        <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
          <CheckIcon className="h-4 w-4" />
        </div>
      ),
    });
    setIsOpen(false);
  };
  
  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
    setIsOpen(false);
  };
  
  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
    setIsOpen(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          onClick={handleNativeShare}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          {size !== "icon" && "Share"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" side="top">
        <div className="space-y-2">
          <div className="text-sm font-medium">Share this content</div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="flex flex-col items-center p-3 h-auto" onClick={shareToTwitter}>
              <IconWrapper 
                icon={SOCIAL_PLATFORMS.find(p => p.id === "twitter")?.icon || Twitter} 
                className="h-5 w-5 mb-1"
                style={{ color: "#1DA1F2" }}
              />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-3 h-auto" onClick={shareToFacebook}>
              <IconWrapper 
                icon={SOCIAL_PLATFORMS.find(p => p.id === "facebook")?.icon || Facebook} 
                className="h-5 w-5 mb-1"
                style={{ color: "#4267B2" }}
              />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-3 h-auto" onClick={copyToClipboard}>
              <Link className="h-5 w-5 mb-1" />
              <span className="text-xs">Copy link</span>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}