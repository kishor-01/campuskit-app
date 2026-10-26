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

        // Auto-heal onboarded flag if user already completed profile in the past
        let isOnboarded = Boolean(user.onboarded);
        if (!isOnboarded && user.education && user.objective) {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { onboarded: true },
            });
            isOnboarded = true;
          } catch (e) {
            console.error("[AUTH] Error auto-healing onboarded:", e);
          }
        }

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

          onboarded: isOnboarded,
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
    ...authConfig.callbacks,

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
      // 1. Run base edge-safe jwt logic first
      if (authConfig.callbacks?.jwt) {
        token = await authConfig.callbacks.jwt({
          token,
          user,
          account,
          trigger,
          session: sessionData,
        });
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
                username: true,
                education: true,
                objective: true,
              },
            });

          // User no longer exists.
          if (!dbUser) {
            return null as any;
          }

          // Auto-heal legacy accounts that already have profile data
          if (!dbUser.onboarded && dbUser.education && dbUser.objective) {
            try {
              await prisma.user.update({
                where: { id: token.sub },
                data: { onboarded: true },
              });
              dbUser.onboarded = true;
            } catch (e) {
              console.error("[AUTH] Auto-heal onboarded error:", e);
            }
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
          if (dbUser.username) {
            token.username = dbUser.username;
          }

          // Only sync onboarded from DB if it's true — never go backward.
          // Once onboarded=true is in the token (from update() or DB), keep it.
          if (dbUser.onboarded === true || token.onboarded !== true) {
            token.onboarded = Boolean(dbUser.onboarded);
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
