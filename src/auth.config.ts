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
  // Edge/proxy safe callbacks only.
  // No Prisma, no bcrypt, no DB calls here.
  // These run in Middleware and ensure req.auth (session.user) has role, isAdmin, onboarded.
  callbacks: {
    jwt({ token, user, trigger, session: sessionData }) {
      // 1. Client called update({ onboarded: true }) from onboarding page
      if (trigger === "update" && sessionData?.onboarded !== undefined) {
        token.onboarded = Boolean(sessionData.onboarded);
      }

      // 2. Initial sign-in: copy user properties into token
      if (user) {
        const u = user as any;
        token.role = u.role || "VIEWER";
        token.isAdmin =
          u.role === "ADMIN" ||
          u.role === "SUPER_ADMIN" ||
          u.isAdmin === true;
        token.sessionVersion = u.sessionVersion ?? 0;
        token.onboarded = Boolean(u.onboarded);
        if (u.username) {
          token.username = u.username;
        }
      }

      return token;
    },

    session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.sub as string) || (token.id as string);
        (session.user as any).role = token.role || "VIEWER";
        (session.user as any).isAdmin = Boolean(token.isAdmin);
        (session.user as any).sessionVersion = token.sessionVersion;
        (session.user as any).onboarded = Boolean(token.onboarded);
        if (token.username) {
          (session.user as any).username = token.username;
        }
        if (token.image) {
          session.user.image = token.image as string;
        }
      }
      return session;
    },
  },

  providers: [],
} satisfies NextAuthConfig;
