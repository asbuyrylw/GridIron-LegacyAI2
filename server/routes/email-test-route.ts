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
    
    // Send a test email
    const success = await emailService.sendEmail({
      to,
      from: 'noreply@gridironlegacyai.com',
      subject,
      text: text || 'This is a test email from GridIron LegacyAI',
      html: html || '<p>This is a test email from <b>GridIron LegacyAI</b>.</p>'
    });
    
    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: `Test email sent successfully to ${to}`
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send test email'
      });
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
      return res.status(200).json({ 
        success: true, 
        message: `Parent invite email sent successfully to ${parentEmail}`
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send parent invite email'
      });
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