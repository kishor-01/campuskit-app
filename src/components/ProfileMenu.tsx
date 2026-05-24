// src/components/ProfileMenu.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { 
  UserCircle2, 
  LogOut, 
  LayoutGrid, 
  User, 
  Target, 
  Shield,
  Crown,
  Edit3,
  Eye,
  UserCheck,
  Settings,
  Map,
  LayoutDashboard,
} from "lucide-react";
import { Role } from "@prisma/client";
import ThemeToggle from "./ThemeToggle";

const getRoleIcon = (role: Role) => {
  switch (role) {
    case Role.SUPER_ADMIN:
      return <Crown className="w-3 h-3" />;
    case Role.ADMIN:
      return <Shield className="w-3 h-3" />;
    case Role.EDITOR:
      return <Edit3 className="w-3 h-3" />;
    case Role.CONTRIBUTOR:
      return <UserCheck className="w-3 h-3" />;
    case Role.VIEWER:
      return <Eye className="w-3 h-3" />;
    default:
      return <UserCheck className="w-3 h-3" />;
  }
};

const getRoleColor = (role: Role) => {
  switch (role) {
    case Role.SUPER_ADMIN:
      return "text-purple-600 bg-purple-100";
    case Role.ADMIN:
      return "text-red-600 bg-red-100";
    case Role.EDITOR:
      return "text-blue-600 bg-blue-100";
    case Role.CONTRIBUTOR:
      return "text-green-600 bg-green-100";
    case Role.VIEWER:
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

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

  if (!session?.user) return null;

  const user = session.user;
  const userRole = user.role;
  const isAdmin = user.isAdmin;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((s) => !s)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors group"
        aria-label="Open user menu"
      >
        {user.image ? (
          <Image 
            src={user.image} 
            alt="Profile" 
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover border border-border"
          />
        ) : (
          <UserCircle2 className="h-7 w-7 text-muted-foreground group-hover:text-foreground" />
        )}
        {/* Role indicator dot */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
          userRole === Role.SUPER_ADMIN ? 'bg-purple-500' :
          userRole === Role.ADMIN ? 'bg-red-500' :
          userRole === Role.EDITOR ? 'bg-blue-500' :
          userRole === Role.CONTRIBUTOR ? 'bg-green-500' :
          'bg-gray-500'
        }`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute right-0 mt-2 w-72 origin-top-right bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {/* User Info Section */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-foreground truncate">
                  {user.name || "User"}
                </p>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
                  {getRoleIcon(userRole)}
                  <span>{userRole.replace('_', ' ')}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {user.email || "No email"}
              </p>
            </div>

            {/* Navigation Links */}
            <div className="py-2">
              <Link 
                href="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="flex items-center w-full px-4 py-2.5 text-sm font-semibold text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 mr-3" /> 
                Mission Control
              </Link>
              <Link 
                href="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <User className="w-4 h-4 mr-3" /> 
                My Profile
              </Link>
              <Link 
                href="/lifemap" 
                onClick={() => setIsOpen(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Map className="w-4 h-4 mr-3 text-indigo-400" /> 
                Lifemap
              </Link>
              <Link 
                href="/profile/edit" 
                onClick={() => setIsOpen(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-3" /> 
                Edit Profile
              </Link>
              <Link 
                href="/profile/privacy" 
                onClick={() => setIsOpen(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Settings className="w-4 h-4 mr-3" /> 
                Privacy Settings
              </Link>
              <Link 
                href="/my-resources" 
                onClick={() => setIsOpen(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <LayoutGrid className="w-4 h-4 mr-3" /> 
                Saved Resources
              </Link>
              <Link 
                href="/my-goals" 
                onClick={() => setIsOpen(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Target className="w-4 h-4 mr-3" /> 
                My Goals
              </Link>
              
              {/* Admin Link - Only show for admins */}
              {isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors border-t border-border mt-2 pt-2"
                >
                  <Shield className="w-4 h-4 mr-3" /> 
                  Admin Dashboard
                </Link>
              )}
            </div>

            {/* Footer Actions */}
            <div className="py-3 border-t border-border flex items-center justify-between px-4 bg-muted/20">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center text-sm text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" /> 
                Sign Out
              </button>

              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}