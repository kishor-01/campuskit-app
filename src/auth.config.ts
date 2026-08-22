// src/auth.config.ts

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  // Let Auth.js choose the appropriate cookie security behavior.
  useSecureCookies: process.env.NODE_ENV === "production",

  // IMPORTANT:
  // No Prisma.
  // No bcrypt.
  // No Credentials provider.
  // No database calls.
  //
  // This configuration is intentionally safe to use
  // inside Next.js Middleware / Proxy.
  providers: [],
} satisfies NextAuthConfig;
