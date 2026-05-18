"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TrendingUp, Search, Zap, Activity, BarChart3 } from "lucide-react";

// ── Types ──────────────────────────────────────────────────
interface DailyUsage {
  date: string;
  count: number;
}

interface SkillRank {
  skill: string;
  count: number;
}

interface AnalyticsChartsProps {
  dailyUsage: DailyUsage[];
  topSkills: SkillRank[];
  totalEvents: number;
  todayEvents: number;
  uniqueUsers: number;
}

// ── Custom Tooltip ─────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl px-4 py-3 text-sm">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">
        <span className="font-bold text-foreground">{payload[0].value}</span>{" "}
        events
      </p>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-xl p-5 transition-all hover:shadow-lg hover:border-primary/30 group">
      {/* Subtle gradient glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: accent ?? "hsl(var(--primary) / 0.1)" }}
        >
          <Icon className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
        </div>
      </div>
    </div>
  );
}

// ── Skill Rank Bar ─────────────────────────────────────────
const RANK_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function SkillRankList({ skills }: { skills: SkillRank[] }) {
  if (!skills.length)
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
        <Search className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">No search data recorded yet.</p>
      </div>
    );

  const maxCount = skills[0]?.count ?? 1;

  return (
    <div className="space-y-3">
      {skills.map((s, i) => (
        <div key={s.skill} className="group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: RANK_COLORS[i % RANK_COLORS.length] }}
              />
              {s.skill}
            </span>
            <span className="text-xs font-semibold text-muted-foreground tabular-nums">
              {s.count}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(s.count / maxCount) * 100}%`,
                backgroundColor: RANK_COLORS[i % RANK_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard Component ───────────────────────────────
export default function AnalyticsCharts({
  dailyUsage,
  topSkills,
  totalEvents,
  todayEvents,
  uniqueUsers,
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-8">
      {/* ── KPI Row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Events (7d)" value={totalEvents} icon={Activity} />
        <StatCard title="Today's Events" value={todayEvents} icon={Zap} />
        <StatCard title="Unique Users" value={uniqueUsers} icon={TrendingUp} />
      </div>

      {/* ── Charts Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Line Chart — Tool Usage Over 7 Days */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">
              Tool Usage — Last 7 Days
            </h3>
          </div>

          {dailyUsage.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Activity className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No usage data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyUsage}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: "hsl(var(--primary))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: "hsl(var(--primary))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Skill Demand Ranked List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">
              Top Searched Skills
            </h3>
          </div>
          <SkillRankList skills={topSkills} />
        </div>
      </div>
    </div>
  );
}
