import prisma from "./prisma";
import { evaluateUserAchievements } from "./achievementService";

/**
 * Timezone-Safe Consistency & Streak Service (UTC Standard)
 * 
 * Database Hammer Protection:
 * - A "Day" starts and resets at Midnight UTC.
 * - If lastActiveAt is already today (in UTC), return immediately to prevent database write bottlenecks.
 * - Otherwise, increment streak if lastActiveAt was yesterday (in UTC), or reset to 1 if older.
 */
export async function recordUserActivity(userId: string): Promise<void> {
  if (!userId) return;

  try {
    // 1. Fetch user's current streak info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastActiveAt: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    if (!user) return;

    const now = new Date();
    
    // Convert current time to UTC day-level date (Midnight UTC)
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (user.lastActiveAt) {
      const lastActive = new Date(user.lastActiveAt);
      const lastActiveUTC = new Date(Date.UTC(lastActive.getUTCFullYear(), lastActive.getUTCMonth(), lastActive.getUTCDate()));

      // Hammer Protection: If active today in UTC, return immediately without any DB write!
      if (lastActiveUTC.getTime() === todayUTC.getTime()) {
        return;
      }

      // Midnight UTC yesterday
      const yesterdayUTC = new Date(todayUTC.getTime() - 24 * 60 * 60 * 1000);

      let newStreak = 1;
      if (lastActiveUTC.getTime() === yesterdayUTC.getTime()) {
        // Increment streak since last activity was yesterday UTC
        newStreak = user.currentStreak + 1;
      } else {
        // Streak broken (older than yesterday UTC), reset to 1
        newStreak = 1;
      }

      const newLongestStreak = Math.max(newStreak, user.longestStreak);

      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastActiveAt: now,
        },
      });
    } else {
      // First time activity recorded for this user
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: 1,
          longestStreak: 1,
          lastActiveAt: now,
        },
      });
    }

    // Fire-and-forget evaluation of achievements to protect the main streak updates
    evaluateUserAchievements(userId).catch((err) => {
      console.error("[Achievement Service Error]", err);
    });
  } catch (error) {
    console.error(`Failed to record user activity for user ${userId}:`, error);
  }
}
