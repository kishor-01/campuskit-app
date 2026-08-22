// src/middleware.ts

import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// IMPORTANT:
// This file must ONLY use the edge/proxy-safe auth configuration.
// Never import "@/auth" here because "@/auth" contains Prisma,
// bcrypt and database-backed callbacks.

const { auth } = NextAuth(authConfig);

console.log("🧩 [Middleware] File loaded");

const publicPaths = [
  "/",
  "/about",
  "/contact",
  "/blog",
  "/resources",
  "/roadmaps",
  "/opportunities",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/tools",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") {
    return true;
  }

  return publicPaths.some(
    (path) => path !== "/" && pathname.startsWith(path)
  );
}

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const session = req.auth;

  // ------------------------------------------------------------
  // Public profile routes
  // ------------------------------------------------------------
  // These should remain accessible without authentication.
  // Useful for public profiles, social previews and crawlers.
  if (pathname.startsWith("/u/")) {
    return NextResponse.next();
  }

  const isPublic = isPublicPath(pathname);
  const isProtected = !isPublic;

  const isLoggedIn = !!session?.user;

  const userRole = (session?.user as any)?.role;

  const isAdmin =
    userRole === "ADMIN" ||
    userRole === "SUPER_ADMIN";

  // ------------------------------------------------------------
  // Already logged-in user visiting /login
  // ------------------------------------------------------------
  if (pathname === "/login" && isLoggedIn) {
    console.log(
      "🧩 [Middleware] Authenticated user hit /login — redirecting to /dashboard"
    );

    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  // ------------------------------------------------------------
  // Onboarding
  // ------------------------------------------------------------
  if (isLoggedIn) {
    const onboarded = (session?.user as any)?.onboarded;
    const isOnboardingRoute = pathname === "/onboarding";

    // User is logged in but has not completed onboarding.
    // Only redirect protected pages. This prevents public pages
    // from being unnecessarily blocked.
    if (
      onboarded !== true &&
      !isOnboardingRoute &&
      isProtected
    ) {
      console.log(
        "🧩 [Middleware] User not onboarded — redirecting to /onboarding"
      );

      return NextResponse.redirect(
        new URL("/onboarding", req.url)
      );
    }

    // User already completed onboarding.
    if (
      onboarded === true &&
      isOnboardingRoute
    ) {
      console.log(
        "🧩 [Middleware] User already onboarded — redirecting to /dashboard"
      );

      return NextResponse.redirect(
        new URL("/dashboard", req.url)
      );
    }
  }

  // ------------------------------------------------------------
  // Protected routes
  // ------------------------------------------------------------
  if (isProtected) {
    // Not logged in -> send to login.
    if (!isLoggedIn) {
      console.log(
        "🧩 [Middleware] Unauthenticated request to protected route — redirecting to login"
      );

      const loginUrl = new URL("/login", req.url);

      loginUrl.searchParams.set(
        "callbackUrl",
        pathname + search
      );

      return NextResponse.redirect(loginUrl);
    }

    // ----------------------------------------------------------
    // Admin protection
    // ----------------------------------------------------------
    if (
      pathname.startsWith("/admin") &&
      !isAdmin
    ) {
      console.log(
        "🧩 [Middleware] Non-admin attempting to access admin route — redirecting"
      );

      return NextResponse.redirect(
        new URL("/", req.url)
      );
    }
  }

  console.log("✅ [Middleware] Request allowed to proceed.");

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
