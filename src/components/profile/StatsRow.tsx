import { Flame, Trophy, Award } from "lucide-react";

interface StatsRowProps {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  lastActiveAt: Date | null;
}

export default function StatsRow({
  currentStreak,
  longestStreak,
  totalContributions,
  lastActiveAt,
}: StatsRowProps) {
  // Determine if active today in UTC
  let isActiveToday = false;
  if (lastActiveAt) {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const lastActive = new Date(lastActiveAt);
    const lastActiveUTC = new Date(Date.UTC(lastActive.getUTCFullYear(), lastActive.getUTCMonth(), lastActive.getUTCDate()));
    isActiveToday = lastActiveUTC.getTime() === todayUTC.getTime();
  }

  const showFlame = currentStreak > 0 && isActiveToday;

  return (
    <div className="bg-gradient-to-br from-card to-card/95 border border-border rounded-xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x md:divide-border/40">
        {/* Current Streak */}
        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <span className="text-4xl font-semibold tracking-tighter text-foreground">
              {currentStreak}
            </span>
            {showFlame ? (
              <Flame className="w-8 h-8 text-orange-500 fill-orange-500 animate-pulse filter drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
            ) : (
              <Flame className="w-8 h-8 text-muted-foreground/30" />
            )}
          </div>
          <span className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
            Current Streak
          </span>
        </div>

        {/* Longest Streak */}
        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <span className="text-4xl font-semibold tracking-tighter text-foreground">
              {longestStreak}
            </span>
            <Trophy className="w-7 h-7 text-amber-500/80" />
          </div>
          <span className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
            Longest Streak
          </span>
        </div>

        {/* Total Contributions */}
        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <span className="text-4xl font-semibold tracking-tighter text-foreground">
              {totalContributions}
            </span>
            <Award className="w-7 h-7 text-indigo-500/80" />
          </div>
          <span className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
            Total Contributions
          </span>
        </div>
      </div>
    </div>
  );
}
