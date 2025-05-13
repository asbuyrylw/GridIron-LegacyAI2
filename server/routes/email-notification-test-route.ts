import { Request, Response, Router } from 'express';
import { emailService } from '../email-service';
import { EmailNotificationType } from '../../shared/parent-access';
import { z } from 'zod';

export const emailNotificationTestRouter = Router();

// Schema for parent notification test
const notificationTestSchema = z.object({
  parentEmail: z.string().email(),
  parentName: z.string(),
  athleteName: z.string(),
  notificationType: z.nativeEnum(EmailNotificationType),
});

// Generate sample data for each notification type
function generateSampleData(notificationType: EmailNotificationType) {
  switch (notificationType) {
    case EmailNotificationType.PERFORMANCE_UPDATE:
      return {
        stats: {
          metrics: {
            speed: {
              fortyYard: 4.65,
              tenYardSplit: 1.55,
              shuttle: 4.1,
              threeCone: 7.0
            },
            strength: {
              benchPress: 225,
              benchPressReps: 15,
              squatMax: 345,
              powerClean: 215
            },
            explosiveness: {
              verticalJump: 34.5,
              broadJump: 115
            }
          },
          insights: [
            "40-yard dash has improved by 0.2 seconds since last measurement",
            "Vertical jump has shown consistent improvement over the last 3 months",
            "Bench press is now at 115% of body weight"
          ],
          recommendations: [
            "Continue focusing on shuttle run technique",
            "Add plyometric exercises to training program twice weekly",
            "Maintain current lifting progression for lower body"
          ]
        }
      };
    
    case EmailNotificationType.NUTRITION_SHOPPING_LIST:
      return {
        items: [
          {
            category: "Proteins",
            name: "Lean Chicken Breast",
            quantity: "3 lbs"
          },
          {
            category: "Proteins",
            name: "Grass-fed Lean Ground Beef",
            quantity: "2 lbs"
          },
          {
            category: "Proteins",
            name: "Wild Caught Salmon",
            quantity: "1 lb"
          },
          {
            category: "Proteins",
            name: "Eggs",
            quantity: "2 dozen"
          },
          {
            category: "Carbohydrates",
            name: "Brown Rice",
            quantity: "2 lbs"
          },
          {
            category: "Carbohydrates",
            name: "Sweet Potatoes",
            quantity: "4 medium"
          },
          {
            category: "Carbohydrates",
            name: "Quinoa",
            quantity: "1 lb"
          },
          {
            category: "Carbohydrates",
            name: "Oats",
            quantity: "1 container"
          },
          {
            category: "Fruits & Vegetables",
            name: "Spinach",
            quantity: "2 bags"
          },
          {
            category: "Fruits & Vegetables",
            name: "Broccoli",
            quantity: "2 bunches"
          },
          {
            category: "Fruits & Vegetables",
            name: "Bananas",
            quantity: "2 bunches"
          },
          {
            category: "Fruits & Vegetables",
            name: "Blueberries",
            quantity: "2 containers"
          },
          {
            category: "Healthy Fats",
            name: "Avocados",
            quantity: "3 medium"
          },
          {
            category: "Healthy Fats",
            name: "Extra Virgin Olive Oil",
            quantity: "1 bottle"
          },
          {
            category: "Healthy Fats",
            name: "Natural Peanut Butter",
            quantity: "1 jar"
          },
          {
            category: "Recovery & Hydration",
            name: "Whey Protein Powder",
            quantity: "1 container"
          },
          {
            category: "Recovery & Hydration",
            name: "Electrolyte Drink Mix",
            quantity: "1 pack"
          }
        ]
      };
    
    case EmailNotificationType.ACHIEVEMENT_NOTIFICATION:
      return {
        achievements: [
          {
            name: "Speed Demon",
            description: "Improved 40-yard dash time by at least 0.2 seconds",
            level: "gold",
            pointValue: 250,
            dateEarned: new Date().toISOString(),
            category: "performance"
          },
          {
            name: "Consistent Trainer",
            description: "Completed 15 consecutive scheduled workouts",
            level: "silver",
            pointValue: 150,
            dateEarned: new Date().toISOString(),
            category: "training"
          },
          {
            name: "Nutrition Master",
            description: "Followed nutrition plan for 30 consecutive days",
            level: "bronze",
            pointValue: 100,
            dateEarned: new Date().toISOString(),
            category: "nutrition"
          }
        ]
      };
    
    case EmailNotificationType.WEEKLY_SUMMARY:
      return {
        weekOf: new Date().toISOString(),
        sections: {
          training: {
            workoutsCompleted: 5,
            totalWorkoutTime: "7.5 hours",
            focusAreas: ["Speed", "Agility", "Strength"],
            highlights: [
              "Personal record in bench press: 225 lbs",
              "Improved shuttle run time by 0.15 seconds"
            ]
          },
          nutrition: {
            adherenceRate: "92%",
            waterIntake: "Good",
            proteinGoals: "Consistently met",
            notes: "Consider increasing carbohydrate intake on heavy training days"
          },
          achievements: {
            pointsEarned: 350,
            newRank: "Rising Star",
            newAchievements: 3
          },
          upcoming: {
            events: [
              "Team practice: Tuesday & Thursday at 3:30pm",
              "Speed training workshop: Saturday at 10:00am"
            ],
            goals: [
              "Reduce 40-yard dash time by 0.05 seconds",
              "Increase squat max by 15 lbs"
            ]
          }
        }
      };
    
    case EmailNotificationType.TRAINING_PROGRESS:
      return {
        trainingData: {
          period: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          },
          overallAdherence: "88%",
          metrics: {
            workoutsPlanned: 20,
            workoutsCompleted: 18,
            totalHours: 27.5,
            averageIntensity: "7.8/10",
          },
          strengthProgress: {
            benchPress: {
              start: 185,
              current: 225,
              change: "+40 lbs"
            },
            squat: {
              start: 275,
              current: 315,
              change: "+40 lbs"
            },
            deadlift: {
              start: 315,
              current: 365,
              change: "+50 lbs"
            }
          },
          speedProgress: {
            fortyYard: {
              start: 4.85,
              current: 4.65,
              change: "-0.2 sec"
            },
            tenYard: {
              start: 1.65,
              current: 1.55,
              change: "-0.1 sec"
            }
          },
          focusAreas: ["Explosiveness", "Lateral Movement", "Core Strength"],
          coachNotes: "Excellent progress in strength development. Should continue focusing on sprint technique to see further improvements in speed."
        }
      };
    
    case EmailNotificationType.ACADEMIC_UPDATE:
      return {
        academicData: {
          term: "Spring 2025",
          gpa: 3.7,
          lastReported: new Date().toISOString(),
          classes: [
            {
              name: "Advanced Mathematics",
              grade: "A-",
              comments: "Strong conceptual understanding, consistent homework completion"
            },
            {
              name: "English Literature",
              grade: "B+",
              comments: "Good analysis in essays, could participate more in discussions"
            },
            {
              name: "Physics",
              grade: "A",
              comments: "Excellent lab work and test performance"
            },
            {
              name: "History",
              grade: "A",
              comments: "Outstanding research project and consistent participation"
            }
          ],
          attendance: {
            daysPresent: 58,
            daysAbsent: 2,
            daysExcused: 2
          },
          standardizedTests: {
            actScore: 28,
            satScore: null,
            nextTestDate: "October 2025"
          },
          academicStanding: "Excellent - On track for Honor Roll",
          notes: "Maintained good academic performance while balancing athletic commitments. College eligibility requirements are being met with substantial margin."
        }
      };
      
    case EmailNotificationType.PARENT_INVITE:
      // Parent invite doesn't need extra data besides recipient info
      return { accessToken: "sample-token-123456" };
    
    default:
      return {};
  }
}

