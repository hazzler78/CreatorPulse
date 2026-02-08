import { motion } from "framer-motion";

export default function Sidebar({
  currentPage = "progress",
  onToggleTheme,
  onRestartOnboarding
}) {
  const navItems = [
    { id: "progress", label: "Progress hub" },
    { id: "accounts", label: "Connected accounts" },
    { id: "goals", label: "Goals" },
    { id: "reports", label: "Reports" }
  ];

  return (
    <aside className="hidden md:flex flex-col gap-4 w-60 shrink-0">
      <motion.div
        className="flex items-center justify-between rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-3"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary-500 via-emerald-400 to-sky-400 flex items-center justify-center text-slate-950 font-semibold text-lg">
            C
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">
              CreatorPulse
            </div>
            <div className="text-[11px] text-slate-400">
              For Mikael &amp; Christina
            </div>
          </div>
        </div>
        <button
          onClick={onToggleTheme}
          className="rounded-full bg-slate-900/80 border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300 hover:border-slate-500 transition-colors"
        >
          ☾ / ☼
        </button>
      </motion.div>

      <nav className="rounded-2xl bg-slate-900/80 border border-slate-800 p-2.5 space-y-1.5 text-sm">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                active
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-300 hover:bg-slate-800/80"
              }`}
            >
              <span>{item.label}</span>
              {active && (
                <span className="text-[11px] text-emerald-600 font-medium">
                  Live
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-2 border-t border-slate-800 mt-1.5">
          <button className="w-full rounded-xl border border-dashed border-slate-700 px-3 py-2.5 text-[11px] text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-colors">
            + Connect new platform
          </button>
          {onRestartOnboarding && (
            <button
              type="button"
              onClick={onRestartOnboarding}
              className="mt-2 w-full rounded-xl px-3 py-2 text-[11px] text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors"
            >
              Restart setup &amp; goals
            </button>
          )}
        </div>
      </nav>

      <div className="mt-auto rounded-2xl bg-gradient-to-br from-emerald-500/15 via-primary-500/10 to-sky-500/10 border border-emerald-500/40 p-3.5 text-xs text-slate-100 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200 text-sm">
            ★
          </span>
          <div>
            <div className="font-medium">Premium momentum</div>
            <div className="text-[11px] text-slate-100/80">
              Unlock multi-account tracking, advanced hashtag insights and
              deeper ad simulations.
            </div>
          </div>
        </div>
        <button className="mt-1 inline-flex items-center justify-center rounded-xl bg-slate-950/70 px-3 py-1.5 text-[11px] font-medium text-emerald-200 border border-emerald-500/60 hover:bg-slate-950 transition-colors">
          Upgrade with Stripe
        </button>
      </div>
    </aside>
  );
}

