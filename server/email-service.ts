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
      console.log('Email would be sent (SENDGRID_API_KEY not set):', emailData);
      return false;
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
    const emailData: EmailData = {
      to: parentEmail,
      from: this.fromEmail,
      subject: `${athleteName}'s Football Performance Update`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${parentName},</h2>
          <p>Here's the latest performance update for ${athleteName}:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
            <h3>Key Stats:</h3>
            <ul>
              ${Object.entries(stats).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
            </ul>
          </div>
          <p>View the complete dashboard for more detailed information.</p>
          <p>- The GridIron LegacyAI Team</p>
        </div>
      `
    };

    return this.sendEmail(emailData);
  }

  // Generate nutrition shopping list email
  async sendNutritionShoppingList(parentEmail: string, parentName: string, athleteName: string, items: string[]): Promise<boolean> {
    const emailData: EmailData = {
      to: parentEmail,
      from: this.fromEmail,
      subject: `${athleteName}'s Nutrition Shopping List`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${parentName},</h2>
          <p>Based on ${athleteName}'s nutrition plan, here's the shopping list for the week:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
            <h3>Shopping List:</h3>
            <ul>
              ${items.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          <p>These items support the nutrition goals set in ${athleteName}'s training plan.</p>
          <p>- The GridIron LegacyAI Team</p>
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