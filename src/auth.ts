// src/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config'; // Import the safe config

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // Spread the safe config
  adapter: PrismaAdapter(prisma), // Add the Node.js-dependent adapter
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (passwordsMatch) return user;
        return null;
      },
    }),
    // Other providers like Google/GitHub would go here
  ],
});