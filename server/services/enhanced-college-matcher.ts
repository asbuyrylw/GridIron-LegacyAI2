/**
 * Enhanced College Matcher - AI-powered recruiting recommendation engine
 * Matches athletes with college programs based on athletic ability, 
 * academic profile, and personal preferences.
 */

import { storage } from "../storage";
import type { Athlete, CombineMetric } from "@shared/schema";
import { colleges, College } from "../data/college-database";
import { generateRecruitingInsights } from "../openai";

export interface CollegeMatchResult {
  divisionRecommendation: string;
  matchScore: number;
  matchedSchools: MatchedCollege[];
  feedback: string[];
  insights?: string[];
  athleteProfile: {
    academicStrength: number; // 0-100
    athleticStrength: number; // 0-100
    positionRanking?: string; // e.g. "Top 10% of QB prospects"
  };
}

export interface MatchedCollege extends College {
  academicMatch: number; // 0-100
  athleticMatch: number; // 0-100
  overallMatch: number; // 0-100
  financialFit?: number; // 0-100, calculated if financial data available
  locationFit?: number; // 0-100, calculated if location preference available
  scholarshipPotential?: string; // "High", "Medium", "Low"
  admissionChance?: string; // "Excellent", "Good", "Average", "Reach"
  campusSize?: string; // "Large", "Medium", "Small"
  matchingReasons?: string[];
}

export interface CollegeMatcherOptions {
  region?: string;
  preferredMajor?: string;
  maxDistance?: number;
  preferredState?: string;
  financialAidImportance?: number; // 0-10
  athleticScholarshipRequired?: boolean;
  minEnrollment?: number;
  maxEnrollment?: number;
  publicOnly?: boolean;
  privateOnly?: boolean;
  useAI?: boolean; // Whether to use AI to enhance results
}

/**
 * The Enhanced College Matcher service helps athletes find the right college fit
 * based on their academic and athletic profiles, with personalized matching.
 */
