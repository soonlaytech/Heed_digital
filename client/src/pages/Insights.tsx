import { useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO, subDays, differenceInCalendarDays, isToday } from "date-fns";
import { Activity, Flame, HeartPulse, Smile, Meh, Frown, TrendingUp, CalendarDays } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckins } from "@/hooks/use-checkins";

const MOOD_SCORE: Record<string, number> = {
  good: 3,
  neutral: 2,
  bad: 1,
};

const MOOD_COLOR: Record<string, string> = {
  good: "#22c55e",
  neutral: "#f59e0b",
  bad: "#ef4444",
};

const MOOD_ICON: Record<string, typeof Smile> = {
  good: Smile,
  neutral: Meh,
  bad: Frown,
};

type CheckinRecord = {
  id: number | string;
  date: string;
  mood: string | null;
  activities?: unknown;
  skipped?: boolean | null;
};

function calcStreak(checkins: CheckinRecord[]) {
  if (!checkins.length) return 0;
  const dates = new Set(checkins.filter((c) => !c.skipped).map((c) => c.date));
  let streak = 0;
  let cursor = new Date();
  while (dates.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export default function Insights() {
  const { data: checkins, isLoading } = useCheckins();

  const records: CheckinRecord[] = useMemo(
    () => ((checkins as CheckinRecord[] | undefined) ?? []).filter((c) => Boolean(c.date)),
    [checkins],
  );

  const sortedByDate = useMemo(
    () => [...records].sort((a, b) => a.date.localeCompare(b.date)),
    [records],
  );

  const trendData = useMemo(() => {
    const map = new Map<string, number>();
    sortedByDate.forEach((c) => {
      const score = c.mood ? MOOD_SCORE[c.mood] : undefined;
      if (score !== undefined) map.set(c.date, score);
    });

    const today = new Date();
    const result: { date: string; label: string; score: number | null }[] = [];
    for (let i = 13; i >= 0; i -= 1) {
      const d = subDays(today, i);
      const key = format(d, "yyyy-MM-dd");
      const score = map.get(key);
      result.push({
        date: key,
        label: format(d, "MMM d"),
        score: score ?? null,
      });
    }
    return result;
  }, [sortedByDate]);

  const moodDistribution = useMemo(() => {
    const counts: Record<string, number> = { good: 0, neutral: 0, bad: 0 };
    records.forEach((c) => {
      if (c.mood && counts[c.mood] !== undefined) counts[c.mood] += 1;
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [records]);

  const streak = useMemo(() => calcStreak(records), [records]);
  const totalCheckins = records.filter((c) => !c.skipped).length;
  const avgScore = useMemo(() => {
    const scores = records
      .map((c) => (c.mood ? MOOD_SCORE[c.mood] : undefined))
      .filter((v): v is number => v !== undefined);
    if (!scores.length) return null;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, [records]);

  const lastCheckin = sortedByDate[sortedByDate.length - 1];
  const daysSinceLast = lastCheckin
    ? differenceInCalendarDays(new Date(), parseISO(lastCheckin.date))
    : null;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 pt-12 pb-32 md:pt-20">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-8 h-80 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pt-12 pb-32 md:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">Your journey</p>
          <h1 className="mt-1 font-display text-4xl font-bold text-foreground">Insights</h1>
          <p className="mt-2 text-muted-foreground">
            A gentle reflection of how the past two weeks have unfolded.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Flame}
            label="Current streak"
            value={streak > 0 ? `${streak} day${streak === 1 ? "" : "s"}` : "Start today"}
            hint={streak > 0 ? "You're showing up." : "One check-in begins it."}
            accent="text-orange-500"
          />
          <StatCard
            icon={CalendarDays}
            label="Total check-ins"
            value={String(totalCheckins)}
            hint={totalCheckins === 0 ? "No reflections yet." : "Moments you paused."}
            accent="text-primary"
          />
          <StatCard
            icon={HeartPulse}
            label="Average mood"
            value={
              avgScore === null
                ? "—"
                : avgScore >= 2.5
                  ? "Mostly good"
                  : avgScore >= 1.7
                    ? "Mixed"
                    : "Tender"
            }
            hint={avgScore === null ? "Add your first check-in." : `Score: ${avgScore.toFixed(1)} / 3`}
            accent="text-pink-500"
          />
          <StatCard
            icon={Activity}
            label="Last reflection"
            value={
              daysSinceLast === null
                ? "—"
                : daysSinceLast === 0
                  ? "Today"
                  : daysSinceLast === 1
                    ? "Yesterday"
                    : `${daysSinceLast} days ago`
            }
            hint={lastCheckin ? format(parseISO(lastCheckin.date), "MMM d, yyyy") : "Awaiting your first."}
            accent="text-emerald-500"
          />
        </section>

        <section className="mt-10 rounded-3xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-semibold">Mood over the last 14 days</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                3 = good · 2 = neutral · 1 = tender. Empty days are unreported.
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #eee" }}
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : null;
                    const label =
                      n === 3 ? "Good" : n === 2 ? "Neutral" : n === 1 ? "Tender" : "No check-in";
                    return [label, "Mood"];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill="url(#moodGradient)"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-foreground">14-day calendar</h2>
            <p className="mt-1 text-xs text-muted-foreground">Each square is one day.</p>
            <div className="mt-5 grid grid-cols-7 gap-2">
              {trendData.map((d) => {
                const mood =
                  d.score === 3 ? "good" : d.score === 2 ? "neutral" : d.score === 1 ? "bad" : "empty";
                const Icon = mood === "empty" ? null : MOOD_ICON[mood];
                const bg =
                  mood === "good"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : mood === "neutral"
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : mood === "bad"
                        ? "bg-red-100 text-red-700 border-red-200"
                        : "bg-muted/60 text-muted-foreground border-border";
                const isCurrent = isToday(parseISO(d.date));
                return (
                  <div
                    key={d.date}
                    title={`${d.label} • ${mood === "empty" ? "no check-in" : mood}`}
                    className={`flex aspect-square flex-col items-center justify-center rounded-xl border text-[10px] font-semibold ${bg} ${isCurrent ? "ring-2 ring-primary/40" : ""}`}
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : <span className="opacity-40">·</span>}
                    <span className="mt-0.5">{format(parseISO(d.date), "d")}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-foreground">Mood distribution</h2>
            <p className="mt-1 text-xs text-muted-foreground">All time, across recorded moods.</p>
            {moodDistribution.length === 0 ? (
              <div className="mt-10 rounded-2xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                Once you record a few moods, you'll see the balance here.
              </div>
            ) : (
              <div className="mt-2 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {moodDistribution.map((entry) => (
                        <Cell key={entry.name} fill={MOOD_COLOR[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value} day${value === 1 ? "" : "s"}`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {moodDistribution.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {moodDistribution.map((m) => (
                  <span key={m.name} className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium capitalize">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MOOD_COLOR[m.name] }} />
                    {m.name} · {m.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
