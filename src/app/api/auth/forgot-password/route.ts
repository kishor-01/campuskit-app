// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emailService } from '@/lib/email-service';
import crypto from 'crypto';
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

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiry to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any existing reset tokens for this email
    // Prevent rapid repeated requests: if a token was created within the last minute, do not create/send again
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000), // 1 minute
        },
      },
    });

    if (recentToken) {
      // Do not send another email; respond with generic success to avoid account enumeration
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, you will receive reset instructions.',
      });
    }

    // Delete any existing reset tokens for this email (older ones)
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expiresAt,
      },
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // Send reset email
    const emailResult = await emailService.sendPasswordResetEmail(email, resetUrl);

    if (!emailResult.success) {
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