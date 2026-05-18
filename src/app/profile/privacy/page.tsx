// src/app/profile/privacy/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PrivacySettingsForm from "./PrivacySettingsForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PrivacySettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      isPublicProfile: true,
      showHeatmap: true,
      allowEmails: true,
    }
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/profile" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Profile
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Privacy Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your data and platform visibility.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8">
        <PrivacySettingsForm user={user} />
      </div>
    </div>
  );
}
