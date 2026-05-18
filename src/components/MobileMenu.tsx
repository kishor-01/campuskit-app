// src/components/MobileMenu.tsx
"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, User, LayoutGrid, Target, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import type { SessionContextValue } from "next-auth/react";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  session: Session | null;
  status: SessionContextValue['status'];
};

const navItems = [
  { href: "/resources", label: "Resources" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/tools", label: "Tools" },
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/blog", label: "Blog" },
];

const profileItems = [
    { href: "/profile", label: "My Profile", icon: <User className="w-4 h-4 mr-3" /> },
    { href: "/my-resources", label: "Saved Resources", icon: <LayoutGrid className="w-4 h-4 mr-3" /> },
    { href: "/my-goals", label: "My Goals", icon: <Target className="w-4 h-4 mr-3" /> },
];

export default function MobileMenu({ open, onClose, session, status }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-y-0 right-0 z-50 bg-background border-l border-border w-[min(70vw,280px)] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-bold text-lg">Seniofy</span>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
                {/* FIX: Show user info when authenticated */}
                {status === 'authenticated' && session?.user && (
                    <div className="p-4 border-b border-border">
                        <p className="font-semibold text-sm text-foreground truncate">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                )}
                
                <nav className="p-4">
                    {/* FIX: Show profile links when authenticated */}
                    {status === 'authenticated' && (
                        <ul className="space-y-2">
                           {profileItems.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} onClick={onClose} className="flex items-center px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                </li>
                           ))}
                        </ul>
                    )}
                    
                    {/* Public navigation links */}
                    {status === 'authenticated' && <hr className="my-4 border-border" />}
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} onClick={onClose} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                            {item.label}
                            </Link>
                        </li>
                        ))}
                    </ul>
                </nav>
            </div>
            
            {status === 'unauthenticated' && (
              <div className="p-4 border-t border-border space-y-3">
                 <Link href="/login" onClick={onClose} className="flex items-center justify-center w-full px-4 py-2.5 rounded-md text-sm font-semibold bg-muted hover:bg-border text-foreground">
                    <LogIn className="w-4 h-4 mr-2"/>
                    Login
                 </Link>
                 <Link href="/signup" onClick={onClose} className="flex items-center justify-center w-full px-4 py-2.5 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                    <UserPlus className="w-4 h-4 mr-2"/>
                    Sign Up
                 </Link>
              </div>
            )}

            {/* FIX: Show logout button when authenticated */}
            {status === 'authenticated' && (
                <div className="p-4 border-t border-border">
                    <button 
                        onClick={() => {
                            onClose();
                            signOut({ callbackUrl: '/' });
                        }}
                        className="flex items-center justify-center w-full px-4 py-2.5 rounded-md text-sm font-semibold bg-muted hover:bg-border text-destructive"
                    >
                        <LogOut className="w-4 h-4 mr-2"/>
                        Logout
                    </button>
                </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

