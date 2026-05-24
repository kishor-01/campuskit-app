// src/components/profile/BentoSettings.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { signOut } from 'next-auth/react';
import {
  Settings, LogOut, Trash2, Loader2, Check, User2, ChevronRight,
  Edit3, Shield, UserCog,
} from 'lucide-react';
import { updateProfileNameAction } from '@/actions/profileActions';
import Link from 'next/link';
import { Role } from '@prisma/client';
import ThemeToggle from '@/components/ThemeToggle';

interface BentoSettingsProps {
  currentName: string;
  userRole: Role;
}

export default function BentoSettings({ currentName, userRole }: BentoSettingsProps) {
  const [name, setName] = useState(currentName);
  const [nameMsg, setNameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showDanger, setShowDanger] = useState(false);

  const isAdmin = userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN;

  const handleNameSave = () => {
    startTransition(async () => {
      const result = await updateProfileNameAction(name);
      if (result?.error) {
        setNameMsg({ type: 'error', text: result.error });
      } else {
        setNameMsg({ type: 'success', text: 'Name updated!' });
        setTimeout(() => setNameMsg(null), 3000);
      }
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full gap-5">
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Settings</h3>
      </div>

      {/* Update Name */}
      <div className="space-y-2">
        <label htmlFor="profile-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <User2 className="w-3.5 h-3.5" /> Display Name
        </label>
        <div className="flex gap-2">
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground
              placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          <button
            onClick={handleNameSave}
            disabled={isPending || name.trim() === currentName}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold
              hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
        {nameMsg && (
          <p className={`text-xs font-medium ${nameMsg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
            {nameMsg.text}
          </p>
        )}
      </div>

      {/* Quick Links */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Links</p>
        {[
          { href: '/profile/edit', icon: Edit3, label: 'Edit Full Profile' },
          { href: '/profile/privacy', icon: Shield, label: 'Privacy Settings' },
          ...(isAdmin ? [{ href: '/admin', icon: UserCog, label: 'Admin Dashboard' }] : []),
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm
              text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all group"
          >
            <span className="flex items-center gap-2.5">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Theme */}
      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/40 border border-border/50">
        <span className="text-sm text-muted-foreground font-medium">Theme</span>
        <ThemeToggle />
      </div>

      {/* Sign Out */}
      <div className="mt-auto pt-4 border-t border-border space-y-2">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-semibold
            text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>

        {/* Danger Zone */}
        <div>
          <button
            onClick={() => setShowDanger((v) => !v)}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs font-semibold
              text-slate-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Danger Zone
          </button>
          {showDanger && (
            <div className="mt-2 p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-2">
              <p className="text-xs text-red-400 font-semibold">⚠ Delete Account</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                This permanently deletes your account and all data. This action cannot be undone.
              </p>
              <form action="/api/auth/delete-account" method="POST">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you absolutely sure? This is permanent and irreversible.')) {
                      fetch('/api/profile/delete', { method: 'DELETE' })
                        .then(() => { window.location.href = '/'; });
                    }
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-xs font-bold text-red-400
                    border border-red-500/30 hover:bg-red-500/20 transition-all"
                >
                  Delete My Account
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
