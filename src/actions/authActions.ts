// src/actions/authActions.ts
'use server';

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendOtpEmail } from "@/lib/email";
import { otpService } from "@/lib/otp-service";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimiter";

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
    const rl = await rateLimit(`login:${ip}`, 5, 15 * 60);
    if (rl.limited) {
      return "Too many login attempts. Please try again later.";
    }

    const callbackUrl = (formData.get("callbackUrl") as string) || "/";
    await signIn("credentials", formData, { callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials. Please try again.";
        default:
          return "Something went wrong. Please try again.";
      }
    }
    throw error;
  }
}

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
    const rl = await rateLimit(`signup:${ip}`, 5, 60 * 60);
    if (rl.limited) {
      return { success: false, message: "Too many signup attempts. Please try again later." };
    }

    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const education = formData.get("education") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !name || !username || !education) {
      return { success: false, message: "All fields are required." };
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return { success: false, message: "User with that email or username already exists." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with email not verified
    const user = await prisma.user.create({
      data: {
        name,
        username,
        education,
        email,
        password: hashedPassword,
        role: 'VIEWER',
        emailVerified: null, // Use emailVerified instead of isEmailVerified
      },
    });

    // Generate and send OTP
    const otp = otpService.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Store OTP in database
    await prisma.otp.create({
      data: {
        email,
        code: hashedOtp,
        type: 'SIGNUP',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    return {
      success: true,
      message: "Account created! Please check your email for verification code.",
      email: user.email,
      redirectToOtp: true
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: "Something went wrong during signup." };
  }
}

// Additional action to verify OTP
export async function verifyOtp(prevState: any, formData: FormData) {
  try {
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
    const rl = await rateLimit(`verify-otp:${ip}`, 10, 15 * 60);
    if (rl.limited) {
      return { success: false, message: "Too many attempts. Please try again later." };
    }

    const email = formData.get("email") as string;
    const code = formData.get("code") as string;

    if (!email || !code) {
      return { success: false, message: "Email and OTP code are required." };
    }

    // Find the most recent OTP for this email
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        type: 'SIGNUP',
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return { success: false, message: "Invalid or expired OTP." };
    }

    // Verify OTP code
    const isValid = await bcrypt.compare(code, otpRecord.code);

    if (!isValid) {
      return { success: false, message: "Invalid OTP code." };
    }

    // Mark email as verified by setting emailVerified timestamp
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    });

    // Delete the used OTP
    await prisma.otp.delete({
      where: { id: otpRecord.id },
    });

    return {
      success: true,
      message: "Email verified successfully! You can now log in.",
      redirectUrl: "/"
    };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, message: "Failed to verify OTP." };
  }
}

// Helper function to check if email is verified
export async function isEmailVerified(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true }
    });

    return !!user?.emailVerified; // email is verified if emailVerified is not null
  } catch (error) {
    console.error('Error checking email verification:', error);
    return false;
  }
}

export async function resendOtp(prevState: any, formData: FormData) {
  try {
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
    const rl = await rateLimit(`resend-otp:${ip}`, 3, 15 * 60);
    if (rl.limited) {
      return { success: false, message: "Too many attempts. Please try again later." };
    }

    const email = formData.get("email") as string;
    if (!email) {
      return { success: false, message: "Email is required." };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, message: "User not found." };
    }

    const otp = otpService.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.otp.create({
      data: {
        email,
        code: hashedOtp,
        type: 'SIGNUP',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    await sendOtpEmail(email, otp);

    return { success: true, message: "OTP sent successfully." };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return { success: false, message: "Failed to resend OTP." };
  }
}

export async function sendInitialOtp(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    if (!email) {
      return { success: false, message: "Email is required." };
    }
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
    const rl = await rateLimit(`init-otp:${ip}`, 3, 15 * 60);
    if (rl.limited) {
      return { success: false, message: "Too many attempts. Please try again later." };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, message: "User not found." };
    }

    // Check if an unexpired OTP already exists
    const existingOtp = await prisma.otp.findFirst({
      where: { email, type: 'SIGNUP', expiresAt: { gt: new Date() } }
    });
    
    if (existingOtp) {
        return { success: true, message: "OTP already sent." };
    }

    const otp = otpService.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.otp.create({
      data: {
        email,
        code: hashedOtp,
        type: 'SIGNUP',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    await sendOtpEmail(email, otp);

    return { success: true, message: "OTP sent successfully." };
  } catch (error) {
    console.error('Init OTP error:', error);
    return { success: false, message: "Failed to send OTP." };
  }
}