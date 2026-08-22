// src/middleware.ts
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// A SEPARATE, edge-safe instance built only from the lightweight config —
// no Prisma adapter, no bcrypt, no Credentials provider. This is the only
// thing allowed to run in Middleware. Never import `@/auth` here.
const { auth } = NextAuth(authConfig);

const publicPaths = [
  "/", "/about", "/contact", "/blog", "/resources", "/roadmaps",
  "/opportunities", "/login", "/signup", "/forgot-password",
  "/reset-password", "/verify-email", "/tools",
];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const session = req.auth;

  // Public profile routes — bypass auth entirely for social scrapers and public viewers
  if (pathname.startsWith("/u/")) {
    return NextResponse.next();
  }

  const isPublic = pathname === "/" || publicPaths.some((p) => p !== "/" && pathname.startsWith(p));
  const isProtected = !isPublic;

  const isLoggedIn = !!session?.user;
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isLoggedIn) {
    const onboarded = (session?.user as any)?.onboarded;
    const isOnboardingRoute = pathname === "/onboarding";

    if (onboarded !== true && !isOnboardingRoute && isProtected) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    if (onboarded === true && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isProtected) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
