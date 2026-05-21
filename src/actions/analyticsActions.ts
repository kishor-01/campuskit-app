"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { recordUserActivity } from "@/lib/streakService";

export async function trackEvent(eventType: string, metadata?: any) {
  // Fire and forget pattern - we wrap in try/catch and don't rethrow
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    if (userId) {
      recordUserActivity(userId).catch((err) => {
        console.error("[Streak] Error recording user activity:", err);
      });
    }

    // Do not await this if we want it to be fully fire-and-forget from the caller's perspective, 
    // but since it's a server action, the caller (client) awaits the HTTP request. 
    // We can just trigger the DB call and return immediately.
    prisma.analyticsEvent.create({
      data: {
        eventType,
        userId,
        metadata: metadata ? metadata : undefined,
      },
    }).catch((err) => {
      console.error("[Analytics] Error logging event to DB:", err);
    });

    return { success: true };
  } catch (error) {
    console.error("[Analytics] Error preparing event tracking:", error);
    return { success: false };
  }
}
