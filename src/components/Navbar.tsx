// src/components/Navbar.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu as MenuIcon, Bell as BellIcon, Map, LayoutDashboard, Zap } from "lucide-react";
import { motion } from "framer-motion";
import MobileMoreMenu from "./MobileMoreMenu";

const ProfileMenu = dynamic(() => import("./ProfileMenu"), { ssr: false });
const NotificationCenter = dynamic(() => import("./NotificationCenter"), { ssr: false });

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/resources", label: "Resources" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/tools", label: "Tools" },
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/blog", label: "Blog" },
];

export default React.memo(function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const navItems = React.useMemo(() => {
    if (status === "authenticated") {
      return [
        { href: "/dashboard", label: "Dashboard" },
        ...NAV_ITEMS,
        { href: "/lifemap", label: "Lifemap" },
      ];
    }
    return NAV_ITEMS;
  }, [status]);

  const isActive = (href: string) => {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex-1 flex justify-start">
              <Link href="/" className="flex items-center gap-2 py-2 px-2 -ml-2 min-h-[44px] min-w-[44px]" aria-label="Seniofy home">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-primary-foreground text-lg">
                  CK
                </div>
                <span className="hidden sm:inline-block text-2xl font-bold bg-gradient-to-br from-foreground to-muted-foreground/80 text-transparent bg-clip-text">
                  Seniofy
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-1" aria-label="Primary">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label === "Dashboard" && (
                    <LayoutDashboard className="w-4 h-4 mr-1.5 text-violet-400 inline-block align-text-bottom" />
                  )}
                  {item.label === "Lifemap" && (
                    <Map className="w-4 h-4 mr-1.5 text-indigo-400 inline-block align-text-bottom" />
                  )}
                  {item.label}
                  {isActive(item.href) && (
                    <motion.span
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      animate={{ opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile Actions: Bell & Hamburger Menu */}
            <div className="flex md:hidden items-center gap-1 justify-end flex-1">
              <NotificationCenter />
              
              <button
                onClick={() => setMoreMenuOpen(true)}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open navigation menu"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="hidden md:flex flex-1 justify-end items-center gap-2">
              <div className="flex items-center gap-2">
                {status === "loading" && <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />}
                {status === "unauthenticated" && (
                  <>
                    <Link href="/login" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium min-h-[44px] flex items-center justify-center transition-colors">
                      Sign In
                    </Link>
                    <Link href="/signup" className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 px-4 py-2 rounded-xl text-sm font-bold min-h-[44px] transition-all shadow-[0_0_16px_rgba(139,92,246,0.25)] hover:shadow-[0_0_24px_rgba(139,92,246,0.4)]">
                      <Zap className="w-3.5 h-3.5" /> Get Started
                    </Link>
                  </>
                )}
                {status === "authenticated" && (
                  <div className="flex items-center gap-1">
                    <NotificationCenter />
                    <ProfileMenu />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <MobileMoreMenu open={moreMenuOpen} onClose={() => setMoreMenuOpen(false)} />
    </>
  );
});

