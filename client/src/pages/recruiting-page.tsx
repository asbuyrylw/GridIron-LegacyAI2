import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecruitingProfile } from "@/components/recruiting/recruiting-profile";
import { RecruitingAnalytics } from "@/components/recruiting/recruiting-analytics";
import { MessageSquare, UserRoundSearch, ArrowUpFromLine, Share2, Loader2 } from "lucide-react";
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
import { 
  useRecruitingAnalytics, 
  useRecruitingMessages,
  useSendRecruitingMessage,
  useShareRecruitingProfile 
} from "@/hooks/use-recruiting-hooks";

export default function RecruitingPage() {
  const { user } = useAuth();
  const athleteId = user?.athlete?.id;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [sharePlatform, setSharePlatform] = useState<string>("email");
  
  // Fetch recruiting analytics data
  const { 
    data: analytics, 
    isLoading: isLoadingAnalytics 
  } = useRecruitingAnalytics(athleteId as number);
  
  // Fetch recruiting messages
  const { 
    data: messages, 
    isLoading: isLoadingMessages 
  } = useRecruitingMessages(athleteId as number);
  
  // Share profile mutation
  const shareProfile = useShareRecruitingProfile(athleteId as number);
  
  const handleShareProfile = () => {
    if (athleteId) {
      shareProfile.mutate({
        platform: sharePlatform,
        message: shareMessage
      });
      setShowShareDialog(false);
    }
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
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
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Recruiting Profile</h2>
            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-6">
                  Your recruiting profile is what college coaches and recruiters will see. 
                  Make sure it's complete and up-to-date.
                </p>
                {/* Profile form would go here */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile fields would go here */}
                    <Button variant="default" className="mt-4">
                      Save Profile
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="analytics" className="m-0">
        {isLoadingAnalytics ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <RecruitingAnalytics
            profileViews={analytics?.profileViews || 0}
            interestLevel={analytics?.interestLevel || 0}
            bookmarksCount={analytics?.bookmarksCount || 0}
            messagesSent={analytics?.messagesSent || 0}
            viewsOverTime={analytics?.viewsOverTime || []}
            interestBySchoolType={analytics?.interestBySchoolType || []}
            interestByPosition={analytics?.interestByPosition || []}
            interestByRegion={analytics?.interestByRegion || []}
          />
        )}
      </TabsContent>
      
      <TabsContent value="messages" className="m-0">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Recruiting Messages</h2>
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-4 border rounded-lg ${message.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                >
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">{message.subject || "No Subject"}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(message.sentAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-gray-700 mb-2">{message.content}</div>
                  <div className="text-sm text-gray-500">
                    From: {message.schoolName || "School Coach"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 border text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium mb-2">No Messages Yet</h3>
            <p className="text-gray-500">
              When coaches reach out to you, you'll see their messages here.
            </p>
          </div>
        )}
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
              <label htmlFor="platform" className="text-sm font-medium">
                Share via
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={sharePlatform === "email" ? "default" : "outline"}
                  onClick={() => setSharePlatform("email")}
                  className="w-full"
                >
                  Email
                </Button>
                <Button 
                  variant={sharePlatform === "twitter" ? "default" : "outline"}
                  onClick={() => setSharePlatform("twitter")}
                  className="w-full"
                >
                  Twitter
                </Button>
                <Button 
                  variant={sharePlatform === "link" ? "default" : "outline"}
                  onClick={() => setSharePlatform("link")}
                  className="w-full"
                >
                  Copy Link
                </Button>
              </div>
            </div>
            
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
              <Button 
                onClick={handleShareProfile}
                disabled={shareProfile.isPending}
              >
                {shareProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    {sharePlatform === "email" 
                      ? "Share with Coaches" 
                      : sharePlatform === "twitter" 
                        ? "Share on Twitter"
                        : "Copy Link"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}