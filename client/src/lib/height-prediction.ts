/**
 * Height Prediction Utilities
 * 
 * This file contains functions for predicting adult height using the Khamis-Roche method,
 * which is one of the most accurate non-radiographic height prediction methods.
 * 
 * The Khamis-Roche method uses current height, weight, parental heights, and age
 * to predict adult height.
 */

import type { GrowthPrediction } from "@shared/schema";

// Conversion utilities
export function cmToInches(cm: number): number {
  return cm / 2.54;
}

export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

// Format height in feet and inches
export function formatHeight(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round((totalInches % 12) * 10) / 10;
  return `${feet}'${inches}"`;
}

export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export interface HeightPredictionInputs {
  gender: string;
  age: number;
  currentHeight: number; // in inches
  currentWeight: number; // in lbs
  motherHeight: number; // in inches
  fatherHeight: number; // in inches
  birthDate: Date;
}

// Prediction ranges by gender
const PREDICTION_RANGES = {
  male: {
    under6: 2.1, // ±2.1 inches
    age6to11: 1.7, // ±1.7 inches
    age12plus: 1.3 // ±1.3 inches
  },
  female: {
    under6: 1.9, // ±1.9 inches
    age6to11: 1.5, // ±1.5 inches
    age12plus: 1.2 // ±1.2 inches
  }
};

// Growth velocity values by age and gender (inches per year)
const GROWTH_VELOCITY = {
  male: {
    5: 2.5, 6: 2.5, 7: 2.3, 8: 2.2, 9: 2.1, 
    10: 2.0, 11: 2.2, 12: 2.6, 13: 3.0, 
    14: 2.8, 15: 2.0, 16: 1.2, 17: 0.6, 18: 0.2
  },
  female: {
    5: 2.5, 6: 2.5, 7: 2.3, 8: 2.2, 9: 2.2, 
    10: 2.4, 11: 2.5, 12: 2.0, 13: 1.5, 
    14: 0.8, 15: 0.4, 16: 0.2, 17: 0.1, 18: 0.0
  }
};

// Height percentages of adult height by age and gender
const HEIGHT_PERCENT_OF_ADULT = {
  male: {
    5: 69, 6: 72, 7: 75, 8: 78, 9: 81,
    10: 84, 11: 87, 12: 90, 13: 94,
    14: 97, 15: 99, 16: 99.5, 17: 99.8, 18: 100
  },
  female: {
    5: 73, 6: 76, 7: 79, 8: 82, 9: 86,
    10: 90, 11: 94, 12: 97, 13: 99,
    14: 99.5, 15: 99.8, 16: 100, 17: 100, 18: 100
  }
};

// Position recommendations by height range (in inches)
type PositionRanges = {
  [key: string]: string[];
};

type GenderPositions = {
  male: PositionRanges;
  female: PositionRanges;
};

const POSITION_RECOMMENDATIONS: GenderPositions = {
  male: {
    under70: ['Cornerback', 'Running Back', 'Wide Receiver', 'Kicker', 'Punt Returner', 'Slot Receiver', 'Safety'],
    under73: ['Quarterback', 'Running Back', 'Wide Receiver', 'Cornerback', 'Safety', 'Slot Receiver'],
    under76: ['Quarterback', 'Wide Receiver', 'Linebacker', 'Strong Safety', 'Free Safety', 'Fullback', 'Halfback'],
    under79: ['Quarterback', 'Tight End', 'Linebacker', 'Fullback', 'Strong Safety', 'Defensive End'],
    over79: ['Tight End', 'Offensive Tackle', 'Offensive Guard', 'Defensive End', 'Defensive Tackle', 'Center']
  },
  female: {
    under65: ['Cornerback', 'Running Back', 'Wide Receiver', 'Kicker', 'Punt Returner'],
    under68: ['Quarterback', 'Running Back', 'Wide Receiver', 'Cornerback', 'Safety'],
    under71: ['Quarterback', 'Wide Receiver', 'Linebacker', 'Strong Safety', 'Free Safety'],
    under74: ['Quarterback', 'Tight End', 'Linebacker', 'Fullback', 'Defensive End'],
    over74: ['Tight End', 'Offensive Tackle', 'Offensive Guard', 'Defensive End', 'Defensive Tackle']
  }
};

