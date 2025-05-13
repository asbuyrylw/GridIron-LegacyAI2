import { Router, Request, Response } from "express";
import { emailService } from "../email-service";
import { EmailNotificationType } from "../../shared/parent-access";

export const emailNotificationTestRouter = Router();

// Route to test parent email notifications
emailNotificationTestRouter.post('/notification-test', async (req: Request, res: Response) => {
  try {
    const { 
      notificationType, 
      parentEmail, 
      parentName, 
      athleteName, 
      data 
    } = req.body;

    if (!notificationType || !parentEmail || !parentName || !athleteName) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: notificationType, parentEmail, parentName, and athleteName are required" 
      });
    }

    // Generate sample data for the requested notification type
    const sampleData = generateSampleData(notificationType);

    // Send the appropriate type of notification
    let success = false;
    switch (notificationType) {
      case EmailNotificationType.INVITE:
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
          data?.items || sampleData.items || []
        );
        break;

      case EmailNotificationType.ACHIEVEMENT_NOTIFICATION:
        success = await emailService.sendAchievementNotification(
          parentEmail,
          parentName,
          athleteName,
          data?.achievements || sampleData.achievements || []
        );
        break;

      case EmailNotificationType.EVENT_REMINDER:
        // Use the custom event notification method with data provided or sample data
        success = await emailService.sendNotification(
          EmailNotificationType.EVENT_REMINDER,
          parentEmail,
          parentName,
          athleteName,
          data?.eventDetails || sampleData.eventDetails
        );
        break;

      case EmailNotificationType.WEEKLY_SUMMARY:
        success = await emailService.sendWeeklySummary(
          parentEmail,
          parentName,
          athleteName,
          data?.summaryData || sampleData.summaryData
        );
        break;

      case EmailNotificationType.TRAINING_PROGRESS:
        success = await emailService.sendTrainingProgress(
          parentEmail,
          parentName,
          athleteName,
          data?.trainingData || sampleData.trainingData
        );
        break;

      case EmailNotificationType.ACADEMIC_UPDATE:
        success = await emailService.sendAcademicUpdate(
          parentEmail,
          parentName,
          athleteName,
          data?.academicData || sampleData.academicData
        );
        break;

      default:
        return res.status(400).json({ 
          success: false, 
          message: `Unknown notification type: ${notificationType}` 
        });
    }

    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: `${notificationType} email sent successfully to ${parentEmail}` 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: `Failed to send ${notificationType} email` 
      });
    }
  } catch (error) {
    console.error('Email notification test error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Error sending notification email", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * Generate appropriate sample data for each notification type
 */
function generateSampleData(notificationType: EmailNotificationType) {
  switch (notificationType) {
    case EmailNotificationType.PERFORMANCE_UPDATE:
      return {
        stats: {
          combineDrillScores: [
            { name: "40 Yard Dash", value: "4.67s", improvement: "+0.13s" },
            { name: "Vertical Jump", value: "30 inches", improvement: "+1.5 inches" },
            { name: "Bench Press", value: "15 reps", improvement: "+2 reps" },
          ],
          gamePerformance: {
            passingYards: 230,
            rushingYards: 45,
            totalTouchdowns: 3,
            completionPercentage: 68.5
          },
          trend: "improving",
          notes: "Showing great improvement in speed and agility this month."
        }
      };
      
    case EmailNotificationType.NUTRITION_SHOPPING_LIST:
      return {
        items: [
          { category: "Protein", name: "Chicken Breast", quantity: "2 lbs" },
          { category: "Vegetables", name: "Broccoli", quantity: "1 bunch" },
          { category: "Carbohydrates", name: "Brown Rice", quantity: "2 lbs" },
          { category: "Healthy Fats", name: "Avocados", quantity: "3 medium" },
          { category: "Fruits", name: "Bananas", quantity: "1 bunch" },
          { category: "Snacks", name: "Greek Yogurt", quantity: "32 oz" },
          { category: "Supplements", name: "Whey Protein", quantity: "1 container" }
        ]
      };
      
    case EmailNotificationType.ACHIEVEMENT_NOTIFICATION:
      return {
        achievements: [
          {
            name: "Speed Demon",
            description: "Improved 40-yard dash time by over 0.1 seconds",
            level: "Silver",
            pointValue: 150,
            dateEarned: "2023-05-12",
            category: "Performance"
          },
          {
            name: "Perfect Attendance",
            description: "Attended all team practices and training sessions for 30 days",
            level: "Gold",
            pointValue: 250,
            dateEarned: "2023-05-11",
            category: "Engagement"
          }
        ]
      };
      
    case EmailNotificationType.EVENT_REMINDER:
      return {
        eventDetails: {
          eventName: "Summer Football Camp",
          eventDate: "2023-06-15",
          startTime: "8:00 AM",
          endTime: "4:00 PM",
          location: "Central High School Stadium",
          description: "Intensive one-day camp focusing on position-specific skills and college recruiting exposure.",
          requiredItems: ["Cleats", "Water bottle", "Athletic clothes", "Mouthguard"],
          coachContact: "Coach Johnson, 555-123-4567"
        }
      };
      
    case EmailNotificationType.WEEKLY_SUMMARY:
      return {
        summaryData: {
          weekOf: "May 8 - May 14, 2023",
          trainingSessionsCompleted: 4,
          totalTrainingHours: 8.5,
          nutritionPlanAdherence: 85,
          weightChange: "+0.5 lbs",
          sleepAverage: "7.2 hours",
          hydrationAverage: "Good",
          topAchievements: ["Improved vertical jump", "Perfect attendance"],
          upcomingEvents: ["Team scrimmage on May 18", "Speed training on May 16"],
          focusAreas: ["Improve route running", "Increase protein intake"]
        }
      };
      
    case EmailNotificationType.TRAINING_PROGRESS:
      return {
        trainingData: {
          period: "Last 30 Days",
          strengthProgress: [
            { exercise: "Bench Press", before: "185 lbs", after: "200 lbs", improvement: "+15 lbs" },
            { exercise: "Squat", before: "275 lbs", after: "315 lbs", improvement: "+40 lbs" },
            { exercise: "Power Clean", before: "155 lbs", after: "175 lbs", improvement: "+20 lbs" }
          ],
          speedAgility: [
            { metric: "40 Yard Dash", before: "4.8s", after: "4.67s", improvement: "+0.13s" },
            { metric: "Pro Agility", before: "4.35s", after: "4.21s", improvement: "+0.14s" }
          ],
          conditioningLevel: "Excellent",
          consistencyScore: 92,
          nextMilestones: ["325 lb squat", "4.5s 40-yard dash"]
        }
      };
      
    case EmailNotificationType.ACADEMIC_UPDATE:
      return {
        academicData: {
          gradeReport: [
            { subject: "Mathematics", currentGrade: "B+", previousGrade: "B", trend: "Improving" },
            { subject: "English", currentGrade: "A-", previousGrade: "B+", trend: "Improving" },
            { subject: "Science", currentGrade: "B", previousGrade: "B", trend: "Stable" },
            { subject: "History", currentGrade: "A", previousGrade: "A", trend: "Stable" }
          ],
          gpa: {
            current: 3.6,
            previous: 3.4,
            trend: "Increasing"
          },
          attendance: "Excellent",
          academicStanding: "Good",
          ncaaEligibility: "On Track",
          notes: "Maintained good academic performance while balancing athletic commitments. College eligibility requirements are being met with substantial margin."
        }
      };
      
    case EmailNotificationType.INVITE:
      // Parent invite doesn't need extra data besides recipient info
      return { accessToken: "sample-token-123456" };
    
    default:
      return {};
  }
}