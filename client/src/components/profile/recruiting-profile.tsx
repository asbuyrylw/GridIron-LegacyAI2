import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Globe, Share2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { CombineMetric } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function RecruitingProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const athlete = user?.athlete;
  const athleteId = athlete?.id;
  
  const { data: metrics } = useQuery<CombineMetric[]>({
    queryKey: [`/api/athlete/${athleteId}/metrics`],
    enabled: !!athleteId,
  });
  
  const latestMetrics = metrics?.[0];
  
  const handleShare = () => {
    toast({
      title: "Share Profile",
      description: "Profile sharing feature coming soon!",
    });
  };
  
  if (!athlete) return null;
  
  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-montserrat font-bold">Recruiting Profile</h2>
        <Link href="/profile">
          <Button 
            variant="ghost" 
            className="text-primary dark:text-accent font-semibold text-sm flex items-center gap-1"
          >
            <span>Edit Profile</span>
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-300 mr-4 flex items-center justify-center overflow-hidden">
              <span className="text-3xl text-gray-500">
                {athlete.firstName?.charAt(0) || athlete.lastName?.charAt(0) || "?"}
              </span>
            </div>
            <div>
              <h3 className="font-montserrat font-bold text-lg">
                {`${athlete.firstName || ""} ${athlete.lastName || ""}`}
              </h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <span className="mr-3">{athlete.position} | {athlete.grade ? `Class of ${athlete.graduationYear}` : "N/A"}</span>
                <span>{athlete.school || "School not set"}</span>
              </div>
              <div className="text-xs text-primary dark:text-accent font-semibold mt-1">
                GPA: {athlete.gpa || "N/A"} | ACT: {athlete.actScore || "N/A"}
              </div>
            </div>
          </div>
          
          <h4 className="font-montserrat font-semibold text-sm uppercase text-gray-500 mb-2">Key Combine Stats</h4>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="p-2 border border-gray-200 dark:border-gray-700 rounded text-center">
              <div className="text-xs text-gray-500">40-Yard</div>
              <div className="font-mono font-semibold">
                {latestMetrics?.fortyYard ? `${latestMetrics.fortyYard}s` : "N/A"}
              </div>
            </div>
            <div className="p-2 border border-gray-200 dark:border-gray-700 rounded text-center">
              <div className="text-xs text-gray-500">Shuttle</div>
              <div className="font-mono font-semibold">
                {latestMetrics?.shuttle ? `${latestMetrics.shuttle}s` : "N/A"}
              </div>
            </div>
            <div className="p-2 border border-gray-200 dark:border-gray-700 rounded text-center">
              <div className="text-xs text-gray-500">Vertical</div>
              <div className="font-mono font-semibold">
                {latestMetrics?.verticalJump ? `${latestMetrics.verticalJump}"` : "N/A"}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Globe className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-sm">
                {athlete.profileVisibility ? "Profile Visible" : "Profile Private"}
              </span>
            </div>
            <Button 
              size="sm"
              className="text-xs"
              onClick={handleShare}
            >
              <Share2 className="h-3 w-3 mr-1" />
              Share Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
