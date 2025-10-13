// src/app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      {/* Global toast container */}
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
