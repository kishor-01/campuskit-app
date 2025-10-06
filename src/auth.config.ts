// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      console.log("IN MIDDLEWARE, auth object is:", auth);

      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      // ✅ NEW: Define additional protected routes for logged-in users
      const isProtectedRoute =
        nextUrl.pathname.startsWith("/perks") ||
        nextUrl.pathname.startsWith("/my-resources") ||
        nextUrl.pathname.startsWith("/profile");

      // ✅ Admin route protection
      if (isAdminRoute) {
        if (isLoggedIn && auth.user.isAdmin) return true; // Allow if admin
        return false; // Deny non-admins
      }

      // ✅ Logged-in-only routes (non-admin protected areas)
      if (isProtectedRoute) {
        if (isLoggedIn) return true; // Allow if logged in
        return false; // Redirect to login if not authenticated
      }

      // ✅ Public routes (always accessible)
      return true;
    },

    jwt({ token, user }) {
      // ✅ Store user info in token on login
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },

    session({ session, token }) {
      // ✅ Attach token data to session for client use
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  providers: [], // ✅ Providers are defined in the main auth.ts file
} satisfies NextAuthConfig;
