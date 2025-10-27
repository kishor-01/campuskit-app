// src/components/profile/SettingsWidget.tsx
'use client';

import { signOut } from "next-auth/react";
import { LogOut, Settings, Shield, UserCog } from "lucide-react";
import { Role } from "@prisma/client";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";

interface SettingsWidgetProps {
  userRole: Role;
}

export default function SettingsWidget({ userRole }: SettingsWidgetProps) {
  const isAdmin = userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN;

  return (
    <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col justify-between">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Settings size={20} className="text-primary"/>
          Settings & Actions
        </h3>
        
        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Theme</p>
          <ThemeToggle />
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Shield className="w-4 h-4" />
              Admin Actions
            </div>
            <Link 
              href="/admin"
              className="block w-full text-left p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <div className="flex items-center gap-2">
                <UserCog className="w-4 h-4" />
                Admin Dashboard
              </div>
            </Link>
          </div>
        )}

        {/* Account Management */}
        <div className="pt-2 border-t border-border">
          <Link 
            href="/profile/edit"
            className="block w-full text-left p-3 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            Edit Profile
          </Link>
          <Link 
            href="/privacy"
            className="block w-full text-left p-3 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            Privacy Settings
          </Link>
        </div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="w-full mt-4 inline-flex items-center justify-center bg-background border border-border text-red-500 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-red-500/10 transition-colors"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </button>
    </div>
  );
}