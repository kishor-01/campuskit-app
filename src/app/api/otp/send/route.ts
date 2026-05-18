// src/app/api/otp/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'SIGNUP' } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 🕒 Rate-limit (1 OTP per minute)
    const recentOtp = await prisma.otp.findFirst({
      where: {
        email: normalizedEmail,
        type,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: 'Please wait a minute before requesting another OTP.' },
        { status: 429 }
      );
    }

    // 🧹 Cleanup expired
    await prisma.otp.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    // 🔢 Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // 💾 Store
    await prisma.otp.create({
      data: {
        email: normalizedEmail,
        code: hashedOtp,
        type,
        expiresAt,
      },
    });

    // 📧 Send via configured provider
    try {
      await sendOTPEmail(normalizedEmail, otpCode);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Error in /api/otp/send:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
