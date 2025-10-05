// src/auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {

      console.log("IN MIDDLEWARE, a auth object is: ", auth);
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');

      if (isAdminRoute) {
        // Redirect non-admins trying to access admin routes
        if (isLoggedIn && auth.user.isAdmin) return true;
        return false;
      }
      // You can add other protected routes here if needed
      // else if (isLoggedIn) return true;
      
      return true;
    },
    jwt({ token, user }) {
      if (user) { // User is available on login
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  providers: [], // Providers are defined in the main auth.ts file
} satisfies NextAuthConfig;