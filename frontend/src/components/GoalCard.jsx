import { motion } from "framer-motion";

const formatCurrency = (value) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);

const formatPercent = (value) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1
  }).format(value);

/**
 * We treat "being on track" as a growth question rather than an absolute money target.
 *
 * - currentRevenue: this month's revenue so far
 * - previousRevenue: last month's revenue (baseline). If 0, we treat "now" as the start.
 * - growthTargetPercent: desired % growth vs baseline (e.g. 30 for +30%)
 *
 * We still show money numbers, but the main progress ring and bar are:
 *   progress = actualGrowthPercent / growthTargetPercent
 */
export default function GoalCard({
  currentRevenue,
  previousRevenue,
  growthTargetPercent
}) {
  const hasBaseline = !!previousRevenue && previousRevenue > 0;
  const safePrev = hasBaseline ? previousRevenue : Math.max(currentRevenue || 0, 1);
  const absoluteDiff = currentRevenue - safePrev;
  const rawGrowthPercent = (absoluteDiff / safePrev) * 100;
  // When there's no baseline (first month / no data), show 0% instead of -100%
  const actualGrowthPercent = hasBaseline ? rawGrowthPercent : Math.max(0, rawGrowthPercent);
  const targetGrowth = growthTargetPercent || 0;

  const growthProgressRaw =
    targetGrowth > 0 ? (actualGrowthPercent / targetGrowth) * 100 : 0;
  const progress = Math.max(0, Math.min(growthProgressRaw, 150)); // cap to 150% to show "over-achievement"

  const remainingGrowth =
    targetGrowth > 0 ? Math.max(targetGrowth - actualGrowthPercent, 0) : null;

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-8 w-64 h-64 bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-8 w-72 h-72 bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative flex-1 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 border border-slate-700/60 px-3 py-1 text-xs font-medium text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Growth on track
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Monthly growth goal
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-xl">
          Stay aligned with your target and see exactly how much momentum you
          need to grow beyond last month across your connected platforms.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs md:text-sm text-slate-300">
            <span>Revenue so far</span>
            <span>
              <span className="font-semibold">
                {formatCurrency(currentRevenue)}
              </span>
              {hasBaseline && (
                <>
                  <span className="mx-1 text-slate-500">/</span>
                  {formatCurrency(previousRevenue)} last month
                </>
              )}
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 via-emerald-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center justify-between text-xs md:text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {hasBaseline ? "Growth vs last month" : "Momentum from your start"}
            </span>
            <span className="text-right">
              <span className="font-semibold">
                {formatPercent(actualGrowthPercent)}%
              </span>
              {targetGrowth > 0 && (
                <>
                  <span className="mx-1 text-slate-500">/</span>
                  <span className="font-semibold">
                    {formatPercent(targetGrowth)}%
                  </span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center gap-4 min-w-[180px]">
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
            <circle
              cx="80"
              cy="80"
              r="64"
              className="stroke-slate-800"
              strokeWidth="10"
              fill="transparent"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="64"
              stroke="url(#goalGradient)"
              strokeWidth="10"
              fill="transparent"
              strokeLinecap="round"
              initial={{ strokeDasharray: 0, strokeDashoffset: 0 }}
              animate={{
                strokeDasharray: `${(progress * 2 * Math.PI * 64) / 100} ${
                  2 * Math.PI * 64
                }`,
                strokeDashoffset: 0
              }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Growth
            </div>
            <div className="text-2xl font-semibold">
              {formatPercent(actualGrowthPercent)}%
            </div>
          </div>
        </div>

        <div className="text-center space-y-1">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Target this month
          </div>
          <div className="text-sm md:text-base font-semibold">
            {targetGrowth > 0
              ? `Aim for +${formatPercent(targetGrowth)}% vs last month`
              : "Set a growth % target to track your pace"}
          </div>
          <div className="text-[11px] text-slate-400">
            {targetGrowth > 0 && remainingGrowth !== null
              ? `You need ~${formatPercent(
                  remainingGrowth
                )}% more growth to fully hit this target.`
              : "Growth is often non-linear — the goal is consistent upward momentum, not perfection."}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

