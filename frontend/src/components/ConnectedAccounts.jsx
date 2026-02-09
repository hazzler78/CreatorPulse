import { apiFetch } from "../api.js";

const LABELS = {
  tiktok: "TikTok",
  youtube: "YouTube",
  spotify: "Spotify"
};

export default function ConnectedAccounts({ platforms, onDisconnect }) {
  if (!platforms?.length) return null;

  const handleDisconnect = async (platform) => {
    try {
      const res = await apiFetch(`/api/accounts/${platform}`, { method: "DELETE" });
      if (res.ok) onDisconnect?.();
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-3 py-2 text-[11px] text-slate-300 flex flex-wrap items-center gap-2">
      <span className="text-slate-400">Tracking:</span>
      {platforms.map((p) => (
        <span
          key={p.platform}
          className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 border border-slate-700"
        >
          <span className="text-[10px] text-slate-400">
            {LABELS[p.platform.toLowerCase()] || p.platform}
          </span>
          <span className="text-slate-100">@{String(p.handle || "").replace(/^@+/, "")}</span>
          <button
            type="button"
            onClick={() => handleDisconnect(p.platform.toLowerCase())}
            className="ml-0.5 text-slate-500 hover:text-red-400 transition-colors"
            title={`Koppla bort ${LABELS[p.platform.toLowerCase()] || p.platform}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

