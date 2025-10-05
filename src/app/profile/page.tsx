// src/app/profile/page.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileIdCard from "@/components/ProfileIdCard";
import ResourceStack from "@/components/ResourceStack";
import ContributionHub from "@/components/ContributionHub";
import AccountSettings from "@/components/AccountSettings";
import StatsStreaks from "@/components/StatsStreaks"; // ✅ New component

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // ✅ Fetch all required data in parallel (faster than sequential)
  const [user, savedResources, savedCount, submissionCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.savedResource.findMany({
      where: { userId },
      include: {
        resource: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    }),
    prisma.savedResource.count({ where: { userId } }),
    prisma.resource.count({ where: { submittedById: userId } }),
  ]);

  if (!user) {
    redirect("/login"); // Safety check if user record doesn't exist
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Welcome to your Desk, {user.name?.split(" ")[0]}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <ProfileIdCard user={user} />

        {/* Recent Saved Resources */}
        <div className="md:col-span-2">
          <ResourceStack savedResources={savedResources} />
        </div>

        {/* Contribution Stats */}
        <div className="md:col-span-3">
          <ContributionHub submissionCount={submissionCount} />
        </div>

        {/* ✅ New Stats & Streaks Section */}
        <div className="md:col-span-2">
          <StatsStreaks
            savedCount={savedCount}
            submittedCount={submissionCount}
            joinDate={user.createdAt}
          />
        </div>

        {/* Account Settings */}
        <div className="md:col-span-1">
          <AccountSettings />
        </div>
      </div>
    </div>
  );
}
