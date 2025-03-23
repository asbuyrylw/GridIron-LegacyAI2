import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Award, Trophy } from "lucide-react";
import { SocialConnections } from "@/components/social/social-connections";
import { SocialPosts } from "@/components/social/social-posts";
import { Achievements } from "@/components/gamification/achievements";
import { Leaderboards } from "@/components/gamification/leaderboards";

export default function SocialAchievementsPage() {
  return (
    <div className="min-h-screen pb-16 relative">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 pb-20">
        <div className="flex items-center mb-6">
          <Trophy className="h-6 w-6 mr-2" />
          <h1 className="text-2xl md:text-3xl font-montserrat font-bold">Social & Achievements</h1>
        </div>
        
        <Tabs defaultValue="social" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="social">
              <Share2 className="h-4 w-4 mr-2" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="h-5 w-5 mr-2 text-primary" />
                  Social Media Connections
                </CardTitle>
                <CardDescription>
                  Connect your social media accounts to share your athletic journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SocialConnections />
              </CardContent>
            </Card>
            
            <SocialPosts />
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-6">
            <Achievements />
            <Leaderboards />
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}