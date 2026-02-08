import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

function projectRevenue({ baseRevenue, baseAdSpend, extraSpend }) {
  const days = 30;
  const baseDaily = baseRevenue / days;
  const roas = baseRevenue / Math.max(baseAdSpend, 1);
  const projectedLift = extraSpend * Math.max(roas * 0.7, 0.8);

  const data = [];
  for (let d = 1; d <= days; d++) {
    const factor = d / days;
    const organic = baseDaily * d * (1 + factor * 0.1);
    const paid = (baseAdSpend + extraSpend) * (roas / days) * factor;
    data.push({
      day: `Day ${d}`,
      organic: Math.round(organic),
      paid: Math.round(paid),
      total: Math.round(organic + paid)
    });
  }

  return { data, projectedLift };
}

const formatCurrency = (value) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);

export default function AdSimulator({
  baseRevenue = 2500,
  baseAdSpend = 600,
  targetRevenue = 5000
}) {
  const [extraSpend, setExtraSpend] = useState(500);

  const { data, projectedLift } = useMemo(
    () => projectRevenue({ baseRevenue, baseAdSpend, extraSpend }),
    [baseRevenue, baseAdSpend, extraSpend]
  );

  const projectedRevenue = baseRevenue + projectedLift;
  const newProgress = Math.min((projectedRevenue / targetRevenue) * 100, 130);
  const roas = baseRevenue / Math.max(baseAdSpend, 1);
  const newRoas = projectedRevenue / Math.max(baseAdSpend + extraSpend, 1);

  return (
    <motion.div
      className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 md:p-8 space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold tracking-tight">
            Ad investment simulator
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            Explore how increasing your paid budget can accelerate your path to
            this month&apos;s revenue goal. Based on your current ROAS trend.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-6 md:gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Extra ad budget this month</span>
              <span className="font-medium">
                {formatCurrency(extraSpend)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2000}
              step={50}
              value={extraSpend}
              onChange={(e) => setExtraSpend(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>+€0</span>
              <span>+€1000</span>
              <span>+€2000</span>
            </div>
          </div>

          <div className="h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="organicArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="paidArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f2937"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={{ stroke: "#111827" }}
                  tickLine={{ stroke: "#111827" }}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={{ stroke: "#111827" }}
                  tickLine={{ stroke: "#111827" }}
                  tickFormatter={(v) => `€${Math.round(v / 100) * 100}`}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    borderRadius: 12,
                    border: "1px solid #1f2937",
                    padding: "10px 12px"
                  }}
                  labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
                  itemStyle={{ fontSize: 11 }}
                  formatter={(value, name) => [
                    formatCurrency(value),
                    name === "organic"
                      ? "Organic"
                      : name === "paid"
                      ? "Paid"
                      : "Total"
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  height={24}
                  wrapperStyle={{ paddingBottom: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="organic"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#organicArea)"
                  name="Organic"
                />
                <Area
                  type="monotone"
                  dataKey="paid"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#paidArea)"
                  name="Paid"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Projected revenue</span>
              </div>
              <div className="text-lg font-semibold">
                {formatCurrency(projectedRevenue)}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10">
                  ↑
                </span>
                +{formatCurrency(projectedLift)} vs now
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>ROAS trend</span>
              </div>
              <div className="text-lg font-semibold">
                {newRoas.toFixed(2)}x
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10">
                  ↗
                </span>
                from {roas.toFixed(2)}x current
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 text-sm">
                ✦
              </span>
              <div>
                <div className="text-sm font-medium">
                  Momentum boost suggestion
                </div>
                <div className="text-xs text-slate-300">
                  Based on your current trajectory and audience response.
                </div>
              </div>
            </div>

            <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside">
              <li>
                Allocate <span className="font-semibold">60%</span> of the
                extra budget to your top-performing TikTok content and{" "}
                <span className="font-semibold">40%</span> to Facebook retargeting.
              </li>
              <li>
                Prioritize creatives using hashtags that already show strong
                engagement to compound your organic lift.
              </li>
              <li>
                If performance stays consistent, this budget level could bring
                you within{" "}
                <span className="font-semibold">
                  {Math.round(newProgress)}% of your monthly goal.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

