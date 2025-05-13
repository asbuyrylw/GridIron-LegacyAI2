import type { GrowthPrediction } from "@shared/schema";

// Input types for height prediction calculations
export interface HeightPredictionInputs {
  gender: "male" | "female";
  age: number;
  currentHeight: number; // in inches
  currentWeight: number; // in pounds
  motherHeight: number; // in inches
  fatherHeight: number; // in inches
  birthDate: Date;
}

/**
 * Convert height from inches to a formatted string (feet and inches)
 */
export function formatHeight(heightInInches: number): string {
  const feet = Math.floor(heightInInches / 12);
  const inches = Math.round(heightInInches % 12);
  return `${feet}'${inches}"`;
}

/**
 * Convert centimeters to inches
 */
export function cmToInches(cm: number): number {
  return cm / 2.54;
}

/**
 * Convert inches to centimeters
 */
export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

/**
 * Convert kilograms to pounds
 */
export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

/**
 * Convert pounds to kilograms
 */
export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

/**
 * Calculate age in years from birth date
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Use the Khamis-Roche method to predict adult height
 * Reference: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2693322/
 * 
 * This is for children between 5-18 years old
 */
export function predictAdultHeight(inputs: HeightPredictionInputs): GrowthPrediction {
  const { gender, age, currentHeight, currentWeight, motherHeight, fatherHeight } = inputs;
  
  // Calculate mid-parent height
  const midParentHeight = gender === "male" 
    ? (fatherHeight + motherHeight + 5) / 2  // Boys: add 5 inches to mother's height
    : (fatherHeight - 5 + motherHeight) / 2; // Girls: subtract 5 inches from father's height
  
  // Calculate predicted adult height using Khamis-Roche method
  let predictedHeightInches = 0;

  if (gender === "male") {
    // Male calculation
    predictedHeightInches = -9.11 + 
      0.23 * currentWeight +
      0.74 * currentHeight + 
      0.38 * midParentHeight;
      
    // Apply age adjustment
    if (age <= 10) {
      predictedHeightInches *= 1.15;
    } else if (age <= 13) {
      predictedHeightInches *= 1.10;
    } else if (age <= 16) {
      predictedHeightInches *= 1.05;
    }
  } else {
    // Female calculation
    predictedHeightInches = -9.59 + 
      0.19 * currentWeight +
      0.73 * currentHeight + 
      0.42 * midParentHeight;
      
    // Apply age adjustment - females generally complete growth earlier
    if (age <= 9) {
      predictedHeightInches *= 1.12;
    } else if (age <= 11) {
      predictedHeightInches *= 1.07;
    } else if (age <= 13) {
      predictedHeightInches *= 1.03;
    }
  }
  
  // Round to nearest quarter inch
  predictedHeightInches = Math.round(predictedHeightInches * 4) / 4;
  
  // Calculate percentage of adult height reached
  const percentComplete = Math.min(100, Math.round((currentHeight / predictedHeightInches) * 100));
  
  // Calculate growth remaining in inches
  const growthRemaining = Math.max(0, predictedHeightInches - currentHeight);
  
  // Convert to metric
  const predictedHeightCm = inchesToCm(predictedHeightInches);
  
  // Calculate range (±2 inches)
  const predictionRange = `${formatHeight(predictedHeightInches - 2)} - ${formatHeight(predictedHeightInches + 2)}`;
  
  // Determine recommended positions based on predicted height
  const recommendedPositions = getRecommendedPositions(gender, predictedHeightInches);
  
  return {
    predictedHeight: formatHeight(predictedHeightInches),
    predictedHeightCm: Math.round(predictedHeightCm),
    percentComplete,
    growthRemaining,
    predictedRange: predictionRange,
    recommendedPositions,
    calculatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Get list of recommended football positions based on predicted adult height
 */
function getRecommendedPositions(gender: "male" | "female", heightInches: number): string[] {
  // Only provide position recommendations for males for football
  if (gender !== "male") {
    return [];
  }
  
  // Positions by height ranges (in inches)
  const positions = [
    { min: 77, max: 85, positions: ["Offensive Tackle", "Defensive End"] },
    { min: 74, max: 80, positions: ["Tight End", "Defensive End", "Offensive Tackle"] },
    { min: 72, max: 78, positions: ["Quarterback", "Tight End", "Linebacker", "Defensive End"] },
    { min: 70, max: 76, positions: ["Quarterback", "Wide Receiver", "Safety", "Cornerback", "Linebacker"] },
    { min: 68, max: 74, positions: ["Running Back", "Wide Receiver", "Cornerback", "Safety"] },
    { min: 65, max: 71, positions: ["Running Back", "Slot Receiver", "Cornerback"] },
    { min: 60, max: 70, positions: ["Running Back", "Slot Receiver", "Kicker"] }
  ];
  
  // Find matching position ranges
  let recommendedPositions: string[] = [];
  
  for (const range of positions) {
    if (heightInches >= range.min && heightInches <= range.max) {
      recommendedPositions = [...recommendedPositions, ...range.positions];
    }
  }
  
  // Remove duplicates
  recommendedPositions = Array.from(new Set(recommendedPositions));
  
  return recommendedPositions;
}