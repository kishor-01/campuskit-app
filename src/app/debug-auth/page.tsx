// src/app/debug-auth/page.tsx
import { auth } from "@/auth";

export default async function DebugAuthPage() {
  const session = await auth();
  
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Auth Debug Information</h1>
      
      <div className="space-y-4 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold">Raw Session Data:</h2>
        <pre className="bg-muted p-4 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold">User Status:</h2>
          <p><strong>Logged in:</strong> {session ? 'Yes' : 'No'}</p>
          <p><strong>User ID:</strong> {session?.user?.id || 'N/A'}</p>
          <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
          <p><strong>Role:</strong> {session?.user?.role || 'N/A'}</p>
        </div>
        
        <div className="space-y-2 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold">Access Control:</h2>
          <p><strong>Can access /admin:</strong> {session?.user?.role && session.user.role !== 'VIEWER' ? 'Yes' : 'No'}</p>
          <p><strong>Is Admin:</strong> {(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') ? 'Yes' : 'No'}</p>
          <p><strong>Session expires:</strong> {session?.expires ? new Date(session.expires).toLocaleString() : 'N/A'}</p>
        </div>
      </div>
      
      <div className="space-y-2 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold">Test Navigation:</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/admin" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Admin Dashboard</a>
          <a href="/admin/test-auth" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">RBAC Test Page</a>
          <a href="/" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Home</a>
        </div>
      </div>
    </div>
  );
}