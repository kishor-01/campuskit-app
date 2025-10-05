"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="light"
      // Add our custom themes to the list
      themes={['light', 'dark', 'celestial', 'twilight']}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}