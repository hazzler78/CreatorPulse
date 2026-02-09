/**
 * Building-phase milestones: progress that matters before monetization.
 * Uses platform data (followers, views, hashtag lift, top track) to show
 * checkmarks for achieved milestones.
 */
const MILESTONES = [
  {
    platform: "TikTok",
    id: "tiktok-1k",
    label: "1K followers",
    check: (p) => p.platform === "TikTok" && (p.metrics?.followerCount ?? 0) >= 1000
  },
  {
    platform: "TikTok",
    id: "tiktok-10k-views",
    label: "Top video 10K+ views",
    check: (p) => p.platform === "TikTok" && (p.metrics?.topPostViews ?? 0) >= 10000
  },
  {
    platform: "TikTok",
    id: "tiktok-2x-hashtag",
    label: "A hashtag with 2×+ lift",
    check: (p) =>
      p.platform === "TikTok" &&
      Array.isArray(p.hashtags) &&
      p.hashtags.some((h) => Number(h.lift) >= 2)
  },
  {
    platform: "YouTube",
    id: "yt-100-subs",
    label: "100 subscribers",
    check: (p) => p.platform === "YouTube" && (p.metrics?.subscriberCount ?? 0) >= 100
  },
  {
    platform: "YouTube",
    id: "yt-5k-views",
    label: "5K+ channel views",
    check: (p) => p.platform === "YouTube" && (p.metrics?.topPostViews ?? 0) >= 5000
  },
  {
    platform: "YouTube",
    id: "yt-top-tags",
    label: "3+ top-performing tags",
    check: (p) =>
      p.platform === "YouTube" &&
      Array.isArray(p.hashtags) &&
      p.hashtags.length >= 3
  },
  {
    platform: "Spotify",
    id: "spotify-top-50",
    label: "Top track 50+ popularity",
    check: (p) =>
      p.platform === "Spotify" && (p.metrics?.topTrackPopularity ?? 0) >= 50
  },
  {
    platform: "Spotify",
    id: "spotify-catalog",
    label: "Music in catalog",
    check: (p) =>
      p.platform === "Spotify" &&
      Array.isArray(p.hashtags) &&
      p.hashtags.length > 0
  }
];

export default function MomentumMilestones({ platforms = [] }) {
  const achieved = MILESTONES.filter((m) => platforms.some((p) => m.check(p)));
  const total = MILESTONES.length;

  if (total === 0) return null;

  return (
    <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 md:p-6 space-y-4 max-w-3xl">
      <div>
        <h2 className="text-sm md:text-base font-semibold tracking-tight">
          Building momentum
        </h2>
        <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">
          Progress that counts even before monetization. Real payouts (e.g. Spotify via
          DistroKid) can lag — these milestones show you’re moving.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MILESTONES.map((m) => {
          const done = platforms.some((p) => m.check(p));
          return (
            <div
              key={m.id}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs border ${
                done
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                  : "bg-slate-950/70 border-slate-800 text-slate-400"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium">
                {done ? "✓" : "—"}
              </span>
              <span>{m.label}</span>
              <span className="text-[10px] opacity-70">({m.platform})</span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500">
        {achieved.length} of {total} milestones reached. Keep going.
      </p>
    </section>
  );
}
