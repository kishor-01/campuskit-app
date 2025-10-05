// src/components/ProfileMenu.tsx

"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { UserCircle2, LogOut, LayoutGrid, User } from 'lucide-react';

export default function ProfileMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // We only render this component if the session is authenticated, so session is guaranteed to exist.
  if (!session) return null; 

  return (
    <div className="relative">
      {/* The profile icon that acts as the button to open the menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-muted transition-colors"
        aria-label="Open user menu"
      >
        <UserCircle2 className="h-6 w-6 text-muted-foreground" />
      </button>

      {/* The Dropdown Menu with animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-2 w-64 origin-top-right bg-background border border-muted rounded-md shadow-lg z-50"
          >
            <div className="p-4 border-b border-muted">
              <p className="font-semibold text-sm text-foreground truncate">{session.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
            </div>
            <div className="py-2">
              <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <User className="w-4 h-4 mr-2" /> My Profile
              </Link>
              <Link href="/my-resources" onClick={() => setIsOpen(false)} className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <LayoutGrid className="w-4 h-4 mr-2" /> Saved Resources
              </Link>
            </div>
            <div className="py-2 border-t border-muted">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}