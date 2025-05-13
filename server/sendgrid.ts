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
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Email not sent: SENDGRID_API_KEY environment variable is not set.");
    return false;
  }
  
  try {
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
    }
    
    return false;
  }
}