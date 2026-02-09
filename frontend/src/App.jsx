import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import { apiFetch } from "./api.js";
import Auth from "./components/Auth.jsx";
import GoalCard from "./components/GoalCard.jsx";
import AdSimulator from "./components/AdSimulator.jsx";
import PlatformOverview from "./components/PlatformOverview.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Onboarding from "./components/Onboarding.jsx";
import ConnectedAccounts from "./components/ConnectedAccounts.jsx";
import AddPlatform from "./components/AddPlatform.jsx";
import HashtagSuggestions from "./components/HashtagSuggestions.jsx";
import MomentumMilestones from "./components/MomentumMilestones.jsx";

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

function getOnboardedKey(userId) {
  return userId ? `creatorpulse-onboarded-${userId}` : "creatorpulse-onboarded";
}

export default function App() {
  const { toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [skipAuth, setSkipAuth] = useState(false);

  const userId = user?.id ?? "demo-user";
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return window.localStorage.getItem(getOnboardedKey(userId)) === "true";
  });
  const [goal, setGoal] = useState({
    previousRevenue: 0,
    currentRevenue: 0,
    growthTargetPercent: 30
  });
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tiktokConnecting, setTiktokConnecting] = useState(false);
  const [currentPage, setCurrentPage] = useState("progress");

  // Reset onboarded check when user changes
  useEffect(() => {
    setHasOnboarded(window.localStorage.getItem(getOnboardedKey(userId)) === "true");
  }, [userId]);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
    }).finally(() => {
      if (mounted) setAuthLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const handleOnboardingComplete = (newGoal) => {
    setGoal((prev) => ({
      ...prev,
      previousRevenue: newGoal.previousRevenue ?? prev.previousRevenue,
      growthTargetPercent: newGoal.growthTargetPercent ?? prev.growthTargetPercent
    }));
    window.localStorage.setItem(getOnboardedKey(userId), "true");
    setHasOnboarded(true);
  };

  const handleRestartOnboarding = () => {
    window.localStorage.removeItem(getOnboardedKey(userId));
    setHasOnboarded(false);
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  const handleDisconnectPlatform = async (platform) => {
    try {
      const res = await apiFetch(`/api/accounts/${platform}`, { method: "DELETE" });
      if (res.ok) await loadData();
    } catch {
      // ignore
    }
  };

  const handleConnectTiktok = async () => {
    setTiktokConnecting(true);
    try {
      const res = await apiFetch("/api/auth/tiktok/url");
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        window.location.href = `${window.location.origin}?tiktok_error=url`;
      }
    } catch {
      window.location.href = `${window.location.origin}?tiktok_error=request`;
    } finally {
      setTiktokConnecting(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsRes, platformsRes] = await Promise.all([
        apiFetch("/api/goals"),
        apiFetch("/api/platforms/summary")
      ]);

      const goalsJson = await goalsRes.json();
      const platformsJson = await platformsRes.json();

      const g = goalsJson.goal || {};
      const allPlatforms = platformsJson.platforms || [];

      setPlatforms(allPlatforms);

      const summedRevenue = allPlatforms.reduce(
        (acc, p) => acc + (p.metrics?.revenue || 0),
        0
      );

      setGoal((prev) => ({
        ...prev,
        previousRevenue:
          g.previous_revenue ?? g.previousRevenue ?? prev.previousRevenue,
        currentRevenue:
          g.current_revenue ?? g.currentRevenue ?? (summedRevenue > 0 ? summedRevenue : prev.currentRevenue),
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
    if (user || skipAuth) loadData();
  }, [user, skipAuth]);

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

  const isAuthenticated = supabase ? !!user : skipAuth;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-950 text-slate-400">
        <div className="animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onAuthenticated={() => setSkipAuth(true)} />;
  }

  if (!hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // platforms from API = only live data, no demo
  const visiblePlatforms = platforms;

  const pageTitle =
    currentPage === "accounts"
      ? "Connected accounts"
      : currentPage === "goals"
      ? "Goals overview"
      : currentPage === "reports"
      ? "Reports & experiments"
      : "Progress hub";

  const pageSubtitle =
    currentPage === "accounts"
      ? "See which platforms are connected and manage integrations."
      : currentPage === "goals"
      ? "Track momentum and milestones while you build — revenue follows."
      : currentPage === "reports"
      ? "Review trends and simulations to decide your next experiments."
      : "Stay aligned with your monthly revenue goals, ad momentum and platform health in one calm view.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-5 md:py-8 flex gap-5">
        <Sidebar
          currentPage={currentPage}
          onToggleTheme={toggleTheme}
          onRestartOnboarding={handleRestartOnboarding}
          onNavigate={setCurrentPage}
        />

        <main className="flex-1 space-y-5 md:space-y-6">
          <header className="flex flex-col gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-xs md:text-sm text-slate-300">{pageSubtitle}</p>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <ConnectedAccounts platforms={platforms} onDisconnect={loadData} />
              <div className="flex items-center gap-2">
                {!platforms.some((p) => p.platform.toLowerCase() === "tiktok") && (
                  <button
                    type="button"
                    onClick={handleConnectTiktok}
                    disabled={tiktokConnecting}
                    className="inline-flex items-center rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-500/20 transition-colors disabled:opacity-60"
                  >
                    {tiktokConnecting ? "Redirecting…" : "Connect TikTok"}
                  </button>
                )}
                <div className="flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-800 px-3 py-1.5">
                  <span className="text-[11px] text-slate-300">
                    {user?.email ?? "Demo user"}
                  </span>
                  {user && (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Sign out
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {currentPage === "progress" && (
            <>
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

              <HashtagSuggestions />

              <section className="flex flex-col gap-4 md:gap-5 max-w-3xl">
                <AddPlatform
                  platforms={platforms}
                  onConnectTiktok={handleConnectTiktok}
                  onAdded={loadData}
                />
                {visiblePlatforms.map((p) => (
                  <PlatformOverview
                    key={p.platform}
                    platform={p.platform}
                    handle={p.handle}
                    metrics={p.metrics}
                    hashtagStats={p.hashtags}
                    engagementTrend={(p.engagementTrend || []).map(
                      (value, idx) => ({
                        label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                          idx
                        ],
                        value
                      })
                    )}
                    live={p._live === true}
                    canDisconnect
                    onDisconnect={handleDisconnectPlatform}
                  />
                ))}
                {!loading && visiblePlatforms.length === 0 && (
                  <p className="text-xs text-slate-400 col-span-full">
                    Koppla in minst en plattform ovan för att se dina riktiga
                    siffror.
                  </p>
                )}
              </section>
            </>
          )}

          {currentPage === "accounts" && (
            <section className="flex flex-col gap-4 md:gap-5 max-w-3xl">
              <AddPlatform
                platforms={platforms}
                onConnectTiktok={handleConnectTiktok}
                onAdded={loadData}
              />
              <ConnectedAccounts platforms={platforms} onDisconnect={loadData} />
              {!loading && platforms.length === 0 && (
                <p className="text-xs text-slate-400">
                  Connect at least one platform to start tracking real data.
                </p>
              )}
            </section>
          )}

          {currentPage === "goals" && (
            <>
              <GoalCard
                currentRevenue={goal.currentRevenue}
                previousRevenue={goal.previousRevenue}
                growthTargetPercent={goal.growthTargetPercent}
              />
              <MomentumMilestones platforms={platforms} />
              <p className="text-xs text-slate-400 max-w-md">
                Adjust your targets by restarting onboarding, or use these numbers
                as a compass for your next steps.
              </p>
            </>
          )}

          {currentPage === "reports" && (
            <>
              <AdSimulator
                baseRevenue={goal.currentRevenue}
                baseAdSpend={600}
                targetRevenue={
                  goal.currentRevenue *
                  (1 + (goal.growthTargetPercent || 30) / 100)
                }
              />
              <section className="flex flex-col gap-4 md:gap-5 max-w-3xl">
                {visiblePlatforms.map((p) => (
                  <PlatformOverview
                    key={p.platform}
                    platform={p.platform}
                    handle={p.handle}
                    metrics={p.metrics}
                    hashtagStats={p.hashtags}
                    engagementTrend={(p.engagementTrend || []).map(
                      (value, idx) => ({
                        label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                          idx
                        ],
                        value
                      })
                    )}
                    live={p._live === true}
                    canDisconnect
                    onDisconnect={handleDisconnectPlatform}
                  />
                ))}
                {!loading && visiblePlatforms.length === 0 && (
                  <p className="text-xs text-slate-400 col-span-full">
                    Koppla in minst en plattform för att se rapportkort här.
                  </p>
                )}
              </section>
            </>
          )}

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
