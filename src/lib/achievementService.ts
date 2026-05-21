import prisma from "./prisma";
import { TITLES, BADGES } from "./gamificationRules";

/**
 * Evaluates the user's achievements (developer title and earned badges)
 * based on their total contributions (AnalyticsEvent count) and streak.
 * 
 * Runs database updates and notification dispatches inside a single transaction
 * to ensure atomicity and transactional safety.
 */
export async function evaluateUserAchievements(userId: string): Promise<void> {
  if (!userId) return;

  // 1. Fetch user's current badges, title, and streak
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      badges: true,
      developerTitle: true,
      currentStreak: true,
    },
  });

  if (!user) return;

  // 2. Count total contributions dynamically via AnalyticsEvents
  const totalContributions = await prisma.analyticsEvent.count({
    where: { userId },
  });

  // 3. Title Check: Find the highest title they qualify for
  let newTitle = "Initiate";
  for (const tier of TITLES) {
    if (totalContributions >= tier.requiredContributions) {
      newTitle = tier.title;
    }
  }

  const titleChanged = newTitle !== user.developerTitle;

  // 4. Badge Check: Determine newly unlocked badges
  const newBadgesToAward: string[] = [];

  // first_step: 1 Contribution
  if (totalContributions >= 1 && !user.badges.includes("first_step")) {
    newBadgesToAward.push("first_step");
  }

  // streak_7: 7-Day Streak
  if (user.currentStreak >= 7 && !user.badges.includes("streak_7")) {
    newBadgesToAward.push("streak_7");
  }

  // architect: 50 Contributions
  if (totalContributions >= 50 && !user.badges.includes("architect")) {
    newBadgesToAward.push("architect");
  }

  // 5. Transactional DB Updates
  if (titleChanged || newBadgesToAward.length > 0) {
    const updatedBadges = [...user.badges, ...newBadgesToAward];

    await prisma.$transaction(async (tx) => {
      // Update User details
      await tx.user.update({
        where: { id: userId },
        data: {
          ...(titleChanged ? { developerTitle: newTitle } : {}),
          ...(newBadgesToAward.length > 0 ? { badges: updatedBadges } : {}),
        },
      });

      // Dispatch Title Promoted notification if title changed
      if (titleChanged) {
        await tx.notification.create({
          data: {
            userId,
            title: "Title Promoted!",
            message: `You have been promoted to ${newTitle}!`,
            type: "ACHIEVEMENT",
          },
        });
      }

      // Dispatch achievement notifications for each newly unlocked badge
      for (const badgeId of newBadgesToAward) {
        const badgeConfig = BADGES.find((b) => b.id === badgeId);
        const badgeName = badgeConfig ? badgeConfig.name : badgeId;
        await tx.notification.create({
          data: {
            userId,
            title: "New Badge Unlocked!",
            message: `You have earned the ${badgeName} badge!`,
            type: "ACHIEVEMENT",
          },
        });
      }
    });
  }
}
