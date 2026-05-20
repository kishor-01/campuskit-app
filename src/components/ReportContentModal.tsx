"use client";

import { useState, useEffect } from "react";
import { submitContentReport } from "@/actions";
import { toast } from "react-hot-toast";
import { Flag, Loader2 } from "lucide-react";
import { Drawer } from "vaul";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ReportContentModal({ contentType, contentId }: { contentType: string, contentId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [snap, setSnap] = useState<string | number | null>(0.5);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      toast.error("Please provide a reason of at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    const result = await submitContentReport({ contentType, contentId, reason });
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message || "Report submitted.");
      setOpen(false);
      setReason("");
    } else {
      toast.error(result.error || "Failed to submit report.");
    }
  };

  const triggerButton = (
    <button
      className="text-muted-foreground hover:text-red-500 transition-colors p-3 md:p-1.5 rounded-full hover:bg-muted min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
      title="Report this content"
    >
      <Flag className="h-4 w-4 md:h-3.5 md:w-3.5" />
    </button>
  );

  if (!mounted) {
    return triggerButton;
  }

  if (isMobile) {
    return (
      <Drawer.Root 
        open={open} 
        onOpenChange={setOpen} 
        snapPoints={[0.5, 1]} 
        activeSnapPoint={snap} 
        setActiveSnapPoint={setSnap}
      >
        <Drawer.Trigger asChild>
          {triggerButton}
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity" />
          <Drawer.Content className="bg-background border-t border-border rounded-t-2xl fixed bottom-0 left-0 right-0 z-50 flex flex-col focus:outline-none h-[90vh]">
            <div className="mx-auto w-12 h-1.5 rounded-full bg-muted my-3 shrink-0 cursor-grab active:cursor-grabbing" />
            <div className="p-6 pt-2 flex flex-col gap-4 overflow-y-auto flex-1">
              <Drawer.Title className="text-lg font-bold text-foreground">Report Content</Drawer.Title>
              <Drawer.Description className="text-sm text-muted-foreground">
                Help us keep Seniofy safe. Briefly explain why this content is inappropriate or spam.
              </Drawer.Description>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2 flex flex-col flex-1">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for reporting (min 10 characters)..."
                  required
                  rows={4}
                  className="w-full p-3 bg-background border border-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] resize-none"
                />
                <div className="flex flex-col gap-2 mt-auto pb-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-md disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                    Submit Report
                  </button>
                  <Drawer.Close asChild>
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md min-h-[44px]"
                    >
                      Cancel
                    </button>
                  </Drawer.Close>
                </div>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  // Desktop standard Dialog
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us keep Seniofy safe. Briefly explain why this content is inappropriate or spam.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for reporting (min 10 characters)..."
            required
            rows={4}
            className="w-full p-2 bg-background border border-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Submit Report
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
