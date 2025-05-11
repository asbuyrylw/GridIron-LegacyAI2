import { storage } from "./storage";
import type { Athlete, CombineMetric } from "@shared/schema";

interface CollegeMatchResult {
  divisionRecommendation: string;
  matchScore: number;
  matchedSchools: MatchedSchool[];
  feedback: string[];
}

interface MatchedSchool {
  name: string;
  division: string;
  region: string;
  academicMatch: number; // 0-100
  athleticMatch: number; // 0-100
  overallMatch: number; // 0-100
  programs?: string[];
  location?: string;
  positionNeeds?: boolean;
}

// College database (simplified for prototype)
const colleges: MatchedSchool[] = [
  {
    name: "Alabama University",
    division: "D1",
    region: "South",
    academicMatch: 0, // Will be calculated
    athleticMatch: 0, // Will be calculated
    overallMatch: 0, // Will be calculated
    programs: ["Business", "Engineering", "Communications"],
    location: "Tuscaloosa, AL"
  },
  {
    name: "Ohio State University",
    division: "D1",
    region: "Midwest",
    academicMatch: 0,
    athleticMatch: 0,
    overallMatch: 0,
    programs: ["Psychology", "Business", "Computer Science"],
    location: "Columbus, OH"
  },
  {
    name: "Michigan State University",
    division: "D1",
    region: "Midwest",
    academicMatch: 0,
    athleticMatch: 0,
    overallMatch: 0,
    programs: ["Agriculture", "Business", "Engineering"],
    location: "East Lansing, MI"
  },
  {
    name: "Florida State University",
    division: "D1",
    region: "South",
    academicMatch: 0,
    athleticMatch: 0,
    overallMatch: 0,
    programs: ["Business", "Criminal Justice", "Communications"],
    location: "Tallahassee, FL"
  },
  {
    name: "Stanford University",
    division: "D1",
    region: "West",
    academicMatch: 0,
    athleticMatch: 0,
    overallMatch: 0,
    programs: ["Computer Science", "Engineering", "Business"],
    location: "Stanford, CA"
  },
  {
    name: "Grand Valley State",
    division: "D2",
    region: "Midwest",
    academicMatch: 0,
    athleticMatch: 0,
    overallMatch: 0,
    programs: ["Business", "Health Sciences", "Education"],
    location: "Allendale, MI"
  },
  {
    name: "Slippery Rock University",
    division: "D2",
    region: "Northeast",
    academicMatch: 0,
    athleticMatch: 0,
    overallMatch: 0,
    programs: ["Physical Therapy", "Education", "Exercise Science"],
    location: "Slippery Rock, PA"
  },
  {
    name: "University of Mount Union",
    division: "D3",
    region: "Midwest",
    academicMatch: 0,
    athleticMatch: 0,
    overallMatch: 0,
    programs: ["Engineering", "Business", "Health Sciences"],
    location: "Alliance, OH"
  },
  {
    name: "Wisconsin-Whitewater",
    division: "D3",
    region: "Midwest",
    academicMatch: 0,
    athleticMatch: 0,
    overallMatch: 0,
    programs: ["Business", "Education", "Communications"],
    location: "Whitewater, WI"
  },
  {
    name: "Morningside University",
    division: "NAIA",
    region: "Midwest",
    academicMatch: 0,
    athleticMatch: 0,
    overallMatch: 0,
    programs: ["Business", "Nursing", "Education"],
    location: "Sioux City, IA"
  },
  {
    name: "Iowa Western CC",
    division: "JUCO",
    region: "Midwest",
    academicMatch: 0,
    athleticMatch: 0,
    overallMatch: 0,
    programs: ["Business", "General Studies", "Computer Science"],
    location: "Council Bluffs, IA"
  }
];

/**
 * The College Matcher service helps athletes find the right college fit
 * based on their academic and athletic profiles.
 */
export class CollegeMatcher {
  /**
   * Generate college matches for an athlete based on their profile data
   */
  async generateCollegeMatches(athleteId: number, options?: {
    region?: string,
    preferredMajor?: string,
    maxDistance?: number,
    publicOnly?: boolean,
    privateOnly?: boolean,
  }): Promise<CollegeMatchResult> {
    try {
      // Get athlete data
      const athlete = await storage.getAthlete(athleteId);
      if (!athlete) {
        throw new Error("Athlete not found");
      }

      // Get athlete's combine metrics
      const metrics = await storage.getLatestCombineMetrics(athleteId);
      if (!metrics) {
        throw new Error("No metrics found for athlete");
      }

      // Get athlete's recruiting preferences
      const preferences = await storage.getRecruitingPreferences(athleteId);

      // Calculate division recommendation
      const divisionInfo = this.calculateDivisionRecommendation(athlete, metrics);
      
      // Match schools
      const matchedSchools = this.matchSchools(athlete, metrics, preferences, options);
      
      // Generate feedback
      const feedback = this.generateFeedback(athlete, metrics, divisionInfo.divisionRecommendation);
      
      return {
        divisionRecommendation: divisionInfo.divisionRecommendation,
        matchScore: divisionInfo.matchScore,
        matchedSchools,
        feedback
      };
    } catch (error) {
      console.error("Error in college matcher:", error);
      throw error;
    }
  }

