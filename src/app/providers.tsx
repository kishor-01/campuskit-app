// src/app/providers.tsx

"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes"; // Corrected import path

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        themes={['light', 'dark', 'theme-solarized', 'theme-rose-pine']}
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}