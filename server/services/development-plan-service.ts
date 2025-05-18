import { storage } from "../storage";
import { AcademicProfile, athletes } from "@shared/schema";
import OpenAI from "openai";

// Helper function to calculate age from a birth date
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Service for generating comprehensive development plans for athletes
 */
export class DevelopmentPlanService {
  private openai: OpenAI | null = null;

  constructor() {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log("Development Plan service initialized with OpenAI");
    } else {
      console.log("Development Plan service initialized without OpenAI - using mock data");
    }
  }

  /**
   * Generate a complete development plan based on athlete's onboarding data
   * This includes long-term development, yearly goals, and quarterly breakdowns
   */
  async generateAthleteDevelopmentPlan(athleteId: number) {
    try {
      // Get complete athlete profile
      const athleteProfile = await this.getAthleteCompleteProfile(athleteId);
      
      // Generate the long-term development plan
      const longTermPlan = await this.generateLongTermDevelopmentPlan(athleteProfile);
      
      // Generate the current year plan with quarterly breakdown
      const currentYearPlan = await this.generateCurrentYearPlan(athleteProfile, longTermPlan);
      
      // Return the complete development plan
      return {
        athleteId,
        longTermPlan,
        currentYearPlan,
        nextUpdateDate: this.calculateNextUpdateDate(),
        lastGenerated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating development plan:", error);
      throw new Error("Failed to generate development plan");
    }
  }

  /**
   * Gather all relevant athlete data from various database tables
   */
  async getAthleteCompleteProfile(athleteId: number) {
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      throw new Error("Athlete not found");
    }

    const user = await storage.getUser(athlete.userId);
    const metrics = (await storage.getCombineMetrics(athleteId)) || [];
    const latestMetrics = metrics.length > 0 ? metrics[0] : null;
    
    // Get academic data if it exists
    let academicProfile = null;
    try {
      // Use available methods based on the storage implementation
      const academicData = await storage.getAcademicStatsByAthlete(athleteId);
      if (academicData && academicData.length > 0) {
        academicProfile = academicData[0];
      }
    } catch (error) {
      console.log("No academic profile found for athlete");
    }
    
    // Get nutrition profile if it exists
    let nutritionProfile = null;
    try {
      // Use available methods based on the storage implementation
      const nutritionPlans = await storage.getNutritionPlans(athleteId);
      if (nutritionPlans && nutritionPlans.length > 0) {
        nutritionProfile = nutritionPlans[0];
      }
    } catch (error) {
      console.log("No nutrition profile found for athlete");
    }
    
    // Get recruiting profile if it exists
    let recruitingProfile = null;
    try {
      recruitingProfile = await storage.getRecruitingProfile(athleteId);
    } catch (error) {
      console.log("No recruiting profile found for athlete");
    }
    
    // Calculate age based on date of birth if available
    let age = null;
    if (athlete.dateOfBirth) {
      age = calculateAge(new Date(athlete.dateOfBirth));
    }
    
    return {
      user,
      athlete,
      age,
      metrics: latestMetrics,
      academicProfile,
      nutritionProfile,
      recruitingProfile
    };
  }

  /**
   * Generate a long-term development plan from current year to senior year
   */
  async generateLongTermDevelopmentPlan(athleteProfile: any) {
    if (this.openai) {
      try {
        // Use OpenAI to generate the long-term plan
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are an expert football development coach with specialization in creating personalized long-term development plans for high school football players. Create detailed plans that are realistic, actionable, and specifically tailored to the athlete's current metrics, position, and goals."
            },
            {
              role: "user", 
              content: `Create a comprehensive long-term football development plan from now through senior year for this athlete:
              
              Name: ${athleteProfile.athlete.firstName} ${athleteProfile.athlete.lastName}
              Position: ${athleteProfile.athlete.position || "Unknown"}
              Current Grade: ${athleteProfile.athlete.grade || "Freshman"}
              Current Height: ${athleteProfile.athlete.height || "Unknown"}
              Current Weight: ${athleteProfile.athlete.weight || "Unknown"}
              
              Current Combine Metrics:
              40-Yard Dash: ${athleteProfile.metrics?.fortyYard || "Unknown"}
              Bench Press: ${athleteProfile.metrics?.benchPress || "Unknown"} lbs
              Squat: ${athleteProfile.metrics?.squatMax || "Unknown"} lbs
              Vertical Jump: ${athleteProfile.metrics?.verticalJump || "Unknown"} inches
              
              Current Academic Profile:
              GPA: ${athleteProfile.athlete.gpa || "Unknown"}
              ACT/SAT: ${athleteProfile.athlete.actScore || "Not taken yet"}
              
              Create a year-by-year development plan that includes:
              1. Body development (weight, height projections, muscle gain goals, body fat targets)
              2. Athletic metrics progression (specific numbers for combine metrics each year)
              3. Position-specific skill development
              4. Academic goals (GPA targets, course recommendations, test prep)
              5. Recruiting milestones and timeline
              
              Format the response as a JSON object with this structure:
              {
                "overview": "Overall development summary",
                "yearByYearPlan": [
                  {
                    "academicYear": "2024-2025",
                    "grade": 9,
                    "bodyDevelopment": {
                      "targetWeight": 180,
                      "heightProjection": "6'0\"",
                      "targetBodyFat": 12,
                      "muscleGainGoal": "Add 10 lbs lean muscle mass"
                    },
                    "combineMetrics": {
                      "fortyYard": "4.8s",
                      "benchPress": "185 lbs",
                      "squat": "315 lbs",
                      "verticalJump": "30 inches",
                      "shuttle": "4.3s"
                    },
                    "skillDevelopment": {
                      "focus": "Footwork and basic mechanics",
                      "drills": ["Drill 1", "Drill 2"],
                      "techniques": "Description of techniques to master"
                    },
                    "academicGoals": {
                      "gpaTarget": "3.5+",
                      "courseRecommendations": ["Course 1", "Course 2"],
                      "testPrep": "Begin ACT prep in spring"
                    },
                    "recruitingMilestones": {
                      "filmGoals": "Create initial highlight reel",
                      "campPlans": ["Camp 1", "Camp 2"],
                      "exposureStrategy": "Strategy description",
                      "timeline": "Key dates and deadlines"
                    }
                  }
                ]
              }
              
              Make projections realistic but optimistic for player development. Include all five years if the athlete is in 8th grade, four years if freshman, etc. Ensure metrics progression is challenging but achievable.`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        });
        
        const longTermPlan = JSON.parse(response.choices[0].message.content);
        return longTermPlan;
      } catch (error) {
        console.error("Error generating long-term plan with OpenAI:", error);
        // Fall back to mock data if OpenAI fails
        return this.getMockLongTermPlan(athleteProfile);
      }
    } else {
      // Use mock data if OpenAI is not available
      return this.getMockLongTermPlan(athleteProfile);
    }
  }

  /**
   * Generate a detailed plan for the current year with quarterly breakdowns
   */
  async generateCurrentYearPlan(athleteProfile: any, longTermPlan: any) {
    if (this.openai) {
      try {
        // Use the athlete profile and long-term plan to create a detailed current year plan
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are an expert football development coach specializing in creating detailed quarterly training and development plans for high school football players. Your plans should be specific, actionable, and tailored to the athlete's position, metrics, and goals."
            },
            {
              role: "user", 
              content: `Create a detailed current year (next 12 months) development plan broken down by quarters for this athlete:
              
              Name: ${athleteProfile.athlete.firstName} ${athleteProfile.athlete.lastName}
              Position: ${athleteProfile.athlete.position || "Unknown"}
              Current Grade: ${athleteProfile.athlete.grade || "Freshman"}
              
              Current Metrics:
              Height: ${athleteProfile.athlete.height || "Unknown"}
              Weight: ${athleteProfile.athlete.weight || "Unknown"}
              40-Yard Dash: ${athleteProfile.metrics?.fortyYard || "Unknown"}
              Bench Press: ${athleteProfile.metrics?.benchPress || "Unknown"} lbs
              Squat: ${athleteProfile.metrics?.squatMax || "Unknown"} lbs
              Vertical Jump: ${athleteProfile.metrics?.verticalJump || "Unknown"} inches
              
              Annual Goals from Long-Term Plan:
              ${JSON.stringify(longTermPlan.yearByYearPlan?.[0] || {})}
              
              Create a quarterly breakdown plan that includes:
              1. Specific training focus and programming for each quarter
              2. Detailed weekly schedule with exact exercises, sets, reps
              3. Nutrition plans with calorie targets and macro breakdowns
              4. Position-specific skill development drills
              5. Recruiting activities and timeline for each quarter
              
              Format the response as a JSON object with this structure:
              {
                "overview": "Summary of the annual plan approach",
                "quarterlyBreakdown": [
                  {
                    "period": "Summer: June-August",
                    "focusAreas": ["Strength", "Speed", "Skill Development"],
                    "trainingProgram": {
                      "progressionModel": "Linear progression focusing on...",
                      "weeklySchedule": {
                        "monday": {
                          "focus": "Lower Body Strength",
                          "exercises": [
                            {
                              "name": "Back Squat",
                              "sets": 4,
                              "reps": "5",
                              "intensity": "75-85% 1RM",
                              "rest": "2-3 min",
                              "notes": "Focus on depth and form"
                            }
                          ]
                        }
                      },
                      "recoveryProtocol": "Recovery approach"
                    },
                    "nutritionPlan": {
                      "dailyCalories": 3000,
                      "macroBreakdown": {
                        "protein": 180,
                        "carbs": 350,
                        "fat": 85
                      },
                      "mealPlan": {
                        "breakfast": ["Option 1", "Option 2"],
                        "lunch": ["Option 1", "Option 2"],
                        "dinner": ["Option 1", "Option 2"],
                        "snacks": ["Option 1", "Option 2"]
                      },
                      "supplements": ["Supplement 1", "Supplement 2"],
                      "groceryList": ["Item 1", "Item 2"]
                    },
                    "skillDevelopment": {
                      "drills": ["Drill 1", "Drill 2"],
                      "techniques": "Technique focus description",
                      "videoAnalysis": "Analysis approach"
                    },
                    "recruitingTasks": {
                      "filmDevelopment": "Film goals",
                      "outreachStrategy": "Outreach approach",
                      "events": ["Event 1", "Event 2"],
                      "monthlyGoals": {
                        "june": ["Goal 1", "Goal 2"],
                        "july": ["Goal 1", "Goal 2"],
                        "august": ["Goal 1", "Goal 2"]
                      }
                    }
                  }
                ]
              }
              
              Make sure the plan is realistic, detailed, and actionable. Divide the year into 4 quarters that align with the football calendar (offseason, summer, in-season, post-season/winter).`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        });
        
        const currentYearPlan = JSON.parse(response.choices[0].message.content);
        return currentYearPlan;
      } catch (error) {
        console.error("Error generating current year plan with OpenAI:", error);
        // Fall back to mock data if OpenAI fails
        return this.getMockCurrentYearPlan(athleteProfile);
      }
    } else {
      // Use mock data if OpenAI is not available
      return this.getMockCurrentYearPlan(athleteProfile);
    }
  }

  /**
   * Calculates the date for the next 12-week progress check
   */
  private calculateNextUpdateDate(): string {
    const now = new Date();
    const nextUpdate = new Date(now);
    nextUpdate.setDate(now.getDate() + 84); // 12 weeks = 84 days
    return nextUpdate.toISOString();
  }

  /**
   * Generate a progress report comparing current metrics to development plan goals
   */
  async generateProgressReport(athleteId: number) {
    // Implementation for progress reporting
    // This would compare current metrics with planned targets
    return {
      athleteId,
      dateGenerated: new Date().toISOString(),
      metricsComparison: {
        planned: {},
        actual: {},
        variance: {}
      },
      recommendations: []
    };
  }

  /**
   * Generate an annual review and college football projection
   */
  async generateAnnualReview(athleteId: number) {
    // Implementation for annual review
    return {
      athleteId,
      dateGenerated: new Date().toISOString(),
      yearInReview: {},
      collegeProjection: {},
      nextYearFocus: []
    };
  }

  /**
   * Mock data for long-term plan when OpenAI is not available
   */
  private getMockLongTermPlan(athleteProfile: any) {
    const firstName = athleteProfile.athlete.firstName || "Athlete";
    const position = athleteProfile.athlete.position || "Quarterback (QB)";
    
    return {
      "overview": `Long-term development plan for ${firstName} focused on comprehensive growth as a ${position} from current grade through senior year, with increasing skill complexity and physical development.`,
      "yearByYearPlan": [
        {
          "academicYear": "2024-2025",
          "grade": 9,
          "bodyDevelopment": {
            "targetWeight": 175,
            "heightProjection": "5'11\"",
            "targetBodyFat": 14,
            "muscleGainGoal": "Add 10 lbs lean muscle, focus on lower body strength"
          },
          "combineMetrics": {
            "fortyYard": "4.9s",
            "benchPress": "175 lbs",
            "squat": "275 lbs",
            "verticalJump": "28 inches",
            "shuttle": "4.4s"
          },
          "skillDevelopment": {
            "focus": "Mastering footwork fundamentals and basic passing mechanics",
            "drills": ["5-step drop progression", "Quick release drills", "Reading single coverage"],
            "techniques": "Proper throwing mechanics, efficient footwork, center exchange"
          },
          "academicGoals": {
            "gpaTarget": "3.5+",
            "courseRecommendations": ["Algebra I", "Biology", "English 9", "World History"],
            "testPrep": "Begin foundational academic skills"
          },
          "recruitingMilestones": {
            "filmGoals": "Create first highlight tape from freshman season",
            "campPlans": ["Local QB camp", "School's summer camp"],
            "exposureStrategy": "Focus on development, build relationships with varsity coaches",
            "timeline": "Create recruiting social media accounts, begin learning about process"
          }
        },
        {
          "academicYear": "2025-2026",
          "grade": 10,
          "bodyDevelopment": {
            "targetWeight": 185,
            "heightProjection": "6'0\"",
            "targetBodyFat": 12,
            "muscleGainGoal": "Add 10-15 lbs muscle mass with focus on upper body strength"
          },
          "combineMetrics": {
            "fortyYard": "4.8s",
            "benchPress": "205 lbs",
            "squat": "315 lbs",
            "verticalJump": "30 inches",
            "shuttle": "4.3s"
          },
          "skillDevelopment": {
            "focus": "Reading defenses and developing passing accuracy at various distances",
            "drills": ["Progression reads", "Throwing on the move", "Red zone decision making"],
            "techniques": "Advanced ball placement, throwing with anticipation, coverage recognition"
          },
          "academicGoals": {
            "gpaTarget": "3.6+",
            "courseRecommendations": ["Geometry", "Chemistry", "English 10", "US History"],
            "testPrep": "PSAT practice, begin ACT/SAT fundamentals"
          },
          "recruitingMilestones": {
            "filmGoals": "Complete game film plus focused highlight reel showing progression",
            "campPlans": ["Regional QB camps", "One D1 college camp", "Elite 11 regional"],
            "exposureStrategy": "Begin direct outreach to college coaches, create recruiting profile",
            "timeline": "Summer before junior year is crucial for camp exposure"
          }
        },
        {
          "academicYear": "2026-2027",
          "grade": 11,
          "bodyDevelopment": {
            "targetWeight": 195,
            "heightProjection": "6'1\"",
            "targetBodyFat": 10,
            "muscleGainGoal": "Focus on functional strength, explosiveness, and durability"
          },
          "combineMetrics": {
            "fortyYard": "4.7s",
            "benchPress": "225 lbs",
            "squat": "365 lbs",
            "verticalJump": "32 inches",
            "shuttle": "4.2s"
          },
          "skillDevelopment": {
            "focus": "Advanced passing concepts, full-field reads, audibles at line of scrimmage",
            "drills": ["Full-field progression reads", "Pocket movement", "Game situation scenarios"],
            "techniques": "Pre-snap reads, defensive recognition, calling protections, audibles"
          },
          "academicGoals": {
            "gpaTarget": "3.7+",
            "courseRecommendations": ["Algebra II", "Physics", "English 11", "1-2 AP courses"],
            "testPrep": "Take ACT/SAT in spring, aim for target score for preferred schools"
          },
          "recruitingMilestones": {
            "filmGoals": "Comprehensive junior year film showing leadership and full skill set",
            "campPlans": ["3-5 target college camps", "Elite regional showcases", "QB-specific national events"],
            "exposureStrategy": "Narrow school list, actively communicate with coaches, visit campuses",
            "timeline": "Summer before senior year crucial for offers, commit by early senior year"
          }
        },
        {
          "academicYear": "2027-2028",
          "grade": 12,
          "bodyDevelopment": {
            "targetWeight": 205,
            "heightProjection": "6'1\"",
            "targetBodyFat": 9,
            "muscleGainGoal": "Refinement and maintenance of peak athletic condition"
          },
          "combineMetrics": {
            "fortyYard": "4.65s",
            "benchPress": "245 lbs",
            "squat": "405 lbs",
            "verticalJump": "34 inches",
            "shuttle": "4.1s"
          },
          "skillDevelopment": {
            "focus": "Collegiate-level concepts, leadership, and mental game mastery",
            "drills": ["College-level passing tree", "Advanced timing routes", "Game management drills"],
            "techniques": "Film study habits, advanced coverage recognition, tempo control, leadership skills"
          },
          "academicGoals": {
            "gpaTarget": "3.7+",
            "courseRecommendations": ["Pre-Calculus/Calculus", "AP Sciences", "AP English", "Electives aligned with college major"],
            "testPrep": "Final ACT/SAT attempt if needed for specific schools"
          },
          "recruitingMilestones": {
            "filmGoals": "Early season highlights showing senior year progression",
            "campPlans": ["Visits to committed/interested schools only"],
            "exposureStrategy": "Solidify college commitment, maintain relationships with coaches",
            "timeline": "Complete commitment by early signing period if possible"
          }
        }
      ]
    };
  }

  /**
   * Mock data for current year plan when OpenAI is not available
   */
  private getMockCurrentYearPlan(athleteProfile: any) {
    const firstName = athleteProfile.athlete.firstName || "Athlete";
    const position = athleteProfile.athlete.position || "Quarterback (QB)";
    
    return {
      "overview": `12-month development plan for ${firstName} as a ${position}, divided into quarterly phases aligned with the football calendar to optimize growth, skill development, and recruiting preparation.`,
      "quarterlyBreakdown": [
        {
          "period": "Summer: June-August",
          "focusAreas": ["Strength Building", "Speed Development", "Position Skills"],
          "trainingProgram": {
            "progressionModel": "Linear progression with focus on building strength and explosiveness before the season",
            "weeklySchedule": {
              "monday": {
                "focus": "Lower Body Strength",
                "exercises": [
                  {
                    "name": "Back Squat",
                    "sets": 4,
                    "reps": "5",
                    "intensity": "75-85% 1RM",
                    "rest": "2-3 min",
                    "notes": "Focus on depth and form"
                  },
                  {
                    "name": "Romanian Deadlift",
                    "sets": 3,
                    "reps": "8",
                    "intensity": "70% 1RM",
                    "rest": "90 sec",
                    "notes": "Control the eccentric phase"
                  },
                  {
                    "name": "Walking Lunges",
                    "sets": 3,
                    "reps": "12 each leg",
                    "intensity": "Bodyweight + dumbbells",
                    "rest": "60 sec",
                    "notes": null
                  }
                ]
              },
              "tuesday": {
                "focus": "Speed & Agility",
                "exercises": [
                  {
                    "name": "Sprint Ladder (10-20-30-40yd)",
                    "sets": 3,
                    "reps": "1 each distance",
                    "intensity": "100%",
                    "rest": "Full recovery",
                    "notes": "Focus on acceleration mechanics"
                  },
                  {
                    "name": "5-10-5 Pro Agility",
                    "sets": 5,
                    "reps": "1",
                    "intensity": "100%",
                    "rest": "60 sec",
                    "notes": "Work on cutting technique"
                  },
                  {
                    "name": "Ladder Drills",
                    "sets": 2,
                    "reps": "5 patterns",
                    "intensity": "High",
                    "rest": "45 sec",
                    "notes": "Quick feet, high knees"
                  }
                ]
              },
              "wednesday": {
                "focus": "Upper Body / Push",
                "exercises": [
                  {
                    "name": "Bench Press",
                    "sets": 4,
                    "reps": "6",
                    "intensity": "75-85% 1RM",
                    "rest": "2 min",
                    "notes": null
                  },
                  {
                    "name": "DB Shoulder Press",
                    "sets": 3,
                    "reps": "8",
                    "intensity": "70-75% 1RM",
                    "rest": "90 sec",
                    "notes": null
                  },
                  {
                    "name": "Tricep Extensions",
                    "sets": 3,
                    "reps": "12",
                    "intensity": "Moderate",
                    "rest": "60 sec",
                    "notes": null
                  }
                ]
              },
              "thursday": {
                "focus": "Position-Specific Skills",
                "exercises": [
                  {
                    "name": "QB Footwork Progression",
                    "sets": 5,
                    "reps": "Each progression",
                    "intensity": "Technical focus",
                    "rest": "30 sec",
                    "notes": "3-5-7 step drops, rollouts"
                  },
                  {
                    "name": "Throwing Accuracy Drill",
                    "sets": 3,
                    "reps": "10 throws per distance",
                    "intensity": "Technical focus",
                    "rest": "60 sec",
                    "notes": "Short, medium, long distances"
                  },
                  {
                    "name": "Pocket Movement Drill",
                    "sets": 3,
                    "reps": "5 minutes",
                    "intensity": "Game speed",
                    "rest": "60 sec",
                    "notes": "Simulated pressure, throw on move"
                  }
                ]
              },
              "friday": {
                "focus": "Lower Body / Pull",
                "exercises": [
                  {
                    "name": "Trap Bar Deadlift",
                    "sets": 4,
                    "reps": "5",
                    "intensity": "75-85% 1RM",
                    "rest": "2-3 min",
                    "notes": null
                  },
                  {
                    "name": "Pull-Ups",
                    "sets": 3,
                    "reps": "AMRAP",
                    "intensity": "Bodyweight",
                    "rest": "90 sec",
                    "notes": "Use assistance if needed"
                  },
                  {
                    "name": "DB Rows",
                    "sets": 3,
                    "reps": "10 each arm",
                    "intensity": "Moderate-Heavy",
                    "rest": "60 sec",
                    "notes": null
                  }
                ]
              },
              "saturday": {
                "focus": "Conditioning & Recovery",
                "exercises": [
                  {
                    "name": "Tempo Runs",
                    "sets": 8,
                    "reps": "40 yards",
                    "intensity": "75% max",
                    "rest": "30 sec",
                    "notes": "Focus on form throughout"
                  },
                  {
                    "name": "Mobility Circuit",
                    "sets": 2,
                    "reps": "Full circuit",
                    "intensity": "Active recovery",
                    "rest": "As needed",
                    "notes": "Hip/shoulder/ankle mobility"
                  }
                ]
              },
              "sunday": {
                "focus": "Rest & Recovery",
                "exercises": [
                  {
                    "name": "Light Stretching",
                    "sets": 1,
                    "reps": "15-20 minutes",
                    "intensity": "Very light",
                    "rest": "N/A",
                    "notes": "Focus on problem areas"
                  }
                ]
              }
            },
            "recoveryProtocol": "10-15 minutes of foam rolling daily, ice baths twice weekly, 8-9 hours of sleep nightly"
          },
          "nutritionPlan": {
            "dailyCalories": 3200,
            "macroBreakdown": {
              "protein": 200,
              "carbs": 375,
              "fat": 85
            },
            "mealPlan": {
              "breakfast": [
                "5 egg whites + 2 whole eggs with vegetables and 1 cup oatmeal with berries",
                "Protein smoothie with whey, banana, peanut butter, oats, and milk"
              ],
              "lunch": [
                "8oz grilled chicken breast, 1.5 cups brown rice, 1 cup vegetables",
                "Turkey and avocado wrap with sweet potato"
              ],
              "dinner": [
                "8oz lean beef/fish, 1 large sweet potato, 2 cups vegetables",
                "Stir fry with lean protein, vegetables, and brown rice"
              ],
              "snacks": [
                "Protein shake with fruit",
                "Greek yogurt with honey and granola",
                "Apple with 2 tbsp almond butter",
                "Tuna on whole grain crackers"
              ]
            },
            "supplements": [
              "Whey protein (post-workout)",
              "Creatine monohydrate (5g daily)",
              "Multivitamin",
              "Fish oil (1-2g daily)"
            ],
            "groceryList": [
              "Chicken breast",
              "Lean ground beef",
              "Eggs",
              "Greek yogurt",
              "Whey protein",
              "Brown rice",
              "Sweet potatoes",
              "Oatmeal",
              "Spinach and mixed greens",
              "Broccoli",
              "Bell peppers",
              "Berries",
              "Bananas",
              "Avocados",
              "Olive oil",
              "Nuts and nut butters"
            ]
          },
          "skillDevelopment": {
            "drills": [
              "3-5-7 step drop progression",
              "Throwing on the run (both directions)",
              "Quick release target practice",
              "Read progression drills",
              "Footwork ladder series"
            ],
            "techniques": "Focus on refining base mechanics, including proper weight transfer, follow-through, and consistent release point on all throws",
            "videoAnalysis": "Weekly review of practice film with position coach, identify 1-2 focus areas each week"
          },
          "recruitingTasks": {
            "filmDevelopment": "Create summer workout and skills video showing progress and development",
            "outreachStrategy": "Research and create list of 20 target schools, begin following position coaches on social media",
            "events": [
              "Attend 2-3 college camps in June-July",
              "Team 7-on-7 tournaments",
              "Regional QB showcase"
            ],
            "monthlyGoals": {
              "june": [
                "Create recruiting profile on major platforms",
                "Attend first college camp",
                "Begin building target school list"
              ],
              "july": [
                "Attend 1-2 additional college camps",
                "Film skills video showing development",
                "Make initial contact with 10 schools"
              ],
              "august": [
                "Set up filming plan for upcoming season",
                "Finalize target school list (20 schools)",
                "Begin test prep for PSAT/ACT/SAT"
              ]
            }
          }
        },
        {
          "period": "In-Season: September-November",
          "focusAreas": ["Performance Maintenance", "Recovery", "Game Preparation"],
          "trainingProgram": {
            "progressionModel": "Maintenance-focused programming with emphasis on recovery and performance optimization during season",
            "weeklySchedule": {
              "monday": {
                "focus": "Light Recovery & Film Study",
                "exercises": [
                  {
                    "name": "Recovery Bike",
                    "sets": 1,
                    "reps": "15 minutes",
                    "intensity": "Low",
                    "rest": "N/A",
                    "notes": "Keep heart rate 120-130 bpm"
                  },
                  {
                    "name": "Mobility Circuit",
                    "sets": 2,
                    "reps": "Full circuit",
                    "intensity": "Light",
                    "rest": "As needed",
                    "notes": "Focus on problem areas from game"
                  },
                  {
                    "name": "Film Review",
                    "sets": 1,
                    "reps": "60-90 minutes",
                    "intensity": "Mental focus",
                    "rest": "N/A",
                    "notes": "Review previous game, self-critique"
                  }
                ]
              },
              "tuesday": {
                "focus": "Full Body Strength Maintenance",
                "exercises": [
                  {
                    "name": "Front Squat",
                    "sets": 3,
                    "reps": "5",
                    "intensity": "70-75% 1RM",
                    "rest": "2 min",
                    "notes": "Focus on form, not maximal weight"
                  },
                  {
                    "name": "DB Bench Press",
                    "sets": 3,
                    "reps": "8",
                    "intensity": "70% 1RM",
                    "rest": "90 sec",
                    "notes": null
                  },
                  {
                    "name": "Pull-Ups",
                    "sets": 3,
                    "reps": "6-8",
                    "intensity": "Controlled",
                    "rest": "90 sec",
                    "notes": null
                  }
                ]
              },
              "wednesday": {
                "focus": "Practice & Position Skills",
                "exercises": [
                  {
                    "name": "Team Practice",
                    "sets": 1,
                    "reps": "2 hours",
                    "intensity": "Game prep",
                    "rest": "As scheduled",
                    "notes": "Focus on week's game plan"
                  },
                  {
                    "name": "Extra QB Drills",
                    "sets": 1,
                    "reps": "20 minutes",
                    "intensity": "Technical focus",
                    "rest": "As needed",
                    "notes": "Work on weekly technical focus points"
                  }
                ]
              },
              "thursday": {
                "focus": "Speed Maintenance & Light Strength",
                "exercises": [
                  {
                    "name": "Speed Ladder",
                    "sets": 3,
                    "reps": "Various patterns",
                    "intensity": "Quick & precise",
                    "rest": "30 sec",
                    "notes": "Footwork focus"
                  },
                  {
                    "name": "Medicine Ball Throws",
                    "sets": 3,
                    "reps": "8",
                    "intensity": "Explosive",
                    "rest": "60 sec",
                    "notes": "Rotational power"
                  },
                  {
                    "name": "Core Circuit",
                    "sets": 2,
                    "reps": "Full circuit",
                    "intensity": "Moderate",
                    "rest": "60 sec between circuits",
                    "notes": "Planks, Russian twists, leg raises"
                  }
                ]
              },
              "friday": {
                "focus": "Pre-Game Activation",
                "exercises": [
                  {
                    "name": "Dynamic Warm-up",
                    "sets": 1,
                    "reps": "Full routine",
                    "intensity": "Building",
                    "rest": "Minimal",
                    "notes": "Prep CNS for game day"
                  },
                  {
                    "name": "Light Throwing Session",
                    "sets": 1,
                    "reps": "15-20 minutes",
                    "intensity": "75% effort",
                    "rest": "As needed",
                    "notes": "Review game plan throws"
                  }
                ]
              },
              "saturday": {
                "focus": "Game Day",
                "exercises": [
                  {
                    "name": "Game Performance",
                    "sets": 1,
                    "reps": "Full game",
                    "intensity": "Maximum",
                    "rest": "N/A",
                    "notes": "Apply week's preparation"
                  }
                ]
              },
              "sunday": {
                "focus": "Active Recovery",
                "exercises": [
                  {
                    "name": "Pool Recovery",
                    "sets": 1,
                    "reps": "30 minutes",
                    "intensity": "Very light",
                    "rest": "N/A",
                    "notes": "Light swimming, water walking"
                  },
                  {
                    "name": "Foam Rolling",
                    "sets": 1,
                    "reps": "Full body",
                    "intensity": "As needed",
                    "rest": "N/A",
                    "notes": "Focus on lower body and throwing arm"
                  }
                ]
              }
            },
            "recoveryProtocol": "Post-game ice bath, daily foam rolling, weekly massage/bodywork, contrast therapy after mid-week practice"
          },
          "nutritionPlan": {
            "dailyCalories": 3400,
            "macroBreakdown": {
              "protein": 200,
              "carbs": 425,
              "fat": 90
            },
            "mealPlan": {
              "breakfast": [
                "Breakfast burrito with eggs, turkey, vegetables, avocado in whole grain wrap",
                "Overnight oats with protein powder, fruit, nuts and honey"
              ],
              "lunch": [
                "Grilled chicken sandwich on whole grain bread with sweet potato fries",
                "Salmon with quinoa and roasted vegetables"
              ],
              "dinner": [
                "Lean beef stir fry with plenty of vegetables and brown rice",
                "Turkey meatballs with whole grain pasta and marinara sauce"
              ],
              "snacks": [
                "Post-practice protein shake with banana",
                "Trail mix with dried fruit and nuts",
                "Rice cakes with turkey and avocado",
                "Greek yogurt with granola"
              ]
            },
            "supplements": [
              "Whey protein (post-workout and post-game)",
              "Creatine monohydrate (5g daily)",
              "BCAAs (during practice)",
              "Electrolyte replacement (game days)",
              "Multivitamin"
            ],
            "groceryList": [
              "Lean proteins (chicken, turkey, lean beef, fish)",
              "Complex carbs (rice, sweet potatoes, whole grain pasta)",
              "Fresh fruits and vegetables",
              "Recovery-supporting foods (tart cherries, turmeric, ginger)",
              "Healthy fats (avocados, nuts, olive oil)"
            ]
          },
          "skillDevelopment": {
            "drills": [
              "Opponent-specific route trees",
              "Red zone efficiency drills",
              "Two-minute drill scenarios",
              "Read progression specific to weekly opponent",
              "Pressure throws with simulated rush"
            ],
            "techniques": "Focus on game-specific situations, decision-making under pressure, and execution of game plan concepts",
            "videoAnalysis": "Opponent film study (2 hours Sunday, 1 hour each weekday), personal performance review (2 hours Mondays)"
          },
          "recruitingTasks": {
            "filmDevelopment": "Create weekly highlights, ensure filming from multiple angles, compile midseason highlight reel by Week 5",
            "outreachStrategy": "Weekly updates to coaches with game stats and film clips, respond to all college correspondence within 24 hours",
            "events": [
              "Host coaches at games when possible",
              "Schedule campus visits during bye week",
              "Update recruiting profiles weekly with new stats/accomplishments"
            ],
            "monthlyGoals": {
              "september": [
                "Share season opener film with target schools",
                "Update recruiting profiles with senior year data",
                "Send weekly performance updates to interested coaches"
              ],
              "october": [
                "Create and distribute mid-season highlight reel",
                "Schedule 1-2 game day visits at target schools",
                "Narrow target list based on interest level"
              ],
              "november": [
                "Complete playoff highlights (if applicable)",
                "Follow up with all interested programs",
                "Begin planning off-season visits"
              ]
            }
          }
        },
        {
          "period": "Winter: December-February",
          "focusAreas": ["Strength Building", "Physical Recovery", "Recruiting", "Academic Focus"],
          "trainingProgram": {
            "progressionModel": "Post-season recovery transitioning into hypertrophy and strength-building phase",
            "weeklySchedule": {
              "monday": {
                "focus": "Upper Body Strength",
                "exercises": [
                  {
                    "name": "Bench Press",
                    "sets": 4,
                    "reps": "6-8",
                    "intensity": "75-85% 1RM",
                    "rest": "2 min",
                    "notes": "Focus on progressive overload"
                  },
                  {
                    "name": "Incline DB Press",
                    "sets": 3,
                    "reps": "8-10",
                    "intensity": "Moderate-Heavy",
                    "rest": "90 sec",
                    "notes": null
                  },
                  {
                    "name": "Cable Rows",
                    "sets": 3,
                    "reps": "10-12",
                    "intensity": "Moderate",
                    "rest": "60 sec",
                    "notes": "Focus on scapular retraction"
                  },
                  {
                    "name": "Face Pulls",
                    "sets": 3,
                    "reps": "15",
                    "intensity": "Light-Moderate",
                    "rest": "45 sec",
                    "notes": "Shoulder health emphasis"
                  }
                ]
              },
              "tuesday": {
                "focus": "Lower Body Strength",
                "exercises": [
                  {
                    "name": "Back Squat",
                    "sets": 5,
                    "reps": "5",
                    "intensity": "80-85% 1RM",
                    "rest": "2-3 min",
                    "notes": "Focus on depth and form"
                  },
                  {
                    "name": "Walking Lunges",
                    "sets": 3,
                    "reps": "10 each leg",
                    "intensity": "Moderate with dumbbells",
                    "rest": "90 sec",
                    "notes": null
                  },
                  {
                    "name": "Glute-Ham Raises",
                    "sets": 3,
                    "reps": "8-10",
                    "intensity": "Bodyweight",
                    "rest": "60 sec",
                    "notes": "Posterior chain emphasis"
                  },
                  {
                    "name": "Calf Raises",
                    "sets": 4,
                    "reps": "15",
                    "intensity": "Moderate",
                    "rest": "45 sec",
                    "notes": "Both seated and standing"
                  }
                ]
              },
              "wednesday": {
                "focus": "Recovery & Skills",
                "exercises": [
                  {
                    "name": "Throwing Session",
                    "sets": 1,
                    "reps": "30 minutes",
                    "intensity": "Technical focus",
                    "rest": "As needed",
                    "notes": "Maintain arm strength and mechanics"
                  },
                  {
                    "name": "Mobility Work",
                    "sets": 1,
                    "reps": "Full routine",
                    "intensity": "Restorative",
                    "rest": "N/A",
                    "notes": "Focus on hip and thoracic mobility"
                  }
                ]
              },
              "thursday": {
                "focus": "Upper Body Hypertrophy",
                "exercises": [
                  {
                    "name": "Weighted Pull-Ups",
                    "sets": 4,
                    "reps": "6-8",
                    "intensity": "Heavy",
                    "rest": "2 min",
                    "notes": "Add weight if possible"
                  },
                  {
                    "name": "DB Shoulder Press",
                    "sets": 3,
                    "reps": "8-10",
                    "intensity": "Moderate-Heavy",
                    "rest": "90 sec",
                    "notes": null
                  },
                  {
                    "name": "Tricep Extensions",
                    "sets": 3,
                    "reps": "10-12",
                    "intensity": "Moderate",
                    "rest": "60 sec",
                    "notes": null
                  },
                  {
                    "name": "Bicep Curls",
                    "sets": 3,
                    "reps": "10-12",
                    "intensity": "Moderate",
                    "rest": "60 sec",
                    "notes": "Alternate between hammer and traditional"
                  }
                ]
              },
              "friday": {
                "focus": "Lower Body Power",
                "exercises": [
                  {
                    "name": "Deadlift",
                    "sets": 4,
                    "reps": "5",
                    "intensity": "80-85% 1RM",
                    "rest": "2-3 min",
                    "notes": "Focus on power generation"
                  },
                  {
                    "name": "Box Jumps",
                    "sets": 4,
                    "reps": "5",
                    "intensity": "Explosive",
                    "rest": "90 sec",
                    "notes": "Focus on height and soft landing"
                  },
                  {
                    "name": "Bulgarian Split Squats",
                    "sets": 3,
                    "reps": "8 each leg",
                    "intensity": "Moderate with dumbbells",
                    "rest": "60 sec between legs",
                    "notes": "Balance and unilateral strength"
                  }
                ]
              },
              "saturday": {
                "focus": "Conditioning & Athleticism",
                "exercises": [
                  {
                    "name": "Shuttle Runs",
                    "sets": 6,
                    "reps": "Pro agility pattern",
                    "intensity": "90% effort",
                    "rest": "60 sec",
                    "notes": "Focus on change of direction"
                  },
                  {
                    "name": "Medicine Ball Circuit",
                    "sets": 3,
                    "reps": "Complete circuit",
                    "intensity": "Explosive",
                    "rest": "90 sec between circuits",
                    "notes": "Rotational, chest, overhead throws"
                  },
                  {
                    "name": "Plyo Push-Ups",
                    "sets": 3,
                    "reps": "8",
                    "intensity": "Explosive",
                    "rest": "60 sec",
                    "notes": "Upper body power"
                  }
                ]
              },
              "sunday": {
                "focus": "Rest & Recovery",
                "exercises": [
                  {
                    "name": "Complete Rest Day",
                    "sets": null,
                    "reps": null,
                    "intensity": null,
                    "rest": null,
                    "notes": "Focus on sleep and nutrition"
                  }
                ]
              }
            },
            "recoveryProtocol": "Weekly massage or soft tissue work, contrast therapy after heavy sessions, 8-9 hours of sleep nightly, deload week every 4th week"
          },
          "nutritionPlan": {
            "dailyCalories": 3300,
            "macroBreakdown": {
              "protein": 210,
              "carbs": 380,
              "fat": 90
            },
            "mealPlan": {
              "breakfast": [
                "Protein pancakes with mixed berries and Greek yogurt",
                "Veggie omelette (4 egg whites, 2 whole eggs) with avocado and toast"
              ],
              "lunch": [
                "Lean bison burger on whole grain bun with side salad",
                "Grilled chicken and quinoa bowl with roasted vegetables"
              ],
              "dinner": [
                "Wild salmon with sweet potato and asparagus",
                "Lean beef stir fry with brown rice and mixed vegetables"
              ],
              "snacks": [
                "Protein smoothie (whey, banana, spinach, almond butter)",
                "Cottage cheese with pineapple",
                "Turkey roll-ups with bell peppers",
                "Hard-boiled eggs and fruit"
              ]
            },
            "supplements": [
              "Whey protein (post-workout)",
              "Casein protein (before bed)",
              "Creatine monohydrate (5g daily)",
              "Vitamin D3 (2000-4000 IU, winter months)",
              "Fish oil (2g daily)"
            ],
            "groceryList": [
              "Various lean proteins (chicken, turkey, fish, lean beef)",
              "Eggs and egg whites",
              "Complex carbs (quinoa, brown rice, sweet potatoes)",
              "Frozen berries for smoothies",
              "Winter vegetables (broccoli, Brussels sprouts, carrots)",
              "Avocados and olive oil",
              "Greek yogurt and cottage cheese",
              "Nuts and nut butters"
            ]
          },
          "skillDevelopment": {
            "drills": [
              "Indoor accuracy drills with targets",
              "QB-specific movement patterns",
              "Mechanical refinement drills",
              "Footwork precision drills",
              "Mental processing drills with film"
            ],
            "techniques": "Winter focus on mechanical refinement, addressing any issues identified during season, developing consistency in throwing motion",
            "videoAnalysis": "Full season review identifying strengths/weaknesses, compare to college QB mechanics, develop refinement plan for off-season"
          },
          "recruitingTasks": {
            "filmDevelopment": "Finalize complete junior season highlight reel, create position-specific cut-ups showing key skills",
            "outreachStrategy": "Schedule calls with position coaches, visit top 5 schools if possible, attend junior days",
            "events": [
              "College junior days",
              "Winter showcases or all-star games if invited",
              "Campus visits during winter break"
            ],
            "monthlyGoals": {
              "december": [
                "Complete full season highlight reel",
                "Schedule college visits during winter break",
                "Update all recruiting profiles with season stats"
              ],
              "january": [
                "Attend 2-3 junior day events",
                "Follow up with all schools that showed interest",
                "Take academic visits to top schools"
              ],
              "february": [
                "Narrow focus to top 8-10 schools",
                "Develop relationship with position coaches",
                "Plan spring/summer camp circuit"
              ]
            }
          }
        },
        {
          "period": "Spring: March-May",
          "focusAreas": ["Explosive Power", "Speed Development", "Position Mastery", "Recruiting Push"],
          "trainingProgram": {
            "progressionModel": "Transition from strength to power and speed, emphasizing football-specific movement patterns",
            "weeklySchedule": {
              "monday": {
                "focus": "Lower Body Power",
                "exercises": [
                  {
                    "name": "Power Cleans",
                    "sets": 5,
                    "reps": "3",
                    "intensity": "75-85% 1RM",
                    "rest": "2-3 min",
                    "notes": "Focus on explosive triple extension"
                  },
                  {
                    "name": "Jump Squats",
                    "sets": 4,
                    "reps": "5",
                    "intensity": "Light-Moderate weight",
                    "rest": "90 sec",
                    "notes": "Explosive movement"
                  },
                  {
                    "name": "Single-Leg RDLs",
                    "sets": 3,
                    "reps": "8 each leg",
                    "intensity": "Moderate",
                    "rest": "60 sec",
                    "notes": "Balance and hamstring development"
                  }
                ]
              },
              "tuesday": {
                "focus": "Speed Development",
                "exercises": [
                  {
                    "name": "Sprint Technique Drills",
                    "sets": 1,
                    "reps": "Full progression",
                    "intensity": "Technical focus",
                    "rest": "As needed",
                    "notes": "A-skips, B-skips, stride-outs"
                  },
                  {
                    "name": "Acceleration Sprints",
                    "sets": 6,
                    "reps": "20 yards",
                    "intensity": "100% effort",
                    "rest": "Full recovery",
                    "notes": "Focus on first 5 steps"
                  },
                  {
                    "name": "Reactive Agility Drills",
                    "sets": 5,
                    "reps": "Various patterns",
                    "intensity": "Maximum",
                    "rest": "Full recovery",
                    "notes": "Coach-cued direction changes"
                  }
                ]
              },
              "wednesday": {
                "focus": "Upper Body Power",
                "exercises": [
                  {
                    "name": "Med Ball Chest Throws",
                    "sets": 4,
                    "reps": "6",
                    "intensity": "Explosive",
                    "rest": "60 sec",
                    "notes": "Throw for maximum distance"
                  },
                  {
                    "name": "Push Press",
                    "sets": 4,
                    "reps": "5",
                    "intensity": "75-80% 1RM",
                    "rest": "2 min",
                    "notes": "Drive through legs"
                  },
                  {
                    "name": "Pull-Ups",
                    "sets": 4,
                    "reps": "AMRAP",
                    "intensity": "Bodyweight",
                    "rest": "90 sec",
                    "notes": "Explosive concentric"
                  },
                  {
                    "name": "Rotational Med Ball Throws",
                    "sets": 3,
                    "reps": "6 each side",
                    "intensity": "Explosive",
                    "rest": "60 sec",
                    "notes": "Core rotational power"
                  }
                ]
              },
              "thursday": {
                "focus": "QB-Specific Training",
                "exercises": [
                  {
                    "name": "Spring Practice",
                    "sets": 1,
                    "reps": "Full practice",
                    "intensity": "Game speed",
                    "rest": "As scheduled",
                    "notes": "Team installation periods"
                  },
                  {
                    "name": "Extra QB Work",
                    "sets": 1,
                    "reps": "30 minutes",
                    "intensity": "Technical focus",
                    "rest": "As needed",
                    "notes": "Route timing with receivers"
                  }
                ]
              },
              "friday": {
                "focus": "Reactive Strength",
                "exercises": [
                  {
                    "name": "Depth Jumps",
                    "sets": 4,
                    "reps": "5",
                    "intensity": "Reactive focus",
                    "rest": "2 min",
                    "notes": "Minimize ground contact time"
                  },
                  {
                    "name": "Hex Bar Deadlift Jumps",
                    "sets": 4,
                    "reps": "5",
                    "intensity": "Light-Moderate weight",
                    "rest": "90 sec",
                    "notes": "Explosive hip extension"
                  },
                  {
                    "name": "Lateral Bounds",
                    "sets": 3,
                    "reps": "5 each direction",
                    "intensity": "Explosive",
                    "rest": "60 sec",
                    "notes": "Quick redirection"
                  }
                ]
              },
              "saturday": {
                "focus": "Team Practice/Competition",
                "exercises": [
                  {
                    "name": "Spring Practice/Scrimmage",
                    "sets": 1,
                    "reps": "Full practice",
                    "intensity": "Game simulation",
                    "rest": "As scheduled",
                    "notes": "Apply weekly learnings"
                  }
                ]
              },
              "sunday": {
                "focus": "Recovery & Mobility",
                "exercises": [
                  {
                    "name": "Light Bike",
                    "sets": 1,
                    "reps": "20 minutes",
                    "intensity": "Very light",
                    "rest": "N/A",
                    "notes": "Blood flow recovery"
                  },
                  {
                    "name": "Full Body Mobility",
                    "sets": 1,
                    "reps": "Full routine",
                    "intensity": "Restorative",
                    "rest": "N/A",
                    "notes": "Yoga-inspired movements"
                  }
                ]
              }
            },
            "recoveryProtocol": "Emphasis on recovery between spring practices, contrast therapy after heavy sessions, increased focus on mobility work, regular soft tissue maintenance"
          },
          "nutritionPlan": {
            "dailyCalories": 3400,
            "macroBreakdown": {
              "protein": 210,
              "carbs": 400,
              "fat": 85
            },
            "mealPlan": {
              "breakfast": [
                "Protein oatmeal with blueberries, banana, and nut butter",
                "Turkey breakfast hash with sweet potatoes, peppers, and eggs"
              ],
              "lunch": [
                "Chicken and rice bowl with black beans and avocado",
                "Tuna wrap with whole grain tortilla and mixed greens"
              ],
              "dinner": [
                "Grass-fed steak with roasted potatoes and vegetables",
                "Grilled fish with quinoa and asparagus"
              ],
              "snacks": [
                "Post-workout shake with protein, banana, and spinach",
                "Rice cakes with nut butter and honey",
                "Greek yogurt with berries and granola",
                "Hummus with vegetables and whole grain crackers"
              ]
            },
            "supplements": [
              "Whey protein isolate (post-workout)",
              "Creatine monohydrate (5g daily)",
              "BCAAs (during spring practice)",
              "Electrolyte supplement (during high intensity days)",
              "Magnesium (before bed for recovery)"
            ],
            "groceryList": [
              "High-quality proteins (chicken breast, grass-fed beef, wild fish)",
              "Spring vegetables (spinach, asparagus, bell peppers)",
              "Complex carbs (quinoa, sweet potatoes, brown rice)",
              "Recovery foods (tart cherry juice, turmeric, ginger)",
              "Portable snack items for busy spring schedule"
            ]
          },
          "skillDevelopment": {
            "drills": [
              "Full route tree timing with receivers",
              "Moving pocket throws at varying distances",
              "Install new offensive concepts for fall",
              "Coverage recognition drills",
              "Two-minute drill situational work"
            ],
            "techniques": "Focus on game-specific execution, developing chemistry with receivers, mastering offensive playbook adjustments for upcoming season",
            "videoAnalysis": "Review spring practice film daily, develop specific improvement plan for summer"
          },
          "recruitingTasks": {
            "filmDevelopment": "Create spring practice highlights, film QB-specific drills showing improvement areas",
            "outreachStrategy": "Finalize top 5-7 schools, maintain regular contact with position coaches, plan official visits",
            "events": [
              "Spring game attendance at top schools",
              "Elite camps and combines",
              "Official visits (late spring)"
            ],
            "monthlyGoals": {
              "march": [
                "Create spring drill video showing skill development",
                "Schedule spring game visits at top schools",
                "Register for elite summer camps"
              ],
              "april": [
                "Film spring practice highlights",
                "Attend 1-2 spring games at target schools",
                "Narrow focus to top 5-7 schools"
              ],
              "may": [
                "Schedule official visits for late spring/summer",
                "Create spring game highlight reel",
                "Maintain weekly contact with top schools"
              ]
            }
          }
        }
      ]
    };
  }
}

export const developmentPlanService = new DevelopmentPlanService();