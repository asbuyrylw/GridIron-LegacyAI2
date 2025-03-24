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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a football recruiting expert. Analyze these combine metrics for a ${position} player and provide feedback.
          
          Format the response as JSON in this structure:
          {
            "overview": "Brief overview of the athlete's metrics",
            "strengths": ["Strength 1", "Strength 2"],
            "areas_to_improve": ["Area 1", "Area 2"],
            "d1_potential": "Assessment of D1 potential on a scale of 1-10",
            "recommended_focus": "Primary training focus recommendation"
          }
          `
        },
        {
          role: "user",
          content: JSON.stringify(metrics)
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error analyzing athlete metrics:", error);
    return {
      overview: "Unable to analyze metrics at this time.",
      strengths: ["N/A"],
      areas_to_improve: ["N/A"],
      d1_potential: "N/A",
      recommended_focus: "Continue working on all areas"
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
