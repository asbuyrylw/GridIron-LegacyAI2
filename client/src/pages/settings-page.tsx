import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  LogOut,
  Bell,
  CreditCard,
  Shield,
  HelpCircle,
  FileText,
  Lock,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleSubscriptionManage = () => {
    toast({
      title: "Subscription Management",
      description: "This feature will be available soon.",
    });
  };
  
  const athlete = user?.athlete;
  const subscriptionTier = athlete?.subscriptionTier || "free";
  
  let tierName;
  switch (subscriptionTier) {
    case "starter":
      tierName = "Starter Plan";
      break;
    case "elite":
      tierName = "Elite Plan";
      break;
    default:
      tierName = "Free Trial";
  }
  
  return (
    <div className="min-h-screen pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        <div className="flex items-center mb-6">
          <Settings className="h-6 w-6 mr-2" />
          <h1 className="text-2xl md:text-3xl font-montserrat font-bold">Settings</h1>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username</span>
                <span className="font-medium">{user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Type</span>
                <span className="font-medium">{user?.userType}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => toast({ title: "Coming Soon", description: "This feature will be available in a future update." })}>
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md bg-primary/5">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Current Plan</span>
                  <span className="font-medium text-primary">{tierName}</span>
                </div>
                {subscriptionTier === "free" ? (
                  <p className="text-sm text-muted-foreground">Upgrade to unlock advanced features and tools.</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {subscriptionTier === "starter"
                      ? "Your subscription renews on the 15th of each month."
                      : "Your subscription includes all premium features and early access."}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSubscriptionManage}>
                Manage Subscription
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive notifications about your progress and Coach Legacy tips
                  </div>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Marketing Emails</div>
                  <div className="text-sm text-muted-foreground">
                    Receive emails about new features and special offers
                  </div>
                </div>
                <Switch
                  checked={marketingEnabled}
                  onCheckedChange={setMarketingEnabled}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Coming Soon", description: "This feature will be available in a future update." })}>
                <FileText className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Coming Soon", description: "This feature will be available in a future update." })}>
                <FileText className="h-4 w-4 mr-2" />
                Terms of Service
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Coming Soon", description: "This feature will be available in a future update." })}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Help & Support
              </Button>
            </CardContent>
          </Card>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                <AlertDialogDescription>
                  You'll need to sign back in to access your GridIron LegacyAI account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
