import { EmailNotificationType } from '../shared/parent-access';
import { sendEmail as sendGridEmail } from './sendgrid';

// Email interface
interface EmailData {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html: string;
}

// Base email service class
class EmailService {
  private readonly fromEmail: string = 'noreply@gridironlegacyai.com';
  private readonly enabled: boolean;

  constructor() {
    this.enabled = !!process.env.SENDGRID_API_KEY;
    if (!this.enabled) {
      console.warn('SendGrid API key not provided. Email service will run in DEVELOPMENT MODE.');
      console.warn('Emails will be simulated in console logs but not actually sent.');
      console.warn('To enable real email delivery, provide a SENDGRID_API_KEY environment variable.');
    } else {
      console.log('SendGrid email service initialized.');
    }
  }

  // Send an email
  async sendEmail(emailData: EmailData): Promise<boolean> {
    // Always ensure we have a from address
    if (!emailData.from) {
      emailData.from = this.fromEmail;
    }
    
    // Set default text content if only HTML is provided
    if (!emailData.text && emailData.html) {
      // Simple HTML to text conversion (not perfect but helps with plain text fallback)
      const textContent = emailData.html
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ')    // Normalize whitespace
        .trim();                 // Trim unnecessary whitespace
      
      emailData.text = textContent;
    }

    // If SendGrid is not enabled, log the email that would be sent but return true
    if (!this.enabled) {
      console.log('Email would be sent (SENDGRID_API_KEY not set):', {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        textPreview: emailData.text?.substring(0, 100) || 'No text preview available'
      });
      
      // Create a mock preview of the email content in console
      console.log('------- EMAIL PREVIEW -------');
      console.log(`To: ${emailData.to}`);
      console.log(`From: ${emailData.from}`);
      console.log(`Subject: ${emailData.subject}`);
      console.log(`Body: ${emailData.text?.substring(0, 500) || 'No text content'}`);
      console.log('----------------------------');
      
      // For development/testing, we'll return true even though email wasn't actually sent
      return true; 
    }

    try {
      // Send email via SendGrid using our updated service
      const success = await sendGridEmail(emailData);
      
      if (success) {
        console.log(`Email sent successfully to ${emailData.to}`);
      } else {
        console.error(`Failed to send email to ${emailData.to} - SendGrid API call returned false`);
      }
      
      return success;
    } catch (error: any) {
      // Enhanced error logging 
      console.error('SendGrid error sending email to', emailData.to);
      console.error(error);
      
      // If we get a 403 Forbidden error, we need a better explanation
      if (error.code === 403) {
        console.error('SendGrid API key error (403 Forbidden): This typically means your API key is invalid or has insufficient permissions, or your sender domain is not verified.');
        console.error('See https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication for domain authentication instructions.');
      }
      
      return false;
    }
  }

