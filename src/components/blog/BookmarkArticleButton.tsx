// src/components/blog/BookmarkArticleButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { toggleSaveArticle } from '@/actions';

interface BookmarkArticleButtonProps {
  articleId: string;
  isInitiallySaved: boolean;
  className?: string;
}

/**
 * Standalone bookmark button for articles, mirroring the existing
 * BookmarkButton for Resources. Allows users to save any article
 * (not just ones with clonable blueprints).
 */
export default function BookmarkArticleButton({
  articleId,
  isInitiallySaved,
  className = '',
}: BookmarkArticleButtonProps) {
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const previous = isSaved;
      // Optimistic UI
      setIsSaved(!previous);

      try {
        const result = await toggleSaveArticle(articleId);

        if (result?.error) {
          setIsSaved(previous);
          toast.error(result.error);
        } else {
          toast.success(result.saved ? 'Article saved' : 'Removed from saved');
        }
      } catch (err) {
        setIsSaved(previous);
        console.error('toggleSaveArticle error:', err);
        toast.error('Something went wrong — try again');
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-95 focus:outline-none ${
        isSaved
          ? 'bg-primary/10 text-primary border border-primary/30'
          : 'bg-muted text-muted-foreground border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30'
      } ${className}`}
      aria-label={isSaved ? 'Remove from saved' : 'Save article'}
      title={isSaved ? 'Saved — click to remove' : 'Save article'}
    >
      <span className="relative inline-block">
        <BookmarkIcon
          className={`w-4 h-4 transition-all ${
            isSaved ? 'fill-primary text-primary' : ''
          }`}
        />
        {isSaved && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-primary animate-ping-slow"
            style={{ opacity: 0.9 }}
          />
        )}
      </span>
      <span>{isSaved ? 'Saved' : 'Save'}</span>

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
