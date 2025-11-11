// src/actions/authActions.ts
'use server';

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { emailService } from "@/lib/email-service";
import { otpService } from "@/lib/otp-service";

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
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
    await emailService.sendOtpEmail(email, otp);

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
      message: "Email verified successfully! You can now log in." 
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