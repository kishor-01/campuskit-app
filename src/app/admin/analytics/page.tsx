// src/app/admin/analytics/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isUserAtLeast } from "@/lib/auth-utils";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import AnalyticsCharts from "./components/AnalyticsCharts";

export const metadata = {
  title: "Analytics | Admin — Seniofy",
  description: "Platform telemetry and usage analytics for Seniofy admin.",
};

export default async function AnalyticsPage() {
  // ── Auth guard ──────────────────────────────────────
  const isAdmin = await isUserAtLeast(Role.ADMIN);
  if (!isAdmin) redirect("/admin");

  // ── Date range: last 7 days ─────────────────────────
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // ── Parallel queries for performance ────────────────
  const [allEvents7d, todayEventsCount, distinctUsers] = await Promise.all([
    // All events in the 7-day window
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { eventType: true, metadata: true, createdAt: true, userId: true },
      orderBy: { createdAt: "asc" },
    }),

    // Today's count
    prisma.analyticsEvent.count({
      where: { createdAt: { gte: todayStart } },
    }),

    // Distinct user IDs (non-null)
    prisma.analyticsEvent.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        userId: { not: null },
      },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);

  // ── Aggregate: Daily usage buckets ──────────────────
  const dayBuckets: Record<string, number> = {};
  for (let d = 0; d < 7; d++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(date.getDate() + d);
    const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dayBuckets[key] = 0;
  }
  // Also include today
  const todayKey = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (!(todayKey in dayBuckets)) dayBuckets[todayKey] = 0;

  for (const event of allEvents7d) {
    const key = event.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (key in dayBuckets) dayBuckets[key]++;
  }

  const dailyUsage = Object.entries(dayBuckets).map(([date, count]) => ({
    date,
    count,
  }));

  // ── Aggregate: Top searched skills (from HERO_SEARCH) ──
  const skillMap: Record<string, number> = {};
  for (const event of allEvents7d) {
    if (event.eventType === "HERO_SEARCH" && event.metadata) {
      const meta = event.metadata as Record<string, any>;
      const inputValue = (meta.input ?? "").toString().trim().toLowerCase();
      if (inputValue) {
        skillMap[inputValue] = (skillMap[inputValue] || 0) + 1;
      }
    }
  }

  const topSkills = Object.entries(skillMap)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          Platform Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Telemetry data from the last 7 days — updated in real-time on every page load.
        </p>
      </div>

      <AnalyticsCharts
        dailyUsage={dailyUsage}
        topSkills={topSkills}
        totalEvents={allEvents7d.length}
        todayEvents={todayEventsCount}
        uniqueUsers={distinctUsers.length}
      />
    </div>
  );
}
