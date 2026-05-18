'use client';

import { useState, useTransition } from "react";
import { ArrowUpRight, Bookmark as BookmarkIcon, Check } from "lucide-react";
import toast from "react-hot-toast";
import { toggleSaveResource } from "@/actions";

export default function ResourceActionsClient({
  resourceId,
  isInitiallySaved,
  url,
}: {
  resourceId: string;
  isInitiallySaved: boolean;
  url: string;
}) {
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const previous = isSaved;
      setIsSaved(!previous);

      try {
        const result = await toggleSaveResource(resourceId);
        if (result?.error) {
          setIsSaved(previous);
          toast.error(result.error);
        } else {
          toast.success("saved" in result && result.saved ? "Saved to your library" : "Removed from library");
        }
      } catch (err) {
        setIsSaved(previous);
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-8">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-primary/20"
      >
        Visit Resource <ArrowUpRight className="w-5 h-5" />
      </a>
      
      <button
        onClick={handleSave}
        disabled={isPending}
        className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 border-2 ${
          isSaved 
            ? 'bg-primary/10 border-primary text-primary' 
            : 'bg-card border-border text-foreground hover:bg-muted'
        }`}
      >
        {isSaved ? (
          <>
            <Check className="w-5 h-5" /> Saved to Library
          </>
        ) : (
          <>
            <BookmarkIcon className="w-5 h-5" /> Save Resource
          </>
        )}
      </button>
    </div>
  );
}
