"use client";

import { useState } from "react";
import { submitContentReport } from "@/actions";
import { toast } from "react-hot-toast";
import { Flag, Loader2 } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-muted"
          title="Report this content"
        >
          <Flag size={14} />
        </button>
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
            className="w-full p-2 bg-background border border-muted rounded-md text-sm"
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
