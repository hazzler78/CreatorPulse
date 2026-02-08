# TikTok Login Kit – Setup for CreatorPulse

## 1. TikTok Developer Portal

1. Go to [developers.tiktok.com](https://developers.tiktok.com) and sign in.
2. Open **Manage apps** and select your app (or create one).
3. Under **Login Kit** (or **Products** → **Login Kit**):
   - Add the **Redirect URI**:
     ```
     https://creatorpulse-9ldz.onrender.com/api/auth/tiktok/callback
     ```
   - Add your **domain** to allowed domains if required:
     ```
     https://creator-pulse-drab.vercel.app
     ```

## 2. App credentials

In the app settings, copy:
- **Client Key** → `TIKTOK_CLIENT_KEY`
- **Client Secret** → `TIKTOK_CLIENT_SECRET`

## 3. Backend env vars (Render)

Set in Render → Your service → Environment:

| Variable | Value |
|----------|-------|
| `TIKTOK_CLIENT_KEY` | Your Client Key |
| `TIKTOK_CLIENT_SECRET` | Your Client Secret |
| `TIKTOK_REDIRECT_URI` | `https://creatorpulse-9ldz.onrender.com/api/auth/tiktok/callback` |
| `FRONTEND_ORIGIN` | `https://creator-pulse-drab.vercel.app` |

## 4. "client_key" error

If TikTok shows a `client_key` error:

- The Redirect URI in the TikTok app **must match** `TIKTOK_REDIRECT_URI` exactly.
- The Client Key must be from the same app where the Redirect URI is configured.
- In Development mode, add your TikTok account as a **test user** in the app.
- Wait a few minutes after changing settings; TikTok may cache config.

## 5. Redeploy

After changing env vars in Render, trigger a new deploy so they take effect.
