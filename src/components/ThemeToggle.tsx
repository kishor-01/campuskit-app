"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Paintbrush } from "lucide-react";
import { motion } from "framer-motion";

const THEME_ORDER = ["dark", "celestial", "twilight", "light"];

export default function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10 bg-muted rounded-full" />;

  // prefer provider's themes if available, else fallback to our order
  const available = Array.isArray(themes) && themes.length > 0 ? themes : THEME_ORDER;
  // ensure the chosen order uses our canonical order for UX predictability
  const ordered = THEME_ORDER.filter((t) => available.includes(t)).concat(available.filter((t) => !THEME_ORDER.includes(t)));
  const currentIndex = ordered.indexOf((theme as string) || "dark");
  const nextIndex = (currentIndex + 1) % ordered.length;

  const handleToggle = () => setTheme(ordered[nextIndex]);

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-md hover:bg-muted transition-colors"
      title={`Switch theme (current: ${theme || "dark"})`}
      aria-label="Toggle theme"
    >
      <motion.div
        key={theme}
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
