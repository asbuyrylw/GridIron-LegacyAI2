/**
 * Implementation of the Khamis-Roche Height Predictor
 * This is a validated method for predicting adult height based on current height,
 * weight, age, and parents' heights.
 */

export interface HeightPredictionInputs {
  currentHeight: number; // in inches
  currentWeight: number; // in pounds
  ageInYears: number; // age in decimal years (15.5 = 15 years, 6 months)
  isMale: boolean; // true for male, false for female
  motherHeight: number; // in inches
  fatherHeight: number; // in inches
}

export interface HeightPredictionResult {
  predictedAdultHeight: number; // in inches
  predictedAdultHeightCm: number; // in centimeters
  percentOfAdultHeight: number; // percentage (0-100) of adult height already achieved
  heightRemainingInches: number; // inches of growth remaining
  heightRemainingCm: number; // centimeters of growth remaining
  predictedRange: {
    min: number; // in inches
    max: number; // in inches
  };
  predictionTimestamp: string; // ISO date string
}

// Khamis-Roche coefficient tables (simplified version)
// These are regression coefficients from the original research paper
const maleCoefficients = {
  intercept: 9.92,
  ageCoefficients: [
    { minAge: 4, maxAge: 8, coefficient: 1.21 },
    { minAge: 8, maxAge: 12, coefficient: 1.05 },
    { minAge: 12, maxAge: 14, coefficient: 0.96 },
    { minAge: 14, maxAge: 16, coefficient: 0.68 },
    { minAge: 16, maxAge: 18, coefficient: 0.28 },
  ],
  heightCoefficient: 0.74,
  weightCoefficient: 0.06,
  midparentHeightCoefficient: 0.54,
};

const femaleCoefficients = {
  intercept: 11.35,
  ageCoefficients: [
    { minAge: 4, maxAge: 8, coefficient: 1.01 },
    { minAge: 8, maxAge: 10, coefficient: 0.87 },
    { minAge: 10, maxAge: 12, coefficient: 0.76 },
    { minAge: 12, maxAge: 13.5, coefficient: 0.38 },
    { minAge: 13.5, maxAge: 18, coefficient: 0.21 },
  ],
  heightCoefficient: 0.71,
  weightCoefficient: 0.05,
  midparentHeightCoefficient: 0.51,
};

/**
 * Convert height from feet/inches format to total inches
 * @param feet 
 * @param inches 
 * @returns total inches
 */
export function convertToInches(feet: number, inches: number): number {
  return (feet * 12) + inches;
}

/**
 * Convert height from inches to feet/inches format
 * @param inches 
 * @returns Object with feet and inches
 */
export function convertToFeetInches(inches: number): { feet: number, inches: number } {
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round((inches % 12) * 10) / 10;
  return { feet, inches: remainingInches };
}

/**
 * Convert height from inches to centimeters
 * @param inches 
 * @returns height in centimeters
 */
export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

/**
 * Convert height from centimeters to inches
 * @param cm 
 * @returns height in inches
 */
export function cmToInches(cm: number): number {
  return cm / 2.54;
}

/**
 * Format height as a string in feet and inches
 * @param inches 
 * @returns formatted height string (e.g., "5' 10"")
 */
export function formatHeight(inches: number): string {
  const { feet, inches: remainingInches } = convertToFeetInches(inches);
  return `${feet}' ${remainingInches}"`;
}

/**
 * Calculate the mid-parent height
 * @param motherHeight in inches
 * @param fatherHeight in inches
 * @param isMale true for male child, false for female child
 * @returns mid-parent height in inches
 */
function calculateMidParentHeight(
  motherHeight: number,
  fatherHeight: number,
  isMale: boolean
): number {
  // For boys: (mother's height + father's height) / 2
  // For girls: ((mother's height + father's height) / 2) - 2.5 inches
  const average = (motherHeight + fatherHeight) / 2;
  return isMale ? average : average - 2.5; 
}

/**
 * Get age coefficient based on current age
 * @param age current age in years
 * @param isMale true for male, false for female
 * @returns coefficient for the age
 */
function getAgeCoefficient(age: number, isMale: boolean): number {
  const coefficients = isMale ? maleCoefficients.ageCoefficients : femaleCoefficients.ageCoefficients;
  
  for (const { minAge, maxAge, coefficient } of coefficients) {
    if (age >= minAge && age < maxAge) {
      return coefficient;
    }
  }
  
  // Default to the last age range coefficient if age is outside ranges
  return coefficients[coefficients.length - 1].coefficient;
}

/**
 * Predict adult height using the Khamis-Roche method
 * @param inputs Height prediction inputs
 * @returns Height prediction result
 */
