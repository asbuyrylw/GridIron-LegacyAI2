import OpenAI from "openai";
import { CombineMetric } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate performance growth predictions based on athlete's current metrics and profile
 */
export async function generatePerformanceGrowthPredictions(
  metrics: CombineMetric,
  position: string,
  trainingData: {
    workoutsPerWeek: number;
    trainingFocus: string[];
    timeframe: 'short' | 'medium' | 'long'; // 1 month, 3 months, 6 months
    age: number;
    height?: string;
    weight?: number;
    experience?: number; // years playing football
  }
): Promise<{
  predictedMetrics: Partial<CombineMetric>;
  recommendations: string[];
  potentialAreas: string[];
  timeline: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
}> {
  try {
    // Create a prompt for OpenAI to generate performance predictions
    let prompt = `As an expert football strength and conditioning coach, predict the potential growth and improvement in performance metrics for a ${position} player based on the following current metrics and training information:

Current Combine Metrics:
- 40-yard dash: ${metrics.fortyYard ? metrics.fortyYard + ' seconds' : 'Not recorded'}
- 10-yard split: ${metrics.tenYardSplit ? metrics.tenYardSplit + ' seconds' : 'Not recorded'}
- Shuttle (5-10-5): ${metrics.shuttle ? metrics.shuttle + ' seconds' : 'Not recorded'}
- 3-Cone: ${metrics.threeCone ? metrics.threeCone + ' seconds' : 'Not recorded'}
- Vertical Jump: ${metrics.verticalJump ? metrics.verticalJump + ' inches' : 'Not recorded'}
- Broad Jump: ${metrics.broadJump ? metrics.broadJump + ' inches' : 'Not recorded'}
- Bench Press: ${metrics.benchPress ? metrics.benchPress + ' lbs' : 'Not recorded'}
- Bench Press Reps (225 lbs): ${metrics.benchPressReps || 'Not recorded'}
- Squat Max: ${metrics.squatMax ? metrics.squatMax + ' lbs' : 'Not recorded'}
- Power Clean: ${metrics.powerClean ? metrics.powerClean + ' lbs' : 'Not recorded'}
- Deadlift: ${metrics.deadlift ? metrics.deadlift + ' lbs' : 'Not recorded'}
- Pull-Ups: ${metrics.pullUps || 'Not recorded'}

Player Information:
- Position: ${position}
- Age: ${trainingData.age} years
${trainingData.height ? `- Height: ${trainingData.height}` : ''}
${trainingData.weight ? `- Weight: ${trainingData.weight} lbs` : ''}
${trainingData.experience ? `- Football Experience: ${trainingData.experience} years` : ''}

Training Information:
- Workouts Per Week: ${trainingData.workoutsPerWeek}
- Training Focus: ${trainingData.trainingFocus.join(', ')}
- Prediction Timeframe: ${trainingData.timeframe === 'short' ? '1 month' : trainingData.timeframe === 'medium' ? '3 months' : '6 months'}

Based on this information, predict:
1. Realistic improvements in key combine metrics over the specified timeframe
2. Specific training recommendations to achieve these improvements
3. Areas with the highest potential for growth
4. A timeline of expected improvements (short-term, medium-term, long-term goals)

Format your response as a JSON object with the following structure:
{
  "predictedMetrics": {
    // Only include metrics with realistic improvement predictions
    "fortyYard": number,
    "shuttle": number,
    ...
  },
  "recommendations": [
    // 3-5 specific training recommendations
    "recommendation 1",
    "recommendation 2",
    ...
  ],
  "potentialAreas": [
    // 2-3 areas with highest potential for improvement
    "area 1",
    "area 2",
    ...
  ],
  "timeline": {
    "shortTerm": [
      // 1-2 realistic achievements within 1 month
      "achievement 1",
      ...
    ],
    "mediumTerm": [
      // 1-2 realistic achievements within 3 months
      "achievement 1",
      ...
    ],
    "longTerm": [
      // 1-2 realistic achievements within 6 months
      "achievement 1",
      ...
    ]
  }
}`;

    // Call OpenAI API to generate predictions
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { 
          role: "system", 
          content: "You are an expert football strength and conditioning coach with 15+ years experience developing personalized training programs and predicting athletic performance improvements." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0].message.content || '{}';
    const predictions = JSON.parse(content);
    
    // Structure the response
    return {
      predictedMetrics: predictions.predictedMetrics || {},
      recommendations: predictions.recommendations || [],
      potentialAreas: predictions.potentialAreas || [],
      timeline: {
        shortTerm: predictions.timeline?.shortTerm || [],
        mediumTerm: predictions.timeline?.mediumTerm || [],
        longTerm: predictions.timeline?.longTerm || []
      }
    };
  } catch (error) {
    console.error("Error generating performance predictions:", error);
    
    // Return fallback predictions if AI generation fails
    return generateFallbackPredictions(metrics, position, trainingData);
  }
}

