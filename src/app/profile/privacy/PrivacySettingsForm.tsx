// src/app/profile/privacy/PrivacySettingsForm.tsx
"use client";

import { useState, useTransition } from "react";
import { updatePrivacySettings } from "@/actions/userActions";
import { motion } from "framer-motion";

interface PrivacySettingsFormProps {
  user: {
    isPublicProfile: boolean;
    showHeatmap: boolean;
    allowEmails: boolean;
  };
}

function ToggleSwitch({ isOn, onToggle, disabled }: { isOn: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        isOn ? "bg-primary" : "bg-muted"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 ${
          isOn ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function PrivacySettingsForm({ user }: PrivacySettingsFormProps) {
  const [settings, setSettings] = useState({
    isPublicProfile: user.isPublicProfile,
    showHeatmap: user.showHeatmap,
    allowEmails: user.allowEmails,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = (key: keyof typeof settings) => {
    const newValue = !settings[key];
    const newSettings = { ...settings, [key]: newValue };
    
    // Optimistic update
    setSettings(newSettings);
    setError(null);

    startTransition(async () => {
      try {
        await updatePrivacySettings(newSettings);
      } catch (err: any) {
        // Revert on failure
        setSettings(settings);
        setError("Failed to save changes. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between py-4 border-b border-border">
        <div className="space-y-0.5">
          <label className="text-base font-medium text-foreground">Public Profile</label>
          <p className="text-sm text-muted-foreground">
            Allow others to view your developer passport and badges.
          </p>
        </div>
        <ToggleSwitch
          isOn={settings.isPublicProfile}
          onToggle={() => handleToggle("isPublicProfile")}
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between py-4 border-b border-border">
        <div className="space-y-0.5">
          <label className="text-base font-medium text-foreground">Activity Heatmap</label>
          <p className="text-sm text-muted-foreground">
            Display your streak and contribution history on your profile.
          </p>
        </div>
        <ToggleSwitch
          isOn={settings.showHeatmap}
          onToggle={() => handleToggle("showHeatmap")}
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between py-4 border-b border-border">
        <div className="space-y-0.5">
          <label className="text-base font-medium text-foreground">Email Notifications</label>
          <p className="text-sm text-muted-foreground">
            Receive updates about your goals, study plans, and platform news.
          </p>
        </div>
        <ToggleSwitch
          isOn={settings.allowEmails}
          onToggle={() => handleToggle("allowEmails")}
          disabled={isPending}
        />
      </div>
    </div>
  );
}
