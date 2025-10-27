// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

console.log("🧩 [Middleware] File loaded");
const { auth: nextAuthHandler } = NextAuth(authConfig);

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  const sessionToken = req.cookies.get("authjs.session-token")?.value;
  const callbackCookie = req.cookies.get("authjs.callback-url")?.value;

  // Handle login redirects for already authenticated users
  if (pathname === "/login" && sessionToken) {
    console.log("🧩 [Middleware] Authenticated user hit /login — redirecting to /");
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("authjs.callback-url", "", { maxAge: 0, path: "/" });
    return res;
  }

  if (callbackCookie && callbackCookie.includes("/login")) {
    console.log("🧩 [Middleware] Clearing authjs.callback-url because it points to /login");
    const res = NextResponse.next();
    res.cookies.set("authjs.callback-url", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Updated protected paths list
  const protectedPaths = ["/profile", "/my-resources", "/admin", "/submit-resource", "/my-goals"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  try {
      const session = await nextAuthHandler(req);

      if (session instanceof Response) {
          console.log("🧩 [Middleware] Auth handler returned a response (e.g., redirect).");
          return session;
      }

      const isLoggedIn = !!session?.user;
      const userRole = session?.user?.role;
      const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
      
      console.log(`🧩 [Middleware] User Status: loggedIn=${isLoggedIn}, role=${userRole}`);

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