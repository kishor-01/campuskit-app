// src/actions/login.ts
"use server";

import { signIn } from "@/auth"; // server-side signIn from NextAuth
import { AuthError } from "next-auth";

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    console.log("[Server Action] Authenticating user...");

    // prefer explicit callbackUrl from the form
    const providedCb = (formData.get("callbackUrl") as string) || "/";
    // call signIn and pass callbackUrl explicitly — avoids stray cookie wins
    await signIn("credentials", formData, { callbackUrl: providedCb });

    console.log("[Server Action] Sign-in triggered (NextAuth will handle redirect).");
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          console.log("[Server Action] Invalid credentials error caught.");
          return "Invalid credentials. Please try again.";
        default:
          console.log("[Server Action] Unknown auth error caught.");
          return "Something went wrong. Please try again.";
      }
    }
    // Re-throw non-AuthError so NEXT_REDIRECT works correctly
    throw error;
  }
}