/**
 * Generate fallback predictions based on general performance improvement ranges
 * Used when AI prediction fails
 */
function generateFallbackPredictions(
  metrics: CombineMetric,
  position: string,
  trainingData: {
    workoutsPerWeek: number;
    trainingFocus: string[];
    timeframe: 'short' | 'medium' | 'long';
    age: number;
    height?: string;
    weight?: number;
    experience?: number;
  }
): {
  predictedMetrics: Partial<CombineMetric>;
  recommendations: string[];
  potentialAreas: string[];
  timeline: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
} {
  // Determine improvement factor based on timeframe
  const improvementFactor = 
    trainingData.timeframe === 'short' ? 0.02 : 
    trainingData.timeframe === 'medium' ? 0.05 : 
    0.08;
  
  // Create predicted metrics with modest improvements
  const predictedMetrics: Partial<CombineMetric> = {};
  
  // Speed metrics (lower is better)
  if (metrics.fortyYard) {
    predictedMetrics.fortyYard = parseFloat((metrics.fortyYard * (1 - improvementFactor)).toFixed(2));
  }
  
  if (metrics.tenYardSplit) {
    predictedMetrics.tenYardSplit = parseFloat((metrics.tenYardSplit * (1 - improvementFactor * 0.8)).toFixed(2));
  }
  
  if (metrics.shuttle) {
    predictedMetrics.shuttle = parseFloat((metrics.shuttle * (1 - improvementFactor)).toFixed(2));
  }
  
  if (metrics.threeCone) {
    predictedMetrics.threeCone = parseFloat((metrics.threeCone * (1 - improvementFactor * 0.9)).toFixed(2));
  }
  
  // Power metrics (higher is better)
  if (metrics.verticalJump) {
    predictedMetrics.verticalJump = parseFloat((metrics.verticalJump * (1 + improvementFactor)).toFixed(1));
  }
  
  if (metrics.broadJump) {
    predictedMetrics.broadJump = parseFloat((metrics.broadJump * (1 + improvementFactor * 0.7)).toFixed(1));
  }
  
  // Strength metrics (higher is better)
  if (metrics.benchPress) {
    predictedMetrics.benchPress = Math.round(metrics.benchPress * (1 + improvementFactor * 1.2));
  }
  
  if (metrics.benchPressReps) {
    predictedMetrics.benchPressReps = Math.round(metrics.benchPressReps * (1 + improvementFactor * 1.5));
  }
  
  if (metrics.squatMax) {
    predictedMetrics.squatMax = Math.round(metrics.squatMax * (1 + improvementFactor * 1.3));
  }
  
  if (metrics.powerClean) {
    predictedMetrics.powerClean = Math.round(metrics.powerClean * (1 + improvementFactor * 1.1));
  }
  
  if (metrics.deadlift) {
    predictedMetrics.deadlift = Math.round(metrics.deadlift * (1 + improvementFactor * 1.2));
  }
  
  if (metrics.pullUps) {
    predictedMetrics.pullUps = Math.round(metrics.pullUps * (1 + improvementFactor * 1.3));
  }
  
  // Generate position-specific recommendations
  const recommendations = generatePositionRecommendations(position, trainingData.trainingFocus);
  
  // Generate potential improvement areas based on position
  const potentialAreas = generatePotentialAreas(position);
  
  // Generate timeline
  const timeline = {
    shortTerm: [
      "Improve movement mechanics through targeted drills",
      "Establish consistent training rhythm"
    ],
    mediumTerm: [
      "Measurable gains in core performance metrics",
      "Increased power output in sport-specific movements"
    ],
    longTerm: [
      "Significant improvements in position-specific abilities",
      "Enhanced overall athletic profile for recruiting"
    ]
  };
  
  return {
    predictedMetrics,
    recommendations,
    potentialAreas,
    timeline
  };
}

/**
 * Generate position-specific training recommendations
 */
