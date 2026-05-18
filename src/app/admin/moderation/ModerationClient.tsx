// src/app/admin/moderation/ModerationClient.tsx
"use client";

import { ContentReport } from "@prisma/client";
import { useState, useTransition } from "react";
import { updateReportStatus, deleteReport } from "@/actions/moderationActions";
import { toast } from "react-hot-toast";
import { Trash2, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function ModerationClient({ reports }: { reports: ContentReport[] }) {
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "REVIEWED">("PENDING");
  const [isPending, startTransition] = useTransition();

  const filteredReports = reports.filter(r => filter === "ALL" ? true : r.status === filter);

  const handleUpdateStatus = (id: string, status: "PENDING" | "REVIEWED") => {
    startTransition(async () => {
      const res = await updateReportStatus(id, status);
      if (res.success) toast.success(res.message || "Status updated.");
      else toast.error(res.error || "Failed to update.");
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    startTransition(async () => {
      const res = await deleteReport(id);
      if (res.success) toast.success(res.message || "Report deleted.");
      else toast.error(res.error || "Failed to delete.");
    });
  };

  return (
    <div className="bg-muted/50 p-6 rounded-lg border border-border">
      <div className="flex gap-4 mb-6 border-b border-muted pb-4">
        {["PENDING", "REVIEWED", "ALL"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No reports found.</p>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="bg-background p-4 rounded-lg border border-border flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${report.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                    {report.status}
                  </span>
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {report.contentType}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="font-semibold text-foreground mb-1">Reason:</p>
                <p className="text-sm text-muted-foreground mb-3">{report.reason}</p>
                
                <p className="text-xs font-mono text-muted-foreground">Content ID: {report.contentId}</p>
                {report.reporterId && <p className="text-xs font-mono text-muted-foreground">Reporter ID: {report.reporterId}</p>}
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                {report.status === "PENDING" ? (
                  <button
                    onClick={() => handleUpdateStatus(report.id, "REVIEWED")}
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                  >
                    <CheckCircle size={14} /> Mark Reviewed
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(report.id, "PENDING")}
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 text-sm"
                  >
                    <Clock size={14} /> Mark Pending
                  </button>
                )}
                <button
                  onClick={() => handleDelete(report.id)}
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 text-sm"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
