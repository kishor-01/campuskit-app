// src/components/BookmarkButton.tsx
"use client";

import { useState, useTransition } from "react";
import { Bookmark as BookmarkIcon } from "lucide-react";
import toast from "react-hot-toast";
import { toggleSaveResource } from "@/actions"; // keep your existing action import

interface BookmarkButtonProps {
  resourceId: string;
  isInitiallySaved: boolean;
  className?: string; // allow positioning from parent
  // callback optional to inform parent card of change (if needed)
  onChange?: (isSaved: boolean) => void;
}

export default function BookmarkButton({
  resourceId,
  isInitiallySaved,
  className = "",
  onChange,
}: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const previous = isSaved;
      // optimistic UI
      setIsSaved(!previous);
      onChange?.(!previous);

      try {
        const result = await toggleSaveResource(resourceId);
        // expected result shape: { error?: string, message?: string }
        if (result?.error) {
          setIsSaved(previous);
          onChange?.(previous);
          toast.error(result.error);
        } else {
          toast.success(result?.message ?? (isSaved ? "Removed from saved" : "Saved"));
        }
      } catch (err) {
        setIsSaved(previous);
        onChange?.(previous);
        console.error("toggleSaveResource error", err);
        toast.error("Something went wrong — try again");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center justify-center rounded-md p-2 transition-transform active:scale-95 focus:outline-none focus:ring-0 ${className}`}
      aria-label={isSaved ? "Remove from saved" : "Save resource"}
      title={isSaved ? "Saved" : "Save resource"}
    >
      <span className={`relative inline-block`}>
        <BookmarkIcon
          className={`w-5 h-5 transition-all ${
            isSaved ? "text-primary fill-primary" : "text-muted-foreground"
          }`}
        />
        {/* small pulse when saved */}
        {isSaved && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-primary animate-ping-slow"
            style={{ opacity: 0.9 }}
          />
        )}
      </span>

      <style>{`
        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 0.9; }
          60% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-ping-slow { animation: ping-slow 900ms cubic-bezier(.4,0,.2,1) forwards; }
      `}</style>
    </button>
  );
}
