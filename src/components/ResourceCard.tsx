// src/components/ResourceCard.tsx
'use client';

import { Resource, Category } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Bookmark as BookmarkIcon, 
  Users as UsersIcon, 
  ArrowUpRight as ArrowUpRightIcon, 
  Flag as FlagIcon, 
  X as XIcon,
  Lightbulb as LightbulbIcon,
} from 'lucide-react';
import { toggleSaveResource, reportResourceAction } from '@/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter
} from '@/components/ui/dialog';

export type ResourceWithCategory = Resource & {
  category: Category;
  isInitiallySaved?: boolean;
  _count?: {
    savedByUsers: number;
  };
};

interface ResourceCardProps {
  resource: ResourceWithCategory;
  isSaved?: boolean;
  onToggleSave?: (isSaved: boolean) => void;
  viewMode: 'grid' | 'list';
}

export default function ResourceCard({
  resource,
  viewMode,
  isSaved: propIsSaved,
  onToggleSave,
}: ResourceCardProps) {
  const [isSaved, setIsSaved] = useState(
    propIsSaved !== undefined ? propIsSaved : (resource.isInitiallySaved || false)
  );
  const [savedCount, setSavedCount] = useState(resource._count?.savedByUsers || 0);
  const [isSaving, startTransition] = useTransition();

  const [reason, setReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Sync state with props
  useEffect(() => {
    if (propIsSaved !== undefined) {
      setIsSaved(propIsSaved);
    }
  }, [propIsSaved]);

  useEffect(() => {
    if (resource._count?.savedByUsers !== undefined) {
      setSavedCount(resource._count.savedByUsers);
    }
  }, [resource._count?.savedByUsers]);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startTransition(async () => {
      const wasSaved = isSaved;
      const originalCount = savedCount;

      // Optimistic update
      const nextSaved = !wasSaved;
      const nextCount = nextSaved ? originalCount + 1 : Math.max(0, originalCount - 1);
      
      setIsSaved(nextSaved);
      setSavedCount(nextCount);
      onToggleSave?.(nextSaved);

      try {
        const result = await toggleSaveResource(resource.id);
        if (result?.error) {
          setIsSaved(wasSaved);
          setSavedCount(originalCount);
          onToggleSave?.(wasSaved);
          toast.error("Failed to update bookmark");
        } else {
          toast.success(nextSaved ? "Added to bookmarks" : "Removed from bookmarks");
        }
      } catch (error) {
        setIsSaved(wasSaved);
        setSavedCount(originalCount);
        onToggleSave?.(wasSaved);
        toast.error("Failed to update bookmark");
      }
    });
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      toast.error("Please provide a reason of at least 10 characters.");
      return;
    }

    setIsReporting(true);
    try {
      const result = await reportResourceAction(resource.id, reason);
      if (result.success) {
        toast.success(result.message || "Report submitted successfully.");
        setIsReportOpen(false);
        setReason("");
      } else {
        toast.error(result.error || "Failed to submit report.");
      }
    } catch (err) {
      toast.error("An error occurred while submitting the report.");
    } finally {
      setIsReporting(false);
    }
  };

  // Shared Action Buttons component
  const actionButtons = (
    <div 
      className="flex items-center gap-1.5 bg-background/50 backdrop-blur-md p-1 rounded-xl border border-white/10"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsReportOpen(true)}
        className="h-8 w-8 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-muted-foreground/90 transition-colors"
        title="Report Resource"
      >
        <FlagIcon className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleSaveToggle}
        disabled={isSaving}
        className="h-8 w-8 rounded-lg hover:bg-primary/20 hover:text-primary text-muted-foreground/90 transition-colors"
        title={isSaved ? "Saved" : "Save Resource"}
      >
        <BookmarkIcon className={`w-4 h-4 transition-all ${isSaved ? "text-primary fill-primary" : ""}`} />
      </Button>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <>
        <Card className="relative bg-card border border-border rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex flex-col md:flex-row h-full">
            {/* Image Section */}
            <div className="relative md:w-56 h-40 overflow-hidden shrink-0 bg-muted/40">
              {resource.imageUrl ? (
                <Image
                  src={resource.imageUrl}
                  alt={resource.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 224px"
                />
              ) : (
                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                  <BookmarkIcon className="w-8 h-8 text-muted-foreground/35" />
                </div>
              )}
            </div>

            {/* Text Content Section */}
            <CardContent className="p-5 flex-grow flex flex-col justify-between pr-20 relative">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/15 text-[10px] tracking-wider uppercase font-bold text-primary border-none">
                    {resource.category.name}
                  </Badge>
                </div>

                <Link href={`/resources/${resource.id}`} className="group/title">
                  <h3 className="text-xl font-bold text-foreground group-hover/title:text-primary transition-colors mb-2">
                    {resource.name}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                  {resource.description}
                </p>
              </div>

              {/* Senior Insight */}
              {resource.seniorInsight && resource.seniorInsight !== 'Pending senior insight' && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/15 mb-3">
                  <LightbulbIcon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-indigo-200/70 leading-relaxed italic line-clamp-2">{resource.seniorInsight}</p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    Added {new Date(resource.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Total saves">
                    <UsersIcon className="w-3.5 h-3.5" />
                    <span>{savedCount} {savedCount === 1 ? 'save' : 'saves'}</span>
                  </div>
                </div>
                <Link href={`/resources/${resource.id}`} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                  View Details <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Absolute Action Controls overlay */}
              <div className="absolute top-5 right-5 z-20">
                {actionButtons}
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Report Dialog */}
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent className="sm:max-w-[425px] border border-border bg-background/95 backdrop-blur-md rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-destructive mb-1">
                <FlagIcon className="w-5 h-5" />
                <DialogTitle className="text-lg font-bold text-foreground">Report Resource</DialogTitle>
              </div>
              <DialogDescription className="text-sm text-muted-foreground">
                Help us keep the community safe. Tell us why you are reporting **{resource.name}**.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleReportSubmit} className="space-y-4 pt-3">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide details (minimum 10 characters)..."
                required
                rows={4}
                className="w-full p-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none placeholder:text-muted-foreground/60"
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsReportOpen(false)}
                  className="rounded-xl border border-border/50 hover:bg-muted/60"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isReporting}
                  variant="destructive"
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/10 flex items-center justify-center gap-2"
                >
                  {isReporting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  Submit Report
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // GRID VIEW
  return (
    <>
      <Card className="relative h-full flex flex-col bg-card border border-border rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20">
        {/* Image Container */}
        <div className="relative h-40 w-full overflow-hidden shrink-0 bg-muted/40">
          {resource.imageUrl ? (
            <Image
              src={resource.imageUrl}
              alt={resource.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted/50 flex items-center justify-center">
              <BookmarkIcon className="w-8 h-8 text-muted-foreground/35" />
            </div>
          )}
          
          {/* Overlay badges/actions */}
          <div className="absolute top-3 left-3 z-20">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-md border-border/50 text-[10px] tracking-wider uppercase font-bold text-primary border-none">
              {resource.category.name}
            </Badge>
          </div>

          <div className="absolute top-3 right-3 z-20">
            {actionButtons}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5 flex-grow flex flex-col justify-between">
          <div className="flex-grow flex flex-col">
            <Link href={`/resources/${resource.id}`} className="group/title">
              <h3 className="text-lg font-bold text-foreground group-hover/title:text-primary transition-colors line-clamp-1 mb-2">
                {resource.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed flex-grow">
              {resource.description}
            </p>

            {/* Senior Insight */}
            {resource.seniorInsight && resource.seniorInsight !== 'Pending senior insight' && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/15 mb-4">
                <LightbulbIcon className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-indigo-200/70 leading-relaxed italic line-clamp-2">{resource.seniorInsight}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto border-t border-border/50 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Total saves">
              <UsersIcon className="w-3.5 h-3.5" />
              <span>{savedCount} {savedCount === 1 ? 'save' : 'saves'}</span>
            </div>
            <Link href={`/resources/${resource.id}`} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              Explore <ArrowUpRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-[425px] border border-border bg-background/95 backdrop-blur-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <FlagIcon className="w-5 h-5" />
              <DialogTitle className="text-lg font-bold text-foreground">Report Resource</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Help us keep the community safe. Tell us why you are reporting **{resource.name}**.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReportSubmit} className="space-y-4 pt-3">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide details (minimum 10 characters)..."
              required
              rows={4}
              className="w-full p-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none placeholder:text-muted-foreground/60"
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsReportOpen(false)}
                className="rounded-xl border border-border/50 hover:bg-muted/60"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isReporting}
                variant="destructive"
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/10 flex items-center justify-center gap-2"
              >
                {isReporting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                Submit Report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}