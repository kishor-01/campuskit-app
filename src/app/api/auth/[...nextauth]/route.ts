// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma, { ensureConnected } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

/**
 * Utility - generate random strings
 */
function generateRandomString(length = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

/**
 * Build options for NextAuth in a defensive way:
 * - attempt to connect to DB first
 * - create adapter only if DB connection established
 * - log and fail gracefully if DB is unreachable
 */
async function buildAuthOptions() {
  let adapter: ReturnType<typeof PrismaAdapter> | undefined;
  try {
    // ensure DB reachable before creating adapter
    await ensureConnected(2, 1000);
    adapter = PrismaAdapter(prisma);
  } catch (err) {
    console.error("[NextAuth] Prisma connection/adapter creation failed:", err);
    // adapter remains undefined — NextAuth will still run but DB-backed features (persisted sessions) won't work.
    // We intentionally do NOT throw here to avoid the cryptic "apply on object" runtime; we want clear logs.
  }

  const options = {
    adapter,
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        profile(profile: any) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
          };
        },
      }),
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
          }
          // ensure DB connected before reading
          await ensureConnected(1, 200).catch((e) => {
            console.error("authorize(): DB not reachable", e);
            throw new Error("Authentication service unavailable");
          });

          const user = await prisma.user.findFirst({
            where: {
              OR: [{ email: credentials.email }, { username: credentials.email }],
            },
          });

          if (!user || !user.password) throw new Error("Invalid credentials");

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) throw new Error("Invalid credentials");

          return user;
        },
      }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
      async signIn({ user, account }) {
        // if DB adapter is not available, fail with a clear message
        if (!adapter) {
          console.error("[NextAuth][signIn] adapter not available (DB unreachable)");
          // returning false will redirect to /api/auth/error; we set a more helpful message below in pages.error
          return false;
        }

        try {
          if (account?.provider === "google" && user.email) {
            // if user email exists, ensure user row exists with username/password placeholder
            let existing = await prisma.user.findUnique({ where: { email: user.email } });

            if (!existing) {
              const username = `${(user.name?.split(" ")[0] ?? "user").toLowerCase()}_${generateRandomString(
                6
              )}`;
              const dummyPass = await hash(generateRandomString(16), 10);

              await prisma.user.create({
                data: {
                  name: user.name,
                  email: user.email,
                  username,
                  password: dummyPass,
                  image: user.image,
                  emailVerified: new Date(),
                },
              });
            }
          }
          return true;
        } catch (err) {
          console.error("[NextAuth][signIn] error:", err);
          return false;
        }
      },

      async jwt({ token, user }) {
        if (user) {
          // attach lightweight fields
          (token as any).id = (user as any).id;
          (token as any).username = (user as any).username;
        }
        return token;
      },

      async session({ session, token }) {
        if (token) {
          session.user = session.user || ({} as any);
          (session.user as any).id = (token as any).id;
          (session.user as any).username = (token as any).username;
        }
        return session;
      },

      async redirect({ url, baseUrl }) {
        // always redirect to baseUrl by default; allow relative URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        try {
          const dest = new URL(url);
          if (dest.origin === baseUrl) return url;
        } catch {
          // ignore parse errors
        }
        return baseUrl;
      },
    },

    pages: {
      signIn: "/login",
      error: "/login", // NextAuth will append ?error=...
    },

    secret: process.env.NEXTAUTH_SECRET,
  };

  return options;
}

/**
 * NextAuth requires exported route handlers in app dir.
 * We build options asynchronously then call NextAuth once.
 */
const handlerPromise = buildAuthOptions().then((opts) => NextAuth(opts)).catch((err) => {
  // If building options fails catastrophically, log and export a basic handler that'll return a helpful error.
  console.error("[NextAuth][init] failed to build options:", err);
  const fallbackHandler = (req: any, res: any) => {
    res.statusCode = 500;
    res.end("Authentication service unavailable (server init failure).");
  };
  return fallbackHandler as any;
});

export async function GET(...args: any[]) {
  const handler = await handlerPromise;
  return handler.GET?.(...args) ?? handler(...args);
}
export async function POST(...args: any[]) {
  const handler = await handlerPromise;
  return handler.POST?.(...args) ?? handler(...args);
}
