// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },

  // Let Auth.js handle cookie naming automatically based on environment (safest for production)
  useSecureCookies: process.env.NODE_ENV === "production",

  callbacks: {
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      if (isAdminRoute) {
        if (!isLoggedIn) return false;

        const userRole = auth.user.role;
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

        if (isAdmin) return true;
        return false;
      }

      const isProtectedRoute =
        nextUrl.pathname.startsWith("/profile") ||
        nextUrl.pathname.startsWith("/my-resources");

      if (isProtectedRoute) {
        return isLoggedIn;
      }

      return true;
    },

    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.onboarded = (user as any).onboarded;
      }
      return token;
    },

    session({ session, token }: any) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.onboarded = token.onboarded as boolean;
      }
      return session;
    },

    // ⚠️ REMOVED the redirect callback – it is now in src/auth.ts
  },

  providers: [],
} satisfies NextAuthConfig;
