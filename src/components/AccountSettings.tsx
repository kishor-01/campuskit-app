// src/components/AccountSettings.tsx

"use client";

import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function AccountSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }} // Staggered delay
      className="bg-muted/50 rounded-2xl p-6 flex flex-col justify-between"
    >
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Settings</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Theme</p>
          <ThemeToggle />
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="w-full mt-4 inline-flex items-center justify-center bg-background border border-muted text-red-500 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-red-500/10 transition-colors"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </button>
    </motion.div>
  );
}