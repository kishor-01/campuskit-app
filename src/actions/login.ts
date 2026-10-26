// src/actions/login.ts
// NOTE: The canonical registerUser (with OTP + rate limiting) lives in authActions.ts.
// This file only re-exports authenticate to avoid breaking any existing imports.
"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

/**
 * Handles user login via credentials.
 */
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
