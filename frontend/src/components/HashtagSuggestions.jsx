import { useEffect, useState, useMemo } from "react";
import { getTikTokHashtagIntel, getYouTubeKeywordIntel } from "../hashtagIntel.js";

const TREND_POOL = {
  tiktok: [
    "#fyp",
    "#shorts",
    "#kpop",
    "#kpopdance",
    "#outfitinspo",
    "#smallcreator",
    "#pov"
  ],
  youtube: [
    "#shorts",
    "#kpop",
    "#kpopdance",
    "#outfitinspo",
    "#originalsong",
    "#studiovlog"
  ]
};

function buildTikTokSuggestion(intel) {
  if (!intel) return null;
  const brand = intel.brandTag || "#velvetorionx";
  const sorted = [...(intel.hashtags || [])].sort(
    (a, b) => (b.lift ?? 0) - (a.lift ?? 0)
  );
  const winners = sorted
    .map((h) => h.tag)
    .filter((tag) => !!tag && tag.toLowerCase() !== brand.toLowerCase());

  const topCore = winners.slice(0, 2);

  const trendCandidates = TREND_POOL.tiktok.filter(
    (tag) =>
      !topCore.includes(tag) &&
      tag.toLowerCase() !== brand.toLowerCase()
  );
  const trends = trendCandidates.slice(0, 2);

  const fullSet = [brand, ...topCore, ...trends].slice(0, 5);

  return {
    tags: fullSet,
    explanation:
      "1 brand + 2 of your top performers + 2 trend/experiment slots. Swap trend tags based on today’s video."
  };
}

function buildYouTubeSuggestion(intel) {
  if (!intel) return null;
  const sorted = [...(intel.keywords || [])].sort(
    (a, b) => (b.lift ?? 0) - (a.lift ?? 0)
  );
  const winners = sorted.map((k) => k.keyword).filter(Boolean);
  const topCore = winners.slice(0, 3);

  const trends = TREND_POOL.youtube.filter((tag) => !topCore.includes(tag)).slice(0, 2);

  return {
    tags: [...topCore, ...trends].slice(0, 5),
    explanation:
      "Mix your best-performing video tags with a couple of current trend tags when you write title/description."
  };
}

export default function HashtagSuggestions() {
  const [tikTokIntel, setTikTokIntel] = useState(null);
  const [ytIntel, setYtIntel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [tt, yt] = await Promise.allSettled([
          getTikTokHashtagIntel(),
          getYouTubeKeywordIntel()
        ]);
        if (cancelled) return;
        if (tt.status === "fulfilled") setTikTokIntel(tt.value);
        if (yt.status === "fulfilled") setYtIntel(yt.value);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load hashtag suggestions");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tiktokSuggestion = useMemo(
    () => buildTikTokSuggestion(tikTokIntel),
    [tikTokIntel]
  );
  const youtubeSuggestion = useMemo(
    () => buildYouTubeSuggestion(ytIntel),
    [ytIntel]
  );

  if (!tiktokSuggestion && !youtubeSuggestion && !error) {
    return null;
  }

  return (
    <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 md:p-5 space-y-4 max-w-3xl">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm md:text-base font-semibold tracking-tight">
            Suggested hashtags for your next posts
          </h2>
          <p className="text-[11px] md:text-xs text-slate-400">
            Based on your own performance plus a small trend pool. Treat these as a starting
            point and swap tags to fit each video.
          </p>
        </div>
      </header>

      {error && (
        <p className="text-[11px] text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {tiktokSuggestion && (
          <div className="space-y-2 rounded-2xl bg-slate-950/70 border border-slate-800 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-200">TikTok set</span>
              <span className="text-[10px] text-slate-400">Max 5 tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tiktokSuggestion.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-slate-900 px-2 py-1 text-[11px] text-slate-100 border border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              {tiktokSuggestion.explanation}
            </p>
          </div>
        )}

        {youtubeSuggestion && (
          <div className="space-y-2 rounded-2xl bg-slate-950/70 border border-slate-800 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-200">YouTube tags</span>
              <span className="text-[10px] text-slate-400">Title / description</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {youtubeSuggestion.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-slate-900 px-2 py-1 text-[11px] text-slate-100 border border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              {youtubeSuggestion.explanation}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

