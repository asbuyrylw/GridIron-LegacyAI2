import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { ArrowRight, Calendar, FileText, Loader2, Mail } from "lucide-react";

interface ParentReportGeneratorProps {
  athleteId: number;
}

type ReportFrequency = "once" | "weekly" | "biweekly" | "monthly";
type ReportPeriod = "week" | "month" | "season" | "year";
type ReportFormat = "email" | "pdf" | "both";

interface ReportConfig {
  frequency: ReportFrequency;
  period: ReportPeriod;
  format: ReportFormat;
  includeMetrics: boolean;
  includeAchievements: boolean;
  includeTraining: boolean;
  includeNutrition: boolean;
  includeAcademic: boolean;
  scheduler: {
    startDate: Date | undefined;
    specificDay?: string;
  };
}

export function ParentReportGenerator({ athleteId }: ParentReportGeneratorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"once" | "recurring">("once");
  
  // Report configuration state
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    frequency: "once",
    period: "month",
    format: "email",
    includeMetrics: true,
    includeAchievements: true,
    includeTraining: true,
    includeNutrition: true,
    includeAcademic: true,
    scheduler: {
      startDate: undefined,
    },
  });
  
  // Report generation mutation
  const generateReportMutation = useMutation({
    mutationFn: async (config: ReportConfig) => {
      const response = await apiRequest(
        "POST", 
        `/api/athlete/${athleteId}/parent-report`,
        { ...config, athleteId }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: activeTab === "once" ? "Report generated successfully" : "Recurring reports scheduled",
        description: activeTab === "once" 
          ? "The report has been sent to the parent's email."
          : `The ${reportConfig.frequency} reports will be sent starting ${reportConfig.scheduler.startDate?.toLocaleDateString()}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate report",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle checkbox change
  const handleCheckboxChange = (field: keyof Omit<ReportConfig, "frequency" | "period" | "format" | "scheduler">) => {
    setReportConfig((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };
  
  // Handle select change
  const handleSelectChange = (field: "frequency" | "period" | "format", value: string) => {
    setReportConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    setReportConfig((prev) => ({
      ...prev,
      scheduler: {
        ...prev.scheduler,
        startDate: date,
      },
    }));
  };
  
  // Handle day of week selection
  const handleDaySelect = (day: string) => {
    setReportConfig((prev) => ({
      ...prev,
      scheduler: {
        ...prev.scheduler,
        specificDay: day,
      },
    }));
  };
  
  // Handle report generation
  const handleGenerateReport = () => {
    // Set the frequency based on active tab
    const config = {
      ...reportConfig,
      frequency: activeTab === "recurring" ? reportConfig.frequency : "once",
    };
    
    // Validate configuration
    if (activeTab === "recurring" && !config.scheduler.startDate) {
      toast({
        title: "Missing start date",
        description: "Please select a start date for recurring reports.",
        variant: "destructive",
      });
      return;
    }
    
    // Execute the mutation
    generateReportMutation.mutate(config);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Parent Report Generator
        </CardTitle>
        <CardDescription>
          Generate detailed reports for parents to track athlete progress
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          defaultValue="once" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "once" | "recurring")}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="once">One-Time Report</TabsTrigger>
            <TabsTrigger value="recurring">Recurring Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="once" className="space-y-4">
            <div className="space-y-2">
              <Label>Report Period</Label>
              <Select
                value={reportConfig.period}
                onValueChange={(value) => handleSelectChange("period", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                  <SelectItem value="season">Current Season</SelectItem>
                  <SelectItem value="year">Past Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Delivery Format</Label>
              <Select
                value={reportConfig.format}
                onValueChange={(value) => handleSelectChange("format", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Report</SelectItem>
                  <SelectItem value="pdf">PDF Download</SelectItem>
                  <SelectItem value="both">Both Email & PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="recurring" className="space-y-4">
            <div className="space-y-2">
              <Label>Report Frequency</Label>
              <Select
                value={reportConfig.frequency}
                onValueChange={(value) => handleSelectChange("frequency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <DatePicker
                date={reportConfig.scheduler.startDate}
                setDate={handleDateChange}
                className="w-full"
              />
            </div>
            
            {reportConfig.frequency === "weekly" && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={reportConfig.scheduler.specificDay || "Monday"}
                  onValueChange={handleDaySelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Delivery Format</Label>
              <Select
                value={reportConfig.format}
                onValueChange={(value) => handleSelectChange("format", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Report</SelectItem>
                  <SelectItem value="pdf">PDF Download</SelectItem>
                  <SelectItem value="both">Both Email & PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <div className="pt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Include in Report</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeMetrics" 
                    checked={reportConfig.includeMetrics}
                    onCheckedChange={() => handleCheckboxChange("includeMetrics")}
                  />
                  <Label htmlFor="includeMetrics">Performance Metrics</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeAchievements" 
                    checked={reportConfig.includeAchievements}
                    onCheckedChange={() => handleCheckboxChange("includeAchievements")}
                  />
                  <Label htmlFor="includeAchievements">Achievements</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeTraining" 
                    checked={reportConfig.includeTraining}
                    onCheckedChange={() => handleCheckboxChange("includeTraining")}
                  />
                  <Label htmlFor="includeTraining">Training Activity</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeNutrition" 
                    checked={reportConfig.includeNutrition}
                    onCheckedChange={() => handleCheckboxChange("includeNutrition")}
                  />
                  <Label htmlFor="includeNutrition">Nutrition Plan</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeAcademic" 
                    checked={reportConfig.includeAcademic}
                    onCheckedChange={() => handleCheckboxChange("includeAcademic")}
                  />
                  <Label htmlFor="includeAcademic">Academic Standing</Label>
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          type="button"
          onClick={() => setActiveTab(activeTab === "once" ? "recurring" : "once")}
        >
          {activeTab === "once" ? "Set up Recurring" : "Switch to One-Time"}
        </Button>
        <Button
          type="button"
          onClick={handleGenerateReport}
          disabled={generateReportMutation.isPending}
        >
          {generateReportMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : activeTab === "once" ? (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Generate Report
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Reports
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}