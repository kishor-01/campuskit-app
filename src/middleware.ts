// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

console.log("🧩 [Middleware] File loaded");
console.log("🧩 [Middleware] ENV secrets available:", {
  NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  AUTH_SECRET: !!process.env.AUTH_SECRET,
});

// Create the NextAuth handler once
const nextAuthHandler = NextAuth(authConfig).auth;

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  console.log("🧩 [Middleware] Incoming request:", req.url);

  // Quick cookie helpers
  const sessionToken = req.cookies.get("authjs.session-token")?.value;
  const callbackCookie = req.cookies.get("authjs.callback-url")?.value;

  // If an authenticated user lands on /login, clear the callback cookie and redirect to home/dashboard
  if (pathname === "/login" && sessionToken) {
    console.log("🧩 [Middleware] Authenticated user hit /login — redirecting to / and clearing callback cookie");
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("authjs.callback-url", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Prevent the callback-url cookie from being the login page itself.
  // If the cookie points to /login, clear it so NextAuth won't redirect back to /login after sign-in.
  if (callbackCookie && callbackCookie.includes("/login")) {
    console.log("🧩 [Middleware] Clearing authjs.callback-url because it points to /login");
    const res = NextResponse.next();
    res.cookies.set("authjs.callback-url", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Protect specific routes (simple whitelist). Adjust protectedPaths as needed.
  const protectedPaths = ["/profile", "/my-resources", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !sessionToken) {
    // Not logged in — redirect to /login with callbackUrl but DO NOT set cookie to /login.
    const loginUrl = new URL("/login", req.url);
    // include full path + search so user returns to exact page after login
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    console.log("🧩 [Middleware] Unauthenticated request to protected route — redirecting to", loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  // Let NextAuth run for other routes (session endpoints, etc.)
  try {
    const nextAuthResp = await nextAuthHandler(req as unknown as Request);
    console.log("✅ [Middleware] Auth handler executed successfully.");
    return nextAuthResp;
  } catch (err) {
    console.error("❌ [Middleware] Auth handler error:", err);
    throw err;
  }
}

export const config = {
  // ignore Next internals and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
