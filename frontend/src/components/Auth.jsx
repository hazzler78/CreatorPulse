import { useState } from "react";
import { supabase } from "../supabase.js";

export default function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      }

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password
        });
        if (signUpError) throw signUpError;
        if (data?.user && !data.user.identities?.length) {
          setError("An account with this email already exists. Try signing in.");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
      }
      onAuthenticated?.();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50 px-4">
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 max-w-md text-center text-slate-400 text-sm">
          Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your env.
          <p className="mt-2 text-xs text-slate-500">
            Falling back to demo mode – refresh to continue without auth.
          </p>
          <button
            type="button"
            onClick={() => onAuthenticated?.()}
            className="mt-4 rounded-full bg-slate-700 px-4 py-2 text-slate-200 text-sm hover:bg-slate-600"
          >
            Continue as demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900/80 border border-slate-800 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-sky-400 flex items-center justify-center text-slate-950 font-semibold text-lg">
            C
          </div>
          <span className="text-lg font-semibold tracking-tight">CreatorPulse</span>
        </div>

        <h1 className="text-center text-lg font-medium text-slate-100">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={6}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 text-slate-950 py-2.5 text-sm font-medium hover:bg-emerald-400 disabled:opacity-60 transition-colors"
          >
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className="text-emerald-400 hover:text-emerald-300"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(""); }}
                className="text-emerald-400 hover:text-emerald-300"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
