// src/app/admin/inbox/page.tsx
import prisma from "@/lib/prisma";
import InboxClient from "./InboxClient";

export default async function InboxPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-foreground mb-2">Inbox</h1>
        <p className="text-muted-foreground">Manage messages from the contact form.</p>
      </div>
      <InboxClient messages={messages} />
    </div>
  );
}
