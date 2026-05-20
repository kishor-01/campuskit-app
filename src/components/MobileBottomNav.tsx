"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Map, Briefcase, User } from "lucide-react";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/roadmaps", label: "Roadmaps", icon: Map },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/profile") {
      if (!isAuthenticated) {
        return pathname === "/login" || pathname === "/signup" || pathname.startsWith("/profile");
      }
      return pathname.startsWith("/profile");
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/60 py-2 px-4 flex justify-around items-center md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)] h-16 safe-bottom">
      {NAV_ITEMS.map((item) => {
        const isProfile = item.href === "/profile";
        const targetHref = isProfile && !isAuthenticated ? "/login" : item.href;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={targetHref}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 gap-1 rounded-xl transition-all duration-200 min-h-[48px] min-w-[48px] ${
              active
                ? "text-primary bg-primary/5 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label={item.label}
          >
            {isProfile && isAuthenticated && user?.image ? (
              <div className={`relative h-5 w-5 rounded-full overflow-hidden transition-transform duration-200 border ${
                active ? "scale-110 border-primary ring-2 ring-primary/20" : "border-muted-foreground/30"
              }`}>
                <Image
                  src={user.image}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="20px"
                />
              </div>
            ) : (
              <item.icon
                className={`h-5 w-5 transition-transform duration-200 ${
                  active ? "scale-110 stroke-[2.5px]" : "stroke-[2px]"
                }`}
              />
            )}
            <span className="text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
