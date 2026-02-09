import { useState } from "react";
import { apiFetch } from "../api.js";

const LABELS = { tiktok: "TikTok", youtube: "YouTube", spotify: "Spotify" };

export default function AddPlatform({ platforms, onConnectTiktok, onAdded }) {
  const [youtubeHandle, setYoutubeHandle] = useState("");
  const [spotifyHandle, setSpotifyHandle] = useState("");
  const [saving, setSaving] = useState(null);

  const hasPlatform = (id) =>
    platforms.some((p) => p.platform.toLowerCase() === id);

  const addHandle = async (platform, handle) => {
    if (!handle?.trim()) return;
    setSaving(platform);
    try {
      const res = await apiFetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle: handle.trim(), mode: "connected" })
      });
      if (res.ok) {
        if (platform === "youtube") setYoutubeHandle("");
        if (platform === "spotify") setSpotifyHandle("");
        onAdded?.();
      }
    } catch {
      // ignore
    } finally {
      setSaving(null);
    }
  };

  const showAdd = !hasPlatform("tiktok") || !hasPlatform("youtube") || !hasPlatform("spotify");
  if (!showAdd) return null;

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 md:p-6 space-y-4">
      <div>
        <h2 className="text-sm font-medium text-slate-100">Lägg till plattform</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Koppla dina konton för att se riktiga siffror och följa din tillväxt.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {!hasPlatform("tiktok") && (
          <button
            type="button"
            onClick={onConnectTiktok}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20 transition-colors"
          >
            Connect {LABELS.tiktok}
          </button>
        )}
        {!hasPlatform("youtube") && (
          <div className="inline-flex items-center gap-2">
            <input
              type="text"
              placeholder="YouTube-kanal (t.ex. @kanalnamn)"
              value={youtubeHandle}
              onChange={(e) => setYoutubeHandle(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 md:w-56"
            />
            <button
              type="button"
              onClick={() => addHandle("youtube", youtubeHandle)}
              disabled={saving === "youtube" || !youtubeHandle.trim()}
              className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving === "youtube" ? "Laddar…" : `Lägg till ${LABELS.youtube}`}
            </button>
          </div>
        )}
        {!hasPlatform("spotify") && (
          <div className="inline-flex items-center gap-2">
            <input
              type="text"
              placeholder="Spotify artist-ID eller namn"
              value={spotifyHandle}
              onChange={(e) => setSpotifyHandle(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 md:w-56"
            />
            <button
              type="button"
              onClick={() => addHandle("spotify", spotifyHandle)}
              disabled={saving === "spotify" || !spotifyHandle.trim()}
              className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving === "spotify" ? "Laddar…" : `Lägg till ${LABELS.spotify}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
