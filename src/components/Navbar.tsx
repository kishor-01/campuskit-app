"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ProfileMenu from "./ProfileMenu";
import MobileMenu from "./MobileMenu";
import { Menu } from "lucide-react";

export default function Navbar() {
  const { status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="app-header sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center font-bold text-primary">
                  CK
                </div>
                <span className="text-2xl font-bold text-foreground">CampusKit</span>
              </Link>
            </div>

            {/* Center - hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-2">
              <Link href="/resources" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Resources
              </Link>
              <Link href="/opportunities" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Opportunities
              </Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Blog
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contact
              </Link>
            </nav>

            {/* Right */}
            <div className="flex items-center space-x-2">
              {/* Mobile hamburger — always visible on small screens */}
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 rounded-md md:hidden hover:bg-muted transition-colors"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
              >
                <Menu className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Divider (hidden on mobile) */}
              <div className="hidden md:block w-px h-6 bg-surface-border mx-2" />

              {status === "loading" && <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />}

              {status === "unauthenticated" && (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/login" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Login
                  </Link>
                  <Link href="/signup" className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-sm font-semibold transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Profile icon is visible on all screen sizes when authenticated */}
              {status === "authenticated" && <ProfileMenu />}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
