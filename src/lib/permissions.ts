// src/lib/permissions.ts
import { Role, Permission } from '@prisma/client';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.VIEWER]: [
    Permission.CONTENT_READ,
    Permission.BLOG_READ,
    Permission.RESOURCE_READ,
    Permission.ROADMAP_READ,
    Permission.OPPORTUNITY_READ,
  ],
  
  [Role.CONTRIBUTOR]: [
    Permission.CONTENT_READ,
    Permission.CONTENT_WRITE,
    Permission.BLOG_READ,
    Permission.BLOG_WRITE,
    Permission.RESOURCE_READ,
    Permission.RESOURCE_WRITE,
    Permission.ROADMAP_READ,
    Permission.OPPORTUNITY_READ,
    Permission.OPPORTUNITY_WRITE,
  ],
  
  [Role.EDITOR]: [
    Permission.CONTENT_READ,
    Permission.CONTENT_WRITE,
    Permission.CONTENT_MODERATE,
    Permission.BLOG_READ,
    Permission.BLOG_WRITE,
    Permission.BLOG_PUBLISH,
    Permission.RESOURCE_READ,
    Permission.RESOURCE_WRITE,
    Permission.RESOURCE_MODERATE,
    Permission.ROADMAP_READ,
    Permission.ROADMAP_WRITE,
    Permission.OPPORTUNITY_READ,
    Permission.OPPORTUNITY_WRITE,
    Permission.OPPORTUNITY_MODERATE,
  ],
  
  [Role.ADMIN]: [
    Permission.CONTENT_READ,
    Permission.CONTENT_WRITE,
    Permission.CONTENT_MODERATE,
    Permission.CONTENT_DELETE,
    Permission.BLOG_READ,
    Permission.BLOG_WRITE,
    Permission.BLOG_PUBLISH,
    Permission.BLOG_DELETE,
    Permission.RESOURCE_READ,
    Permission.RESOURCE_WRITE,
    Permission.RESOURCE_MODERATE,
    Permission.RESOURCE_DELETE,
    Permission.ROADMAP_READ,
    Permission.ROADMAP_WRITE,
    Permission.ROADMAP_PUBLISH,
    Permission.ROADMAP_DELETE,
    Permission.OPPORTUNITY_READ,
    Permission.OPPORTUNITY_WRITE,
    Permission.OPPORTUNITY_MODERATE,
    Permission.OPPORTUNITY_DELETE,
    Permission.USER_READ,
    Permission.AFFILIATE_READ,
    Permission.AFFILIATE_MANAGE,
  ],
  
  [Role.SUPER_ADMIN]: Object.values(Permission),
};

export function hasPermission(userRole: Role, requiredPermission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(requiredPermission);
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Helper to check if user can manage specific content types
export const canUser = {
  // Content management
  createContent: (role: Role) => hasPermission(role, Permission.CONTENT_WRITE),
  moderateContent: (role: Role) => hasPermission(role, Permission.CONTENT_MODERATE),
  deleteContent: (role: Role) => hasPermission(role, Permission.CONTENT_DELETE),

  // Blog management
  writeBlog: (role: Role) => hasPermission(role, Permission.BLOG_WRITE),
  publishBlog: (role: Role) => hasPermission(role, Permission.BLOG_PUBLISH),
  deleteBlog: (role: Role) => hasPermission(role, Permission.BLOG_DELETE),

  // Resource management
  submitResource: (role: Role) => hasPermission(role, Permission.RESOURCE_WRITE),
  moderateResource: (role: Role) => hasPermission(role, Permission.RESOURCE_MODERATE),
  deleteResource: (role: Role) => hasPermission(role, Permission.RESOURCE_DELETE),

  // User management
  viewUsers: (role: Role) => hasPermission(role, Permission.USER_READ),
  manageUsers: (role: Role) => hasPermission(role, Permission.USER_MANAGE),

  // Affiliate management
  viewAffiliates: (role: Role) => hasPermission(role, Permission.AFFILIATE_READ),
  manageAffiliates: (role: Role) => hasPermission(role, Permission.AFFILIATE_MANAGE),
};

// Role hierarchy for comparison
export const ROLE_HIERARCHY = {
  [Role.VIEWER]: 0,
  [Role.CONTRIBUTOR]: 1,
  [Role.EDITOR]: 2,
  [Role.ADMIN]: 3,
  [Role.SUPER_ADMIN]: 4,
};

export function isRoleAtLeast(userRole: Role, minimumRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole];
  return userLevel >= requiredLevel;
}