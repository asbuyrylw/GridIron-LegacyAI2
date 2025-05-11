import OpenAI from "openai";
import { CombineMetric } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate performance insights for an athlete based on their metrics
 */
export async function generatePerformanceInsights(
  metrics: CombineMetric,
  position: string,
  athleteId: number
) {
  // Map position to standardized categories
  const positionCategory = mapPositionToCategory(position);

  // Division 1 benchmarks by position
  const benchmarks = getPositionBenchmarks(positionCategory);

  // Compare with benchmark
  const comparisons = compareWithBenchmarks(metrics, benchmarks);

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional football performance analyst and coach specializing in athletic development. 
          You help high school athletes understand their athletic performance metrics and provide practical advice.
          Analyze the athlete's combine test results and provide insights for a ${position} player.
          
          Focus on the following in your analysis:
          1. Identify 3-5 specific strengths based on the metrics
          2. Identify 3-5 specific areas for improvement
          3. Provide 3-5 actionable recommendations for training
          4. Include a performance trend assessment
          5. If possible, provide a position-specific assessment relative to peers
          
          Your analysis should be football-specific, position-relevant, and oriented toward college recruiting standards.
          Be specific, practical, and actionable but encouraging in your feedback.
          
          Output your analysis in JSON format with the following structure:
          {
            "strengths": ["strength 1", "strength 2", ...],
            "weaknesses": ["weakness 1", "weakness 2", ...],
            "recommendations": ["recommendation 1", "recommendation 2", ...],
            "performanceTrend": "improving/stable/declining",
            "positionRanking": "Description of how the athlete compares to peers"
          }`
        },
        {
          role: "user",
          content: `Here are my athletic performance metrics as a ${position} player:
          
          40-Yard Dash: ${metrics.fortyYard ? metrics.fortyYard + ' seconds' : 'Not available'}
          10-Yard Split: ${metrics.tenYardSplit ? metrics.tenYardSplit + ' seconds' : 'Not available'}
          5-10-5 Shuttle: ${metrics.shuttle ? metrics.shuttle + ' seconds' : 'Not available'}
          3-Cone Drill: ${metrics.threeCone ? metrics.threeCone + ' seconds' : 'Not available'}
          Vertical Jump: ${metrics.verticalJump ? metrics.verticalJump + ' inches' : 'Not available'}
          Broad Jump: ${metrics.broadJump ? metrics.broadJump + ' inches' : 'Not available'}
          Bench Press: ${metrics.benchPress ? metrics.benchPress + ' lbs' : 'Not available'}
          Bench Press Reps: ${metrics.benchPressReps ? metrics.benchPressReps + ' reps' : 'Not available'}
          Squat Max: ${metrics.squatMax ? metrics.squatMax + ' lbs' : 'Not available'}
          Power Clean: ${metrics.powerClean ? metrics.powerClean + ' lbs' : 'Not available'}
          Deadlift: ${metrics.deadlift ? metrics.deadlift + ' lbs' : 'Not available'}
          Pull-Ups: ${metrics.pullUps ? metrics.pullUps + ' reps' : 'Not available'}
          
          Here's how my metrics compare to Division 1 standards for my position:
          ${formatComparisons(comparisons)}
          
          Please analyze my metrics and provide insights that will help me improve as a ${position} player.`
        }
      ],
      response_format: { type: "json_object" },
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("Error parsing OpenAI response", error);
      return generateFallbackInsights(metrics, position, comparisons);
    }
  } catch (error) {
    console.error("Error generating insights with OpenAI", error);
    return generateFallbackInsights(metrics, position, comparisons);
  }
}

// Map the position to a standardized category for benchmarks
function mapPositionToCategory(position: string): string {
  if (!position) return "General";
  
  const positionLower = position.toLowerCase();
  
  if (positionLower.includes("quarterback")) return "Quarterback";
  if (positionLower.includes("running back") || positionLower.includes("rb")) return "Running Back";
  if (positionLower.includes("wide receiver") || positionLower.includes("wr")) return "Wide Receiver";
  if (positionLower.includes("tight end") || positionLower.includes("te")) return "Tight End";
  if (positionLower.includes("offensive line") || 
      positionLower.includes("tackle") || 
      positionLower.includes("guard") || 
      positionLower.includes("center")) return "Offensive Line";
  if (positionLower.includes("defensive line") || 
      positionLower.includes("defensive tackle") || 
      positionLower.includes("defensive end")) return "Defensive Line";
  if (positionLower.includes("linebacker")) return "Linebacker";
  if (positionLower.includes("cornerback") || 
      positionLower.includes("safety") || 
      positionLower.includes("defensive back")) return "Defensive Back";
  if (positionLower.includes("kicker") || 
      positionLower.includes("punter") || 
      positionLower.includes("special")) return "Special Teams";
      
  return "General"; // Default
}

// D1 benchmarks for different positions
function getPositionBenchmarks(position: string) {
  const benchmarks = {
    "Quarterback": {
      fortyYard: 4.7,
      tenYardSplit: 1.62,
      shuttle: 4.2,
      threeCone: 7.0,
      verticalJump: 32,
      broadJump: 112,
      benchPressReps: 15,
      squatMax: 380
    },
    "Running Back": {
      fortyYard: 4.5,
      tenYardSplit: 1.55,
      shuttle: 4.1,
      threeCone: 6.9,
      verticalJump: 36,
      broadJump: 118,
      benchPressReps: 20,
      squatMax: 450
    },
    "Wide Receiver": {
      fortyYard: 4.5,
      tenYardSplit: 1.53,
      shuttle: 4.1,
      threeCone: 6.8,
      verticalJump: 36,
      broadJump: 120,
      benchPressReps: 15,
      squatMax: 400
    },
    "Tight End": {
      fortyYard: 4.7,
      tenYardSplit: 1.65,
      shuttle: 4.3,
      threeCone: 7.1,
      verticalJump: 34,
      broadJump: 116,
      benchPressReps: 22,
      squatMax: 460
    },
    "Offensive Line": {
      fortyYard: 5.2,
      tenYardSplit: 1.80,
      shuttle: 4.6,
      threeCone: 7.7,
      verticalJump: 28,
      broadJump: 102,
      benchPressReps: 30,
      squatMax: 500
    },
    "Defensive Line": {
      fortyYard: 4.9,
      tenYardSplit: 1.70,
      shuttle: 4.5,
      threeCone: 7.5,
      verticalJump: 32,
      broadJump: 110,
      benchPressReps: 30,
      squatMax: 500
    },
    "Linebacker": {
      fortyYard: 4.65,
      tenYardSplit: 1.60,
      shuttle: 4.2,
      threeCone: 7.0,
      verticalJump: 34,
      broadJump: 115,
      benchPressReps: 25,
      squatMax: 460
    },
    "Defensive Back": {
      fortyYard: 4.5,
      tenYardSplit: 1.55,
      shuttle: 4.1,
      threeCone: 6.8,
      verticalJump: 36,
      broadJump: 120,
      benchPressReps: 15,
      squatMax: 400
    },
    "Special Teams": {
      fortyYard: 4.8,
      tenYardSplit: 1.65,
      shuttle: 4.3,
      threeCone: 7.2,
      verticalJump: 32,
      broadJump: 110,
      benchPressReps: 18,
      squatMax: 400
    },
    "General": {
      fortyYard: 4.7,
      tenYardSplit: 1.65,
      shuttle: 4.3,
      threeCone: 7.2,
      verticalJump: 32,
      broadJump: 110,
      benchPressReps: 20,
      squatMax: 400
    }
  };
  
  return benchmarks[position as keyof typeof benchmarks] || benchmarks.General;
}

// Compare athlete metrics with benchmarks
function compareWithBenchmarks(metrics: CombineMetric, benchmarks: any) {
  const comparisons: Record<string, { 
    metric: number | null | undefined, 
    benchmark: number, 
    difference: number | null, 
    isLowerBetter: boolean,
    percentOfBenchmark: number | null 
  }> = {};
  
  // Metrics where lower is better
  const lowerIsBetter = ['fortyYard', 'tenYardSplit', 'shuttle', 'threeCone'];
  
  for (const key in benchmarks) {
    if (metrics[key as keyof CombineMetric] !== undefined && 
        metrics[key as keyof CombineMetric] !== null) {
      
      const metricValue = metrics[key as keyof CombineMetric] as number;
      const benchmarkValue = benchmarks[key];
      const isLowerBetter = lowerIsBetter.includes(key);
      
      // Calculate difference (positive means better than benchmark for both types)
      let difference = isLowerBetter ? 
        benchmarkValue - metricValue : 
        metricValue - benchmarkValue;
      
      // Calculate percentage of benchmark
      let percentOfBenchmark = isLowerBetter ?
        (benchmarkValue / metricValue) * 100 :
        (metricValue / benchmarkValue) * 100;
      
      comparisons[key] = {
        metric: metricValue,
        benchmark: benchmarkValue,
        difference,
        isLowerBetter,
        percentOfBenchmark
      };
    } else {
      comparisons[key] = {
        metric: null,
        benchmark: benchmarks[key],
        difference: null,
        isLowerBetter: lowerIsBetter.includes(key),
        percentOfBenchmark: null
      };
    }
  }
  
  return comparisons;
}

// Format comparisons for the API prompt
function formatComparisons(comparisons: Record<string, any>) {
  let result = "";
  
  for (const key in comparisons) {
    const comparison = comparisons[key];
    if (comparison.metric === null) continue;
    
    const metricFormatted = comparison.metric.toFixed(2);
    const benchmarkFormatted = comparison.benchmark.toFixed(2);
    const differenceFormatted = Math.abs(comparison.difference).toFixed(2);
    
    let comparisonText = comparison.difference > 0 ?
      "better than" : 
      "below";
    
    if (comparison.isLowerBetter) {
      // For metrics like 40-yard where lower is better
      result += `${key}: ${metricFormatted} (D1 benchmark: ${benchmarkFormatted}). `;
      
      if (comparison.difference > 0) {
        result += `${differenceFormatted} seconds faster than benchmark (${comparison.percentOfBenchmark.toFixed(0)}%)\n`;
      } else if (comparison.difference < 0) {
        result += `${differenceFormatted} seconds slower than benchmark (${comparison.percentOfBenchmark.toFixed(0)}%)\n`;
      } else {
        result += `Matches benchmark\n`;
      }
    } else {
      // For metrics like vertical jump where higher is better
      result += `${key}: ${metricFormatted} (D1 benchmark: ${benchmarkFormatted}). `;
      
      if (comparison.difference > 0) {
        result += `${differenceFormatted} units higher than benchmark (${comparison.percentOfBenchmark.toFixed(0)}%)\n`;
      } else if (comparison.difference < 0) {
        result += `${differenceFormatted} units lower than benchmark (${comparison.percentOfBenchmark.toFixed(0)}%)\n`;
      } else {
        result += `Matches benchmark\n`;
      }
    }
  }
  
  return result;
}

// Generate basic insights when OpenAI API fails
function generateFallbackInsights(metrics: CombineMetric, position: string, comparisons: Record<string, any>) {
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];
  let performanceTrend = "stable";
  
  // Count metrics above/below benchmarks
  let aboveBenchmarkCount = 0;
  let belowBenchmarkCount = 0;
  let totalMetrics = 0;
  
  for (const key in comparisons) {
    const comparison = comparisons[key];
    if (comparison.metric === null) continue;
    
    totalMetrics++;
    if (comparison.difference > 0) {
      aboveBenchmarkCount++;
      
      // Add to strengths if significantly above benchmark
      if (comparison.percentOfBenchmark > 105) {
        if (comparison.isLowerBetter) {
          strengths.push(`Your ${key} time of ${comparison.metric.toFixed(2)} seconds is excellent for a ${position}, exceeding the Division 1 benchmark.`);
        } else {
          strengths.push(`Your ${key} of ${comparison.metric.toFixed(0)} is a standout attribute for a ${position}, exceeding the Division 1 benchmark.`);
        }
      }
    } else {
      belowBenchmarkCount++;
      
      // Add to weaknesses if significantly below benchmark
      if (comparison.percentOfBenchmark < 95) {
        if (comparison.isLowerBetter) {
          weaknesses.push(`Your ${key} time of ${comparison.metric.toFixed(2)} seconds could be improved to reach the Division 1 benchmark of ${comparison.benchmark.toFixed(2)} seconds.`);
        } else {
          weaknesses.push(`Your ${key} of ${comparison.metric.toFixed(0)} is below the Division 1 benchmark of ${comparison.benchmark.toFixed(0)} for a ${position}.`);
        }
      }
    }
  }
  
  // Determine overall trend
  if (aboveBenchmarkCount > belowBenchmarkCount) {
    performanceTrend = "improving";
  } else if (belowBenchmarkCount > aboveBenchmarkCount) {
    performanceTrend = "declining";
  } else {
    performanceTrend = "stable";
  }
  
  // Add generic recommendations based on position
  if (position.toLowerCase().includes("quarterback")) {
    recommendations.push("Focus on improving throwing mechanics and arm strength with specialized quarterback drills.");
    recommendations.push("Work on quick release and decision-making with progressive complexity passing drills.");
    recommendations.push("Include footwork drills to enhance mobility in the pocket.");
  } else if (position.toLowerCase().includes("defensive") || position.toLowerCase().includes("linebacker")) {
    recommendations.push("Incorporate more change-of-direction drills to improve lateral quickness.");
    recommendations.push("Add explosive power exercises like clean pulls and jump squats to your routine.");
    recommendations.push("Implement a specialized agility program to enhance your 5-10-5 shuttle time.");
  } else if (position.toLowerCase().includes("receiver") || position.toLowerCase().includes("back")) {
    recommendations.push("Focus on acceleration drills to improve your 10-yard split time.");
    recommendations.push("Add plyometric exercises to increase your vertical jump and explosive power.");
    recommendations.push("Incorporate route-specific agility drills to enhance your change of direction ability.");
  } else if (position.toLowerCase().includes("line")) {
    recommendations.push("Emphasize lower body strength with heavy squats and deadlifts.");
    recommendations.push("Add more upper body power exercises to improve your bench press performance.");
    recommendations.push("Incorporate short-area quickness drills specific to line play.");
  } else {
    recommendations.push("Develop a position-specific speed training program to improve your 40-yard dash time.");
    recommendations.push("Incorporate more compound movements like squats, deadlifts, and power cleans into your strength routine.");
    recommendations.push("Add plyometric exercises to enhance your explosive power and jumping ability.");
  }
  
  // If we don't have enough strengths or weaknesses, add generic ones
  if (strengths.length < 3) {
    if (metrics.benchPressReps) strengths.push(`You demonstrate good upper body strength as shown by your bench press performance.`);
    if (metrics.verticalJump) strengths.push(`Your vertical jump shows good lower body power.`);
    if (metrics.fortyYard) strengths.push(`You have a solid foundation of speed to build upon.`);
    
    // Fill with generic strengths if still needed
    const genericStrengths = [
      "You've shown commitment to measuring and tracking your athletic metrics.",
      "You have a balanced athletic profile with potential for improvement.",
      "Your attention to your athletic development puts you ahead of many athletes."
    ];
    
    for (let i = 0; strengths.length < 3 && i < genericStrengths.length; i++) {
      strengths.push(genericStrengths[i]);
    }
  }
  
  if (weaknesses.length < 3) {
    // Add generic areas for improvement
    const genericWeaknesses = [
      "Consider a more structured approach to speed development to improve your times.",
      "Your overall power metrics could benefit from a focused plyometric program.",
      "Adding more sport-specific conditioning could help translate your raw metrics to on-field performance.",
      "A more consistent strength training program would help improve your overall athletic profile."
    ];
    
    for (let i = 0; weaknesses.length < 3 && i < genericWeaknesses.length; i++) {
      weaknesses.push(genericWeaknesses[i]);
    }
  }
  
  return {
    strengths: strengths,
    weaknesses: weaknesses,
    recommendations: recommendations,
    performanceTrend: performanceTrend,
    positionRanking: `Based on your metrics, you show ${aboveBenchmarkCount/totalMetrics > 0.7 ? 'strong' : aboveBenchmarkCount/totalMetrics > 0.5 ? 'good' : 'developing'} potential as a ${position}.`
  };
}