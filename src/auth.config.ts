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
    // Keep your existing authorized logic
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isProtectedRoute =
        nextUrl.pathname.startsWith("/profile") ||
        nextUrl.pathname.startsWith("/my-resources");

      if (isAdminRoute) {
        if (isLoggedIn && auth.user.isAdmin) return true;
        return false;
      }

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },

    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },

    session({ session, token }: any) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },

    // Sanitize where NextAuth will redirect after sign-in/sign-out.
    redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      try {
        // Create absolute URL
        const resolved = new URL(url, baseUrl);
        // Prevent redirecting to the sign-in page or other internal traps
        if (resolved.pathname === "/login") return baseUrl + "/";
        // Prevent open redirect to external origin
        if (resolved.origin !== baseUrl) return baseUrl + "/";
        // Otherwise allow relative or same-origin redirect
        return resolved.toString();
      } catch (e) {
        return baseUrl + "/";
      }
    },
  },

  providers: [],
} satisfies NextAuthConfig;
