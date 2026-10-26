// src/types/next-auth.d.ts

import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Role } from "@prisma/client";

// We are extending the built-in types from next-auth
// This tells TypeScript what to expect on our custom session and token objects

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      role: Role;
      onboarded?: boolean;
      username?: string | null;
      sessionVersion?: number;
    } & DefaultSession["user"];
  }

  interface User {
    isAdmin: boolean;
    role: Role;
    onboarded?: boolean;
    username?: string | null;
    sessionVersion?: number;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    isAdmin: boolean;
    role: Role;
    onboarded?: boolean;
    username?: string | null;
    sessionVersion?: number;
  }
}