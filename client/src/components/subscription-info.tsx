import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function SubscriptionInfo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const athlete = user?.athlete;
  
  const handleUpgrade = () => {
    toast({
      title: "Upgrade Plan",
      description: "Subscription upgrade feature coming soon!",
    });
  };
  
  if (!athlete) return null;
  
  // Determine subscription information
  const subscriptionTier = athlete.subscriptionTier || "free";
  let tierName, price, renewalDate;
  
  switch (subscriptionTier) {
    case "starter":
      tierName = "Starter Plan";
      price = "$12.99/month";
      renewalDate = athlete.subscriptionRenewal || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      break;
    case "elite":
      tierName = "Elite Plan";
      price = "$24.99/month";
      renewalDate = athlete.subscriptionRenewal || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      tierName = "Free Trial";
      price = "Free";
      renewalDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  return (
    <section className="mb-12">
      <Card className="bg-gradient-to-r from-primary to-primary-light text-white">
        <CardContent className="py-4">
          <h3 className="font-montserrat font-bold mb-3">{tierName}</h3>
          {subscriptionTier !== "elite" && (
            <p className="text-sm mb-4">
              Upgrade to Elite for advanced analytics and automatic social media posting.
            </p>
          )}
          <div className="flex justify-between items-center">
            <div className="text-xs">
              <span className="opacity-80">{price}</span>
              {subscriptionTier !== "free" && (
                <div className="mt-1">
                  Renews on {format(new Date(renewalDate), "MMM d, yyyy")}
                </div>
              )}
            </div>
            {subscriptionTier !== "elite" && (
              <Button 
                className="bg-amber-400 hover:bg-amber-500 text-primary font-semibold text-sm"
                onClick={handleUpgrade}
              >
                Upgrade Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
