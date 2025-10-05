// src/components/Navbar.tsx

"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import ProfileMenu from "./ProfileMenu"; // Use ProfileMenu for authenticated users

export default function Navbar() {
  // useSession hook provides session data and status
  const { status } = useSession();

  return (
    <header className="bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b border-muted shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo and Name */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center font-bold text-primary">
                CK
              </div>
              <span className="text-2xl font-bold text-foreground">CampusKit</span>
            </Link>
          </div>

          {/* Right Section: Navigation Links & Auth Buttons */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/resources"
              className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Resources
            </Link>
            {/* <Link href="/blog" ...>Blog</Link> – can enable later */}
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Contact
            </Link>

            <div className="w-px h-6 bg-muted mx-3"></div>

            {/* Conditional Auth Section */}
            {status === "loading" && (
              // Show a placeholder while session status is being determined
              <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
            )}

            {status === "unauthenticated" && (
              // Show Login and Sign Up buttons if the user is not logged in
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-bold transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {status === "authenticated" && (
              // Show the ProfileMenu component if the user is logged in
              <ProfileMenu />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
