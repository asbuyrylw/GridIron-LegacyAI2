import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/use-user';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, FileText, Calendar, Award, School } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/query-client';
import ApplicationChecklistTab from '@/components/college-applications/application-checklist-tab';
import DocumentUploadsTab from '@/components/college-applications/document-uploads-tab';
import SchoolApplicationsTab from '@/components/college-applications/school-applications-tab';
import AcademicAchievementsTab from '@/components/college-applications/academic-achievements-tab';

export default function CollegeApplicationHubPage() {
  const { user, isLoading: userLoading } = useUser();
  const [activeTab, setActiveTab] = useState('checklist');
  const { toast } = useToast();

  // If the user is not loading and not found, or not an athlete, redirect to login
  if (!userLoading && (!user || user.userType !== 'athlete')) {
    return (
      <div className="container py-10">
        <EmptyPlaceholder
          title="Access Denied"
          description="You need to be logged in as an athlete to access the College Application Hub."
          icon={<FileText className="h-12 w-12 text-muted-foreground" />}
        />
      </div>
    );
  }

  if (userLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const athleteId = user.athlete?.id;

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">College Application Hub</h1>
          <p className="text-muted-foreground">
            Manage your college applications, documents, deadlines, and academic achievements in one place.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="checklist" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Application Checklist
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Uploads
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              School Applications
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Academic Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checklist" className="space-y-4">
            <ApplicationChecklistTab athleteId={athleteId!} />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <DocumentUploadsTab athleteId={athleteId!} />
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <SchoolApplicationsTab athleteId={athleteId!} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <AcademicAchievementsTab athleteId={athleteId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}