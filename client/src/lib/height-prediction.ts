/**
 * Height prediction implementation using the Khamis-Roche method
 */

import { GrowthPrediction } from "@shared/schema";

// Define football positions by height ranges (in inches)
const POSITION_HEIGHT_RANGES = {
  male: {
    "Quarterback (QB)": { min: 72, max: 78 },             // 6'0" to 6'6"
    "Running Back (RB)": { min: 68, max: 73 },            // 5'8" to 6'1"
    "Wide Receiver (WR)": { min: 70, max: 77 },           // 5'10" to 6'5"
    "Tight End (TE)": { min: 74, max: 79 },               // 6'2" to 6'7"
    "Offensive Lineman (OL)": { min: 74, max: 80 },       // 6'2" to 6'8"
    "Defensive Lineman (DL)": { min: 74, max: 79 },       // 6'2" to 6'7"
    "Linebacker (LB)": { min: 72, max: 77 },              // 6'0" to 6'5"
    "Cornerback (CB)": { min: 70, max: 74 },              // 5'10" to 6'2"
    "Safety (S)": { min: 71, max: 76 },                   // 5'11" to 6'4"
    "Kicker/Punter (K/P)": { min: 70, max: 76 }           // 5'10" to 6'4"
  },
  female: {
    "Quarterback (QB)": { min: 66, max: 72 },
    "Running Back (RB)": { min: 62, max: 68 },
    "Wide Receiver (WR)": { min: 65, max: 70 },
    "Tight End (TE)": { min: 68, max: 74 },
    "Offensive Lineman (OL)": { min: 68, max: 74 },
    "Defensive Lineman (DL)": { min: 68, max: 74 },
    "Linebacker (LB)": { min: 66, max: 72 },
    "Cornerback (CB)": { min: 64, max: 70 },
    "Safety (S)": { min: 65, max: 71 },
    "Kicker/Punter (K/P)": { min: 64, max: 70 }
  }
};

// Conversion constants
const CM_TO_INCHES = 0.393701;
const INCHES_TO_CM = 2.54;
const LB_TO_KG = 0.453592;
const KG_TO_LB = 2.20462;

export interface HeightPredictionInputs {
  gender: "male" | "female";
  age: number;
  currentHeight: number;
  currentHeightUnit?: "in" | "cm";
  currentWeight: number;
  currentWeightUnit?: "lb" | "kg";
  motherHeight: number;
  motherHeightUnit?: "in" | "cm";
  fatherHeight: number;
  fatherHeightUnit?: "in" | "cm";
  birthDate: Date;
}

/**
 * Convert height from centimeters to formatted feet and inches
 */
function cmToFeetInches(cm: number): string {
  const inches = cm * CM_TO_INCHES;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return `${feet}'${remainingInches}"`;
}

/**
 * Generate the height prediction range (±2 inches)
 */
function generateHeightRange(predictedHeightInches: number): string {
  const lowerBound = predictedHeightInches - 2;
  const upperBound = predictedHeightInches + 2;
  
  const lowerFeet = Math.floor(lowerBound / 12);
  const lowerInches = Math.round(lowerBound % 12);
  
  const upperFeet = Math.floor(upperBound / 12);
  const upperInches = Math.round(upperBound % 12);
  
  return `${lowerFeet}'${lowerInches}" to ${upperFeet}'${upperInches}"`;
}

/**
 * Calculate growth percentage based on current age and height prediction
 */
function calculateGrowthPercentage(
  gender: "male" | "female",
  currentHeight: number,
  predictedHeight: number,
  age: number
): number {
  if (gender === "male") {
    // Boys typically complete growth by 18
    if (age >= 18) return 100;
    
    // Growth percentages are approximate and vary by individual
    const percentages: {[key: number]: number} = {
      10: 75,
      11: 78,
      12: 81,
      13: 86,
      14: 90,
      15: 94,
      16: 97,
      17: 99
    };
    
    // Use closest age or interpolate
    if (age <= 10) return percentages[10] * (currentHeight / predictedHeight);
    if (age in percentages) return percentages[age];
    
    // Default calculation if age not in table
    return (currentHeight / predictedHeight) * 100;
  } else {
    // Girls typically complete growth by 16
    if (age >= 16) return 100;
    
    // Growth percentages for girls
    const percentages: {[key: number]: number} = {
      10: 85,
      11: 90,
      12: 94,
      13: 97,
      14: 99,
      15: 99.5
    };
    
    // Use closest age or interpolate
    if (age <= 10) return percentages[10] * (currentHeight / predictedHeight);
    if (age in percentages) return percentages[age];
    
    // Default calculation if age not in table
    return (currentHeight / predictedHeight) * 100;
  }
}

