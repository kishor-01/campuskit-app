// src/middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Initialize NextAuth.js with ONLY the safe config
// The .auth property is the middleware function
export default NextAuth(authConfig).auth;

export const config = {
  // The matcher configures where the middleware runs
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};