  /**
   * Calculate which division is the best fit for an athlete
   */
  private calculateDivisionRecommendation(athlete: Athlete, metrics: CombineMetric): { divisionRecommendation: string, matchScore: number } {
    // Default division and score
    let divisionRecommendation = "D2";
    let matchScore = 50;
    
    // Position-specific logic for QBs
    if (athlete.position.includes("Quarterback")) {
      // Height advantage for QBs
      if (athlete.height && parseFloat(athlete.height) >= 74) { // 6'2" or taller
        matchScore += 15;
      } else if (athlete.height && parseFloat(athlete.height) >= 72) { // 6'0" or taller
        matchScore += 10;
      }
      
      // Speed metrics for mobile QBs
      if (metrics.fortyYard && metrics.fortyYard <= 4.7) { // Fast QB
        matchScore += 10;
      }
    }
    
    // Position-specific logic for WRs/DBs
    if (athlete.position.includes("Receiver") || athlete.position.includes("Back")) {
      if (metrics.fortyYard && metrics.fortyYard <= 4.5) { // Very fast
        matchScore += 20;
      } else if (metrics.fortyYard && metrics.fortyYard <= 4.7) { // Fast
        matchScore += 10;
      }
      
      // Jumping ability
      if (metrics.verticalJump && metrics.verticalJump >= 34) {
        matchScore += 10;
      }
    }
    
    // Position-specific logic for linemen
    if (athlete.position.includes("Line")) {
      // Size advantage
      if (athlete.weight && athlete.weight >= 280) {
        matchScore += 15;
      } else if (athlete.weight && athlete.weight >= 250) {
        matchScore += 10;
      }
      
      // Strength metrics
      if (metrics.benchPress && metrics.benchPress >= 315) {
        matchScore += 15;
      } else if (metrics.benchPress && metrics.benchPress >= 275) {
        matchScore += 10;
      }
    }
    
    // Academic considerations
    if (athlete.gpa && athlete.gpa >= 3.7) {
      matchScore += 15; // Academic excellence
    } else if (athlete.gpa && athlete.gpa >= 3.3) {
      matchScore += 10; // Solid academics
    }
    
    // Test scores
    if (athlete.actScore && athlete.actScore >= 28) {
      matchScore += 10;
    } else if (athlete.actScore && athlete.actScore >= 25) {
      matchScore += 5;
    }
    
    // Assign division based on match score
    if (matchScore >= 80) {
      divisionRecommendation = "D1";
    } else if (matchScore >= 60) {
      divisionRecommendation = "D2";
    } else if (matchScore >= 40) {
      divisionRecommendation = "D3/NAIA";
    } else {
      divisionRecommendation = "JUCO";
    }
    
    // Cap match score at 100
    matchScore = Math.min(Math.max(matchScore, 0), 100);
    
    return { divisionRecommendation, matchScore };
  }
  
