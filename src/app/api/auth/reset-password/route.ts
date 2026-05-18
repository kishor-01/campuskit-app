// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json();

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: 'Email, OTP code, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find the reset OTP for this email
    const resetOtp = await prisma.otp.findFirst({
      where: {
        email,
        type: 'PASSWORD_RESET',
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!resetOtp) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      );
    }

    // Verify OTP code
    const isValidOtp = await bcrypt.compare(code, resetOtp.code);

    if (!isValidOtp) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      );
    }

    // Verify the user still exists and can reset password
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      await prisma.otp.delete({
        where: { id: resetOtp.id },
      });
      return NextResponse.json(
        { error: 'User account no longer exists' },
        { status: 400 }
      );
    }

    // Check if user has a password (not OAuth-only)
    if (!user.password) {
      await prisma.otp.delete({
        where: { id: resetOtp.id },
      });
      return NextResponse.json(
        { error: 'This account uses social login. Please sign in with your social provider.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and increment sessionVersion to invalidate all existing JWTs
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        sessionVersion: { increment: 1 },
      },
    });

    // Delete the used reset OTP
    await prisma.otp.delete({
      where: { id: resetOtp.id },
    });

    // Invalidate all existing sessions for security
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}