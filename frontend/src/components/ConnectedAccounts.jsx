import { useEffect, useState } from "react";
import { apiFetch } from "../api.js";

const LABELS = {
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  spotify: "Spotify"
};

export default function ConnectedAccounts({ onDisconnect }) {
  const [accounts, setAccounts] = useState([]);

  const load = async () => {
    try {
      const res = await apiFetch("/api/accounts");
      const json = await res.json();
      setAccounts(json.accounts ?? []);
    } catch {
      // ignore for now – stays empty if backend not running
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDisconnect = async (platform) => {
    try {
      const res = await apiFetch(`/api/accounts/${platform}`, { method: "DELETE" });
      if (res.ok) {
        await load();
        onDisconnect?.();
      }
    } catch {
      // ignore
    }
  };

  if (!accounts.length) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-3 py-2 text-[11px] text-slate-300 flex flex-wrap items-center gap-2">
      <span className="text-slate-400">Tracking:</span>
      {accounts.map((acc) => (
        <span
          key={acc.id || `${acc.user_id}-${acc.platform}`}
          className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 border border-slate-700"
        >
          <span className="text-[10px] text-slate-400">
            {LABELS[acc.platform] || acc.platform}
          </span>
          <span className="text-slate-100">{acc.handle}</span>
          {acc.status && (
            <span className="text-[9px] uppercase tracking-wide text-emerald-400">
              {acc.status}
            </span>
          )}
          <button
            type="button"
            onClick={() => handleDisconnect(acc.platform)}
            className="ml-0.5 text-slate-500 hover:text-red-400 transition-colors"
            title={`Disconnect ${LABELS[acc.platform] || acc.platform}`}
            aria-label={`Disconnect ${LABELS[acc.platform] || acc.platform}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