  /**
   * Match schools based on athlete profile and preferences
   */
  private matchSchools(
    athlete: Athlete, 
    metrics: CombineMetric, 
    preferences?: any,
    options?: any
  ): MatchedSchool[] {
    // Clone colleges so we can modify them
    const matchedSchools = JSON.parse(JSON.stringify(colleges)) as MatchedSchool[];
    
    // Calculate matches for each school
    matchedSchools.forEach(school => {
      // Academic match score calculation
      if (athlete.gpa) {
        // Higher match score for better academic fit
        if (school.division === "D1" && athlete.gpa >= 3.3) {
          school.academicMatch = 80 + Math.min((athlete.gpa - 3.3) * 50, 20);
        } else if (school.division === "D2" && athlete.gpa >= 2.8) {
          school.academicMatch = 80 + Math.min((athlete.gpa - 2.8) * 50, 20);
        } else if ((school.division === "D3" || school.division === "NAIA") && athlete.gpa >= 2.5) {
          school.academicMatch = 80 + Math.min((athlete.gpa - 2.5) * 50, 20);
        } else if (school.division === "JUCO") {
          school.academicMatch = 80; // JUCO is generally accessible
        } else {
          // Academic match is lower if GPA is below threshold
          school.academicMatch = Math.max(40, athlete.gpa * 25);
        }
      } else {
        school.academicMatch = 50; // Default if no GPA
      }
      
      // Athletic match calculation
      if (school.division === "D1") {
        // D1 has highest athletic requirements
        school.athleticMatch = this.calculateAthleticMatch(metrics, athlete, 0.9);
      } else if (school.division === "D2") {
        school.athleticMatch = this.calculateAthleticMatch(metrics, athlete, 0.7);
      } else if (school.division === "D3" || school.division === "NAIA") {
        school.athleticMatch = this.calculateAthleticMatch(metrics, athlete, 0.5);
      } else {
        // JUCO - most accessible athletically
        school.athleticMatch = this.calculateAthleticMatch(metrics, athlete, 0.3);
      }
      
      // Factor in preferences if available
      if (preferences) {
        // Preferred division
        if (preferences.desiredDivision && preferences.desiredDivision === school.division) {
          school.academicMatch += 10;
          school.athleticMatch += 10;
        }
        
        // Preferred schools
        if (preferences.schoolsOfInterest && 
            Array.isArray(preferences.schoolsOfInterest) && 
            preferences.schoolsOfInterest.includes(school.name)) {
          school.academicMatch += 15;
          school.athleticMatch += 15;
        }
      }
      
      // Apply filters based on options
      if (options) {
        // Region filter
        if (options.region && school.region !== options.region) {
          school.academicMatch *= 0.7;
          school.athleticMatch *= 0.7;
        }
        
        // Major/program filter
        if (options.preferredMajor && 
            (!school.programs || !school.programs.some(p => 
              p.toLowerCase().includes(options.preferredMajor.toLowerCase())
            ))) {
          school.academicMatch *= 0.6;
        }
      }
      
      // Calculate overall match score (weighted average)
      school.overallMatch = Math.round((school.academicMatch * 0.4 + school.athleticMatch * 0.6));
      
      // Ensure all scores are within 0-100 range
      school.academicMatch = Math.min(Math.max(Math.round(school.academicMatch), 0), 100);
      school.athleticMatch = Math.min(Math.max(Math.round(school.athleticMatch), 0), 100);
      school.overallMatch = Math.min(Math.max(Math.round(school.overallMatch), 0), 100);
    });
    
    // Sort by overall match score (descending)
    return matchedSchools.sort((a, b) => b.overallMatch - a.overallMatch);
  }
  
  /**
   * Calculate athletic match score based on position and metrics
   */
  private calculateAthleticMatch(metrics: CombineMetric, athlete: Athlete, difficultyFactor: number): number {
    let score = 50; // Base score
    const position = athlete.position;
    
    // Different metrics matter for different positions
    if (position.includes("Quarterback")) {
      // QB-specific metrics
      if (metrics.fortyYard) {
        // Speed less important but still relevant for QBs
        if (metrics.fortyYard <= 4.7) score += 15;
        else if (metrics.fortyYard <= 5.0) score += 10;
        else if (metrics.fortyYard <= 5.3) score += 5;
      }
      
      // Height important for vision
      if (athlete.height) {
        const heightInches = parseFloat(athlete.height);
        if (heightInches >= 75) score += 20; // 6'3"+ optimal
        else if (heightInches >= 73) score += 15; // 6'1"+ good
        else if (heightInches >= 71) score += 10; // 5'11"+ decent
      }
    } 
    else if (position.includes("Back") || position.includes("Receiver") || position.includes("Safety") || position.includes("Corner")) {
      // Speed-based positions
      if (metrics.fortyYard) {
        if (metrics.fortyYard <= 4.4) score += 25;
        else if (metrics.fortyYard <= 4.5) score += 20;
        else if (metrics.fortyYard <= 4.6) score += 15;
        else if (metrics.fortyYard <= 4.8) score += 10;
      }
      
      // Agility for these positions
      if (metrics.shuttle) {
        if (metrics.shuttle <= 4.0) score += 15;
        else if (metrics.shuttle <= 4.2) score += 10;
        else if (metrics.shuttle <= 4.4) score += 5;
      }
      
      // Vertical for catching/defending passes
      if (metrics.verticalJump) {
        if (metrics.verticalJump >= 38) score += 15;
        else if (metrics.verticalJump >= 35) score += 10;
        else if (metrics.verticalJump >= 32) score += 5;
      }
    }
    else if (position.includes("Line")) {
      // Strength-based metrics for linemen
      if (metrics.benchPress) {
        if (metrics.benchPress >= 350) score += 20;
        else if (metrics.benchPress >= 315) score += 15;
        else if (metrics.benchPress >= 275) score += 10;
        else if (metrics.benchPress >= 225) score += 5;
      }
      
      // Weight/size
      if (athlete.weight) {
        if (position.includes("Offensive")) {
          if (athlete.weight >= 300) score += 15;
          else if (athlete.weight >= 280) score += 10;
          else if (athlete.weight >= 260) score += 5;
        } else { // Defensive line
          if (athlete.weight >= 280) score += 15;
          else if (athlete.weight >= 260) score += 10;
          else if (athlete.weight >= 240) score += 5;
        }
      }
    }
    else if (position.includes("Linebacker")) {
      // Hybrid of speed and strength
      if (metrics.fortyYard) {
        if (metrics.fortyYard <= 4.6) score += 20;
        else if (metrics.fortyYard <= 4.8) score += 15;
        else if (metrics.fortyYard <= 5.0) score += 10;
      }
      
      if (metrics.benchPress) {
        if (metrics.benchPress >= 315) score += 15;
        else if (metrics.benchPress >= 275) score += 10;
        else if (metrics.benchPress >= 225) score += 5;
      }
    }
    
    // Apply difficulty factor (higher divisions have stricter requirements)
    const adjustedScore = 50 + (score - 50) * difficultyFactor;
    
    return adjustedScore;
  }
  
