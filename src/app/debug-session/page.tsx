// src/app/debug-session/page.tsx
import { auth } from "@/auth";
import { signOut } from "@/auth";

export default async function DebugSessionPage() {
  const session = await auth();

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Session Debug</h1>
      
      <div className="space-y-4 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold">Raw Session Data:</h2>
        <pre className="bg-muted p-4 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold">User Info:</h2>
          <p><strong>Logged in:</strong> {session ? '✅ Yes' : '❌ No'}</p>
          <p><strong>User ID:</strong> {session?.user?.id || 'N/A'}</p>
          <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
          <p><strong>Role:</strong> {session?.user?.role || 'N/A'}</p>
          <p><strong>Is Admin in session:</strong> {session?.user?.isAdmin ? '✅ Yes' : '❌ No'}</p>
        </div>
        
        <div className="space-y-2 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold">Access Control:</h2>
          <p><strong>Can access /admin:</strong> 
            {session?.user?.role && session.user.role !== 'VIEWER' ? '✅ Yes' : '❌ No'}
          </p>
          <p><strong>Is Admin:</strong> 
            {(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') ? '✅ Yes' : '❌ No'}
          </p>
        </div>
      </div>

      <div className="space-y-2 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold">Actions:</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/admin" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Test Admin Access
          </a>
          <form action={async () => {
            'use server';
            await signOut();
          }}>
            <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Sign Out
            </button>
          </form>
          <a href="/" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Home
          </a>
        </div>
      </div>

      {session?.user?.role === 'ADMIN' && (
        <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-800 font-semibold">✅ You have admin access in session!</p>
        </div>
      )}
    </div>
  );
}