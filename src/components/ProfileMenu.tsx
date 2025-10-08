"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { UserCircle2, LogOut, LayoutGrid, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function ProfileMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Close when clicking outside of the menu
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node | null;
      if (!isOpen) return;
      if (!menuRef.current) return;
      if (menuRef.current.contains(target)) return;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      setIsOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!session) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((s) => !s)}
        className="p-2 rounded-full hover:bg-muted transition-colors"
        aria-label="Open user menu"
      >
        <UserCircle2 className="h-6 w-6 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-64 origin-top-right bg-surface border border-surface-border rounded-md shadow-lg z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-surface-border">
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

            <div className="py-2 border-t border-surface-border flex items-center justify-between px-4">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center text-sm text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-md"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>

              {/* Theme toggle aligned to the right */}
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
