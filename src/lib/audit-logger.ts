import prisma from "./prisma";

export async function logLoginFailed(identifier: string, ip?: string, reason?: string): Promise<void> {
  await prisma.security_audit_log.create({
    data: {
      id: crypto.randomUUID(),
      eventType: "LOGIN_FAILED",
      details: { identifier, reason },
      ip,
    },
  });
}

export async function logLoginSuccess(userId: string, ip?: string): Promise<void> {
  await prisma.security_audit_log.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      eventType: "LOGIN_SUCCESS",
      ip,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    },
  });
}

export async function logSecurityEvent(
  eventType: string,
  details: any,
  userId?: string | null,
  ip?: string | null,
  userAgent?: string | null
): Promise<void> {
  await prisma.security_audit_log.create({
    data: {
      id: crypto.randomUUID(),
      eventType,
      details,
      userId: userId || null,
      ip: ip || null,
      userAgent: userAgent || null,
    },
  });
}
