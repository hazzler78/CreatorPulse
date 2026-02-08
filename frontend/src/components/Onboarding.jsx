import { useState } from "react";
import { apiFetch } from "../api.js";

const PLATFORMS = [
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
  { id: "youtube", label: "YouTube" },
  { id: "spotify", label: "Spotify" }
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [growthMetric, setGrowthMetric] = useState("revenue");
  const [growthStage, setGrowthStage] = useState("steady"); // early | steady | mature

  const [selectedPlatforms, setSelectedPlatforms] = useState(() =>
    PLATFORMS.reduce(
      (acc, p) => ({ ...acc, [p.id]: { enabled: p.id === "tiktok" || p.id === "facebook", handle: "" } }),
      {}
    )
  );
  const [saving, setSaving] = useState(false);

  const togglePlatform = (id) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled }
    }));
  };

  const updateHandle = (id, handle) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [id]: { ...prev[id], handle }
    }));
  };

  const handleFinish = async () => {
    try {
      setSaving(true);

      const enabled = PLATFORMS.filter((p) => selectedPlatforms[p.id]?.enabled);

      // Hit backend in demo mode so you can test quickly
      await Promise.all(
        enabled.map((p) =>
          apiFetch("/api/accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              platform: p.id,
              handle:
                selectedPlatforms[p.id]?.handle?.trim() ||
                `@${p.id}-demo`,
              mode: "demo"
            })
          })
        )
      );

      const stageDefaults = {
        early: 50,
        steady: 30,
        mature: 15
      };

      const goal = {
        growthMetric,
        // We don't force you to guess last month's revenue; we let the system
        // treat "now" as the starting point.
        previousRevenue: 0,
        growthTargetPercent: stageDefaults[growthStage] ?? 30
      };

      if (onComplete) {
        onComplete(goal, enabled);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900/80 border border-slate-800 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-700 px-3 py-1 text-[11px] text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              First-time setup
            </div>
            <h1 className="mt-3 text-xl md:text-2xl font-semibold tracking-tight">
              Let&apos;s tune CreatorPulse to you
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300">
              We&apos;ll focus on growth first and wire in your social accounts so
              your Progress Hub feels like home from day one.
            </p>
          </div>
          <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-500 via-emerald-400 to-sky-400 text-slate-950 font-semibold">
            C
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full ${
                step >= s ? "bg-emerald-500" : "bg-slate-800"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-slate-100">
              What kind of growth do you care about right now?
            </h2>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setGrowthMetric("revenue")}
                className={`rounded-2xl border px-3 py-2 text-left ${
                  growthMetric === "revenue"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                    : "border-slate-700 bg-slate-900 text-slate-200"
                }`}
              >
                <div className="font-medium">Revenue</div>
                <div className="text-[11px] text-slate-400">
                  Track € growth month over month.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setGrowthMetric("audience")}
                className={`rounded-2xl border px-3 py-2 text-left ${
                  growthMetric === "audience"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                    : "border-slate-700 bg-slate-900 text-slate-200"
                }`}
              >
                <div className="font-medium">Audience</div>
                <div className="text-[11px] text-slate-400">
                  Followers, listeners, subscribers.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setGrowthMetric("engagement")}
                className={`rounded-2xl border px-3 py-2 text-left ${
                  growthMetric === "engagement"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                    : "border-slate-700 bg-slate-900 text-slate-200"
                }`}
              >
                <div className="font-medium">Engagement</div>
                <div className="text-[11px] text-slate-400">
                  Comments, saves, watch time.
                </div>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-[11px] text-slate-400">
                No need to guess exact numbers. Just pick the pace of growth that
                feels right and we&apos;ll calibrate the dashboard for you.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGrowthStage("early")}
                  className={`rounded-2xl border px-3 py-2 text-left ${
                    growthStage === "early"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-700 bg-slate-900 text-slate-200"
                  }`}
                >
                  <div className="font-medium">Finding signals</div>
                  <div className="text-[11px] text-slate-400">
                    You&apos;re testing, experimenting, chasing first wins.
                    We&apos;ll assume a bold growth target.
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setGrowthStage("steady")}
                  className={`rounded-2xl border px-3 py-2 text-left ${
                    growthStage === "steady"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-700 bg-slate-900 text-slate-200"
                  }`}
                >
                  <div className="font-medium">Steady climb</div>
                  <div className="text-[11px] text-slate-400">
                    You&apos;re getting traction and want a sustainable, clear
                    sense of upward momentum.
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setGrowthStage("mature")}
                  className={`rounded-2xl border px-3 py-2 text-left ${
                    growthStage === "mature"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-700 bg-slate-900 text-slate-200"
                  }`}
                >
                  <div className="font-medium">Protecting gains</div>
                  <div className="text-[11px] text-slate-400">
                    You care more about consistency and stability than huge leaps.
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-slate-100">
              Which platforms do you want CreatorPulse to track?
            </h2>
            <p className="text-[11px] text-slate-400">
              For now we&apos;ll connect them in demo mode so you can feel the flow.
              Later, we&apos;ll swap this to real OAuth connections.
            </p>
            <div className="space-y-2">
              {PLATFORMS.map((p) => {
                const state = selectedPlatforms[p.id];
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-slate-950/70 border border-slate-800 px-3 py-2.5"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-100">
                        {p.label}
                      </div>
                      <input
                        type="text"
                        placeholder={`@${p.id} handle / channel`}
                        value={state?.handle || ""}
                        onChange={(e) => updateHandle(p.id, e.target.value)}
                        className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`text-[11px] rounded-full px-3 py-1.5 border ${
                        state?.enabled
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                          : "border-slate-700 bg-slate-900 text-slate-300"
                      }`}
                    >
                      {state?.enabled ? "Tracking" : "Not now"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-sm font-medium text-slate-100">
              You&apos;re ready for your Progress Hub
            </h2>
            <p className="text-slate-300">
              CreatorPulse will focus on{" "}
              <span className="font-semibold">
                {growthMetric === "revenue"
                  ? "revenue growth"
                  : growthMetric === "audience"
                  ? "audience growth"
                  : "engagement depth"}
              </span>{" "}
              and track your accounts so you can see your upward momentum at a
              glance.
            </p>
            <ul className="space-y-1.5">
              <li>
                <span className="text-slate-400">Growth target:</span>{" "}
                <span className="font-semibold text-slate-100">
                  We&apos;ll set a realistic growth pace based on your stage so
                  you never have to guess numbers.
                </span>
              </li>
              <li>
                <span className="text-slate-400">Platforms:</span>{" "}
                <span className="font-semibold text-slate-100">
                  {PLATFORMS.filter((p) => selectedPlatforms[p.id]?.enabled)
                    .map((p) => p.label)
                    .join(", ") || "None yet"}
                </span>
              </li>
            </ul>
            <p className="text-[11px] text-slate-400">
              You can always tweak your growth target and platforms later. The
              important thing is that you keep moving and let the dashboard
              reflect your journey.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 text-xs">
          <button
            type="button"
            disabled={step === 1 || saving}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="rounded-full border border-slate-700 px-3 py-1.5 text-slate-300 disabled:opacity-40 disabled:cursor-default hover:border-slate-500 transition-colors"
          >
            Back
          </button>
          <div className="flex items-center gap-2">
            {step < 3 && (
              <button
                type="button"
                disabled={saving}
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                className="rounded-full bg-slate-100 text-slate-900 px-4 py-1.5 font-medium hover:bg-white transition-colors"
              >
                Continue
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                disabled={saving}
                onClick={handleFinish}
                className="rounded-full bg-emerald-500 text-slate-950 px-4 py-1.5 font-medium hover:bg-emerald-400 transition-colors disabled:opacity-60"
              >
                {saving ? "Saving…" : "Go to Progress Hub"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

