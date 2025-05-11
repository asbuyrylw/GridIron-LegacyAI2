import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecruitingProfile } from "@/components/recruiting/recruiting-profile";
import { RecruitingAnalytics } from "@/components/recruiting/recruiting-analytics";
import { LucideBarChart2, UserRoundSearch, ArrowUpFromLine, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRecruitingProfile, useUpdateRecruitingProfile } from "@/hooks/use-recruiting-hooks";

export default function RecruitingPage() {
  const { user } = useAuth();
  const athleteId = user?.athlete?.id;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  
  // Fetch recruiting profile data
  const { data: recruitingProfile, isLoading: isLoadingProfile } = useRecruitingProfile(athleteId);
  const updateProfile = useUpdateRecruitingProfile(athleteId);
  
  const handleSaveProfile = (data: any) => {
    // Call API to save profile
    if (athleteId) {
      updateProfile.mutate(data);
    }
  };
  
  const handleShareProfile = () => {
    // Share functionality would be implemented here
    toast({
      title: "Profile shared",
      description: "Your recruiting profile has been shared with coaches.",
    });
    setShowShareDialog(false);
  };

  return (
    <div className="container px-4 py-6 max-w-6xl">
      <PageHeader
        title="Recruiting Hub"
        description="Manage your recruiting profile and track college interest"
        icon={<UserRoundSearch className="h-6 w-6" />}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto mb-4 md:mb-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="default" 
            className="w-full md:w-auto"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Profile
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full md:w-auto"
            onClick={() => {
              // Generate PDF would be implemented here
              toast({
                title: "Profile exported",
                description: "Your recruiting profile has been exported as PDF.",
              });
            }}
          >
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      
      {!user?.athlete && (
        <Alert className="mb-6">
          <AlertTitle>No athlete profile found</AlertTitle>
          <AlertDescription>
            You need to complete your athlete profile before accessing recruiting features.
          </AlertDescription>
        </Alert>
      )}
      
      <TabsContent value="profile" className="m-0">
        {user?.athlete && (
          <RecruitingProfile
            currentProfile={recruitingProfile}
            athleteId={athleteId}
            onSave={handleSaveProfile}
            isLoading={updateProfile.isPending}
          />
        )}
      </TabsContent>
      
      <TabsContent value="analytics" className="m-0">
        <RecruitingAnalytics
          // Profile stats would be fetched from backend
          profileViews={recruitingProfile?.stats?.profileViews}
          interestLevel={recruitingProfile?.stats?.interestLevel}
          bookmarksCount={recruitingProfile?.stats?.bookmarks}
          messagesSent={recruitingProfile?.stats?.messages}
          // Other analytics data would be passed here
        />
      </TabsContent>
      
      {/* Share Profile Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Recruiting Profile</DialogTitle>
            <DialogDescription>
              Share your profile with coaches and schools to increase your recruiting opportunities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Add a personal message (optional)
              </label>
              <Textarea
                id="message"
                placeholder="I'm interested in your program and would appreciate if you could review my profile..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button onClick={handleShareProfile}>
                <Share2 className="h-4 w-4 mr-2" />
                Share with Selected Coaches
              </Button>
              <Button variant="outline">
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                Get Shareable Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}