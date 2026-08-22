//src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client";
import { authConfig } from "./auth.config";
import { isAccountLocked, recordFailedLoginAttempt, clearFailedLoginAttempts } from '@/lib/failed-login-tracker';
import { logLoginFailed, logLoginSuccess } from '@/lib/audit-logger';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    // Email or Username credentials login
    Credentials({
      async authorize(credentials) {
        const login = credentials?.login as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!login || !password) return null;

        // PREVENT BRUTE FORCE: Check if account is already locked before attempting login
        if (await isAccountLocked(login)) {
          throw new Error("Account is locked due to too many failed attempts. Try again later.");
        }

        // Find user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: login }, { username: login }],
          },
        });

        if (!user || !user.password) {
          await recordFailedLoginAttempt(login);
          await logLoginFailed(login, undefined, 'Invalid credentials');
          return null;
        }

        // Verify password
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
          await recordFailedLoginAttempt(login);
          await logLoginFailed(login, undefined, 'Invalid credentials');
          return null;
        }

        // Login successful
        await clearFailedLoginAttempts(login);
        await logLoginSuccess(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          sessionVersion: user.sessionVersion,
          isAdmin: user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN,
        };
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId:
        process.env.GOOGLE_CLIENT_ID ||
        process.env.AUTH_GOOGLE_ID ||
        "",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ||
        process.env.AUTH_GOOGLE_SECRET ||
        "",
    }),
  ],

  // ───────────────────────────────
  // Callbacks
  // ───────────────────────────────
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.role = (user as any).role || Role.VIEWER;
        token.isAdmin =
          (user as any).role === Role.ADMIN ||
          (user as any).role === Role.SUPER_ADMIN;
        token.sessionVersion = (user as any).sessionVersion || 0;
        token.onboarded = (user as any).onboarded;
      }

      // True JWT Invalidation: Verify sessionVersion with the database
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { sessionVersion: true, role: true, image: true, onboarded: true }
          });

          // If user is deleted or session version changed, invalidate token
          // EXCEPT if this is a new OAuth sign-in, where we trust the provider and sync the version
          if (!dbUser) {
            return null as any;
          }
          if (account && account.provider !== "credentials") {
            token.sessionVersion = dbUser.sessionVersion;
          } else if (dbUser.sessionVersion !== token.sessionVersion) {
            return null as any; // Invalidates the JWT token
          }
          // Sync role, image, and onboarded to token
          token.role = dbUser.role;
          token.isAdmin = dbUser.role === Role.ADMIN || dbUser.role === Role.SUPER_ADMIN;
          token.image = dbUser.image;
          token.onboarded = dbUser.onboarded;
        } catch (err) {
          console.error("[AUTH] Error checking session version", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub!;
        session.user.role = (token.role as Role) || Role.VIEWER;
        session.user.isAdmin = token.isAdmin as boolean;
        if (token.image) session.user.image = token.image as string;
        (session.user as any).sessionVersion = token.sessionVersion;
        session.user.onboarded = token.onboarded as boolean;
      }
      return session;
    },

    async signIn({ user, account }) {
      try {
        // If OAuth login, mark email as verified
        if (account?.provider === "google" && user?.email) {
          await prisma.user.upsert({
            where: { email: user.email },
            update: { emailVerified: new Date() },
            create: {
              name: user.name || "Google User",
              email: user.email,
              emailVerified: new Date(),
              role: Role.VIEWER,
            },
          });
        }
        return true;
      } catch (error) {
        console.error("Google sign-in error:", error);
        return false;
      }
    },

    async redirect({ url, baseUrl }) {
       // If the target URL contains the callback redirect parameter, force it relative
      if (url.startsWith("/")) return `${baseUrl}${url}`;
       // Safe fallback: force route directly to the main relative dashboard layout
      return `${baseUrl}/dashboard`;
    },
  },
  // ───────────────────────────────
  // Pages
  // ───────────────────────────────
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },

  session: {
    strategy: "jwt",
  },
});
