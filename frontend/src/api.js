/**
 * API base URL. In development, Vite proxies /api to the backend.
 * In production, set VITE_API_URL in Vercel env vars to your backend URL
 * (e.g. https://your-backend.onrender.com) if the backend is deployed separately.
 */
export const API_BASE = import.meta.env.VITE_API_URL || "";
