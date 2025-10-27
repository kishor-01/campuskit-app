// src/app/test-simple/page.tsx
import { auth } from "@/auth";

export default async function SimpleTestPage() {
  const session = await auth();
  
  const canAccessAdmin = session?.user?.role && session.user.role !== 'VIEWER';
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple RBAC Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <p><strong>Logged in:</strong> {session ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Your role:</strong> {session?.user?.role || 'None'}</p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <p><strong>Can access /admin:</strong> {canAccessAdmin ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</p>
        </div>
        
        <div className="space-y-2">
          <a 
            href="/admin" 
            className="block w-full px-4 py-2 bg-blue-500 text-white text-center rounded hover:bg-blue-600"
          >
            Try Admin Dashboard
          </a>
          <a 
            href="/" 
            className="block w-full px-4 py-2 bg-gray-500 text-white text-center rounded hover:bg-gray-600"
          >
            Go Home
          </a>
        </div>
        
        {isAdmin && (
          <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-800 font-semibold">🎉 RBAC is working! You have admin access.</p>
          </div>
        )}
      </div>
    </div>
  );
}