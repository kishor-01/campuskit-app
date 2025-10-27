// src/app/admin/test-roles/page.tsx
import { getCurrentUser } from '@/lib/auth-utils';
import { Role } from '@prisma/client';

export default async function TestRolesPage() {
  const user = await getCurrentUser();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">RBAC Test Page</h1>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>Role:</strong> {user?.role || 'No role'}</p>
        <p><strong>Is Admin:</strong> {user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}