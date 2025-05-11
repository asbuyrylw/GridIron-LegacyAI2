import OpenAI from "openai";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a coaching response based on a user's message and athlete data
 */
export async function generateCoachingResponse(
  message: string,
  athleteData: {
    position?: string;
    metrics?: any;
    firstName?: string;
    lastName?: string;
  }
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Coach Legacy, an AI football coach and mentor for high school athletes. 
          You provide personalized training advice, motivational support, and career guidance.
          
          Athlete Data:
          Position: ${athleteData.position || "Unknown"}
          Name: ${athleteData.firstName || ""} ${athleteData.lastName || ""}
          
          Guidelines:
          - Keep responses concise (100-150 words)
          - Be encouraging but realistic
          - Provide specific, actionable advice
          - Focus on both athletic and academic development
          - Relate advice to football training, technique, and recruiting
          - Speak in a coach-like tone, using relevant football terminology
          - When metrics are provided, reference them in your response
          - Mention the athlete by first name when available
          `
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating coaching response:", error);
    return "I'm experiencing some technical difficulties. Please try again later.";
  }
}

/**
 * Generate a training plan based on athlete data
 */
export async function generateTrainingPlan(
  athleteData: {
    position?: string;
    metrics?: any;
    focus?: string;
  }
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert football training program developer.
          Create a football training plan for a ${athleteData.position || "football"} player.
          The plan should focus on ${athleteData.focus || "overall athletic development"}.
          
          Format the response as JSON in this exact structure:
          {
            "title": "Training Plan Title",
            "focus": "Main focus area",
            "exercises": [
              {
                "id": "ex1",
                "name": "Exercise Name",
                "sets": 3,
                "reps": "10 reps",
                "restTime": 60
              },
              ...2-3 more exercises
            ],
            "coachTip": "A specific coaching tip related to this workout"
          }
          `
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating training plan:", error);
    
    // Return a fallback plan
    return {
      title: "Default Training Plan",
      focus: athleteData.focus || "General Development",
      exercises: [
        {
          id: "ex1",
          name: "Agility Ladder Drills",
          sets: 3,
          reps: "30 seconds",
          restTime: 45
        },
        {
          id: "ex2",
          name: "Speed Bursts",
          sets: 5,
          reps: "20 yards",
          restTime: 60
        },
        {
          id: "ex3",
          name: "Position-Specific Drills",
          sets: 4,
          reps: "10 reps",
          restTime: 30
        }
      ],
      coachTip: "Focus on proper technique before increasing intensity."
    };
  }
}

/**
 * Analyze combine metrics and provide feedback
 */
export async function analyzeAthleteMetrics(metrics: any, position: string = "Unknown") {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a football recruiting expert. Analyze these combine metrics for a ${position} player and provide comprehensive performance insights.
          
          Format the response as JSON in this structure:
          {
            "strengths": ["Strength 1", "Strength 2", "Strength 3"],
            "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
            "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
            "performanceTrend": "improving" or "stable" or "declining",
            "positionRanking": "Top X% among [position]s in your region",
            "improvementAreas": ["Area 1", "Area 2", "Area 3"],
            "recentAchievements": ["Achievement 1", "Achievement 2", "Achievement 3"]
          }
          `
        },
        {
          role: "user",
          content: JSON.stringify(metrics)
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error analyzing athlete metrics:", error);
    return {
      strengths: ["Good fundamental skills for your position", "Committed to improvement", "Athletic potential"],
      weaknesses: ["Need more data to provide specific insights", "Limited metrics available for analysis"],
      recommendations: ["Continue recording your performance metrics", "Work with coaches on all aspects of your game", "Focus on fundamental skills"],
      performanceTrend: "stable",
      positionRanking: `Need more data to rank among other ${position}s`,
      improvementAreas: ["Overall athletic performance", "Position-specific skills", "Consistent data tracking"],
      recentAchievements: ["Starting your performance tracking journey"]
    };
  }
}

/**
 * Generate a meal suggestion based on athlete's nutrition plan and preferences
 */
export async function generateMealSuggestion(
  nutritionPlan: any,
  mealType: string,
  goal: string,
  restrictions: string = ""
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a sports nutritionist specialized in creating meal plans for football athletes.
          Create a delicious and nutritious ${mealType} meal that aligns with the athlete's nutrition plan and supports their ${goal} goal.
          
          Nutrition Plan Details:
          - Daily Calories: ${nutritionPlan.dailyCalories} kcal
          - Protein Target: ${nutritionPlan.proteinTarget}g
          - Carbs Target: ${nutritionPlan.carbTarget}g
          - Fat Target: ${nutritionPlan.fatTarget}g
          - Overall Goal: ${nutritionPlan.goal}
          ${restrictions ? `- Dietary Restrictions: ${restrictions}` : ''}
          
          Format the response as JSON in this exact structure:
          {
            "name": "Meal name",
            "description": "Brief description of the meal and benefits for athletes",
            "ingredients": ["Ingredient 1 with amount", "Ingredient 2 with amount", ...],
            "instructions": "Step-by-step preparation instructions",
            "nutritionInfo": {
              "calories": 0,
              "protein": 0,
              "carbs": 0,
              "fat": 0
            },
            "prepTime": "15 minutes",
            "benefits": ["Benefit 1", "Benefit 2", ...],
            "tips": "Additional tips for the athlete"
          }
          
          Notes:
          - For ${mealType}, allocate approximately ${mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner' ? '30%' : '10%'} of daily nutrition targets
          - Focus on whole foods and minimal processing
          - For a ${goal} goal, emphasize ${goal === 'muscle_gain' ? 'protein-rich foods' : goal === 'fat_loss' ? 'high-protein, moderate-carb options' : goal === 'performance' ? 'quality carbs and protein' : goal === 'recovery' ? 'anti-inflammatory foods and protein' : 'balanced macronutrients'}
          - Make the meal practical for a high school athlete to prepare
          `
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating meal suggestion:", error);
    
    // Return a basic structure with error message
    return {
      name: "Error generating meal suggestion",
      description: "Unable to generate a meal suggestion at this time.",
      ingredients: ["Please try again later"],
      instructions: "N/A",
      nutritionInfo: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      },
      prepTime: "N/A",
      benefits: ["N/A"],
      tips: "Please try again later."
    };
  }
}

