import prisma from "./prisma";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export async function isAccountLocked(identifier: string): Promise<boolean> {
  // Check if account is locked by the 'lockedUntil' field on the User model
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
    select: { lockedUntil: true },
  });

  if (user && user.lockedUntil && user.lockedUntil > new Date()) {
    return true;
  }

  // Fallback: check failed_login_attempts table if user isn't locked via the field
  const lockoutTime = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000);
  const recentAttempts = await prisma.failed_login_attempts.count({
    where: {
      identifier,
      attemptedAt: {
        gte: lockoutTime,
      },
    },
  });

  if (recentAttempts >= MAX_FAILED_ATTEMPTS) {
    if (user) {
      // Set the lockedUntil field
      await prisma.user.updateMany({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
        data: {
          lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000),
        },
      });
    }
    return true;
  }

  return false;
}

export async function recordFailedLoginAttempt(identifier: string): Promise<void> {
  await prisma.failed_login_attempts.create({
    data: {
      id: crypto.randomUUID(),
      identifier,
    },
  });
  
  // Re-evaluate lock status
  await isAccountLocked(identifier);
}

export async function clearFailedLoginAttempts(identifier: string): Promise<void> {
  await prisma.failed_login_attempts.deleteMany({
    where: { identifier },
  });

  await prisma.user.updateMany({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
    data: {
      lockedUntil: null,
    },
  });
}
