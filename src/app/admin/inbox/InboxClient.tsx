// src/app/admin/inbox/InboxClient.tsx
"use client";

import { ContactMessage } from "@prisma/client";
import { useState, useTransition } from "react";
import { updateMessageStatus, deleteMessage } from "@/actions/moderationActions";
import { toast } from "react-hot-toast";
import { Trash2, MailOpen, Mail } from "lucide-react";

export default function InboxClient({ messages }: { messages: ContactMessage[] }) {
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("UNREAD");
  const [isPending, startTransition] = useTransition();

  const filteredMessages = messages.filter(m => filter === "ALL" ? true : m.status === filter);

  const handleUpdateStatus = (id: string, status: "UNREAD" | "READ") => {
    startTransition(async () => {
      const res = await updateMessageStatus(id, status);
      if (res.success) toast.success(res.message || "Status updated.");
      else toast.error(res.error || "Failed to update.");
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    startTransition(async () => {
      const res = await deleteMessage(id);
      if (res.success) toast.success(res.message || "Message deleted.");
      else toast.error(res.error || "Failed to delete.");
    });
  };

  return (
    <div className="bg-muted/50 p-6 rounded-lg border border-border">
      <div className="flex gap-4 mb-6 border-b border-muted pb-4">
        {["UNREAD", "READ", "ALL"].map(f => (
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
        {filteredMessages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No messages found.</p>
        ) : (
          filteredMessages.map(msg => (
            <div key={msg.id} className={`bg-background p-4 rounded-lg border flex flex-col sm:flex-row justify-between gap-4 ${msg.status === 'UNREAD' ? 'border-primary shadow-sm' : 'border-border'}`}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${msg.status === "UNREAD" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                    {msg.status}
                  </span>
                  <span className="text-sm font-semibold">{msg.name}</span>
                  <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline">{msg.email}</a>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                {msg.subject && <p className="font-semibold text-foreground mb-1">Subject: {msg.subject}</p>}
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.message}</p>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                {msg.status === "UNREAD" ? (
                  <button
                    onClick={() => handleUpdateStatus(msg.id, "READ")}
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
                  >
                    <MailOpen size={14} /> Mark Read
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(msg.id, "UNREAD")}
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 text-sm"
                  >
                    <Mail size={14} /> Mark Unread
                  </button>
                )}
                <button
                  onClick={() => handleDelete(msg.id)}
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
