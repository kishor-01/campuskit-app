// /src/actions/authActions.ts
'use server';

import { AuthError } from "next-auth";
import { signIn, auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

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

    // Fix: Use proper bcrypt hashing with salt rounds
    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds

    // Create user with VIEWER role by default
    const user = await prisma.user.create({
      data: { 
        name, 
        username, 
        education, 
        email, 
        password: hashedPassword,
        role: 'VIEWER'
      },
    });

    return { 
      success: true, 
      message: "Account created successfully!",
      email: user.email
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: "Something went wrong during signup." };
  }
}