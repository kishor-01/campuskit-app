// src/components/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Paintbrush } from "lucide-react";
import { motion } from "framer-motion";

// This array is the single source of truth for the cycle order.
// It must match the `themes` prop in your ThemeProvider.
const THEME_CYCLE_ORDER = ["light", "dark", "synthwave", "mocha"];

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // To prevent hydration errors, we render a placeholder on the server.
  if (!mounted) {
    return (
      <button className="p-2 rounded-md" aria-label="Toggle theme" disabled>
        <div className="w-5 h-5" />
      </button>
    );
  }

  const handleToggle = () => {
    // --- DEBUGGING LOGS ---
    // These logs will help us diagnose the issue.
    console.log('--- THEME TOGGLE CLICK ---');
    console.log('Current resolvedTheme:', resolvedTheme);

    const currentIndex = THEME_CYCLE_ORDER.indexOf(resolvedTheme as string);
    console.log('Calculated currentIndex:', currentIndex);

    const nextIndex = (currentIndex + 1) % THEME_CYCLE_ORDER.length;
    console.log('Calculated nextIndex:', nextIndex);
    
    const nextTheme = THEME_CYCLE_ORDER[nextIndex];
    console.log('Setting theme to:', nextTheme);
    console.log('-------------------------');
    // --- END DEBUGGING ---
    
    setTheme(nextTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-md hover:bg-muted transition-colors"
      title={`Switch theme (current: ${resolvedTheme})`}
      aria-label="Toggle theme"
    >
      <motion.div
        key={resolvedTheme} // The key ensures the animation re-runs on theme change
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <Paintbrush className="h-5 w-5 text-muted-foreground" />
      </motion.div>
    </button>
  );
}

