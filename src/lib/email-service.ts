// src/lib/email-service.ts
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  /**
   * Send OTP email for signup verification
   */
  async sendOtpEmail(email: string, otpCode: string): Promise<{ success: boolean; message?: string }> {
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
            <div style="display: inline-block; background: #f8f9fa; padding: 15px 30px; border-radius: 8px; border: 2px dashed #667eea;">
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

    try {
      const sentFrom = new Sender(process.env.FROM_EMAIL || 'noreply@seniofy.com', 'Seniofy');
      const recipients = [new Recipient(email, email)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject('Verify Your Seniofy Account')
        .setHtml(html)
        .setText(`Your verification code is ${otpCode}`);

      await mailerSend.email.send(emailParams);

      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      return { 
        success: false, 
        message: 'Failed to send verification email' 
      };
    }
  }

  /**
   * Send password reset email with reset link
   */
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<{ success: boolean; message?: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Seniofy</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.6;">
            You requested to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Or copy and paste this link in your browser:<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              Need help? Contact our support team or visit our help center.
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      const sentFrom = new Sender(process.env.FROM_EMAIL || 'noreply@seniofy.com', 'Seniofy');
      const recipients = [new Recipient(email, email)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject('Reset Your Seniofy Password')
        .setHtml(html)
        .setText(`Reset your password by visiting: ${resetUrl}`);

      await mailerSend.email.send(emailParams);

      return { success: true };
    } catch (error) {
      console.error('Password reset email error:', error);
      return { 
        success: false, 
        message: 'Failed to send password reset email' 
      };
    }
  }

  /**
   * Send password reset OTP email
   */
  async sendPasswordResetOtpEmail(email: string, otpCode: string): Promise<{ success: boolean; message?: string }> {
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
            <div style="display: inline-block; background: #f8f9fa; padding: 15px 30px; border-radius: 8px; border: 2px dashed #667eea;">
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

    try {
      const sentFrom = new Sender(process.env.FROM_EMAIL || 'noreply@seniofy.com', 'Seniofy');
      const recipients = [new Recipient(email, email)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject('Reset Your Seniofy Password (OTP)')
        .setHtml(html)
        .setText(`Your password reset code is ${otpCode}`);

      await mailerSend.email.send(emailParams);

      return { success: true };
    } catch (error) {
      console.error('Password reset OTP email error:', error);
      return { 
        success: false, 
        message: 'Failed to send password reset OTP email' 
      };
    }
  }
  /**
   * Send notification to old email that email was changed
   */
  async sendEmailChangeVerification(email: string, portalUrl: string): Promise<{ success: boolean; message?: string }> {
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

    try {
      const sentFrom = new Sender(process.env.FROM_EMAIL || 'noreply@seniofy.com', 'Seniofy');
      const recipients = [new Recipient(email, email)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject('Security Alert: Seniofy Email Address Changed')
        .setHtml(html)
        .setText(`Your Seniofy email address was changed. If you did not authorize this, please contact support immediately.`);

      await mailerSend.email.send(emailParams);

      return { success: true };
    } catch (error) {
      console.error('Email change notification error:', error);
      return { 
        success: false, 
        message: 'Failed to send email change notification' 
      };
    }
  }
}

// Export an instance as default
export const emailService = new EmailService();