/**
 * Find recommended positions based on predicted height
 */
function findRecommendedPositions(gender: "male" | "female", predictedHeightInches: number): string[] {
  const positionRanges = POSITION_HEIGHT_RANGES[gender];
  const recommendedPositions: string[] = [];
  
  for (const [position, range] of Object.entries(positionRanges)) {
    if (predictedHeightInches >= range.min && predictedHeightInches <= range.max) {
      recommendedPositions.push(position);
    }
  }
  
  // If too short for all positions, recommend positions with lowest height requirements
  if (recommendedPositions.length === 0) {
    let lowestMin = Number.MAX_SAFE_INTEGER;
    let lowestPositions: string[] = [];
    
    for (const [position, range] of Object.entries(positionRanges)) {
      if (range.min < lowestMin) {
        lowestMin = range.min;
        lowestPositions = [position];
      } else if (range.min === lowestMin) {
        lowestPositions.push(position);
      }
    }
    
    return lowestPositions;
  }
  
  return recommendedPositions;
}

/**
 * Predict adult height using Khamis-Roche method
 */
export function predictAdultHeight(inputs: HeightPredictionInputs): GrowthPrediction {
  // Normalize units to inches and pounds for calculation
  const currentHeight = inputs.currentHeightUnit === "cm" 
    ? inputs.currentHeight * CM_TO_INCHES 
    : inputs.currentHeight;
  
  const currentWeight = inputs.currentWeightUnit === "kg" 
    ? inputs.currentWeight * KG_TO_LB 
    : inputs.currentWeight;
  
  const motherHeight = inputs.motherHeightUnit === "cm" 
    ? inputs.motherHeight * CM_TO_INCHES 
    : inputs.motherHeight;
  
  const fatherHeight = inputs.fatherHeightUnit === "cm" 
    ? inputs.fatherHeight * CM_TO_INCHES 
    : inputs.fatherHeight;
  
  // Age calculation (more accurate than just using the provided age)
  const today = new Date();
  const birthDate = inputs.birthDate;
  const ageInYears = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  let predictedHeightInches: number;
  
  if (inputs.gender === "male") {
    // Boys Khamis-Roche equation
    predictedHeightInches = 
      -9.8969 + 
      0.8476 * currentHeight + 
      0.0709 * currentWeight + 
      0.2815 * ((motherHeight + fatherHeight) / 2) + 
      1.7175 * (17.7 - ageInYears);
  } else {
    // Girls Khamis-Roche equation
    predictedHeightInches = 
      -7.2536 + 
      0.8116 * currentHeight + 
      0.0586 * currentWeight + 
      0.3184 * ((motherHeight + fatherHeight) / 2) + 
      1.2839 * (15.7 - ageInYears);
  }
  
  // Convert predicted height to feet and inches format
  const predictedHeightCm = predictedHeightInches * INCHES_TO_CM;
  const predictedHeight = cmToFeetInches(predictedHeightCm);
  
  // Calculate growth completion percentage
  const percentComplete = Math.min(
    Math.round(calculateGrowthPercentage(
      inputs.gender,
      currentHeight,
      predictedHeightInches,
      ageInYears
    )),
    100
  );
  
  // Calculate remaining growth in inches
  const growthRemaining = predictedHeightInches - currentHeight;
  
  // Generate the height prediction range
  const predictedRange = generateHeightRange(predictedHeightInches);
  
  // Find recommended positions
  const recommendedPositions = findRecommendedPositions(
    inputs.gender,
    predictedHeightInches
  );
  
  return {
    predictedHeight,
    predictedHeightCm,
    predictedHeightInches,
    percentComplete,
    growthRemaining,
    predictedRange,
    recommendedPositions,
    calculatedAt: new Date().toISOString()
  };
}