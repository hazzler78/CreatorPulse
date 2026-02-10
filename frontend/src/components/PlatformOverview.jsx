import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: value >= 10000 ? "compact" : "standard"
  }).format(value);

function HashtagPill({ tag, lift, isTop }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-between rounded-full px-3 py-1.5 text-xs ${
        isTop
          ? "bg-emerald-500/10 border border-emerald-500/40 text-emerald-100"
          : "bg-slate-900/70 border border-slate-800 text-slate-200"
      }`}
    >
      <span className="font-medium">{tag}</span>
      <span className="flex items-center gap-1 text-[11px]">
        <span className="text-emerald-400">↑</span>
        {lift.toFixed(1)}x
      </span>
    </div>
  );
}

function computeMomentumStatus(engagementTrend = []) {
  if (!Array.isArray(engagementTrend) || engagementTrend.length < 2) {
    return {
      label: "Momentum building",
      tone: "neutral"
    };
  }

  const first = Number(engagementTrend[0]?.value ?? 0);
  const last = Number(engagementTrend[engagementTrend.length - 1]?.value ?? 0);
  const baseline = Math.max(first, 1);
  const change = last - first;
  const changePct = (change / baseline) * 100;

  if (changePct >= 40 && last >= 5) {
    return {
      label: "Momentum spike",
      tone: "spike"
    };
  }

  if (changePct >= 15) {
    return {
      label: "Momentum building",
      tone: "up"
    };
  }

  if (changePct <= -15) {
    return {
      label: "Cooling off",
      tone: "down"
    };
  }

  return {
    label: "Stable this week",
    tone: "stable"
  };
}

export default function PlatformOverview({
  platform,
  handle,
  avatarColor,
  metrics,
  hashtagStats,
  engagementTrend,
  live = false,
  canDisconnect = false,
  onDisconnect
}) {
  const primaryColor =
    platform === "TikTok" ? "#22c55e" : platform === "Facebook" ? "#3b82f6" : "#6366f1";
  const momentum = computeMomentumStatus(engagementTrend);

  const momentumClasses =
    momentum.tone === "spike"
      ? "bg-emerald-500/15 border border-emerald-400/70 text-emerald-100"
      : momentum.tone === "up"
      ? "bg-emerald-500/10 border border-emerald-500/50 text-emerald-200"
      : momentum.tone === "down"
      ? "bg-rose-500/10 border border-rose-500/60 text-rose-100"
      : "bg-amber-500/10 border border-amber-400/60 text-amber-100";

  return (
    <motion.div
      className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 md:p-6 space-y-4"
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center text-lg font-semibold text-slate-900 shadow-lg"
            style={{
              background:
                avatarColor ||
                (platform === "TikTok"
                  ? "linear-gradient(135deg,#22c55e,#14b8a6)"
                  : "linear-gradient(135deg,#3b82f6,#6366f1)")
            }}
          >
            {platform[0]}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              {platform}
            </div>
            <div className="text-sm md:text-base font-medium">@{String(handle || "").replace(/^@+/, "")}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {canDisconnect && onDisconnect && (
            <button
              type="button"
              onClick={() => onDisconnect(platform.toLowerCase())}
              className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-2.5 py-1 text-[11px] text-slate-400 hover:border-red-500/50 hover:text-red-400 transition-colors"
              title={`Koppla bort ${platform}`}
            >
              Koppla bort
            </button>
          )}
          {live && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 text-[11px] text-amber-200">
              Live
            </span>
          )}
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] ${momentumClasses}`}
          >
            <span className="text-xs">
              {momentum.tone === "down" ? "↘" : momentum.tone === "stable" ? "→" : "⬈"}
            </span>
            {momentum.label}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm">
        <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-2.5 space-y-1">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            Monthly revenue
          </div>
          <div className="text-sm md:text-base font-semibold">
            €{formatNumber(metrics.revenue)}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            ↑ {metrics.revenueChange.toFixed(1)}% vs last month
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-2.5 space-y-1">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            Engagement rate
          </div>
          <div className="text-sm md:text-base font-semibold">
            {metrics.engagement.toFixed(1)}%
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            ↑ {metrics.engagementChange.toFixed(1)} pts
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-2.5 space-y-1">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            {platform === "Spotify" ? "Followers" : "Top content"}
          </div>
          <div className="text-sm md:text-base font-semibold">
            {formatNumber(metrics.topPostViews)}{" "}
            {platform === "Spotify" ? "followers" : "views"}
          </div>
          <div className="text-[11px] text-slate-300">
            {metrics.topPostLabel}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)] gap-4 md:gap-5">
        <div className="h-36 min-h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagementTrend} margin={{ left: -18, right: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f2937"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={{ stroke: "#020617" }}
                tickLine={{ stroke: "#020617" }}
                tickMargin={6}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={{ stroke: "#020617" }}
                tickLine={{ stroke: "#020617" }}
                tickFormatter={(v) => `${v}%`}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "#020617",
                  borderRadius: 10,
                  border: "1px solid #1f2937",
                  padding: "8px 10px"
                }}
                labelStyle={{ color: "#e5e7eb", fontSize: 11 }}
                itemStyle={{ fontSize: 11 }}
                formatter={(value) => [`${value.toFixed(1)}%`, "Engagement"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={primaryColor}
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>Top hashtags</span>
            <span className="shrink-0">
              Avg. lift:{" "}
              <span className="font-medium text-emerald-300">
                {hashtagStats
                  .reduce((acc, h) => acc + h.lift, 0)
                  .toFixed(1)}
                x
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtagStats.map((h, idx) => (
              <HashtagPill
                key={h.tag}
                tag={h.tag}
                lift={h.lift}
                isTop={idx === 0}
              />
            ))}
          </div>
          <p className="text-[11px] text-slate-400 pt-2 leading-relaxed">
            Keep leaning into the hashtags above on days with slower traction.
            Consistency compounds your reach even when the algorithm feels quiet.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