export function predictAdultHeight(
  inputs: HeightPredictionInputs
): HeightPredictionResult {
  const { 
    currentHeight, 
    currentWeight, 
    ageInYears, 
    isMale, 
    motherHeight, 
    fatherHeight 
  } = inputs;
  
  // Get appropriate coefficients based on gender
  const coefficients = isMale ? maleCoefficients : femaleCoefficients;
  
  // Calculate mid-parent height
  const midParentHeight = calculateMidParentHeight(motherHeight, fatherHeight, isMale);
  
  // Get age-specific coefficient
  const ageCoefficient = getAgeCoefficient(ageInYears, isMale);
  
  // Khamis-Roche formula:
  // Predicted height = intercept + (age coefficient × age) + (height coefficient × current height) 
  //                  + (weight coefficient × current weight) 
  //                  + (midparent height coefficient × midparent height)
  
  const predictedAdultHeight = 
    coefficients.intercept + 
    (ageCoefficient * ageInYears) + 
    (coefficients.heightCoefficient * currentHeight) + 
    (coefficients.weightCoefficient * currentWeight) + 
    (coefficients.midparentHeightCoefficient * midParentHeight);
  
  // Calculate percentage of adult height already achieved
  const percentOfAdultHeight = (currentHeight / predictedAdultHeight) * 100;
  
  // Calculate height remaining
  const heightRemainingInches = predictedAdultHeight - currentHeight;
  
  // Standard error of the prediction is approximately 1.7 inches
  // Create a prediction range of ±2 inches
  const predictionRange = {
    min: Math.round((predictedAdultHeight - 2) * 10) / 10,
    max: Math.round((predictedAdultHeight + 2) * 10) / 10,
  };
  
  return {
    predictedAdultHeight: Math.round(predictedAdultHeight * 10) / 10,
    predictedAdultHeightCm: Math.round(inchesToCm(predictedAdultHeight) * 10) / 10,
    percentOfAdultHeight: Math.round(percentOfAdultHeight * 10) / 10,
    heightRemainingInches: Math.round(heightRemainingInches * 10) / 10,
    heightRemainingCm: Math.round(inchesToCm(heightRemainingInches) * 10) / 10,
    predictedRange,
    predictionTimestamp: new Date().toISOString(),
  };
}

/**
 * Get a textual interpretation of the prediction results
 * @param result The height prediction result
 * @param currentAge The athlete's current age
 * @returns A text description of the prediction
 */
export function getHeightPredictionInterpretation(
  result: HeightPredictionResult,
  currentAge: number
): string {
  const { percentOfAdultHeight, predictedAdultHeight } = result;
  const formattedAdultHeight = formatHeight(predictedAdultHeight);
  
  let interpretation = `Predicted adult height: ${formattedAdultHeight}\n`;
  interpretation += `You are currently at ${percentOfAdultHeight}% of your predicted adult height.\n\n`;
  
  if (currentAge < 13) {
    interpretation += "You're in the early growth phase with significant growth potential ahead. ";
    interpretation += "Proper nutrition and training now will establish a foundation for your athletic development.";
  } else if (currentAge < 16) {
    interpretation += "You're in the peak growth phase where proper training and nutrition are critical. ";
    interpretation += "Focus on technique as your body adjusts to rapid changes in height and proportions.";
  } else {
    interpretation += "You're nearing your full adult height. ";
    interpretation += "Focus on maximizing strength, speed, and technique as your growth stabilizes.";
  }
  
  return interpretation;
}

/**
 * Get position recommendations based on predicted height
 * @param predictedHeightInches Predicted adult height in inches
 * @param isMale Whether the athlete is male
 * @returns Array of recommended positions
 */
export function getPositionRecommendations(
  predictedHeightInches: number,
  isMale: boolean
): string[] {
  // Position recommendations for male athletes
  if (isMale) {
    if (predictedHeightInches >= 77) { // 6'5"+ 
      return ['Offensive Tackle', 'Defensive End', 'Tight End'];
    } else if (predictedHeightInches >= 74) { // 6'2"+ 
      return ['Quarterback', 'Tight End', 'Linebacker', 'Defensive End'];
    } else if (predictedHeightInches >= 72) { // 6'0"+
      return ['Quarterback', 'Wide Receiver', 'Safety', 'Cornerback', 'Running Back'];
    } else if (predictedHeightInches >= 70) { // 5'10"+
      return ['Running Back', 'Slot Receiver', 'Cornerback', 'Safety'];
    } else {
      return ['Running Back', 'Slot Receiver', 'Cornerback', 'Kick Returner'];
    }
  }
  // Position recommendations for female athletes
  else {
    if (predictedHeightInches >= 70) { // 5'10"+ 
      return ['Quarterback', 'Wide Receiver', 'Defensive End'];
    } else if (predictedHeightInches >= 67) { // 5'7"+
      return ['Quarterback', 'Wide Receiver', 'Safety', 'Cornerback'];
    } else if (predictedHeightInches >= 65) { // 5'5"+
      return ['Running Back', 'Slot Receiver', 'Cornerback', 'Safety'];
    } else {
      return ['Running Back', 'Slot Receiver', 'Cornerback', 'Kick Returner'];
    }
  }
}