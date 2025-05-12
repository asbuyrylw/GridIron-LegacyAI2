import sgMail from '@sendgrid/mail';
import { EmailNotificationType } from '../shared/parent-access';

// Initialize SendGrid if API key exists
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

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
      console.warn('SendGrid API key not provided. Email sending is disabled.');
    }
  }

  // Send an email
  async sendEmail(emailData: EmailData): Promise<boolean> {
    if (!this.enabled) {
      console.log('Email would be sent (SENDGRID_API_KEY not set):', {
        to: emailData.to,
        subject: emailData.subject,
        textPreview: emailData.text?.substring(0, 100) || 'No text preview available'
      });
      // For development/testing, we'll return true even though email wasn't actually sent
      return true; 
    }

    try {
      await sgMail.send(emailData);
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
  }

  // Generate parent invite email
  async sendParentInvite(athleteName: string, parentEmail: string, parentName: string, accessToken: string): Promise<boolean> {
    const accessUrl = `${process.env.BASE_URL || 'https://app.gridironlegacyai.com'}/parent-view?token=${accessToken}`;
    
    const emailData: EmailData = {
      to: parentEmail,
      from: this.fromEmail,
      subject: `${athleteName} has invited you to track their football progress on GridIron LegacyAI`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${parentName},</h2>
          <p>${athleteName} has invited you to view their football training and recruiting progress on GridIron LegacyAI.</p>
          <p>This special access will allow you to:</p>
          <ul>
            <li>View their performance stats and progress</li>
            <li>Get nutrition shopping lists from their meal plans</li>
            <li>Receive updates on achievements and milestones</li>
          </ul>
          <p><a href="${accessUrl}" style="display: inline-block; background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Progress Dashboard</a></p>
          <p>This link is unique to you and should not be shared with others.</p>
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
              ? stats.insights.map(insight => `<li>${insight}</li>`).join('') 
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
              ? stats.recommendations.map(rec => `<li>${rec}</li>`).join('') 
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

  // Send an email notification based on type
  async sendNotification(type: EmailNotificationType, parentEmail: string, parentName: string, athleteName: string, data: any): Promise<boolean> {
    switch (type) {
      case EmailNotificationType.INVITE:
        return this.sendParentInvite(athleteName, parentEmail, parentName, data.accessToken);
      case EmailNotificationType.PERFORMANCE_UPDATE:
        return this.sendPerformanceUpdate(parentEmail, parentName, athleteName, data.stats);
      case EmailNotificationType.NUTRITION_SHOPPING_LIST:
        return this.sendNutritionShoppingList(parentEmail, parentName, athleteName, data.items);
      case EmailNotificationType.ACHIEVEMENT_NOTIFICATION:
        // Implementation would go here
        return false;
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