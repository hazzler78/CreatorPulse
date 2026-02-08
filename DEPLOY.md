# CreatorPulse – Deployment Guide

## Deploy to Vercel (Frontend)

1. **Connect your repo**
   - Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
   - Click **Add New Project** and import your CreatorPulse repo.

2. **Configure build**
   - In project settings, set **Root Directory** to `frontend`.
   - The `vercel.json` config will:
     - Run `npm run build` (Vite)
     - Serve output from `dist`
     - Rewrite `/terms` and `/privacy` to the static legal pages

3. **Environment variables**
   - **Supabase Auth** (required for sign in): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (from Supabase → Project Settings → API).
   - **Backend API** (if hosted separately): `VITE_API_URL=https://your-backend.onrender.com`.

4. **Deploy**
   - Click **Deploy**. You’ll get a URL like `creatorpulse-xxx.vercel.app`.

## Backend (Optional)

The frontend works without the backend (default data, no TikTok OAuth). For full features (goals, platforms, accounts, TikTok connect):

1. Deploy the backend to [Render](https://render.com) or [Railway](https://railway.app).
2. Set environment variables:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
   - `SUPABASE_JWT_SECRET` – from Supabase → Project Settings → API → **JWT Secret** (verifies auth tokens)
   - `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`
   - `TIKTOK_REDIRECT_URI` = your backend URL + `/api/auth/tiktok/callback`
   - `FRONTEND_ORIGIN` = your Vercel URL (e.g. `https://creatorpulse-xxx.vercel.app`)
3. Add the backend URL as `VITE_API_URL` in Vercel’s project settings.

## TikTok Login

See [TIKTOK_SETUP.md](TIKTOK_SETUP.md) for configuring TikTok OAuth with the new domain.

## Terms of Service & Privacy Policy

- **Terms:** `/terms` → `terms.html`
- **Privacy:** `/privacy` → `privacy.html`

Both are linked in the footer and styled to match the app.
