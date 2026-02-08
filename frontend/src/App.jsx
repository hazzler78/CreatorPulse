import { useState, useEffect } from "react";
import { API_BASE } from "./api.js";
import GoalCard from "./components/GoalCard.jsx";
import AdSimulator from "./components/AdSimulator.jsx";
import PlatformOverview from "./components/PlatformOverview.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Onboarding from "./components/Onboarding.jsx";
import ConnectedAccounts from "./components/ConnectedAccounts.jsx";

function useTheme() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("creatorpulse-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("creatorpulse-theme", theme);
  }, [theme]);

  return { theme, toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}

export default function App() {
  const { toggleTheme } = useTheme();
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return window.localStorage.getItem("creatorpulse-onboarded") === "true";
  });
  const [goal, setGoal] = useState({
    previousRevenue: 0,
    currentRevenue: 2600,
    growthTargetPercent: 30
  });
  const [platforms, setPlatforms] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleOnboardingComplete = (newGoal) => {
    setGoal((prev) => ({
      ...prev,
      previousRevenue: newGoal.previousRevenue ?? prev.previousRevenue,
      growthTargetPercent: newGoal.growthTargetPercent ?? prev.growthTargetPercent
    }));
    window.localStorage.setItem("creatorpulse-onboarded", "true");
    setHasOnboarded(true);
  };

  const handleRestartOnboarding = () => {
    window.localStorage.removeItem("creatorpulse-onboarded");
    setHasOnboarded(false);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsRes, platformsRes, accountsRes] = await Promise.all([
        fetch(`${API_BASE}/api/goals`),
        fetch(`${API_BASE}/api/platforms/summary`),
        fetch(`${API_BASE}/api/accounts`)
      ]);

      const goalsJson = await goalsRes.json();
      const platformsJson = await platformsRes.json();
      const accountsJson = await accountsRes.json();

      const g = goalsJson.goal || {};
      const allPlatforms = platformsJson.platforms || [];
      const userAccounts = accountsJson.accounts || [];

      setPlatforms(allPlatforms);
      setAccounts(userAccounts);

      const summedRevenue = allPlatforms.reduce(
        (acc, p) => acc + (p.metrics?.revenue || 0),
        0
      );

      setGoal((prev) => ({
        ...prev,
        previousRevenue:
          g.previous_revenue ?? g.previousRevenue ?? prev.previousRevenue,
        currentRevenue:
          (g.current_revenue ?? g.currentRevenue ?? summedRevenue) || prev.currentRevenue,
        growthTargetPercent:
          g.growth_target_percent ??
          g.growthTargetPercent ??
          prev.growthTargetPercent
      }));
    } catch {
      // keep defaults if backend not reachable
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle TikTok OAuth return: refetch data and clean URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tiktok = params.get("tiktok");
    const tiktokError = params.get("tiktok_error");
    if (tiktok === "connected") {
      loadData();
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (tiktokError) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (!hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const connectedPlatformIds = new Set(accounts.map((a) => a.platform));
  const visiblePlatforms =
    platforms.length && connectedPlatformIds.size
      ? platforms.filter((p) => connectedPlatformIds.has(p.platform.toLowerCase()))
      : platforms.length
      ? platforms
      : []; // fall back to empty until backend returns

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-5 md:py-8 flex gap-5">
        <Sidebar onToggleTheme={toggleTheme} onRestartOnboarding={handleRestartOnboarding} />

        <main className="flex-1 space-y-5 md:space-y-6">
          <header className="flex flex-col gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                Progress hub
              </h1>
              <p className="text-xs md:text-sm text-slate-300">
                Stay aligned with your monthly revenue goals, ad momentum and
                platform health in one calm view.
              </p>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <ConnectedAccounts />
              <div className="flex items-center gap-2">
                <a
                  href={`${API_BASE}/api/auth/tiktok/url`}
                  className="hidden md:inline-flex items-center rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-500 transition-colors"
                >
                  Connect TikTok
                </a>
                <div className="rounded-full bg-slate-900/80 border border-slate-800 px-3 py-1.5 text-[11px] text-slate-300">
                  Logged in • Demo user
                </div>
              </div>
            </div>
          </header>

          <GoalCard
            currentRevenue={goal.currentRevenue}
            previousRevenue={goal.previousRevenue}
            growthTargetPercent={goal.growthTargetPercent}
          />

          <AdSimulator
            baseRevenue={goal.currentRevenue}
            baseAdSpend={600}
            targetRevenue={
              goal.currentRevenue *
              (1 + (goal.growthTargetPercent || 30) / 100)
            }
          />

          <section className="grid md:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-5">
            {visiblePlatforms.map((p) => (
              <PlatformOverview
                key={p.platform}
                platform={p.platform}
                handle={p.handle}
                metrics={p.metrics}
                hashtagStats={p.hashtags}
                engagementTrend={(p.engagementTrend || []).map((value, idx) => ({
                  label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx],
                  value
                }))}
                live={p._live === true}
              />
            ))}
            {!loading && visiblePlatforms.length === 0 && (
              <p className="text-xs text-slate-400 col-span-full">
                Connect at least one platform in onboarding to see detailed cards here.
              </p>
            )}
          </section>

          <footer className="pt-2 pb-1 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>
              Built for creators scaling from side-income to{" "}
              <span className="text-slate-300 font-medium">
                sustainable freedom
              </span>
              .{" "}
              <a href="/terms" className="text-slate-400 hover:text-slate-300 transition-colors">
                Terms of Service
              </a>
              {" · "}
              <a href="/privacy" className="text-slate-400 hover:text-slate-300 transition-colors">
                Privacy Policy
              </a>
            </span>
            <span className="hidden md:inline text-slate-500">
              Future: live TikTok / Facebook data, Stripe-powered premium,
              deeper hashtag intelligence.
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

