// src/lib/auth-utils.ts
import { auth } from "@/auth";
import { Permission, Role } from "@prisma/client";
import { hasPermission } from "./permissions";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requirePermission(requiredPermission: Permission) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (!hasPermission(user.role as Role, requiredPermission)) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}

export async function checkPermission(requiredPermission: Permission): Promise<boolean> {
  try {
    await requirePermission(requiredPermission);
    return true;
  } catch {
    return false;
  }
}

export async function isUserAtLeast(requiredRole: Role): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const roleHierarchy = {
    [Role.VIEWER]: 0,
    [Role.CONTRIBUTOR]: 1,
    [Role.EDITOR]: 2,
    [Role.ADMIN]: 3,
    [Role.SUPER_ADMIN]: 4,
  };
  
  const userLevel = roleHierarchy[user.role as Role] || 0;
  const requiredLevel = roleHierarchy[requiredRole];
  
  return userLevel >= requiredLevel;
}