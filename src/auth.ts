//src/auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    // Email or Username credentials login
    Credentials({
      async authorize(credentials) {
        const login = credentials?.login as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!login || !password) return null;

        // Find user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: login }, { username: login }],
          },
        });

        if (!user || !user.password) return null;

        // Verify password
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
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
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role || Role.VIEWER;
        token.isAdmin =
          (user as any).role === Role.ADMIN ||
          (user as any).role === Role.SUPER_ADMIN;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = (token.role as Role) || Role.VIEWER;
        session.user.isAdmin = token.isAdmin as boolean;
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
      // Always redirect OAuth logins to homepage after success
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/`;
    },
  },

  // ───────────────────────────────
  // Pages
  // ───────────────────────────────
  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },
});
