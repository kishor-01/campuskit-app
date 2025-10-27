// src/components/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark" // A safe, popular default
      enableSystem={false}
      // List all available themes for the toggle to cycle through
      themes={["light", "dark", "matrix", "dusk"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