export class EnhancedCollegeMatcher {
  /**
   * Generate college matches for an athlete based on their profile data
   */
  async generateCollegeMatches(athleteId: number, options?: CollegeMatcherOptions): Promise<CollegeMatchResult> {
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
      const matchedSchools = await this.matchSchools(athlete, metrics, preferences, options);
      
      // Generate feedback
      const feedback = this.generateFeedback(athlete, metrics, divisionInfo.divisionRecommendation);
      
      // Get academic and athletic strength scores
      const academicStrength = this.calculateAcademicStrength(athlete);
      const athleticStrength = this.calculateAthleticStrength(metrics, athlete);
      
      // Generate AI insights if requested
      let insights: string[] | undefined;
      if (options?.useAI) {
        insights = await this.generateAIInsights(athlete, metrics, matchedSchools.slice(0, 5));
      }
      
      return {
        divisionRecommendation: divisionInfo.divisionRecommendation,
        matchScore: divisionInfo.matchScore,
        matchedSchools,
        feedback,
        insights,
        athleteProfile: {
          academicStrength,
          athleticStrength,
          positionRanking: this.calculatePositionRanking(athlete, metrics)
        }
      };
    } catch (error) {
      console.error("Error in college matcher:", error);
      throw error;
    }
  }

  /**
   * Calculate academic strength score for an athlete
   */
  private calculateAcademicStrength(athlete: Athlete): number {
    let score = 50; // Base score
    
    // GPA factor (max 40 points)
    if (athlete.gpa) {
      if (athlete.gpa >= 4.0) score += 40;
      else if (athlete.gpa >= 3.7) score += 35;
      else if (athlete.gpa >= 3.5) score += 30;
      else if (athlete.gpa >= 3.3) score += 25;
      else if (athlete.gpa >= 3.0) score += 20;
      else if (athlete.gpa >= 2.5) score += 10;
    }
    
    // Test scores factor (max 30 points)
    if (athlete.actScore) {
      if (athlete.actScore >= 32) score += 30;
      else if (athlete.actScore >= 28) score += 25;
      else if (athlete.actScore >= 24) score += 20;
      else if (athlete.actScore >= 20) score += 15;
      else if (athlete.actScore >= 18) score += 10;
    }
    
    // Ensure score is within 0-100
    return Math.min(100, Math.max(0, score));
  }
  
  /**
   * Calculate athletic strength score based on position and metrics
   */
  private calculateAthleticStrength(metrics: CombineMetric, athlete: Athlete): number {
    let score = 50; // Base score
    const position = athlete.position || "";
    
    // Different metrics matter for different positions
    if (position.includes("Quarterback")) {
      // QB-specific metrics
      if (metrics.fortyYard) {
        // Speed less important but still relevant for QBs
        if (metrics.fortyYard <= 4.6) score += 25;
        else if (metrics.fortyYard <= 4.8) score += 20;
        else if (metrics.fortyYard <= 5.0) score += 15;
        else if (metrics.fortyYard <= 5.2) score += 10;
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
    
    // Ensure score is within 0-100
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate estimated position ranking
   */
  private calculatePositionRanking(athlete: Athlete, metrics: CombineMetric): string {
    const athleticStrength = this.calculateAthleticStrength(metrics, athlete);
    
    if (athleticStrength >= 90) return "Elite prospect (Top 1%)";
    if (athleticStrength >= 85) return "Top-tier prospect (Top 5%)";
    if (athleticStrength >= 80) return "High-level prospect (Top 10%)";
    if (athleticStrength >= 75) return "Strong prospect (Top 20%)";
    if (athleticStrength >= 70) return "Solid prospect (Top 30%)";
    if (athleticStrength >= 65) return "Good prospect (Top 40%)";
    if (athleticStrength >= 60) return "Average prospect (Top 50%)";
    if (athleticStrength >= 55) return "Developing prospect (Top 60%)";
    
    return "Developing prospect";
  }

  /**
   * Calculate which division is the best fit for an athlete
   */
  private calculateDivisionRecommendation(athlete: Athlete, metrics: CombineMetric): { divisionRecommendation: string, matchScore: number } {
    // Default division and score
    let divisionRecommendation = "D2";
    let matchScore = 50;
    
    // Position-specific logic for QBs
    if (athlete.position && athlete.position.includes("Quarterback")) {
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
    if (athlete.position && (athlete.position.includes("Receiver") || athlete.position.includes("Back"))) {
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
    if (athlete.position && athlete.position.includes("Line")) {
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
   * Generate AI-powered insights using athlete profile and top matches
   */
  private async generateAIInsights(athlete: Athlete, metrics: CombineMetric, topMatches: MatchedCollege[]): Promise<string[]> {
    try {
      // Use OpenAI to generate recruiting insights
      const insights = await generateRecruitingInsights(athlete, metrics, topMatches);
      return insights;
    } catch (error) {
      console.error("Error generating AI insights:", error);
      return [
        "Focus on your current strengths and continue to develop areas for improvement.",
        "Research each school's academic programs thoroughly to ensure a good fit.",
        "Contact coaches directly to express interest and share your highlight film."
      ];
    }
  }
  
  /**
   * Match schools based on athlete profile and preferences
   */
  private async matchSchools(
    athlete: Athlete, 
    metrics: CombineMetric, 
    preferences?: any,
    options?: CollegeMatcherOptions
  ): Promise<MatchedCollege[]> {
    // Clone colleges so we can modify them
    const matchedSchools = JSON.parse(JSON.stringify(colleges)) as MatchedCollege[];
    
    // Calculate matches for each school
    matchedSchools.forEach(school => {
      // Academic match score calculation
      school.academicMatch = this.calculateAcademicMatch(athlete, school);
      
      // Athletic match calculation
      school.athleticMatch = this.calculateAthleticMatch(metrics, athlete, school);
      
      // Financial fit calculation
      school.financialFit = this.calculateFinancialFit(athlete, school);
      
      // Location fit calculation
      school.locationFit = this.calculateLocationFit(athlete, school, preferences);
      
      // Determine scholarship potential
      school.scholarshipPotential = this.determineScholarshipPotential(athlete, metrics, school);
      
      // Determine admission chance
      school.admissionChance = this.determineAdmissionChance(athlete, school);
      
      // Determine campus size
      school.campusSize = this.determineCampusSize(school.enrollment);
      
      // Generate matching reasons
      school.matchingReasons = this.generateMatchingReasons(athlete, metrics, school, preferences);
      
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
        
        // State filter
        if (options.preferredState && school.state.toLowerCase() !== options.preferredState.toLowerCase()) {
          school.academicMatch *= 0.8;
          school.athleticMatch *= 0.8;
        }
        
        // Major/program filter
        if (options.preferredMajor && 
            (!school.programs || !school.programs.some(p => 
              p.toLowerCase().includes(options.preferredMajor!.toLowerCase())
            ))) {
          school.academicMatch *= 0.6;
        }
        
        // Athletic scholarship requirement
        if (options.athleticScholarshipRequired && !school.athleticScholarships) {
          school.athleticMatch *= 0.3;
          school.overallMatch = 0; // Disqualify schools without athletic scholarships
        }
        
        // Public/private filter
        if (options.publicOnly && !school.isPublic) {
          school.overallMatch = 0;
        }
        
        if (options.privateOnly && school.isPublic) {
          school.overallMatch = 0;
        }
        
        // Enrollment filters
        if (options.minEnrollment && school.enrollment < options.minEnrollment) {
          school.academicMatch *= 0.7;
        }
        
        if (options.maxEnrollment && school.enrollment > options.maxEnrollment) {
          school.academicMatch *= 0.7;
        }
      }
      
      // Calculate overall match score (weighted average)
      const baseOverallMatch = (school.academicMatch * 0.4 + 
                               school.athleticMatch * 0.6);
      
      // Adjust with financial and location if available
      if (school.financialFit !== undefined && school.locationFit !== undefined) {
        let financialWeight = options?.financialAidImportance ? (options.financialAidImportance / 10) * 0.2 : 0.1;
        let locationWeight = 0.1;
        let academicWeight = 0.4 - (financialWeight / 2);
        let athleticWeight = 0.6 - (financialWeight / 2) - locationWeight;
        
        school.overallMatch = (school.academicMatch * academicWeight +
                              school.athleticMatch * athleticWeight +
                              school.financialFit * financialWeight +
                              school.locationFit * locationWeight);
      } else {
        school.overallMatch = baseOverallMatch;
      }
      
      // Ensure all scores are within 0-100 range
      school.academicMatch = Math.min(Math.max(Math.round(school.academicMatch), 0), 100);
      school.athleticMatch = Math.min(Math.max(Math.round(school.athleticMatch), 0), 100);
      school.overallMatch = Math.min(Math.max(Math.round(school.overallMatch), 0), 100);
      if (school.financialFit !== undefined) {
        school.financialFit = Math.min(Math.max(Math.round(school.financialFit), 0), 100);
      }
      if (school.locationFit !== undefined) {
        school.locationFit = Math.min(Math.max(Math.round(school.locationFit), 0), 100);
      }
    });
    
    // Sort by overall match score (descending) and filter out disqualified schools
    return matchedSchools
      .filter(school => school.overallMatch > 0)
      .sort((a, b) => b.overallMatch - a.overallMatch);
  }
  
  /**
   * Calculate academic match score
   */
  private calculateAcademicMatch(athlete: Athlete, school: College): number {
    let score = 50; // Base score
    
    if (athlete.gpa && school.averageGPA) {
      // GPA comparison
      const gpaDiff = athlete.gpa - school.averageGPA;
      if (gpaDiff >= 0.3) score += 25; // Well above average
      else if (gpaDiff >= 0) score += 20; // Above average
      else if (gpaDiff >= -0.3) score += 15; // Slightly below
      else if (gpaDiff >= -0.5) score += 10; // Below but within range
      else score += 5; // Well below
    } else if (athlete.gpa) {
      // Estimate based on division if no school GPA data
      if (school.division === "D1" && athlete.gpa >= 3.5) score += 25;
      else if (school.division === "D1" && athlete.gpa >= 3.2) score += 20;
      else if (school.division === "D2" && athlete.gpa >= 3.0) score += 25;
      else if (school.division === "D2" && athlete.gpa >= 2.7) score += 20;
      else if ((school.division === "D3" || school.division === "NAIA") && athlete.gpa >= 2.7) score += 25;
      else if ((school.division === "D3" || school.division === "NAIA") && athlete.gpa >= 2.5) score += 20;
      else if (school.division === "JUCO") score += 20; // JUCO is generally accessible
    }
    
    // Admission rate consideration
    if (athlete.gpa && school.admissionRate) {
      if (school.admissionRate < 0.2) { // Very selective
        if (athlete.gpa >= 3.8) score += 15;
        else if (athlete.gpa >= 3.5) score += 10;
        else if (athlete.gpa < 3.3) score -= 15; // Penalty for selective schools
      } else if (school.admissionRate < 0.5) { // Moderately selective
        if (athlete.gpa >= 3.5) score += 10;
        else if (athlete.gpa >= 3.2) score += 5;
        else if (athlete.gpa < 3.0) score -= 5;
      }
      // Less selective schools don't have penalties
    }
    
    // Program match (if preferred major is known)
    if (athlete.preferredMajor && school.programs) {
      const matchingProgram = school.programs.some(program => 
        program.toLowerCase().includes(athlete.preferredMajor!.toLowerCase())
      );
      if (matchingProgram) score += 15;
    }
    
    return score;
  }
  
  /**
   * Calculate athletic match score based on position and metrics
   */
  private calculateAthleticMatch(metrics: CombineMetric, athlete: Athlete, school: College): number {
    // Base athletic match derived from school's division and athlete's metrics
    let baseScore = 50;
    const position = athlete.position || "";
    
    // Adjust difficulty factor based on division
    let difficultyFactor = 1.0;
    if (school.division === "D1") difficultyFactor = 0.9;
    else if (school.division === "D2") difficultyFactor = 0.7; 
    else if (school.division === "D3" || school.division === "NAIA") difficultyFactor = 0.5;
    else difficultyFactor = 0.3; // JUCO
    
    // Different metrics matter for different positions
    if (position.includes("Quarterback")) {
      // QB-specific metrics
      if (metrics.fortyYard) {
        // Speed less important but still relevant for QBs
        if (metrics.fortyYard <= 4.7) baseScore += 15;
        else if (metrics.fortyYard <= 5.0) baseScore += 10;
        else if (metrics.fortyYard <= 5.3) baseScore += 5;
      }
      
      // Height important for vision
      if (athlete.height) {
        const heightInches = parseFloat(athlete.height);
        if (heightInches >= 75) baseScore += 20; // 6'3"+ optimal
        else if (heightInches >= 73) baseScore += 15; // 6'1"+ good
        else if (heightInches >= 71) baseScore += 10; // 5'11"+ decent
      }
    } 
    else if (position.includes("Back") || position.includes("Receiver") || position.includes("Safety") || position.includes("Corner")) {
      // Speed-based positions
      if (metrics.fortyYard) {
        if (metrics.fortyYard <= 4.4) baseScore += 25;
        else if (metrics.fortyYard <= 4.5) baseScore += 20;
        else if (metrics.fortyYard <= 4.6) baseScore += 15;
        else if (metrics.fortyYard <= 4.8) baseScore += 10;
      }
      
      // Agility for these positions
      if (metrics.shuttle) {
        if (metrics.shuttle <= 4.0) baseScore += 15;
        else if (metrics.shuttle <= 4.2) baseScore += 10;
        else if (metrics.shuttle <= 4.4) baseScore += 5;
      }
      
      // Vertical for catching/defending passes
      if (metrics.verticalJump) {
        if (metrics.verticalJump >= 38) baseScore += 15;
        else if (metrics.verticalJump >= 35) baseScore += 10;
        else if (metrics.verticalJump >= 32) baseScore += 5;
      }
    }
    else if (position.includes("Line")) {
      // Strength-based metrics for linemen
      if (metrics.benchPress) {
        if (metrics.benchPress >= 350) baseScore += 20;
        else if (metrics.benchPress >= 315) baseScore += 15;
        else if (metrics.benchPress >= 275) baseScore += 10;
        else if (metrics.benchPress >= 225) baseScore += 5;
      }
      
      // Weight/size
      if (athlete.weight) {
        if (position.includes("Offensive")) {
          if (athlete.weight >= 300) baseScore += 15;
          else if (athlete.weight >= 280) baseScore += 10;
          else if (athlete.weight >= 260) baseScore += 5;
        } else { // Defensive line
          if (athlete.weight >= 280) baseScore += 15;
          else if (athlete.weight >= 260) baseScore += 10;
          else if (athlete.weight >= 240) baseScore += 5;
        }
      }
    }
    else if (position.includes("Linebacker")) {
      // Hybrid of speed and strength
      if (metrics.fortyYard) {
        if (metrics.fortyYard <= 4.6) baseScore += 20;
        else if (metrics.fortyYard <= 4.8) baseScore += 15;
        else if (metrics.fortyYard <= 5.0) baseScore += 10;
      }
      
      if (metrics.benchPress) {
        if (metrics.benchPress >= 315) baseScore += 15;
        else if (metrics.benchPress >= 275) baseScore += 10;
        else if (metrics.benchPress >= 225) baseScore += 5;
      }
    }
    
    // Apply difficulty factor (higher divisions have stricter requirements)
    const adjustedBaseScore = 50 + (baseScore - 50) * difficultyFactor;
    
    // Position-specific recruiting boost
    let recruitingBoost = 0;
    if (school.recruitingProfile?.activelyRecruiting) {
      // Check if school is recruiting the athlete's position
      const isActivelyRecruiting = school.recruitingProfile.activelyRecruiting.some(
        recruitingPosition => position.includes(recruitingPosition.replace(/\(.+\)/, "").trim())
      );
      
      if (isActivelyRecruiting) {
        recruitingBoost = 20; // Significant boost if school needs the position
      }
    }
    
    // Final score calculation
    const finalScore = adjustedBaseScore + recruitingBoost;
    
    return Math.min(100, Math.max(0, finalScore));
  }
  
  /**
   * Calculate financial fit score
   */
  private calculateFinancialFit(athlete: Athlete, school: College): number {
    let score = 50; // Base score
    
    // Athletic scholarship availability
    if (school.athleticScholarships) {
      score += 15;
    }
    
    // In-state vs out-of-state tuition
    if (athlete.state && athlete.state.toLowerCase() === school.state.toLowerCase()) {
      score += 20; // In-state tuition advantage
    }
    
    // School type (public vs private)
    if (school.isPublic) {
      score += 10; // Public schools generally more affordable
    }
    
    return score;
  }
  
  /**
   * Calculate location fit score
   */
  private calculateLocationFit(athlete: Athlete, school: College, preferences?: any): number {
    let score = 50; // Base score
    
    // Region match
    if (athlete.region && athlete.region === school.region) {
      score += 20;
    }
    
    // State match (higher priority)
    if (athlete.state && athlete.state.toLowerCase() === school.state.toLowerCase()) {
      score += 25;
    }
    
    // Preference-based adjustments
    if (preferences) {
      if (preferences.preferredRegion && preferences.preferredRegion === school.region) {
        score += 15;
      }
      
      if (preferences.preferredState && 
          preferences.preferredState.toLowerCase() === school.state.toLowerCase()) {
        score += 20;
      }
      
      // Distance preference (from preferences or athlete's location)
      if (preferences.maxDistance) {
        // Simple approximation
        if (athlete.region && athlete.region !== school.region) {
          score -= 15; // Different region penalty
        }
      }
    }
    
    return Math.min(100, Math.max(0, score));
  }
  
  /**
   * Determine scholarship potential at a school
   */
  private determineScholarshipPotential(athlete: Athlete, metrics: CombineMetric, school: College): string {
    // No athletic scholarships at D3
    if (school.division === "D3") return "None (D3 schools don't offer athletic scholarships)";
    
    // No scholarships at school
    if (!school.athleticScholarships) return "None";
    
    // Calculate athletic match score for this specific school
    const athleticMatch = this.calculateAthleticMatch(metrics, athlete, school);
    
    // Determine potential based on match score and division
    if (school.division === "D1") {
      if (athleticMatch >= 85) return "High";
      if (athleticMatch >= 70) return "Medium";
      return "Low";
    } else if (school.division === "D2") {
      if (athleticMatch >= 80) return "High";
      if (athleticMatch >= 65) return "Medium";
      return "Low";
    } else { // NAIA or JUCO
      if (athleticMatch >= 75) return "High";
      if (athleticMatch >= 60) return "Medium";
      return "Low";
    }
  }
  
  /**
   * Determine admission chance
   */
  private determineAdmissionChance(athlete: Athlete, school: College): string {
    if (!athlete.gpa) return "Unknown (GPA required)";
    
    let gpaFactor = 0;
    if (athlete.gpa >= 4.0) gpaFactor = 4;
    else if (athlete.gpa >= 3.7) gpaFactor = 3;
    else if (athlete.gpa >= 3.3) gpaFactor = 2;
    else if (athlete.gpa >= 3.0) gpaFactor = 1;
    else gpaFactor = 0;
    
    let testFactor = 0;
    if (athlete.actScore) {
      if (athlete.actScore >= 30) testFactor = 3;
      else if (athlete.actScore >= 27) testFactor = 2;
      else if (athlete.actScore >= 24) testFactor = 1;
      else testFactor = 0;
    }
    
    // Calculate admission score
    const admissionScore = gpaFactor + testFactor;
    
    // Adjust based on school selectivity
    if (school.admissionRate) {
      if (school.admissionRate < 0.1) { // Extremely selective
        if (admissionScore >= 6) return "Good";
        if (admissionScore >= 4) return "Average";
        return "Reach";
      } else if (school.admissionRate < 0.3) { // Very selective
        if (admissionScore >= 5) return "Excellent";
        if (admissionScore >= 3) return "Good";
        if (admissionScore >= 1) return "Average";
        return "Reach";
      } else if (school.admissionRate < 0.6) { // Moderately selective
        if (admissionScore >= 4) return "Excellent";
        if (admissionScore >= 2) return "Good";
        return "Average";
      } else { // Less selective
        if (admissionScore >= 2) return "Excellent";
        return "Good";
      }
    } else {
      // Approximate based on division if admission rate unknown
      if (school.division === "D1") {
        if (admissionScore >= 5) return "Excellent";
        if (admissionScore >= 3) return "Good";
        if (admissionScore >= 1) return "Average";
        return "Reach";
      } else {
        if (admissionScore >= 3) return "Excellent";
        if (admissionScore >= 1) return "Good";
        return "Average";
      }
    }
  }
  
  /**
   * Determine campus size category based on enrollment
   */
  private determineCampusSize(enrollment: number): string {
    if (enrollment >= 20000) return "Large";
    if (enrollment >= 5000) return "Medium";
    return "Small";
  }
  
  /**
   * Generate matching reasons for each school
   */
  private generateMatchingReasons(athlete: Athlete, metrics: CombineMetric, school: College, preferences?: any): string[] {
    const reasons: string[] = [];
    
    // Athletic fit
    const athleticMatch = this.calculateAthleticMatch(metrics, athlete, school);
    if (athleticMatch >= 80) {
      reasons.push("Strong athletic fit for your position and abilities");
    }
    
    // Academic fit
    const academicMatch = this.calculateAcademicMatch(athlete, school);
    if (academicMatch >= 80) {
      reasons.push("Excellent academic match for your profile");
    }
    
    // Actively recruiting your position
    if (school.recruitingProfile?.activelyRecruiting) {
      const position = athlete.position || "";
      const isActivelyRecruiting = school.recruitingProfile.activelyRecruiting.some(
        recruitingPosition => position.includes(recruitingPosition.replace(/\(.+\)/, "").trim())
      );
      
      if (isActivelyRecruiting) {
        reasons.push("Currently recruiting your position");
      }
    }
    
    // Major/program match
    if (athlete.preferredMajor && school.programs) {
      const matchingProgram = school.programs.some(program => 
        program.toLowerCase().includes(athlete.preferredMajor!.toLowerCase())
      );
      if (matchingProgram) {
        reasons.push(`Offers your preferred major: ${athlete.preferredMajor}`);
      }
    }
    
    // Location preferences
    if (preferences?.preferredState && 
        preferences.preferredState.toLowerCase() === school.state.toLowerCase()) {
      reasons.push(`Located in your preferred state: ${school.state}`);
    }
    
    if (preferences?.preferredRegion && preferences.preferredRegion === school.region) {
      reasons.push(`Located in your preferred region: ${school.region}`);
    }
    
    // Recent success
    if (school.recruitingProfile?.recentSuccess) {
      reasons.push(`Program success: ${school.recruitingProfile.recentSuccess}`);
    }
    
    // School type
    if (preferences?.preferPublic && school.isPublic) {
      reasons.push("Public institution (as preferred)");
    }
    
    if (preferences?.preferPrivate && !school.isPublic) {
      reasons.push("Private institution (as preferred)");
    }
    
    // Scholarship availability
    if (preferences?.requireScholarship && school.athleticScholarships) {
      reasons.push("Offers athletic scholarships");
    }
    
    // Campus size
    const campusSize = this.determineCampusSize(school.enrollment);
    if (preferences?.preferredCampusSize === campusSize) {
      reasons.push(`${campusSize} campus size (as preferred)`);
    }
    
    // If no specific reasons, add a generic one
    if (reasons.length === 0) {
      reasons.push("Overall good match for your athletic and academic profile");
    }
    
    return reasons;
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
        feedback.push("To improve your options, focus on raising your GPA above 2.5, which is a common minimum for many athletic programs.");
      } else if (athlete.gpa < 3.0 && recommendedDivision === "D1") {
        feedback.push("To strengthen your D1 prospects, work on raising your GPA above 3.0 to meet NCAA eligibility requirements.");
      } else if (athlete.gpa >= 3.5) {
        feedback.push("Your strong academic profile opens additional opportunities, including academic scholarships at many institutions.");
      }
    } else {
      feedback.push("Adding your GPA to your profile will allow for more accurate college matching.");
    }
    
    // Test score feedback
    if (!athlete.actScore && !athlete.satScore) {
      feedback.push("Taking the ACT or SAT can help strengthen your academic profile for college recruiters.");
    }
    
    // Position-specific feedback
    if (athlete.position) {
      if (athlete.position.includes("Quarterback")) {
        feedback.push("Quarterbacks should continue to develop both passing accuracy and decision-making skills, which are highly valued by recruiters.");
      } else if (athlete.position.includes("Line")) {
        feedback.push("Continue to develop strength and conditioning as linemen are evaluated heavily on size, strength, and mobility.");
      } else if (athlete.position.includes("Back") || athlete.position.includes("Receiver")) {
        feedback.push("Speed, agility, and hands are crucial for your position. Consider focusing on improving your 40-yard dash and shuttle times.");
      }
    }
    
    // General athletic feedback
    feedback.push("Create quality highlight films that showcase your best plays and athleticism.");
    feedback.push("Actively reach out to coaches at your target schools to express interest and share your highlights.");
    
    return feedback;
  }
  
  /**
   * Get college details by ID
   */
  async getCollegeById(id: number): Promise<College | undefined> {
    return colleges.find(college => college.id === id);
  }
  
  /**
   * Get colleges by division
   */
  async getCollegesByDivision(division: string): Promise<College[]> {
    return colleges.filter(college => college.division === division);
  }
  
  /**
   * Search colleges by name, region, or state
   */
  async searchColleges(query: string): Promise<College[]> {
    query = query.toLowerCase();
    return colleges.filter(college => 
      college.name.toLowerCase().includes(query) ||
      college.region.toLowerCase().includes(query) ||
      college.state.toLowerCase().includes(query) ||
      college.city.toLowerCase().includes(query)
    );
  }
}

export const enhancedCollegeMatcher = new EnhancedCollegeMatcher();