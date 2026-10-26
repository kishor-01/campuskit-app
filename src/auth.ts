// src/auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client";

import { authConfig } from "./auth.config";

import {
  isAccountLocked,
  recordFailedLoginAttempt,
  clearFailedLoginAttempts,
} from "@/lib/failed-login-tracker";

import {
  logLoginFailed,
  logLoginSuccess,
} from "@/lib/audit-logger";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,

  trustHost: true,

  // Prisma belongs ONLY in the full server-side auth config.
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    // ============================================================
    // Credentials Login
    // ============================================================
    Credentials({
      async authorize(credentials) {
        const login = credentials?.login as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!login || !password) {
          return null;
        }

        // ----------------------------------------------------------
        // Account lock protection
        // ----------------------------------------------------------
        if (await isAccountLocked(login)) {
          throw new Error(
            "Account is locked due to too many failed attempts. Try again later."
          );
        }

        // ----------------------------------------------------------
        // Find user by email OR username
        // ----------------------------------------------------------
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: login },
              { username: login },
            ],
          },
        });

        // ----------------------------------------------------------
        // Invalid user / password-less account
        // ----------------------------------------------------------
        if (!user || !user.password) {
          await recordFailedLoginAttempt(login);

          await logLoginFailed(
            login,
            undefined,
            "Invalid credentials"
          );

          return null;
        }

        // ----------------------------------------------------------
        // Verify password
        // ----------------------------------------------------------
        const passwordsMatch = await bcrypt.compare(
          password,
          user.password
        );

        if (!passwordsMatch) {
          await recordFailedLoginAttempt(login);

          await logLoginFailed(
            login,
            undefined,
            "Invalid credentials"
          );

          return null;
        }

        // ----------------------------------------------------------
        // Successful login
        // ----------------------------------------------------------
        await clearFailedLoginAttempts(login);

        await logLoginSuccess(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          sessionVersion: user.sessionVersion,

          isAdmin:
            user.role === Role.ADMIN ||
            user.role === Role.SUPER_ADMIN,

          onboarded: user.onboarded,
        };
      },
    }),

    // ============================================================
    // Google OAuth
    // ============================================================
    GoogleProvider({
      clientId:
        process.env.GOOGLE_CLIENT_ID ||
        process.env.AUTH_GOOGLE_ID ||
        "",

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ||
        process.env.AUTH_GOOGLE_SECRET ||
        "",

      // Google verifies ownership of the email address.
      //
      // This allows a Google account to authenticate against an
      // existing credentials account with the same verified email.
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  // ==============================================================
  // Callbacks
  // ==============================================================
  callbacks: {
    // ------------------------------------------------------------
    // JWT
    // ------------------------------------------------------------
    async jwt({
      token,
      user,
      account,
      trigger,
      session: sessionData,
    }) {
      // ── Client called update({ onboarded: true }) from onboarding page ──
      // Merge the flag immediately so the next request (middleware) sees it.
      if (trigger === 'update' && sessionData?.onboarded === true) {
        token.onboarded = true;
      }

      // When the user first signs in, copy the user information
      // into the JWT.
      if (user) {
        token.role =
          (user as any).role || Role.VIEWER;

        token.isAdmin =
          (user as any).role === Role.ADMIN ||
          (user as any).role === Role.SUPER_ADMIN;

        token.sessionVersion =
          (user as any).sessionVersion || 0;

        token.onboarded =
          (user as any).onboarded;
      }

      // ----------------------------------------------------------
      // Database-backed JWT validation
      // ----------------------------------------------------------
      //
      // Skip on 'update' triggers: the DB write (completeOnboardingAction)
      // and the JWT update race each other. Trust what the client sent.
      //
      if (token.sub && trigger !== 'update') {
        try {
          const dbUser =
            await prisma.user.findUnique({
              where: {
                id: token.sub,
              },

              select: {
                sessionVersion: true,
                role: true,
                image: true,
                onboarded: true,
              },
            });

          // User no longer exists.
          if (!dbUser) {
            return null as any;
          }

          // OAuth login:
          // Synchronize the current database session version.
          if (
            account &&
            account.provider !== "credentials"
          ) {
            token.sessionVersion =
              dbUser.sessionVersion;
          }

          // Credentials login:
          // Invalidate the JWT when the session version changes.
          else if (
            dbUser.sessionVersion !==
            token.sessionVersion
          ) {
            return null as any;
          }

          // --------------------------------------------------------
          // Keep token data synchronized with the database
          // --------------------------------------------------------
          token.role = dbUser.role;

          token.isAdmin =
            dbUser.role === Role.ADMIN ||
            dbUser.role === Role.SUPER_ADMIN;

          token.image = dbUser.image;

          // Only sync onboarded from DB if it's true — never go backward.
          // Once onboarded=true is in the token (from update() or DB), keep it.
          if (dbUser.onboarded === true || token.onboarded !== true) {
            token.onboarded = dbUser.onboarded;
          }
        } catch (error) {
          console.error(
            "[AUTH] Error checking session version:",
            error
          );
        }
      }

      return token;
    },

    // ------------------------------------------------------------
    // Session
    // ------------------------------------------------------------
    async session({
      session,
      token,
    }) {
      if (session.user && token) {
        session.user.id = token.sub!;

        session.user.role =
          (token.role as Role) ||
          Role.VIEWER;

        session.user.isAdmin =
          Boolean(token.isAdmin);

        if (token.image) {
          session.user.image =
            token.image as string;
        }

        (session.user as any).sessionVersion =
          token.sessionVersion;

        session.user.onboarded =
          token.onboarded as boolean;
      }

      return session;
    },

    // ------------------------------------------------------------
    // Sign In
    // ------------------------------------------------------------
    async signIn({
      user,
      account,
    }) {
      try {
        // ----------------------------------------------------------
        // Google
        // ----------------------------------------------------------
        //
        // PrismaAdapter is responsible for creating/linking the
        // User and Account records.
        //
        // We only synchronize email verification here.
        //
        if (
          account?.provider === "google" &&
          user?.email
        ) {
          await prisma.user.updateMany({
            where: {
              email: user.email,
            },

            data: {
              emailVerified: new Date(),
            },
          });
        }

        return true;
      } catch (error) {
        console.error(
          "[AUTH] Sign-in callback error:",
          error
        );

        return false;
      }
    },

    // ------------------------------------------------------------
    // Redirect
    // ------------------------------------------------------------
    async redirect({
      url,
      baseUrl,
    }) {
      // Relative URL.
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Absolute URL on our own domain.
      try {
        const targetUrl = new URL(url);

        if (targetUrl.origin === baseUrl) {
          return url;
        }
      } catch {
        // Invalid URL -> fall through to safe default.
      }

      // Safe fallback.
      return `${baseUrl}/dashboard`;
    },
  },

  // ==============================================================
  // Custom Auth Pages
  // ==============================================================
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },

  // ==============================================================
  // Session
  // ==============================================================
  session: {
    strategy: "jwt",
  },
});
