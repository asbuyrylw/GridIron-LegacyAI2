import { Request, Response, Router } from 'express';
import { emailService } from '../email-service';

export const emailTestRouter = Router();

// Simple route to test email sending
emailTestRouter.post('/test-email', async (req: Request, res: Response) => {
  try {
    const { to, subject, text, html } = req.body;
    
    // Validate required fields
    if (!to || !subject) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: to and subject are required'
      });
    }

    // Check if SendGrid API key is available
    const usingSendGrid = !!process.env.SENDGRID_API_KEY;
    
    // Send a test email
    const success = await emailService.sendEmail({
      to,
      from: 'noreply@gridironlegacyai.com',
      subject,
      text: text || 'This is a test email from GridIron LegacyAI',
      html: html || '<p>This is a test email from <b>GridIron LegacyAI</b>.</p>'
    });
    
    if (success) {
      // If the service is disabled but we returned success, it's in development mode
      if (!usingSendGrid) {
        return res.status(200).json({ 
          success: true, 
          message: `[DEVELOPMENT MODE] Email simulation successful. Email would be sent to ${to}`,
          note: "Running in development mode with SendGrid disabled. Emails are simulated but not actually delivered."
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: `Test email sent successfully to ${to}`
      });
    } else {
      // Failed to send, provide more context on the issue
      if (usingSendGrid) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send test email via SendGrid',
          troubleshooting: 'SendGrid API returned an error. This may be due to authentication issues or domain verification. Check server logs for details.'
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to send test email (SendGrid API key not configured)'
        });
      }
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while sending the test email',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Test parent invite email
emailTestRouter.post('/test-parent-invite', async (req: Request, res: Response) => {
  try {
    const { parentEmail, parentName, athleteName } = req.body;
    
    // Validate required fields
    if (!parentEmail || !parentName || !athleteName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: parentEmail, parentName, and athleteName are required'
      });
    }
    
    // Check if SendGrid API key is available
    const usingSendGrid = !!process.env.SENDGRID_API_KEY;
    
    // Generate a test access token
    const accessToken = 'test-token-123456';
    
    // Send a parent invite email
    const success = await emailService.sendParentInvite(
      athleteName,
      parentEmail,
      parentName,
      accessToken
    );
    
    if (success) {
      // If the service is disabled but we returned success, it's in development mode
      if (!usingSendGrid) {
        return res.status(200).json({ 
          success: true, 
          message: `[DEVELOPMENT MODE] Parent invite simulation successful. Email would be sent to ${parentEmail}`,
          note: "Running in development mode with SendGrid disabled. Parent invites are simulated but not actually delivered."
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: `Parent invite email sent successfully to ${parentEmail}`
      });
    } else {
      // Failed to send, provide more context on the issue
      if (usingSendGrid) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send parent invite email via SendGrid',
          troubleshooting: 'SendGrid API returned an error. This may be due to authentication issues or domain verification. Check server logs for details.'
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to send parent invite email (SendGrid API key not configured)'
        });
      }
    }
  } catch (error) {
    console.error('Error sending parent invite email:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while sending the parent invite email',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});