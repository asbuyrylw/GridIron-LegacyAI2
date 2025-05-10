import React, { useState } from "react";
import { SocialPlatform, SOCIAL_PLATFORMS, formatSocialMediaUrl } from "@/lib/social-platforms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Copy, Check, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialLink {
  platform: string;
  username: string;
}

interface SocialLinksProps {
  links: SocialLink[];
  editable?: boolean;
  onSave?: (links: SocialLink[]) => void;
  title?: string;
  description?: string;
}

export function SocialLinks({ 
  links = [], 
  editable = false,
  onSave,
  title = "Social Media Profiles",
  description = "Connect with your social media accounts"
}: SocialLinksProps) {
  const [editMode, setEditMode] = useState(false);
  const [editableLinks, setEditableLinks] = useState<SocialLink[]>(links);
  const { toast } = useToast();
  
  // Function to copy link to clipboard
  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "The link has been copied to your clipboard",
      duration: 3000,
    });
  };
  
  // Function to open link in a new tab
  const openLink = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };
  
  // Function to update a link during edit mode
  const updateLink = (index: number, username: string) => {
    const newLinks = [...editableLinks];
    newLinks[index] = {
      ...newLinks[index],
      username
    };
    setEditableLinks(newLinks);
  };
  
  // Function to save changes
  const saveChanges = () => {
    if (onSave) {
      onSave(editableLinks);
    }
    setEditMode(false);
    toast({
      title: "Changes saved",
      description: "Your social media links have been updated",
      duration: 3000,
    });
  };
  
  // Function to cancel changes
  const cancelChanges = () => {
    setEditableLinks(links);
    setEditMode(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {editable && !editMode && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Links
            </Button>
          )}
          {editable && editMode && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={cancelChanges}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={saveChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {editMode ? (
            // Edit mode display
            <>
              {SOCIAL_PLATFORMS.map((platform, index) => {
                const existingLink = editableLinks.find(link => link.platform === platform.id);
                return (
                  <div key={platform.id} className="space-y-2">
                    <Label htmlFor={`social-${platform.id}`} className="flex items-center gap-2">
                      <div className="h-5 w-5" style={{ color: platform.color }}>
                        {React.createElement(platform.icon)}
                      </div>
                      {platform.name}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`social-${platform.id}`}
                        placeholder={`Enter your ${platform.name} username`}
                        value={existingLink?.username || ''}
                        onChange={(e) => {
                          const linkIndex = editableLinks.findIndex(link => link.platform === platform.id);
                          if (linkIndex >= 0) {
                            updateLink(linkIndex, e.target.value);
                          } else {
                            setEditableLinks([...editableLinks, { platform: platform.id, username: e.target.value }]);
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{platform.description}</p>
                    {index < SOCIAL_PLATFORMS.length - 1 && <Separator className="my-4" />}
                  </div>
                );
              })}
            </>
          ) : (
            // View mode display
            <>
              {links.length > 0 ? (
                <div className="grid gap-4">
                  {links
                    .filter(link => link.username)
                    .map((link) => {
                      const platform = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
                      if (!platform || !link.username) return null;
                      
                      const fullUrl = formatSocialMediaUrl(platform, link.username);
                      
                      return (
                        <div key={link.platform} className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${platform.color}20` }}>
                              <div className="h-5 w-5" style={{ color: platform.color }}>
                                {React.createElement(platform.icon)}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {platform.name}
                                <Badge variant="outline" className="text-xs">
                                  @{link.username}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => copyToClipboard(fullUrl)}
                              title="Copy link"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => openLink(fullUrl)}
                              title="Open link"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </div>
                  <h3 className="font-medium mb-1">No social profiles connected</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                    Connect your social media accounts to share your football journey with coaches, teammates, and fans
                  </p>
                  {editable && (
                    <Button 
                      variant="outline" 
                      onClick={() => setEditMode(true)}
                    >
                      Connect Accounts
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}