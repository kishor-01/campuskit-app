// src/components/BookmarkButton.tsx

"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "react-hot-toast";
import { toggleSaveResource } from "@/app/actions";

interface BookmarkButtonProps {
  resourceId: string;
  isInitiallySaved: boolean;
}

export default function BookmarkButton({ resourceId, isInitiallySaved }: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      // Optimistic UI update
      const previouslySaved = isSaved;
      setIsSaved(!isSaved); 

      const result = await toggleSaveResource(resourceId);

      if (result.error) {
        // If the server fails, revert the change and show an error toast
        setIsSaved(previouslySaved);
        toast.error(result.error);
      } else {
        // On success, show a confirmation toast
        toast.success(result.message || "Success!");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-muted transition-colors disabled:opacity-50"
      aria-label="Save resource"
    >
      <Bookmark
        className={`w-5 h-5 transition-all ${
          isSaved ? "text-primary fill-primary" : "text-muted-foreground"
        }`}
      />
    </button>
  );
}