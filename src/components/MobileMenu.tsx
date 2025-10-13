// src/components/MobileMenu.tsx
"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import useFocusTrap from "@/hooks/useFocusTrap";
import { X } from "lucide-react";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // focus trap when open
  useFocusTrap(panelRef, open);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (!open) return;
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // prevent body scroll when open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const navItems = [
    { href: "/resources", label: "Resources" },
    { href: "/opportunities", label: "Opportunities" },
    { href: "/tools", label: "Tools" },
    { href: "/roadmaps", label: "Roadmaps" },
    { href: "/goals", label: "Goals" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <AnimatePresence initial={false}>
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

          {/* Sliding panel: Narrow, clamped width */}
          <motion.div
            ref={panelRef}
            id="mobile-menu"
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
            className="fixed inset-y-0 right-0 z-50 border-l border-surface-border bg-surface shadow-2xl
                       w-[min(68vw,320px)] sm:w-[min(56vw,360px)] mobile-safe overflow-y-auto"
          >
            {/* Header: CampusKit name and close button (2rem gap: ml-8) */}
            <div className="flex items-center px-4 py-3">
              <span className="font-semibold text-lg text-foreground">CampusKit</span>

              <button
                onClick={onClose}
                aria-label="Close menu"
                className="ml-8 p-2 rounded-md hover:bg-muted transition-colors"
                title="Close menu"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Short centered divider */}
            <div className="flex justify-center" aria-hidden="true">
              <span className="block w-12 h-px bg-surface-border rounded" />
            </div>

            {/* Nav links (left aligned, do not stretch full width) */}
            <nav className="px-4 py-6" aria-label="Mobile primary">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      onClose();
                    }}
                    className="self-start inline-flex items-center px-3 py-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* bottom spacer to respect safe-area */}
              <div className="h-6" />
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
