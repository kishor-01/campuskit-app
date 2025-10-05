// src/components/ThemeToggle.tsx

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Paintbrush } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, themes, setTheme } = useTheme();

  // We need to check if the component is mounted to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a placeholder on the server
    return <div className="w-16 h-8 bg-muted rounded-full" />;
  }
  
  const cycleTheme = () => {
    const currentThemeIndex = themes.indexOf(theme || 'light');
    const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
    setTheme(themes[nextThemeIndex]);
  };

  return (
    <button
      onClick={cycleTheme}
      className="w-16 h-8 rounded-full bg-muted flex items-center justify-center relative overflow-hidden"
      aria-label="Cycle theme"
    >
      <motion.div
        key={theme}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
          <Paintbrush className="text-muted-foreground" />
      </motion.div>
    </button>
  );
}