// src/components/Navbar.tsx
"use client";

import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu as MenuIcon } from "lucide-react";
import { motion } from "framer-motion";

const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });
const ProfileMenu = dynamic(() => import("./ProfileMenu"), { ssr: false });

type NavItem = { href: string; label: string };

// Primary nav items
const NAV_ITEMS: NavItem[] = [
  { href: "/resources", label: "Resources" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/tools", label: "Tools" },
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default React.memo(function Navbar() {
  const { status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMenu = useCallback(() => setMobileOpen(true), []);
  const closeMenu = useCallback(() => setMobileOpen(false), []);

  function isActive(href: string) {
    if (!pathname) return false;
    // Mark active if current path starts with href (useful for nested routes)
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <header className="app-header sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - brand */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3" aria-label="CampusKit home">
                <div
                  className="w-8 h-8 bg-muted rounded-full flex items-center justify-center font-bold text-primary"
                  aria-hidden
                >
                  CK
                </div>
                <span className="text-2xl font-bold text-foreground">CampusKit</span>
              </Link>
            </div>

            {/* Center - main nav (hidden on mobile) */}
            <nav
              className="hidden md:flex items-center space-x-2"
              role="navigation"
              aria-label="Primary"
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    isActive(item.href)
                      ? "text-primary bg-surface/60 aria-current"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right */}
            <div className="flex items-center space-x-2">
              {/* Mobile hamburger — visible on small screens */}
              <button
                onClick={openMenu}
                className="p-2 rounded-md md:hidden hover:bg-muted transition-colors"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                title="Open menu"
              >
                {/* subtle animated hamburger using framer-motion; respects reduced-motion by default */}
                <motion.span whileTap={{ scale: 0.95 }} aria-hidden>
                  <MenuIcon className="h-5 w-5 text-muted-foreground" />
                </motion.span>
              </button>

              {/* Divider (hidden on mobile) */}
              <div className="hidden md:block w-px h-6 bg-surface-border mx-2" />

              {status === "loading" && <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />}

              {status === "unauthenticated" && (
                <div className="hidden md:flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Profile icon (visible when authenticated) */}
              {status === "authenticated" && <ProfileMenu />}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <MobileMenu open={mobileOpen} onClose={closeMenu} />
    </>
  );
});