function generatePositionRecommendations(position: string, trainingFocus: string[]): string[] {
  const positionLower = position.toLowerCase();
  const recommendations: string[] = [];
  
  // General recommendations for all positions
  recommendations.push("Follow a progressive overload approach to strength training");
  recommendations.push("Maintain consistent hydration and nutrition protocols");
  
  // Position-specific recommendations
  if (positionLower.includes("quarterback")) {
    recommendations.push("Incorporate rotational power exercises to improve throwing velocity");
    recommendations.push("Practice footwork drills to enhance pocket mobility");
    recommendations.push("Add shoulder stability work to prevent injuries and improve throw accuracy");
  } 
  else if (positionLower.includes("running back")) {
    recommendations.push("Focus on single-leg power exercises to improve cutting ability");
    recommendations.push("Add plyometric training to enhance explosiveness");
    recommendations.push("Incorporate contact balance drills to improve breaking tackles");
  }
  else if (positionLower.includes("wide receiver")) {
    recommendations.push("Prioritize route-running precision drills");
    recommendations.push("Add hand-eye coordination training with varied catch scenarios");
    recommendations.push("Incorporate high-intensity sprint intervals for improved separation speed");
  }
  else if (positionLower.includes("tight end")) {
    recommendations.push("Balance blocking strength work with route-running agility");
    recommendations.push("Add catching drills in traffic situations");
    recommendations.push("Incorporate full-body power movements like cleans and snatches");
  }
  else if (positionLower.includes("offensive line")) {
    recommendations.push("Focus on explosive power from a three-point stance");
    recommendations.push("Add mobility work for hips and ankles to improve blocking technique");
    recommendations.push("Incorporate heavy compound lifts with an emphasis on lower body strength");
  }
  else if (positionLower.includes("defensive line")) {
    recommendations.push("Prioritize first-step explosiveness training");
    recommendations.push("Add hand combat techniques with resistance bands");
    recommendations.push("Incorporate lateral movement training for gap control");
  }
  else if (positionLower.includes("linebacker")) {
    recommendations.push("Focus on multi-directional change of direction drills");
    recommendations.push("Add reactive agility work with visual cues");
    recommendations.push("Incorporate tackling technique drills with proper form emphasis");
  }
  else if (positionLower.includes("cornerback") || positionLower.includes("safety")) {
    recommendations.push("Prioritize backpedal-to-sprint transition drills");
    recommendations.push("Add hip flexibility work for smoother coverage movements");
    recommendations.push("Incorporate high-intensity interval training for sustained speed");
  }
  else if (positionLower.includes("kicker") || positionLower.includes("punter")) {
    recommendations.push("Focus on single-leg stability and strength");
    recommendations.push("Add hip mobility work for improved kicking mechanics");
    recommendations.push("Incorporate core rotation exercises for power transfer");
  }
  
  // Add recommendations based on training focus
  if (trainingFocus.some(focus => focus.toLowerCase().includes("speed"))) {
    recommendations.push("Add resisted sprint training to improve acceleration mechanics");
  }
  
  if (trainingFocus.some(focus => focus.toLowerCase().includes("strength"))) {
    recommendations.push("Implement periodized strength cycles with planned deload weeks");
  }
  
  if (trainingFocus.some(focus => focus.toLowerCase().includes("agility"))) {
    recommendations.push("Include reactive agility drills with visual and auditory cues");
  }
  
  // Return only 5 recommendations max
  return recommendations.slice(0, 5);
}

/**
 * Generate potential improvement areas based on position
 */
function generatePotentialAreas(position: string): string[] {
  const positionLower = position.toLowerCase();
  
  if (positionLower.includes("quarterback")) {
    return ["Rotational power", "Throwing accuracy", "Footwork speed"];
  } 
  else if (positionLower.includes("running back")) {
    return ["Lower body power", "Change of direction", "Contact balance"];
  }
  else if (positionLower.includes("wide receiver")) {
    return ["Top-end speed", "Route precision", "Jump timing"];
  }
  else if (positionLower.includes("tight end")) {
    return ["Functional strength", "Receiving skills", "Blocking technique"];
  }
  else if (positionLower.includes("offensive line")) {
    return ["Lower body strength", "Hand placement", "Lateral agility"];
  }
  else if (positionLower.includes("defensive line")) {
    return ["First-step explosiveness", "Hand combat technique", "Leverage control"];
  }
  else if (positionLower.includes("linebacker")) {
    return ["Change of direction", "Play recognition speed", "Tackling technique"];
  }
  else if (positionLower.includes("cornerback")) {
    return ["Hip flexibility", "Transition speed", "Ball tracking"];
  }
  else if (positionLower.includes("safety")) {
    return ["Range coverage", "Tackling in space", "Play diagnosis"];
  }
  else if (positionLower.includes("kicker") || positionLower.includes("punter")) {
    return ["Leg strength", "Technique consistency", "Mental focus"];
  }
  
  // Default areas for any position
  return ["Power development", "Speed mechanics", "Position-specific skills"];
}