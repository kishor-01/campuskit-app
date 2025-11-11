// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __prismaConnectPromise: Promise<void> | undefined;
}

const createPrisma = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const prisma: PrismaClient = global.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

/**
 * Try to connect to the DB with a few retries (useful for transient Railway proxy issues).
 * This returns a promise you can await in server startup code or API routes if you want to fail fast.
 */
async function ensureConnected(retries = 3, delayMs = 1000) {
  // reuse existing in-flight attempt if present
  if (global.__prismaConnectPromise) return global.__prismaConnectPromise;

  global.__prismaConnectPromise = (async () => {
    let lastError: any = null;
    for (let i = 0; i < retries; i++) {
      try {
        // $connect is idempotent; if already connected it resolves quickly.
        await prisma.$connect();
        return;
      } catch (err) {
        lastError = err;
        // wait a bit before retrying
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    // final attempt without swallowing — leave the error for the caller to handle/log
    throw lastError;
  })();

  return global.__prismaConnectPromise;
}

export default prisma;
export { ensureConnected };
