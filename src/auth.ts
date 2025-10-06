// src/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config'; // Import the safe config

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // Spread the safe config
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        // UPDATED LOGIC STARTS HERE
        // We now expect a generic 'login' field that can be email or username
        const login = credentials?.login as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!login || !password) {
          return null;
        }

        let user;

        // Check if the input is an email or a username
        if (login.includes('@')) {
          user = await prisma.user.findUnique({
            where: { email: login },
          });
        } else {
          user = await prisma.user.findUnique({
            where: { username: login },
          });
        }
        
        // If no user was found, or the user has no password (e.g., social login)
        if (!user || !user.password) {
          return null;
        }

        // Compare the provided password with the stored hash
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
          return user; // Return the user object on success
        }
        
        return null; // Return null on password mismatch
        // UPDATED LOGIC ENDS HERE
      },
    }),
  ],
});