// Route to handle email notification testing
emailNotificationTestRouter.post('/notification-test', async (req: Request, res: Response) => {
  try {
    // Check for SENDGRID_API_KEY and notify if not present
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SENDGRID_API_KEY not set. Email will be simulated but not sent.');
    }
    
    // Validate request body
    const validationResult = notificationTestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validationResult.error.errors
      });
    }
    
    const { parentEmail, parentName, athleteName, notificationType } = validationResult.data;
    
    // Generate sample data for the requested notification type
    const sampleData = generateSampleData(notificationType);

    // Send the appropriate type of notification
    let success = false;
    switch (notificationType) {
      case EmailNotificationType.PARENT_INVITE:
        success = await emailService.sendParentInvite(
          athleteName,
          parentEmail,
          parentName,
          sampleData.accessToken
        );
        break;

      case EmailNotificationType.PERFORMANCE_UPDATE:
        success = await emailService.sendPerformanceUpdate(
          parentEmail,
          parentName,
          athleteName,
          sampleData.stats
        );
        break;

      case EmailNotificationType.NUTRITION_SHOPPING_LIST:
        success = await emailService.sendNutritionShoppingList(
          parentEmail,
          parentName,
          athleteName,
          sampleData.items
        );
        break;

      case EmailNotificationType.ACHIEVEMENT_NOTIFICATION:
        success = await emailService.sendAchievementNotification(
          parentEmail,
          parentName,
          athleteName,
          sampleData.achievements
        );
        break;

      case EmailNotificationType.WEEKLY_SUMMARY:
        success = await emailService.sendWeeklySummary(
          parentEmail,
          parentName,
          athleteName,
          sampleData
        );
        break;

      case EmailNotificationType.TRAINING_PROGRESS:
        success = await emailService.sendTrainingProgress(
          parentEmail,
          parentName,
          athleteName,
          sampleData.trainingData
        );
        break;

      case EmailNotificationType.ACADEMIC_UPDATE:
        success = await emailService.sendAcademicUpdate(
          parentEmail,
          parentName,
          athleteName,
          sampleData.academicData
        );
        break;

      default:
        // Use the generic sendNotification method
        success = await emailService.sendNotification(
          notificationType,
          parentEmail,
          parentName,
          athleteName,
          sampleData
        );
    }

    if (success) {
      const isProdMode = !!process.env.SENDGRID_API_KEY;
      return res.status(200).json({
        success: true,
        message: isProdMode 
          ? `${notificationType} notification sent successfully to ${parentEmail}` 
          : `[DEVELOPMENT MODE] ${notificationType} notification simulation successful for ${parentEmail}`
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        details: 'Check server logs for more information'
      });
    }
  } catch (error) {
    console.error('Error sending notification test:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending the notification',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});