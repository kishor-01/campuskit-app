// src/lib/otp-service.ts
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export interface OtpResult {
  success: boolean;
  message?: string;
  otp?: string;
}
export interface VerifyOtpResult {
  success: boolean;
  message?: string;
  email?: string;
}

/**
 * OTP Service for generating, storing, and verifying OTPs
 */
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 10;
  // OTP length: 6 digits for user convenience
  private readonly OTP_LENGTH = 6;

  /**
   * Generate a random numeric OTP
   */
  generateOtp(): string {
    // Secure random numeric OTP using crypto
    const digits = '0123456789';
    const bytes = crypto.randomBytes(this.OTP_LENGTH);
    let otp = '';
    for (let i = 0; i < this.OTP_LENGTH; i++) {
      otp += digits[bytes[i] % digits.length];
    }
    return otp;
  }

  /**
   * Create and store an OTP for the given email and type
   */
  async createOtp(
    email: string, 
    type: 'SIGNUP' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION'
  ): Promise<OtpResult> {
    try {
      // Clean up expired OTPs
      await this.cleanupExpiredOtps();

      // Check rate limiting (max 3 OTPs per email per hour)
      const recentOtps = await prisma.otp.count({
        where: {
          email,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      });

      if (recentOtps >= 3) {
        return {
          success: false,
          message: 'Too many OTP requests. Please try again later.'
        };
      }

      const otpCode = this.generateOtp();
      const hashedOtp = await bcrypt.hash(otpCode, 8);
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      await prisma.otp.create({
        data: {
          email,
          code: hashedOtp,
          type: type as any, // Map to Prisma enum
          expiresAt
        }
      });

      return {
        success: true,
        message: 'OTP created successfully',
        otp: otpCode
      };

    } catch (error) {
      console.error('OTP creation error:', error);
      return {
        success: false,
        message: 'Failed to create OTP'
      };
    }
  }

  /**
   * Verify an OTP code for the given email and type
   */
  async verifyOtp(
    email: string,
    code: string,
    type: 'SIGNUP' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION'
  ): Promise<VerifyOtpResult> {
    try {
      // Clean up expired OTPs first
      await this.cleanupExpiredOtps();

      const otpRecord = await prisma.otp.findFirst({
        where: {
          email,
          type: type as any,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!otpRecord) {
        return {
          success: false,
          message: 'OTP not found or expired'
        };
      }

      const isValid = await bcrypt.compare(code, otpRecord.code);
      
      if (!isValid) {
        return {
          success: false,
          message: 'Invalid OTP code'
        };
      }

      // Delete the used OTP
      await prisma.otp.delete({
        where: { id: otpRecord.id }
      });

      return {
        success: true,
        message: 'OTP verified successfully',
        email
      };

    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Failed to verify OTP'
      };
    }
  }

  /**
   * Clean up expired OTPs from the database
   */
  private async cleanupExpiredOtps(): Promise<void> {
    try {
      await prisma.otp.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
    } catch (error) {
      console.error('OTP cleanup error:', error);
    }
  }

  /**
   * Check if an email has a pending OTP
   */
  async hasPendingOtp(email: string, type: string): Promise<boolean> {
    const pendingOtp = await prisma.otp.findFirst({
      where: {
        email,
        type: type as any,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    return !!pendingOtp;
  }
}

// Export an instance as default
export const otpService = new OtpService();