  /**
   * Generate feedback and improvement suggestions
   */
  private generateFeedback(athlete: Athlete, metrics: CombineMetric, recommendedDivision: string): string[] {
    const feedback: string[] = [];
    
    // Division-specific feedback
    if (recommendedDivision === "D1") {
      feedback.push("Your profile indicates D1 potential. Continue developing in all areas to maintain this trajectory.");
    } else if (recommendedDivision === "D2") {
      feedback.push("Your profile aligns well with D2 programs, which offer excellent competition and often substantial scholarships.");
    } else if (recommendedDivision === "D3/NAIA") {
      feedback.push("D3 and NAIA schools offer competitive football and strong academics, often with merit-based scholarships.");
    } else {
      feedback.push("JUCO can be an excellent path to develop and potentially transfer to a four-year program later.");
    }
    
    // Academic feedback
    if (athlete.gpa) {
      if (athlete.gpa < 2.5) {
        feedback.push("To improve your options, focus on raising your GPA to at least 2.5.");
      } else if (athlete.gpa < 3.0 && (recommendedDivision === "D1" || recommendedDivision === "D2")) {
        feedback.push("To strengthen your D1/D2 candidacy, aim to raise your GPA to 3.0+.");
      }
    } else {
      feedback.push("Add your GPA to your profile to receive more accurate college matching.");
    }
    
    // Athletic feedback based on position
    if (athlete.position.includes("Quarterback")) {
      if (metrics.fortyYard && metrics.fortyYard > 5.0) {
        feedback.push(`Improving your speed from ${metrics.fortyYard}s to under 5.0s in the 40-yard dash would increase your options.`);
      }
    } 
    else if (athlete.position.includes("Receiver") || athlete.position.includes("Back") || athlete.position.includes("Corner") || athlete.position.includes("Safety")) {
      if (metrics.fortyYard && metrics.fortyYard > 4.7) {
        feedback.push(`Speed is critical for your position. Work on improving your 40-yard time from ${metrics.fortyYard}s to under 4.7s.`);
      }
      if (metrics.verticalJump && metrics.verticalJump < 32) {
        feedback.push(`A vertical jump of 32+ inches would strengthen your profile (currently ${metrics.verticalJump}").`);
      }
    }
    else if (athlete.position.includes("Line")) {
      if (metrics.benchPress && metrics.benchPress < 275) {
        feedback.push(`Strength is key for linemen. Aim to increase your bench press from ${metrics.benchPress} to 275+ lbs.`);
      }
    }
    
    // Test score feedback
    if (!athlete.actScore && !athlete.satScore) {
      feedback.push("Taking the ACT or SAT can increase your academic profile for college recruitment.");
    }
    
    // Recruiting materials feedback
    const preferences = storage.getRecruitingPreferences(athlete.id).catch(() => null);
    if (preferences) {
      promises.then(prefs => {
        if (prefs && !prefs.hasHighlightFilm) {
          feedback.push("Creating a highlight film is essential for college recruitment. Add one to your profile.");
        }
      });
    } else {
      feedback.push("Complete your recruiting preferences to receive more tailored college matches.");
    }
    
    return feedback;
  }
}

export const collegeMatcher = new CollegeMatcher();