/**
 * Get position recommendations based on height
 */
function getPositionRecommendations(height: number, gender: string): string[] {
  if (gender === 'male') {
    const malePositions = POSITION_RECOMMENDATIONS.male;
    if (height >= 79) return malePositions.over79;
    if (height >= 76) return malePositions.under79;
    if (height >= 73) return malePositions.under76;
    if (height >= 70) return malePositions.under73;
    return malePositions.under70;
  } else {
    const femalePositions = POSITION_RECOMMENDATIONS.female;
    if (height >= 74) return femalePositions.over74;
    if (height >= 71) return femalePositions.under74;
    if (height >= 68) return femalePositions.under71;
    if (height >= 65) return femalePositions.under68;
    return femalePositions.under65;
  }
}

/**
 * Get prediction range based on age and gender
 */
function getPredictionRange(age: number, gender: string): number {
  const ranges = gender === 'male' ? PREDICTION_RANGES.male : PREDICTION_RANGES.female;
  
  if (age < 6) return ranges.under6;
  if (age >= 6 && age < 12) return ranges.age6to11;
  return ranges.age12plus;
}

/**
 * Get percent of adult height achieved based on age and gender
 */
function getPercentOfAdultHeight(age: number, gender: string): number {
  const percentages = gender === 'male' ? HEIGHT_PERCENT_OF_ADULT.male : HEIGHT_PERCENT_OF_ADULT.female;
  const clampedAge = Math.min(Math.max(Math.floor(age), 5), 18);
  return percentages[clampedAge as keyof typeof percentages];
}

/**
 * Calculate remaining growth based on current height and predicted adult height
 */
function calculateRemainingGrowth(currentHeight: number, predictedHeight: number): number {
  return Math.max(0, predictedHeight - currentHeight);
}

/**
 * Predict adult height using the Khamis-Roche method
 */
export function predictAdultHeight(inputs: HeightPredictionInputs): GrowthPrediction {
  const { gender, age, currentHeight, currentWeight, motherHeight, fatherHeight } = inputs;
  
  // Ensure inputs are within valid ranges
  const validAge = Math.min(Math.max(age, 5), 18);
  const validWeight = Math.max(currentWeight, 40); // Minimum 40 lbs
  
  let predictedHeight: number;
  
  if (gender === 'male') {
    // Male Khamis-Roche equation
    predictedHeight = 
      -9.11 + 
      0.748 * currentHeight + 
      0.0759 * validWeight +
      0.235 * motherHeight + 
      0.375 * fatherHeight -
      0.018 * validAge * validWeight;
  } else {
    // Female Khamis-Roche equation
    predictedHeight = 
      -7.25 + 
      0.698 * currentHeight + 
      0.0519 * validWeight +
      0.345 * motherHeight + 
      0.315 * fatherHeight -
      0.015 * validAge * validWeight;
  }
  
  // Round to one decimal place
  predictedHeight = Math.round(predictedHeight * 10) / 10;
  
  // Calculate percent of adult height achieved
  const percentComplete = getPercentOfAdultHeight(validAge, gender);
  
  // Calculate growth remaining
  const growthRemaining = calculateRemainingGrowth(currentHeight, predictedHeight);
  
  // Get position recommendations based on predicted height
  const recommendedPositions = getPositionRecommendations(predictedHeight, gender);
  
  // Get prediction range
  const predictionRange = getPredictionRange(validAge, gender);
  
  // Generate result
  const result: GrowthPrediction = {
    predictedHeight: formatHeight(predictedHeight),
    predictedHeightCm: Math.round(inchesToCm(predictedHeight) * 10) / 10,
    predictedHeightInches: predictedHeight,
    percentComplete,
    growthRemaining,
    recommendedPositions,
    predictedRange: `${formatHeight(predictedHeight - predictionRange)} to ${formatHeight(predictedHeight + predictionRange)}`,
    calculatedAt: new Date().toISOString()
  };
  
  return result;
}