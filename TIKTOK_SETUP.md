# TikTok Login Kit – Setup for CreatorPulse

## Step 1: App details (where you are now)

Fill in the **App details** section:

| Field | Value |
|-------|-------|
| **Web/Desktop URL** | `https://creator-pulse-drab.vercel.app` |
| **Terms of Service URL** | `https://creator-pulse-drab.vercel.app/terms` |
| **Privacy Policy URL** | `https://creator-pulse-drab.vercel.app/privacy` |

Click **Save**.

---

## Step 2: Add Login Kit product (Redirect URI is here)

The **Redirect URI** is configured inside the **Login Kit** product, not in App details.

1. In the left sidebar, expand **Products**.
2. Click **+ Add products**.
3. Select **Login Kit** and add it.
4. In the Login Kit configuration, find **Redirect URI** or **Redirect URIs**.
5. Add this **exact** URL:
   ```
   https://creatorpulse-9ldz.onrender.com/api/auth/tiktok/callback
   ```
6. Save.

---

## Step 3: Add scopes

1. Expand **Scopes** in the sidebar.
2. Add these scopes (needed for user info):
   - `user.info.basic`
   - `user.info.profile`
   - `user.info.stats`

---

## Step 4: Development vs Production

- **Development**: You can test immediately. Add your TikTok account as a **test user** in the app.
- **Production**: Fill all required fields (description, demo video, etc.) and **Submit for review**.

---

## Step 5: Credentials

At the top of the page you should see:
- **Client Key**: `awjkubik0h410lff` (already matches your .env)
- **Client Secret**: Copy this – it goes in `TIKTOK_CLIENT_SECRET`

---

## Step 6: Render environment variables

Set in Render → Your service → Environment:

| Variable | Value |
|----------|-------|
| `TIKTOK_CLIENT_KEY` | `awjkubik0h410lff` |
| `TIKTOK_CLIENT_SECRET` | Your Client Secret |
| `TIKTOK_REDIRECT_URI` | `https://creatorpulse-9ldz.onrender.com/api/auth/tiktok/callback` |
| `FRONTEND_ORIGIN` | `https://creator-pulse-drab.vercel.app` |

---

## Quick reference

| Purpose | URL |
|---------|-----|
| Your app (main site) | `https://creator-pulse-drab.vercel.app` |
| Terms of Service | `https://creator-pulse-drab.vercel.app/terms` |
| Privacy Policy | `https://creator-pulse-drab.vercel.app/privacy` |
| **OAuth redirect (callback)** | `https://creatorpulse-9ldz.onrender.com/api/auth/tiktok/callback` |

The redirect URI must **exactly match** – no trailing slash, no query params.
