import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { emailService } from '../email-service';
import { EmailNotificationType } from '../../shared/parent-access';
import { parentAccessService } from '../parent-access-service';

const router = Router();

// Schema for scheduled reports
const scheduledReportSchema = z.object({
  athleteId: z.number(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  sections: z.array(z.string()),
  includeInsights: z.boolean().default(true),
  active: z.boolean().default(true),
  lastSent: z.string().optional(),
  nextScheduled: z.string().optional(),
});

const updateScheduledReportSchema = scheduledReportSchema.partial().omit({ athleteId: true });

// Dummy in-memory storage for scheduled reports (in production this would be in the database)
interface ScheduledReport {
  id: number;
  athleteId: number;
  frequency: string;
  dayOfWeek: string;
  sections: string[];
  includeInsights: boolean;
  active: boolean;
  lastSent?: string;
  nextScheduled?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for scheduled reports
let scheduledReports: ScheduledReport[] = [];
let nextReportId = 1;

// Helper to validate athlete access - simplified for now
async function validateAthleteAccess(req: Request, athleteId: number): Promise<boolean> {
  if (!req.session.userId) {
    return false;
  }
  
  // Get the user's athlete profile
  const athlete = await storage.getAthlete(athleteId);
  
  // Check if the user is the athlete
  if (athlete && athlete.userId === req.session.userId) {
    return true;
  }
  
  // For coaches, we'd need to implement team membership checks,
  // but we're simplifying for now
  
  return false;
}

// Calculate the next scheduled date
function calculateNextScheduledDate(frequency: string, dayOfWeek: string): string {
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDayIndex = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
  
  if (targetDayIndex === -1) {
    throw new Error(`Invalid day of week: ${dayOfWeek}`);
  }
  
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  let daysToAdd = 0;
  
  switch (frequency) {
    case 'daily':
      daysToAdd = 1;
      break;
    case 'weekly':
      daysToAdd = (targetDayIndex + 7 - currentDayIndex) % 7;
      if (daysToAdd === 0) daysToAdd = 7; // If today is the target day, schedule for next week
      break;
    case 'biweekly':
      daysToAdd = (targetDayIndex + 7 - currentDayIndex) % 7;
      if (daysToAdd === 0) daysToAdd = 14; // If today is the target day, schedule for 2 weeks later
      else daysToAdd += 7; // Otherwise, schedule for next week + days to target
      break;
    case 'monthly':
      // For monthly, we'll use the same day of week but 4 weeks later
      daysToAdd = (targetDayIndex + 7 - currentDayIndex) % 7;
      if (daysToAdd === 0) daysToAdd = 28; // If today is the target day, schedule for 4 weeks later
      else daysToAdd += 21; // Otherwise, start with 3 weeks + days to target
      break;
    default:
      daysToAdd = 7; // Default to weekly
  }
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysToAdd);
  
  return nextDate.toISOString();
}

// GET all scheduled reports for an athlete
router.get('/api/athlete/:athleteId/scheduled-reports', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    // For now, we'll use a simplified authentication check since we don't have 
    // the storage methods for validation
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Just return the reports for the athlete
    const athleteReports = scheduledReports.filter(report => report.athleteId === athleteId);
    res.json(athleteReports);
  } catch (error) {
    console.error('Error fetching scheduled reports:', error);
    res.status(500).json({ message: 'Failed to fetch scheduled reports' });
  }
});

// GET a specific scheduled report
router.get('/api/athlete/:athleteId/scheduled-reports/:id', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const reportId = parseInt(req.params.id);
    
    // For now, we'll use a simplified authentication check
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const report = scheduledReports.find(r => r.id === reportId && r.athleteId === athleteId);
    
    if (!report) {
      return res.status(404).json({ message: 'Scheduled report not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching scheduled report:', error);
    res.status(500).json({ message: 'Failed to fetch scheduled report' });
  }
});

// POST create a new scheduled report
router.post('/api/athlete/:athleteId/scheduled-reports', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    
    // For now, we'll use a simplified authentication check
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate the request body
    const validationResult = scheduledReportSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid report data', 
        errors: validationResult.error.errors 
      });
    }
    
    const reportData = validationResult.data;
    
    // Check if the athlete ID in the path matches the one in the body
    if (reportData.athleteId !== athleteId) {
      return res.status(400).json({ message: 'Athlete ID mismatch' });
    }
    
    // Calculate the next scheduled date
    const nextScheduled = calculateNextScheduledDate(reportData.frequency, reportData.dayOfWeek);
    
    // Create the new report
    const newReport: ScheduledReport = {
      id: nextReportId++,
      ...reportData,
      nextScheduled,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    scheduledReports.push(newReport);
    
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating scheduled report:', error);
    res.status(500).json({ message: 'Failed to create scheduled report' });
  }
});

