// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { otpService } from '@/lib/otp-service';
import bcrypt from 'bcryptjs';
import rateLimit from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Rate limit by IP and email
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rl = await rateLimit(`forgot:${email}:${ip}`, 3, 60 * 5); // 3 requests per 5 minutes
    if (rl.limited) {
      return NextResponse.json({ success: true, message: 'If this email is registered, you will receive reset instructions.' }, { status: 429 });
    }

    // Check if user exists - only allow registered users
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Security: Don't reveal whether email exists or not
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, you will receive reset instructions.',
      });
    }

    // Check if user has a password (not OAuth-only users)
    if (!user.password) {
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, you will receive reset instructions.',
      });
    }

    // Prevent rapid repeated requests: if an OTP was created within the last minute, do not create/send again
    const recentOtp = await prisma.otp.findFirst({
      where: {
        email,
        type: 'PASSWORD_RESET',
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000), // 1 minute
        },
      },
    });

    if (recentOtp) {
      // Do not send another email; respond with generic success to avoid account enumeration
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, you will receive reset instructions.',
      });
    }

    // Delete any existing reset OTPs for this email (older ones)
    await prisma.otp.deleteMany({
      where: { 
        email,
        type: 'PASSWORD_RESET' 
      },
    });

    // Generate reset OTP
    const otpCode = otpService.generateOtp();
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create new reset OTP
    await prisma.otp.create({
      data: {
        email,
        code: hashedOtp,
        type: 'PASSWORD_RESET',
        expiresAt,
      },
    });

    // Send reset OTP email
    try {
      await sendPasswordResetEmail(email, otpCode);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'If this email is registered, you will receive reset instructions.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process reset request' },
      { status: 500 }
    );
  }
}