// src/app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react"; // Has SessionProvider
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider> {/* Wraps children */}
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: '14px',
          },
        }}
      />
    </SessionProvider>
  );
}