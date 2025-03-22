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
