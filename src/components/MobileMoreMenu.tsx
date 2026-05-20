"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Drawer } from "vaul";
import { BookOpen, Wrench, FileText, ChevronRight, X } from "lucide-react";

const MENU_ITEMS = [
  { href: "/resources", label: "Resources", desc: "Curated learning materials & assets", icon: BookOpen },
  { href: "/tools", label: "Tools", desc: "Interactive developer utility tools", icon: Wrench },
  { href: "/blog", label: "Blog", desc: "Latest technical articles & stories", icon: FileText },
];

interface MobileMoreMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMoreMenu({ open, onClose }: MobileMoreMenuProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Drawer.Root open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity" onClick={onClose} />
        <Drawer.Content className="bg-background border-t border-border/40 rounded-t-3xl fixed bottom-0 left-0 right-0 z-50 flex flex-col focus:outline-none max-h-[85vh] pb-8">
          {/* Top handle bar */}
          <div className="mx-auto w-12 h-1 rounded-full bg-muted my-4 shrink-0 cursor-grab active:cursor-grabbing" />
          
          <div className="flex items-center justify-between px-6 pb-4">
            <Drawer.Title className="text-xl font-bold text-foreground">More</Drawer.Title>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto px-4">
            <div className="bg-card/50 border border-border/30 rounded-2xl overflow-hidden shadow-xs">
              {MENU_ITEMS.map((item, idx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors active:bg-muted/60 min-h-[56px] ${
                    idx < MENU_ITEMS.length - 1 ? "border-b border-border/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/5 text-primary rounded-xl shrink-0">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-foreground leading-tight">{item.label}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/60" />
                </Link>
              ))}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
