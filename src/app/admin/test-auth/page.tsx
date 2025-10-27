// src/app/admin/test-auth/page.tsx
import { auth } from "@/auth";
import { Role } from "@prisma/client";

export default async function TestAuthPage() {
  const session = await auth();
  
  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">RBAC System Test</h1>
      
      <div className="space-y-4 p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold">Session Information</h2>
        <div className="space-y-2">
          <p><strong>Logged in:</strong> {session ? 'Yes' : 'No'}</p>
          <p><strong>User ID:</strong> {session?.user?.id || 'N/A'}</p>
          <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
          <p><strong>Role:</strong> <span className="font-mono bg-muted px-2 py-1 rounded">{session?.user?.role || 'N/A'}</span></p>
        </div>
      </div>

      <div className="space-y-4 p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold">Role-Based Access Test</h2>
        <div className="space-y-2">
          <p><strong>Is Admin:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-sm ${(session?.user?.role === Role.ADMIN || session?.user?.role === Role.SUPER_ADMIN) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {(session?.user?.role === Role.ADMIN || session?.user?.role === Role.SUPER_ADMIN) ? 'YES' : 'NO'}
            </span>
          </p>
          <p><strong>Can access /admin:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-sm ${session?.user?.role && session.user.role !== Role.VIEWER ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {session?.user?.role && session.user.role !== Role.VIEWER ? 'YES' : 'NO'}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-4 p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold">Quick Tests</h2>
        <div className="space-y-2">
          <a 
            href="/admin" 
            className="block w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg text-center hover:bg-primary/90 transition-colors"
          >
            Test Admin Dashboard Access
          </a>
          <a 
            href="/admin/test-roles" 
            className="block w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-center hover:bg-secondary/80 transition-colors"
          >
            Test Roles Page
          </a>
          <a 
            href="/debug-auth" 
            className="block w-full px-4 py-3 bg-muted text-foreground rounded-lg text-center hover:bg-muted/80 transition-colors"
          >
            View Detailed Auth Debug
          </a>
        </div>
      </div>

      {session?.user?.role === Role.ADMIN && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">✅ You have admin access! The RBAC system is working correctly.</p>
        </div>
      )}
    </div>
  );
}