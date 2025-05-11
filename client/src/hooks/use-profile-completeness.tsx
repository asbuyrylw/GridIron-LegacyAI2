import { useEffect, useState } from "react";
import { OnboardingData } from "@shared/schema";

export interface ProfileSection {
  name: string;
  isComplete: boolean;
  weight: number; // Weight/importance of this section in the overall percentage
}

export function useProfileCompleteness(formData: Partial<OnboardingData> = {}) {
  const [sections, setSections] = useState<ProfileSection[]>([
    { name: "Personal Info", isComplete: false, weight: 15 },
    { name: "Football Info", isComplete: false, weight: 15 },
    { name: "Athletic Metrics", isComplete: false, weight: 15 },
    { name: "Academic Profile", isComplete: false, weight: 15 },
    { name: "Strength & Conditioning", isComplete: false, weight: 15 },
    { name: "Nutrition", isComplete: false, weight: 10 },
    { name: "Recruiting Goals", isComplete: false, weight: 15 },
  ]);

  // Calculate the completeness percentage
  const totalWeight = sections.reduce((acc, section) => acc + section.weight, 0);
  const completedWeight = sections
    .filter(section => section.isComplete)
    .reduce((acc, section) => acc + section.weight, 0);
  
  const percentage = Math.round((completedWeight / totalWeight) * 100);

  // Update section completion status based on formData
  useEffect(() => {
    if (!formData) return;

    const updatedSections = [...sections];
    
    // Check each section and update its completion status
    if (formData.personalInfo) {
      const requiredFields = [
        'firstName', 'lastName', 'dateOfBirth', 'school', 'graduationYear'
      ];
      updatedSections[0].isComplete = requiredFields.every(
        field => !!formData.personalInfo?.[field as keyof typeof formData.personalInfo]
      );
    }
    
    if (formData.footballInfo) {
      const requiredFields = ['position', 'yearsPlayed', 'teamLevel'];
      updatedSections[1].isComplete = requiredFields.every(
        field => !!formData.footballInfo?.[field as keyof typeof formData.footballInfo]
      );
    }
    
    if (formData.athleticMetrics) {
      const requiredFields = ['height', 'weight', 'fortyYard'];
      updatedSections[2].isComplete = requiredFields.every(
        field => !!formData.athleticMetrics?.[field as keyof typeof formData.athleticMetrics]
      );
    }
    
    if (formData.academicProfile) {
      const requiredFields = ['gpa'];
      updatedSections[3].isComplete = requiredFields.every(
        field => !!formData.academicProfile?.[field as keyof typeof formData.academicProfile]
      );
    }
    
    if (formData.strengthConditioning) {
      const requiredFields = ['yearsTraining', 'daysPerWeek'];
      updatedSections[4].isComplete = requiredFields.every(
        field => !!formData.strengthConditioning?.[field as keyof typeof formData.strengthConditioning]
      );
    }
    
    if (formData.nutrition) {
      const requiredFields = ['dietType'];
      updatedSections[5].isComplete = requiredFields.every(
        field => !!formData.nutrition?.[field as keyof typeof formData.nutrition]
      );
    }
    
    if (formData.recruitingGoals) {
      const requiredFields = ['desiredDivision'];
      updatedSections[6].isComplete = requiredFields.every(
        field => !!formData.recruitingGoals?.[field as keyof typeof formData.recruitingGoals]
      );
    }
    
    setSections(updatedSections);
  }, [formData]);

  return {
    sections,
    percentage,
    completedSections: sections.filter(section => section.isComplete).length,
    totalSections: sections.length,
  };
}