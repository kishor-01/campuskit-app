// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { auth as nextAuthHandler } from "@/auth"; // FIX: Import the complete consolidated auth module directly

console.log("🧩 [Middleware] File loaded");

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Track session cookies for both Local Development and Secure Production Vercel environments
  const sessionToken = req.cookies.get("authjs.session-token")?.value || 
                       req.cookies.get("__Secure-authjs.session-token")?.value;
                       
  const callbackCookie = req.cookies.get("authjs.callback-url")?.value;

  // Handle login page bypass for already authenticated users
  if (pathname === "/login" && sessionToken) {
    console.log("🧩 [Middleware] Authenticated user hit /login — redirecting to /dashboard");
    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    res.cookies.set("authjs.callback-url", "", { maxAge: 0, path: "/" });
    return res;
  }

  if (callbackCookie && callbackCookie.includes("/login")) {
    console.log("🧩 [Middleware] Clearing authjs.callback-url because it points to /login");
    const res = NextResponse.next();
    res.cookies.set("authjs.callback-url", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Public profile routes — bypass auth entirely for social scrapers and public viewers
  if (pathname.startsWith('/u/')) {
    return NextResponse.next();
  }

  // Secure-by-default: Only allow explicitly public paths
  const publicPaths = [
    "/", "/about", "/contact", "/blog", "/resources", "/roadmaps",
    "/opportunities", "/login", "/signup", "/forgot-password",
    "/reset-password", "/verify-email", "/tools"
  ];
  const isPublic = pathname === "/" || publicPaths.some((p) => p !== "/" && pathname.startsWith(p));
  const isProtected = !isPublic;

  try {
      // Execute the unified engine handler containing the Google OAuth schema configuration
      const session = await nextAuthHandler(req as any) as any;

      if (session instanceof Response) {
          console.log("🧩 [Middleware] Auth handler returned an absolute routing response.");
          
          const redirectUrlHeader = session.headers.get("Location");
          if (redirectUrlHeader) {
              try {
                  const parsedUrl = new URL(redirectUrlHeader);
                  const cleanRedirect = new URL(parsedUrl.pathname + parsedUrl.search, req.url);
                  return NextResponse.redirect(cleanRedirect);
              } catch (e) {
                  return session;
              }
          }
          return session;
      }

      const isLoggedIn = !!session?.user;
      const userRole = session?.user?.role;
      const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
      
      console.log(`🧩 [Middleware] User Status: loggedIn=${isLoggedIn}, role=${userRole}`);

      // ──────────────────────────────────────────────
      // Onboarding Interception
      // ──────────────────────────────────────────────
      if (isLoggedIn) {
        const onboarded = session.user?.onboarded;
        const isOnboardingRoute = pathname === '/onboarding';

        if (onboarded !== true && !isOnboardingRoute && isProtected) {
          console.log('🧩 [Middleware] User not onboarded — redirecting to /onboarding');
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }

        if (onboarded === true && isOnboardingRoute) {
          console.log('🧩 [Middleware] User already onboarded — redirecting to /dashboard');
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }

      if (isProtected) {
          if (!isLoggedIn) {
              console.log("🧩 [Middleware] Unauthenticated request to protected route — redirecting to login");
              const loginUrl = new URL("/login", req.url);
              loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
              return NextResponse.redirect(loginUrl);
          }
          
          // Admin route protection
          if (pathname.startsWith("/admin") && !isAdmin) {
              console.log("🧩 [Middleware] Non-admin attempting to access admin route — redirecting");
              return NextResponse.redirect(new URL("/", req.url));
          }
      }

      console.log("✅ [Middleware] Request allowed to proceed.");
      return NextResponse.next();

  } catch (err) {
       if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
           console.warn("🧩 [Middleware] Caught internal NEXT_REDIRECT error.");
           return NextResponse.next();
       }
      console.error("❌ [Middleware] Auth processing error:", err);
      return new NextResponse("Authentication processing error", { status: 500 });
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
