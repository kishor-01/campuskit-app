import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_NAME = 'Seniofy';
// IMPORTANT: Update this to noreply@yourdomain.in once your domain is verified
const SENDER_EMAIL = 'onboarding@resend.dev';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Core function to send an email using Resend, with Brevo fallback.
 */
async function sendEmail({ to, subject, html }: EmailPayload): Promise<void> {
  try {
    // Attempt 1: Resend
    const resendResult = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    if (resendResult.error) {
      throw new Error(`Resend Error: ${resendResult.error.message}`);
    }
    
    return; // Success
  } catch (error) {
    console.error('Primary email provider (Resend) failed:', error);
    
    // Attempt 2: Brevo Fallback
    try {
      console.log('Attempting fallback to Brevo...');
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY || '',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: SENDER_NAME, email: SENDER_EMAIL },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html
        })
      });

      if (!response.ok) {
        throw new Error(`Brevo HTTP Error: ${response.statusText}`);
      }
      return; // Success
    } catch (fallbackError) {
      console.error('Fallback email provider (Brevo) also failed:', fallbackError);
      throw new Error('All email providers failed to send the email.');
    }
  }
}

/**
 * Send OTP email for signup verification
 */
export async function sendOtpEmail(email: string, otpCode: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Seniofy</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Digital Senior</p>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
        <p style="color: #666; line-height: 1.6;">
          Thank you for signing up for Seniofy! To complete your registration, 
          please use the following verification code:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: #f4f4f4; padding: 15px 30px; border-radius: 8px; border: 2px dashed #667eea;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">
              ${otpCode}
            </span>
          </div>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          This code will expire in 10 minutes. If you didn't request this code, 
          please ignore this email.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Need help? Contact our support team or visit our help center.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Your Seniofy OTP Code',
    html,
  });
}

/**
 * Send password reset OTP email
 */
export async function sendPasswordResetEmail(email: string, otpCode: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Seniofy</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
        <p style="color: #666; line-height: 1.6;">
          We received a request to reset your password. Use the following OTP code to proceed:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: #f4f4f4; padding: 15px 30px; border-radius: 8px; border: 2px dashed #667eea;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">
              ${otpCode}
            </span>
          </div>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          This code will expire in 10 minutes. If you didn't request a password reset, 
          please ignore this email and your password will remain unchanged.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Need help? Contact our support team or visit our help center.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Seniofy Password (OTP)',
    html,
  });
}

/**
 * Send notification to old email that email was changed
 */
export async function sendEmailChangeAlert(email: string, portalUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Seniofy</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Security Alert</p>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #333; margin-bottom: 20px;">Email Address Changed</h2>
        <p style="color: #666; line-height: 1.6;">
          The email address associated with your Seniofy account has been successfully changed.
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          If you did not authorize this change, please secure your account immediately.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${portalUrl}" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Go to Seniofy
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Need help? Contact our support team immediately.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Security Alert: Seniofy Email Address Changed',
    html,
  });
}

/**
 * Send welcome email to newsletter subscribers
 */
export async function sendNewsletterWelcome(email: string, confirmUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Seniofy</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to our Newsletter!</p>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #333; margin-bottom: 20px;">Thanks for Subscribing!</h2>
        <p style="color: #666; line-height: 1.6;">
          We're excited to have you on board. Please confirm your subscription by clicking the link below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Confirm Subscription
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          If you didn't subscribe to our newsletter, you can safely ignore this email.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Need help? Contact our support team.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Confirm your Seniofy Newsletter Subscription',
    html,
  });
}
