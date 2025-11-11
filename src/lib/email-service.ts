// src/lib/email-service.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
          <h1 style="margin: 0; font-size: 28px;">EduLink</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Digital Senior</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for signing up for EduLink! To complete your registration, 
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
      await resend.emails.send({
        from: 'EduLink <noreply@edulink.com>',
        to: email,
        subject: 'Verify Your EduLink Account',
        html,
      });

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
          <h1 style="margin: 0; font-size: 28px;">EduLink</h1>
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
      await resend.emails.send({
        from: 'EduLink <noreply@edulink.com>',
        to: email,
        subject: 'Reset Your EduLink Password',
        html,
      });

      return { success: true };
    } catch (error) {
      console.error('Password reset email error:', error);
      return { 
        success: false, 
        message: 'Failed to send password reset email' 
      };
    }
  }
}

// Export an instance as default
export const emailService = new EmailService();