  // Generate parent invite email
  async sendParentInvite(athleteName: string, parentEmail: string, parentName: string, accessToken: string): Promise<boolean> {
    // We no longer use the access token for a dashboard link since we're using email-only approach
    
    const emailData: EmailData = {
      to: parentEmail,
      from: this.fromEmail,
      subject: `${athleteName} has invited you to receive football progress updates from GridIron LegacyAI`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${parentName},</h2>
          <p>${athleteName} has invited you to receive their football training and recruiting progress updates via email from GridIron LegacyAI.</p>
          <p>You'll now receive regular email updates that include:</p>
          <ul>
            <li>Performance stats and progress reports</li>
            <li>Nutrition shopping lists based on their meal plans</li>
            <li>Updates on achievements and milestones</li>
          </ul>
          <p style="background-color: #f7f7f7; padding: 15px; border-left: 4px solid #4A90E2; margin: 20px 0;">
            <strong>No account or login is required.</strong> All updates will be delivered directly to this email address.
          </p>
          <p>Thank you for supporting ${athleteName}'s football journey!</p>
          <p>- The GridIron LegacyAI Team</p>
        </div>
      `
    };

    return this.sendEmail(emailData);
  }

  // Generate performance update email
  async sendPerformanceUpdate(parentEmail: string, parentName: string, athleteName: string, stats: any): Promise<boolean> {
    // Format metrics more nicely with human-readable names
    const formatMetricName = (name: string): string => {
      // Convert camelCase or snake_case to Title Case with spaces
      return name
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
        .trim(); // Remove any extra spaces
    };
    
    // Separate metrics into categories if applicable
    let categorizedStats: Record<string, any> = {};
    
    if (stats.metrics) {
      // If stats is already categorized
      categorizedStats = stats;
    } else {
      // Group into general "Performance Metrics" category
      categorizedStats = {
        "Performance Metrics": stats
      };
    }
    
    // Generate HTML for metrics by category
    const metricsHtml = Object.entries(categorizedStats)
      .map(([category, metricsObj]) => {
        if (!metricsObj || typeof metricsObj !== 'object') return '';
        
        return `
          <div style="margin-bottom: 20px;">
            <h4 style="color: #4A90E2; margin-bottom: 10px; border-bottom: 1px solid #e0e0e0; padding-bottom: 5px;">
              ${formatMetricName(category)}
            </h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>
                ${Object.entries(metricsObj)
                  .filter(([key]) => key !== 'id' && key !== 'athleteId' && key !== 'dateRecorded')
                  .map(([key, value]) => `
                    <tr>
                      <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">
                        <strong>${formatMetricName(key)}</strong>
                      </td>
                      <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align: right;">
                        ${value}
                      </td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        `;
      })
      .join('');
    
    // Include insights if available
    const insightsHtml = stats.insights 
      ? `
        <div style="background-color: #f5f7fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <h4 style="color: #4A90E2; margin-top: 0;">Performance Insights:</h4>
          <ul>
            ${Array.isArray(stats.insights) 
              ? stats.insights.map((insight: string) => `<li>${insight}</li>`).join('') 
              : `<li>${stats.insights}</li>`}
          </ul>
        </div>
      `
      : '';
    
    // Include recommendations if available
    const recommendationsHtml = stats.recommendations
      ? `
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <h4 style="color: #4A90E2; margin-top: 0;">Coach Recommendations:</h4>
          <ul>
            ${Array.isArray(stats.recommendations) 
              ? stats.recommendations.map((rec: string) => `<li>${rec}</li>`).join('') 
              : `<li>${stats.recommendations}</li>`}
          </ul>
        </div>
      `
      : '';
    
    const emailData: EmailData = {
      to: parentEmail,
      from: this.fromEmail,
      subject: `${athleteName}'s Football Performance Update`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4A90E2; padding: 20px; color: white; text-align: center; border-radius: 4px 4px 0 0;">
            <h2 style="margin: 0;">Performance Report</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 4px 4px;">
            <p>Hello ${parentName},</p>
            <p>Here's the latest performance update for ${athleteName}:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
              ${metricsHtml}
            </div>
            
            ${insightsHtml}
            ${recommendationsHtml}
            
            <p style="margin-top: 20px;">This report is automatically generated based on ${athleteName}'s latest training and performance data.</p>
            <p style="margin-bottom: 0;">Best regards,<br>The GridIron LegacyAI Team</p>
          </div>
        </div>
      `
    };

    return this.sendEmail(emailData);
  }

  // Generate nutrition shopping list email
  async sendNutritionShoppingList(parentEmail: string, parentName: string, athleteName: string, items: any[]): Promise<boolean> {
    // Group items by category if they are structured objects
    let itemsByCategory: Record<string, any[]> = {};
    
    if (items.length > 0 && typeof items[0] === 'object' && items[0].category) {
      // Items are structured with categories
      items.forEach(item => {
        if (!itemsByCategory[item.category]) {
          itemsByCategory[item.category] = [];
        }
        itemsByCategory[item.category].push(item);
      });
    } else {
      // Simple string list, put all under "General" category
      itemsByCategory = { "General": items };
    }
    
    // Generate HTML for each category
    const categoriesHtml = Object.entries(itemsByCategory)
      .map(([category, categoryItems]) => {
        return `
          <div style="margin-bottom: 20px;">
            <h4 style="color: #4A90E2; margin-bottom: 10px;">${category}</h4>
            <ul style="padding-left: 20px;">
              ${categoryItems.map(item => {
                // Handle both string items and object items
                if (typeof item === 'object') {
                  return `<li>${item.name}${item.quantity ? ` - ${item.quantity}` : ''}</li>`;
                } else {
                  return `<li>${item}</li>`;
                }
              }).join('')}
            </ul>
          </div>
        `;
      })
      .join('');
    
    const emailData: EmailData = {
      to: parentEmail,
      from: this.fromEmail,
      subject: `${athleteName}'s Nutrition Shopping List`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4A90E2; padding: 20px; color: white; text-align: center; border-radius: 4px 4px 0 0;">
            <h2 style="margin: 0;">Nutrition Shopping List</h2>
          </div>
          <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 4px 4px;">
            <p>Hello ${parentName},</p>
            <p>Based on ${athleteName}'s performance nutrition plan, here is the recommended shopping list for this week:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
              ${categoriesHtml}
            </div>
            
            <div style="background-color: #f5f7fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <h4 style="color: #4A90E2; margin-top: 0;">Nutrition Tips:</h4>
              <ul>
                <li>Focus on whole foods rather than processed options</li>
                <li>Prepare meals in advance to maintain consistency</li>
                <li>Stay hydrated throughout training sessions</li>
                <li>Timing of protein intake is important for recovery</li>
              </ul>
            </div>
            
            <p style="margin-top: 20px;">These items support the nutrition goals set in ${athleteName}'s training plan to maximize performance and recovery.</p>
            <p style="margin-bottom: 0;">Best regards,<br>The GridIron LegacyAI Team</p>
          </div>
        </div>
      `
    };

    return this.sendEmail(emailData);
  }

  // Send achievement notification email
  async sendAchievementNotification(parentEmail: string, parentName: string, athleteName: string, achievements: any[]): Promise<boolean> {
    if (!achievements || achievements.length === 0) {
      console.error('No achievements provided for email notification');
      return false;
    }
    
    // Generate HTML for each achievement
    const achievementsHtml = achievements.map(achievement => {
      // Determine tier color for styling
      let tierColor = '#6B7280'; // Default gray
      switch (achievement.level || achievement.tier) {
        case 'bronze': tierColor = '#CD7F32'; break;
        case 'silver': tierColor = '#C0C0C0'; break;
        case 'gold': tierColor = '#FFD700'; break;
        case 'platinum': tierColor = '#E5E4E2'; break;
      }
      
      return `
        <div style="margin-bottom: 15px; border-left: 4px solid ${tierColor}; padding-left: 15px;">
          <h4 style="margin: 0 0 5px 0; color: #333;">${achievement.name}</h4>
          <p style="margin: 0; color: #666; font-size: 14px;">${achievement.description}</p>
          <div style="display: flex; margin-top: 8px; font-size: 12px;">
            <span style="color: ${tierColor}; font-weight: bold; margin-right: 10px;">
              ${(achievement.level || achievement.tier).toUpperCase()}
            </span>
            <span style="color: #6B7280;">
              ${achievement.pointValue || achievement.points || 0} points
            </span>
          </div>
        </div>
      `;
    }).join('');
    
    const emailData: EmailData = {
      to: parentEmail,
      from: this.fromEmail,
      subject: `${athleteName} has unlocked new achievements!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4A90E2; padding: 20px; color: white; text-align: center; border-radius: 4px 4px 0 0;">
            <h2 style="margin: 0;">Achievement Update</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 4px 4px;">
            <p>Hello ${parentName},</p>
            <p>${athleteName} has recently unlocked ${achievements.length > 1 ? 'some new achievements' : 'a new achievement'}!</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
              ${achievementsHtml}
            </div>
            
            <div style="background-color: #f5f7fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <h4 style="color: #4A90E2; margin-top: 0;">What This Means:</h4>
              <p style="margin-bottom: 0;">
                ${athleteName} is making great progress in their training journey. These achievements 
                reflect their dedication and improvement in key football skills and overall development.
              </p>
            </div>
            
            <p style="margin-top: 20px;">
              Achievements are awarded for significant milestones in athletic performance, consistent 
              training, academic progress, and overall engagement with the GridIron LegacyAI platform.
            </p>
            <p style="margin-bottom: 0;">Best regards,<br>The GridIron LegacyAI Team</p>
          </div>
        </div>
      `
    };

    return this.sendEmail(emailData);
  }

  // Send an email notification based on type
  // Send a weekly summary report
  async sendWeeklySummary(parentEmail: string, parentName: string, athleteName: string, summaryData: any): Promise<boolean> {
    // Define sections to include
    const sections = summaryData.sections || ['performance', 'achievements', 'training', 'nutrition'];
    
    // Build HTML sections based on available data
    let sectionsHtml = '';
    
    // Performance metrics section
    if (sections.includes('performance') && summaryData.performance) {
      const performanceHtml = this.buildPerformanceSection(summaryData.performance);
      if (performanceHtml) {
        sectionsHtml += `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #4A90E2; margin-top: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">
              Performance Summary
            </h3>
            ${performanceHtml}
          </div>
        `;
      }
    }
    
    // Achievements section
    if (sections.includes('achievements') && summaryData.achievements && summaryData.achievements.length > 0) {
      const achievementsHtml = summaryData.achievements
        .map((achievement: any) => {
          const tierColor = this.getTierColor(achievement.level || achievement.tier || 'bronze');
          return `
            <div style="margin-bottom: 10px; border-left: 4px solid ${tierColor}; padding-left: 10px;">
              <h4 style="margin: 0 0 5px 0; color: #333;">${achievement.name}</h4>
              <p style="margin: 0; color: #666; font-size: 14px;">${achievement.description}</p>
            </div>
          `;
        })
        .join('');
        
      if (achievementsHtml) {
        sectionsHtml += `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #4A90E2; margin-top: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">
              Achievements This Week
            </h3>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
              ${achievementsHtml}
            </div>
          </div>
        `;
      }
    }
    
    // Training summary section
    if (sections.includes('training') && summaryData.training) {
      const training = summaryData.training;
      const sessionsCount = training.sessionCount || 0;
      const completionRate = training.completionRate || 0;
      
      sectionsHtml += `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #4A90E2; margin-top: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">
            Training Activity
          </h3>
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <div style="min-width: 150px; background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 10px;">
              <p style="font-size: 32px; font-weight: bold; margin: 0; color: #4A90E2;">${sessionsCount}</p>
              <p style="margin: 0; color: #666;">Training sessions</p>
            </div>
            <div style="min-width: 150px; background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 10px;">
              <p style="font-size: 32px; font-weight: bold; margin: 0; color: #4A90E2;">${completionRate}%</p>
              <p style="margin: 0; color: #666;">Completion rate</p>
            </div>
          </div>
          ${training.focusAreas ? `
            <div style="margin-top: 15px;">
              <h4 style="margin: 0 0 5px 0;">Focus Areas:</h4>
              <ul style="margin-top: 5px; padding-left: 20px;">
                ${Array.isArray(training.focusAreas) 
                  ? training.focusAreas.map((area: string) => `<li>${area}</li>`).join('') 
                  : `<li>${training.focusAreas}</li>`}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    // Nutrition section
    if (sections.includes('nutrition') && summaryData.nutrition) {
      const nutrition = summaryData.nutrition;
      
      sectionsHtml += `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #4A90E2; margin-top: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">
            Nutrition Overview
          </h3>
          ${nutrition.complianceRate ? `
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
              <p style="font-size: 24px; font-weight: bold; margin: 0 0 5px 0; color: #4A90E2;">${nutrition.complianceRate}%</p>
              <p style="margin: 0; color: #666;">Meal plan compliance</p>
            </div>
          ` : ''}
          ${nutrition.recommendations ? `
            <div style="margin-top: 15px;">
              <h4 style="margin: 0 0 5px 0;">Nutritionist Recommendations:</h4>
              <ul style="margin-top: 5px; padding-left: 20px;">
                ${Array.isArray(nutrition.recommendations) 
                  ? nutrition.recommendations.map((rec: string) => `<li>${rec}</li>`).join('') 
                  : `<li>${nutrition.recommendations}</li>`}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    // Custom message
    const customMessageHtml = summaryData.customMessage ? `
      <div style="margin: 25px 0; padding: 15px; background-color: #f5f7fa; border-radius: 4px; border-left: 4px solid #4A90E2;">
        <h4 style="margin-top: 0; color: #4A90E2;">Personal Note:</h4>
        <p style="margin-bottom: 0;">${summaryData.customMessage}</p>
      </div>
    ` : '';
    
    const emailData: EmailData = {
      to: parentEmail,
      from: this.fromEmail,
      subject: `${athleteName}'s Weekly Football Progress Report`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4A90E2; padding: 20px; color: white; text-align: center; border-radius: 4px 4px 0 0;">
            <h2 style="margin: 0;">Weekly Progress Report</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">${this.formatDateRange()}</p>
          </div>
          
          <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 4px 4px;">
            <p>Hello ${parentName},</p>
            <p>Here's a summary of ${athleteName}'s progress this week:</p>
            
            ${sectionsHtml}
            ${customMessageHtml}
            
            <p style="margin-top: 20px;">
              This weekly report summarizes ${athleteName}'s progress and achievements. 
              For more detailed information, ${athleteName} can show you specific metrics and plans within the GridIron LegacyAI platform.
            </p>
            <p style="margin-bottom: 0;">Best regards,<br>The GridIron LegacyAI Team</p>
          </div>
        </div>
      `
    };

    return this.sendEmail(emailData);
  }
  
  // Send training progress email
  async sendTrainingProgress(parentEmail: string, parentName: string, athleteName: string, trainingData: any): Promise<boolean> {
    const workoutSessions = trainingData.sessions || [];
    const completedSessionsCount = workoutSessions.filter((session: any) => session.completed).length;
    const totalSessionsCount = workoutSessions.length;
    const completionRatePercent = totalSessionsCount > 0 
      ? Math.round((completedSessionsCount / totalSessionsCount) * 100) 
      : 0;
    
    // Generate HTML for each completed session
    const sessionsHtml = workoutSessions
      .filter((session: any) => session.completed)
      .map((session: any) => {
        const date = new Date(session.date).toLocaleDateString();
        const duration = session.duration || 0;
        const exercises = session.exercisesCompleted?.planExercises || [];
        
        return `
          <div style="margin-bottom: 15px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px;">
            <h4 style="margin: 0 0 5px 0;">${session.title || `Training on ${date}`}</h4>
            <div style="display: flex; margin-bottom: 10px; font-size: 14px; color: #666;">
              <div style="margin-right: 15px;"><strong>Date:</strong> ${date}</div>
              <div style="margin-right: 15px;"><strong>Duration:</strong> ${duration} min</div>
              ${session.perceivedExertion ? `<div><strong>Effort:</strong> ${session.perceivedExertion}/10</div>` : ''}
            </div>
            ${exercises.length > 0 ? `
              <div style="font-size: 14px;">
                <div><strong>Exercises:</strong></div>
                <ul style="margin-top: 5px; padding-left: 20px;">
                  ${exercises.map((ex: any) => `
                    <li>${ex.name} - ${ex.sets} sets × ${ex.reps}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
            ${session.notes ? `
              <div style="font-size: 14px; margin-top: 10px;">
                <strong>Notes:</strong> ${session.notes}
              </div>
            ` : ''}
          </div>
        `;
      })
      .join('');
    
    // Include upcoming training preview if available
    const upcomingTrainingHtml = trainingData.upcoming ? `
      <div style="margin-top: 25px;">
        <h3 style="color: #4A90E2; margin-top: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">
          Upcoming Training Focus
        </h3>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
          <h4 style="margin-top: 0;">${trainingData.upcoming.title || 'Next Training Plan'}</h4>
          <p>${trainingData.upcoming.description || ''}</p>
          ${trainingData.upcoming.focus ? `<p><strong>Focus:</strong> ${trainingData.upcoming.focus}</p>` : ''}
        </div>
      </div>
    ` : '';
    
    const emailData: EmailData = {
      to: parentEmail,
      from: this.fromEmail,
      subject: `${athleteName}'s Training Progress Update`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4A90E2; padding: 20px; color: white; text-align: center; border-radius: 4px 4px 0 0;">
            <h2 style="margin: 0;">Training Progress Report</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">${this.formatDateRange()}</p>
          </div>
          
          <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 4px 4px;">
            <p>Hello ${parentName},</p>
            <p>Here's a summary of ${athleteName}'s recent training activity:</p>
            
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin: 20px 0;">
              <div style="min-width: 150px; background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 10px; text-align: center;">
                <p style="font-size: 32px; font-weight: bold; margin: 0; color: #4A90E2;">${completedSessionsCount}</p>
                <p style="margin: 0; color: #666;">Sessions completed</p>
              </div>
              <div style="min-width: 150px; background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 10px; text-align: center;">
                <p style="font-size: 32px; font-weight: bold; margin: 0; color: #4A90E2;">${completionRatePercent}%</p>
                <p style="margin: 0; color: #666;">Completion rate</p>
              </div>
            </div>
            
            <h3 style="color: #4A90E2; margin-top: 25px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">
              Completed Training Sessions
            </h3>
            <div>
              ${sessionsHtml || '<p>No completed training sessions in this period.</p>'}
            </div>
            
            ${upcomingTrainingHtml}
            
            <p style="margin-top: 20px;">
              Consistent training is essential for athletic development. Please encourage ${athleteName} to stick to their 
              training schedule and complete all assigned exercises for maximum improvement.
            </p>
            <p style="margin-bottom: 0;">Best regards,<br>The GridIron LegacyAI Team</p>
          </div>
        </div>
      `
    };

    return this.sendEmail(emailData);
  }
  
  // Send academic update email
  async sendAcademicUpdate(parentEmail: string, parentName: string, athleteName: string, academicData: any): Promise<boolean> {
    const emailData: EmailData = {
      to: parentEmail,
      from: this.fromEmail,
      subject: `${athleteName}'s Academic Progress Update`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4A90E2; padding: 20px; color: white; text-align: center; border-radius: 4px 4px 0 0;">
            <h2 style="margin: 0;">Academic Progress Report</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 4px 4px;">
            <p>Hello ${parentName},</p>
            <p>Here's an update on ${athleteName}'s academic progress:</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                <div style="min-width: 120px; text-align: center; margin-bottom: 15px;">
                  <p style="font-size: 28px; font-weight: bold; margin: 0; color: #4A90E2;">
                    ${academicData.gpa || 'N/A'}
                  </p>
                  <p style="margin: 0; color: #666;">Current GPA</p>
                </div>
                <div style="min-width: 120px; text-align: center; margin-bottom: 15px;">
                  <p style="font-size: 28px; font-weight: bold; margin: 0; color: #4A90E2;">
                    ${academicData.actScore || 'N/A'}
                  </p>
                  <p style="margin: 0; color: #666;">ACT Score</p>
                </div>
                <div style="min-width: 120px; text-align: center; margin-bottom: 15px;">
                  <p style="font-size: 28px; font-weight: bold; margin: 0; color: #4A90E2;">
                    ${academicData.satScore || 'N/A'}
                  </p>
                  <p style="margin: 0; color: #666;">SAT Score</p>
                </div>
              </div>
              
              ${academicData.courses && academicData.courses.length > 0 ? `
                <div style="margin-top: 20px;">
                  <h4 style="margin-top: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">Current Courses</h4>
                  <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="border-bottom: 1px solid #e0e0e0;">
                        <th style="text-align: left; padding: 8px;">Course</th>
                        <th style="text-align: right; padding: 8px;">Current Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${academicData.courses.map((course: any) => `
                        <tr style="border-bottom: 1px solid #f0f0f0;">
                          <td style="padding: 8px;">${course.name}</td>
                          <td style="padding: 8px; text-align: right;">${course.grade || 'N/A'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : ''}
            </div>
            
            ${academicData.insights ? `
              <div style="background-color: #f5f7fa; padding: 15px; border-radius: 4px; margin-top: 20px; border-left: 4px solid #4A90E2;">
                <h4 style="color: #4A90E2; margin-top: 0;">Academic Insights:</h4>
                <p>${academicData.insights}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 20px; background-color: #FFF8E1; padding: 15px; border-radius: 4px; border-left: 4px solid #FFC107;">
              <h4 style="color: #FF9800; margin-top: 0;">College Eligibility Requirements:</h4>
              <p style="margin-bottom: 10px;">Remember that NCAA Division I eligibility typically requires:</p>
              <ul style="margin-top: 0;">
                <li>Graduate from high school</li>
                <li>Complete 16 core courses</li>
                <li>Earn a minimum 2.3 GPA in core courses</li>
                <li>Earn an SAT or ACT score that matches your core-course GPA on the sliding scale</li>
              </ul>
            </div>
            
            <p style="margin-top: 20px;">
              Academic performance is crucial for college recruiting. ${athleteName} should maintain focus on 
              both athletic and academic achievement to maximize opportunities.
            </p>
            <p style="margin-bottom: 0;">Best regards,<br>The GridIron LegacyAI Team</p>
          </div>
        </div>
      `
    };

    return this.sendEmail(emailData);
  }
  
  // Helper functions
  private formatDateRange(): string {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `${formatDate(lastWeek)} - ${formatDate(today)}`;
  }
  
  private getTierColor(tier: string): string {
    switch (tier.toLowerCase()) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#6B7280';
    }
  }
  
  private buildPerformanceSection(performance: any): string {
    if (!performance) return '';
    
    let html = '';
    
    // Key metrics with visual indicators
    if (performance.metrics) {
      const metricKeys = Object.keys(performance.metrics).filter(key => 
        key !== 'id' && key !== 'athleteId' && key !== 'dateRecorded'
      );
      
      if (metricKeys.length > 0) {
        html += `
          <div style="margin-bottom: 15px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>
                ${metricKeys.map(key => {
                  const value = performance.metrics[key];
                  const change = performance.changes?.[key] || 0;
                  const arrow = change > 0 ? '▲' : change < 0 ? '▼' : '';
                  const changeColor = change > 0 ? '#4CAF50' : change < 0 ? '#F44336' : '#757575';
                  
                  return `
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                      <td style="padding: 8px; width: 50%;">
                        <strong>${this.formatMetricName(key)}</strong>
                      </td>
                      <td style="padding: 8px; text-align: right;">
                        ${value} 
                        ${change !== 0 ? 
                          `<span style="color: ${changeColor}; font-size: 12px; margin-left: 5px;">
                            ${arrow} ${Math.abs(change)}
                          </span>` : 
                          ''
                        }
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }
    
    // Progress areas
    if (performance.progressAreas && performance.progressAreas.length > 0) {
      html += `
        <div style="margin-top: 15px;">
          <h4 style="margin: 0 0 10px 0;">Areas of Improvement:</h4>
          <ul style="margin-top: 0; padding-left: 20px;">
            ${performance.progressAreas.map((area: string) => `<li>${area}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    return html;
  }
  
  private formatMetricName(name: string): string {
    // Convert camelCase or snake_case to Title Case with spaces
    return name
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
      .trim(); // Remove any extra spaces
  }

  async sendNotification(type: EmailNotificationType, parentEmail: string, parentName: string, athleteName: string, data: any): Promise<boolean> {
    switch (type) {
      case EmailNotificationType.INVITE:
        return this.sendParentInvite(athleteName, parentEmail, parentName, data.accessToken);
      case EmailNotificationType.PERFORMANCE_UPDATE:
        return this.sendPerformanceUpdate(parentEmail, parentName, athleteName, data.stats);
      case EmailNotificationType.NUTRITION_SHOPPING_LIST:
        return this.sendNutritionShoppingList(parentEmail, parentName, athleteName, data.items);
      case EmailNotificationType.ACHIEVEMENT_NOTIFICATION:
        return this.sendAchievementNotification(parentEmail, parentName, athleteName, data.achievements);
      case EmailNotificationType.WEEKLY_SUMMARY:
        return this.sendWeeklySummary(parentEmail, parentName, athleteName, data);
      case EmailNotificationType.TRAINING_PROGRESS:
        return this.sendTrainingProgress(parentEmail, parentName, athleteName, data);
      case EmailNotificationType.ACADEMIC_UPDATE:
        return this.sendAcademicUpdate(parentEmail, parentName, athleteName, data);
      case EmailNotificationType.EVENT_REMINDER:
        // Implementation would go here
        return false;
      default:
        console.error(`Unsupported email notification type: ${type}`);
        return false;
    }
  }
}

export const emailService = new EmailService();