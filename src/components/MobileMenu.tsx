"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import { X } from "lucide-react";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { status, data: session } = useSession();
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape or outside clicks
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function onPointer(e: PointerEvent) {
      const t = e.target as Node | null;
      if (!open) return;
      if (!panelRef.current) return;
      if (!panelRef.current.contains(t)) onClose();
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, onClose]);

  // prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const panel = (
    <motion.div
      ref={panelRef}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-surface shadow-2xl z-50 border-l border-surface-border"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center font-bold text-primary">CK</div>
          <span className="font-semibold text-lg text-foreground">CampusKit</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <nav className="px-4 py-6 space-y-4">
        <Link onClick={onClose} href="/resources" className="block text-foreground font-medium px-2 py-2 rounded-md hover:bg-muted">
          Resources
        </Link>
        <Link onClick={onClose} href="/opportunities" className="block text-foreground font-medium px-2 py-2 rounded-md hover:bg-muted">
          Opportunities
        </Link>
        <Link onClick={onClose} href="/blog" className="block text-foreground font-medium px-2 py-2 rounded-md hover:bg-muted">
          Blog
        </Link>
        <Link onClick={onClose} href="/about" className="block text-foreground font-medium px-2 py-2 rounded-md hover:bg-muted">
          About
        </Link>
        <Link onClick={onClose} href="/contact" className="block text-foreground font-medium px-2 py-2 rounded-md hover:bg-muted">
          Contact
        </Link>

        <div className="border-t border-surface-border mt-4 pt-4 space-y-3">
          {status === "loading" && <div className="h-8 w-full bg-muted rounded-md animate-pulse" />}

          {status === "unauthenticated" && (
            <>
              <Link onClick={onClose} href="/login" className="block w-full text-center px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold">
                Login
              </Link>
              <Link onClick={onClose} href="/signup" className="block w-full text-center px-4 py-2 rounded-md border border-surface-border">
                Sign Up
              </Link>
            </>
          )}

          {status === "authenticated" && session && (
            <>
              <div className="px-2">
                <p className="text-sm font-semibold text-foreground truncate">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
              </div>

              <Link onClick={onClose} href="/profile" className="block px-2 py-2 text-foreground hover:bg-muted rounded-md">
                My Profile
              </Link>

              <Link onClick={onClose} href="/my-resources" className="block px-2 py-2 text-foreground hover:bg-muted rounded-md">
                Saved Resources
              </Link>

              <button
                onClick={() => { onClose(); signOut({ callbackUrl: "/" }); }}
                className="w-full text-left px-4 py-2 rounded-md text-sm text-red-500 hover:bg-red-500/10"
              >
                Logout
              </button>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-surface-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Theme</p>
              <p className="text-xs text-muted-foreground/80">Tap to cycle</p>
            </div>
            <div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          {panel}
        </>
      )}
    </AnimatePresence>
  );
}
