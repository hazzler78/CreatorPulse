import { supabase } from "./supabase.js";

/**
 * API base URL. In development, Vite proxies /api to the backend.
 * In production, set VITE_API_URL in Vercel env vars to your backend URL
 * (e.g. https://your-backend.onrender.com) if the backend is deployed separately.
 */
export const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * Authenticated fetch – adds Bearer token from Supabase session when available.
 */
export async function apiFetch(path, options = {}) {
  const headers = { ...options.headers };
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}
