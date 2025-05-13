import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email functionality will be disabled.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("Using fallback mode for SendGrid (no API key)");
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(
  params: EmailParams
): Promise<boolean> {
  // Verify all required fields are present
  if (!params.to || !params.from || !params.subject) {
    console.error('Missing required email parameters:', { 
      to: !!params.to, 
      from: !!params.from, 
      subject: !!params.subject 
    });
    return false;
  }
  
  // Make sure text is provided if html is not
  const textContent = params.text || '';
  
  // Check if we're in development mode (no SendGrid API key)
  if (!process.env.SENDGRID_API_KEY) {
    console.log('------ DEVELOPMENT MODE EMAIL ------');
    console.log(`To: ${params.to}`);
    console.log(`From: ${params.from}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`Text Content: ${textContent.substring(0, 200)}${textContent.length > 200 ? '...' : ''}`);
    if (params.html) {
      console.log(`HTML Content: ${params.html.substring(0, 200)}${params.html.length > 200 ? '...' : ''}`);
    }
    console.log('-----------------------------------');
    console.log(`[DEV MODE] Email simulation sent to ${params.to}`);
    
    // Return success in development mode
    return true;
  }
  
  try {
    // Log the email being sent for debugging (excluding content for privacy)
    console.log('Sending email via SendGrid:', {
      to: params.to,
      from: params.from,
      subject: params.subject,
      hasText: !!textContent,
      hasHtml: !!params.html
    });
    
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: textContent,
      html: params.html,
    });
    
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error:', error);
    
    // Log more detailed error information if available
    if (error.response) {
      console.error('Error details:', {
        statusCode: error.code,
        body: error.response.body
      });
      
      // Special handling for common errors
      if (error.code === 403) {
        console.error('This is typically due to:');
        console.error('1. Invalid API key');
        console.error('2. Unverified sender domain');
        console.error('3. Insufficient permissions on the API key');
      }
    }
    
    // For testing purposes, we'll simulate email sending in case of errors
    // This allows development to proceed even when SendGrid is having issues
    console.log('Falling back to development mode due to SendGrid error');
    console.log('------ FALLBACK MODE EMAIL ------');
    console.log(`Would have sent to: ${params.to}`);
    console.log(`From: ${params.from}`);
    console.log(`Subject: ${params.subject}`);
    console.log('--------------------------------');
    
    // Return false to indicate that the actual SendGrid send failed
    return false;
  }
}