/**
 * Generate AI-powered recruiting insights and advice for an athlete
 * based on their profile and top college matches
 */
export async function generateRecruitingInsights(
  athlete: {
    position?: string;
    firstName?: string;
    lastName?: string;
    height?: string;
    weight?: number;
    gpa?: number;
    actScore?: number;
    grade?: number;
    school?: string;
  },
  metrics: any,
  topMatches: any[]
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a recruiting advisor for high school football athletes looking to play college football.
          Generate personalized recruiting insights and advice for this athlete based on their profile and their top college matches.
          
          Athlete Profile:
          - Name: ${athlete.firstName || ""} ${athlete.lastName || ""}
          - Position: ${athlete.position || "Unknown"}
          - Height: ${athlete.height || "Unknown"}
          - Weight: ${athlete.weight || "Unknown"} lbs
          - GPA: ${athlete.gpa || "Unknown"}
          - ACT Score: ${athlete.actScore || "Unknown"}
          - Grade/Year: ${athlete.grade || "Unknown"}
          - School: ${athlete.school || "Unknown"}
          
          Athletic Metrics:
          - 40-yard dash: ${metrics.fortyYard || "Unknown"}
          - Vertical Jump: ${metrics.verticalJump || "Unknown"} inches
          - Bench Press: ${metrics.benchPress || "Unknown"} lbs
          - Shuttle: ${metrics.shuttle || "Unknown"} seconds
          
          Top College Matches:
          ${topMatches.map((college, index) => `
          ${index + 1}. ${college.name} (${college.division})
             - Location: ${college.city}, ${college.state}
             - Conference: ${college.conference || "Unknown"}
             - Academic Match: ${college.academicMatch}/100
             - Athletic Match: ${college.athleticMatch}/100
             - Overall Match: ${college.overallMatch}/100
             ${college.recruitingProfile?.activelyRecruiting ? `- Actively Recruiting: ${college.recruitingProfile.activelyRecruiting.join(", ")}` : ""}
          `).join("")}
          
          Provide a list of 5-7 specific, actionable insights and recommendations for this athlete's recruiting process.
          Each insight should be returned as a separate string in a JSON array called "insights". Focus on:
          1. Position-specific advice for their recruiting journey
          2. How to effectively approach the top-matching schools
          3. Academic or athletic areas to improve
          4. Timeline recommendations for the recruiting process
          5. How to stand out to college recruiters
          
          Provide detailed, specific advice tailored to this athlete's profile and college matches.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Expect result to be an array of strings
    if (Array.isArray(result.insights)) {
      return result.insights;
    } else if (Array.isArray(result)) {
      return result;
    } else {
      // Fallback if the structure isn't as expected
      return ["Focus on your strengths in your highlight films",
              "Reach out directly to the recruiting coordinators at your top matched schools",
              "Consider attending camps at schools that are actively recruiting your position"];
    }
  } catch (error) {
    console.error("Error generating recruiting insights:", error);
    return [
      "Build a strong highlight reel showcasing your best plays",
      "Reach out to coaches at your top-matched schools directly",
      "Focus on maintaining or improving your academic standing",
      "Consider attending camps or showcases where college coaches will be present",
      "Develop a recruiting timeline with regular follow-ups with interested programs"
    ];
  }
}
