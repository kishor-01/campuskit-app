"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      // map available theme keys to class names on <html>
      value={{
        light: "light",
        dark: "dark",
        celestial: "celestial",
        twilight: "twilight",
      }}
      themes={["light", "dark", "celestial", "twilight"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
