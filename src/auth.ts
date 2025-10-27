// src/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config';
import { Role } from '@prisma/client';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const login = credentials?.login as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!login || !password) return null;

        // Find user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: login },
              { username: login }
            ]
          }
        });
        
        if (!user || !user.password) return null;

        // Verify password with bcrypt
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
          // Return user object with role
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
            isAdmin: user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN
          };
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role to token when user signs in
      if (user) {
        token.role = user.role;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as Role;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
});