// src/components/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Star, Coffee } from "lucide-react";
import { motion } from "framer-motion";

// This array is the single source of truth for the cycle order.
// It should match the theme names used in your CSS (see `src/app/globals.css`).
// Keep the order intentional: light -> dark -> synthwave -> mocha
const THEME_CYCLE_ORDER = ["light", "dark", "synthwave", "mocha"];

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Local state to keep a reliable value of the current theme on the client.
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Prefer the resolvedTheme from next-themes when available.
    if (typeof resolvedTheme === 'string') {
      setCurrentTheme(resolvedTheme);
      return;
    }

    // If resolvedTheme is not provided yet, fall back to localStorage (next-themes writes `theme` key)
    try {
      const stored = window.localStorage.getItem('theme');
      if (stored) setCurrentTheme(stored);
    } catch (e) {
      // ignore storage access errors
    }
  }, [resolvedTheme]);

  // Keep in sync if other tabs change the theme (storage event)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme' && typeof e.newValue === 'string') {
        setCurrentTheme(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // To prevent hydration errors, render a placeholder on the server.
  if (!mounted) {
    return (
      <button className="p-2 rounded-md" aria-label="Toggle theme" disabled>
        <div className="w-5 h-5" />
      </button>
    );
  }

  // Determine next theme based on the currently applied theme (use local state first)
  const active = currentTheme ?? (typeof resolvedTheme === 'string' ? resolvedTheme : THEME_CYCLE_ORDER[0]);
  const currentIndex = THEME_CYCLE_ORDER.indexOf(active) === -1 ? 0 : THEME_CYCLE_ORDER.indexOf(active);
  const nextIndex = (currentIndex + 1) % THEME_CYCLE_ORDER.length;
  const nextTheme = THEME_CYCLE_ORDER[nextIndex];

  // The button should show an icon for the NEXT theme (per your request)
  const NextIcon = nextTheme === 'dark' ? Moon : nextTheme === 'light' ? Sun : nextTheme === 'synthwave' ? Star : Coffee;

  const handleClick = () => {
    // Use next-themes to set the theme (this updates the document class and localStorage).
    // We optimistically update local state to reflect the change immediately in the UI.
    setTheme(nextTheme);
    setCurrentTheme(nextTheme);

    // Sometimes next-themes may override/normalize the theme (e.g., when system is enabled).
    // Read back from localStorage shortly after to ensure UI stays in sync.
    try {
      setTimeout(() => {
        const stored = window.localStorage.getItem('theme');
        if (stored) setCurrentTheme(stored);
      }, 120);
    } catch (e) {
      // ignore
    }
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-md hover:bg-muted transition-colors"
      title={`Switch theme (next: ${nextTheme})`}
      aria-label="Toggle theme"
    >
      <motion.div
        key={nextTheme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <NextIcon className="h-5 w-5 text-muted-foreground" />
      </motion.div>
    </button>
  );
}

