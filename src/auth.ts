// src/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const login = credentials?.login as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!login || !password) return null;

        const user = login.includes('@')
          ? await prisma.user.findUnique({ where: { email: login } })
          : await prisma.user.findUnique({ where: { username: login } });
        
        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) return user;
        
        return null;
      },
    }),
  ],
});