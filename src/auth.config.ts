// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },

  // Make cookie settings explicit and safe for local dev vs production.
  useSecureCookies: process.env.NODE_ENV === "production",

  cookies: {
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "authjs.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "authjs.callback-url",
      options: {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    // Simple authorized logic for now
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      if (isAdminRoute) {
        if (!isLoggedIn) return false;

        // Simple role check - allow ADMIN and SUPER_ADMIN
        const userRole = auth.user.role;
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

        if (isAdmin) return true;
        return false;
      }

      // Existing protected routes
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
      }
      return token;
    },

    session({ session, token }: any) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },

    redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      try {
        const resolved = new URL(url, baseUrl);
        if (resolved.pathname === "/login") return baseUrl + "/";
        if (resolved.origin !== baseUrl) return baseUrl + "/";
        return resolved.toString();
      } catch (e) {
        return baseUrl + "/";
      }
    },
  },

  providers: [],
} satisfies NextAuthConfig;