// PATCH update a scheduled report
router.patch('/api/athlete/:athleteId/scheduled-reports/:id', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const reportId = parseInt(req.params.id);
    
    // For now, we'll use a simplified authentication check
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Find the report
    const reportIndex = scheduledReports.findIndex(r => r.id === reportId && r.athleteId === athleteId);
    
    if (reportIndex === -1) {
      return res.status(404).json({ message: 'Scheduled report not found' });
    }
    
    // Validate the update data
    const validationResult = updateScheduledReportSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid update data', 
        errors: validationResult.error.errors 
      });
    }
    
    const updateData = validationResult.data;
    
    // Calculate new next scheduled date if frequency or day of week changes
    let nextScheduled = scheduledReports[reportIndex].nextScheduled;
    if (updateData.frequency || updateData.dayOfWeek) {
      const frequency = updateData.frequency || scheduledReports[reportIndex].frequency;
      const dayOfWeek = updateData.dayOfWeek || scheduledReports[reportIndex].dayOfWeek;
      nextScheduled = calculateNextScheduledDate(frequency, dayOfWeek);
    }
    
    // Update the report
    scheduledReports[reportIndex] = {
      ...scheduledReports[reportIndex],
      ...updateData,
      nextScheduled,
      updatedAt: new Date()
    };
    
    res.json(scheduledReports[reportIndex]);
  } catch (error) {
    console.error('Error updating scheduled report:', error);
    res.status(500).json({ message: 'Failed to update scheduled report' });
  }
});

// DELETE a scheduled report
router.delete('/api/athlete/:athleteId/scheduled-reports/:id', async (req: Request, res: Response) => {
  try {
    const athleteId = parseInt(req.params.athleteId);
    const reportId = parseInt(req.params.id);
    
    // For now, we'll use a simplified authentication check
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Find the report
    const reportIndex = scheduledReports.findIndex(r => r.id === reportId && r.athleteId === athleteId);
    
    if (reportIndex === -1) {
      return res.status(404).json({ message: 'Scheduled report not found' });
    }
    
    // Remove the report
    scheduledReports.splice(reportIndex, 1);
    
    res.json({ message: 'Scheduled report deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled report:', error);
    res.status(500).json({ message: 'Failed to delete scheduled report' });
  }
});

// In a production app, this would be a scheduled job, not an API endpoint
router.post('/api/scheduled-reports/process', async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as Storage;
    const now = new Date();
    const processedReports = [];
    
    // Find reports that are due
    const dueReports = scheduledReports.filter(report => {
      if (!report.active) return false;
      if (!report.nextScheduled) return false;
      
      const nextScheduledDate = new Date(report.nextScheduled);
      return nextScheduledDate <= now;
    });
    
    // Process each due report
    for (const report of dueReports) {
      try {
        // Get the athlete data
        const athlete = await storage.getAthlete(report.athleteId);
        if (!athlete) continue;
        
        // Get the user data for the athlete name
        const user = await storage.getUser(athlete.userId);
        if (!user) continue;
        
        const athleteName = `${athlete.firstName} ${athlete.lastName}`;
        
        // Get parent accesses to send notifications to
        const parentAccesses = await parentAccessService.getParentAccessesByAthleteId(report.athleteId);
        const activeParents = parentAccesses.filter(access => access.active && access.receiveUpdates);
        
        if (activeParents.length === 0) continue;
        
        // Prepare the report content
        const reportContent: any = {
          sections: {},
          includeInsights: report.includeInsights
        };
        
        // Get data for each selected section
        if (report.sections.includes('performance')) {
          const metrics = await storage.getCombineMetricsByAthlete(report.athleteId);
          reportContent.sections.performance = {
            title: 'Performance Metrics',
            metrics: metrics?.[0] || {},
          };
        }
        
        if (report.sections.includes('achievements')) {
          const achievements = await storage.getAthleteAchievements(report.athleteId);
          reportContent.sections.achievements = {
            title: 'Recent Achievements',
            achievements: achievements || [],
          };
        }
        
        // Process other sections based on the report configuration
        // ... (similar logic for other sections)
        
        // Send the report to each parent
        const successfulSends = [];
        const failedSends = [];
        
        for (const parentAccess of activeParents) {
          try {
            const success = await parentAccessService.sendEmail(
              parentAccess,
              EmailNotificationType.PERFORMANCE_UPDATE,
              reportContent
            );
            
            if (success) {
              successfulSends.push({
                parentId: parentAccess.id,
                email: parentAccess.email,
                name: parentAccess.name
              });
            } else {
              failedSends.push({
                parentId: parentAccess.id,
                email: parentAccess.email,
                reason: "Email delivery failed"
              });
            }
          } catch (error) {
            console.error(`Error sending scheduled report to parent ${parentAccess.id}:`, error);
            failedSends.push({
              parentId: parentAccess.id,
              email: parentAccess.email,
              reason: "Error processing report"
            });
          }
        }
        
        // Update the report's last sent and next scheduled dates
        const reportIndex = scheduledReports.findIndex(r => r.id === report.id);
        if (reportIndex !== -1) {
          scheduledReports[reportIndex].lastSent = now.toISOString();
          scheduledReports[reportIndex].nextScheduled = calculateNextScheduledDate(
            report.frequency,
            report.dayOfWeek
          );
          scheduledReports[reportIndex].updatedAt = now;
        }
        
        processedReports.push({
          reportId: report.id,
          athleteId: report.athleteId,
          athleteName,
          successfulSends,
          failedSends
        });
      } catch (error) {
        console.error(`Error processing report ${report.id}:`, error);
      }
    }
    
    res.json({
      processed: processedReports.length,
      reports: processedReports
    });
  } catch (error) {
    console.error('Error processing scheduled reports:', error);
    res.status(500).json({ message: 'Failed to process scheduled reports' });
  }
});

export { router };