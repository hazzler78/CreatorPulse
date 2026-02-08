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
2. Add these scopes:
   - `user.info.basic`
   - `user.info.profile`
   - `user.info.stats`
   - `video.list` (för riktiga visningsantal på topp-videon)

**Om du redan har kopplat TikTok:** koppla loss och koppla in igen efter att du lagt till `video.list`, så att den nya access-tokenen inkluderar scope.

---

## Step 4: Production vs Sandbox (viktigt!)

**Production** och **Sandbox** har olika Client Key och Client Secret. Du måste:
1. Välj **samma flik** (Production eller Sandbox) överallt
2. Lägg till Redirect URI i Login Kit under **den** fliken
3. Kopiera Client Key + Client Secret från **den** fliken till Render
4. Om du är i **Sandbox/Draft**: lägg till ditt TikTok-konto som **test user**

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

---

## Troubleshooting: "client_key" error

If you get "client_key" after authorizing (including via QR code):

1. **Production vs Sandbox** – TikTok has separate credentials for each. In the Developer Portal, check which tab you're in (Production / Sandbox). Use the Client Key and Client Secret from the **same** environment as your redirect URI. Update Render env vars accordingly.

2. **Redirect URI match** – In Login Kit → Redirect URI, the value must exactly match `TIKTOK_REDIRECT_URI` in Render (no extra slash, no query params).

3. **Avoid QR if possible** – Try the normal flow: click "Connect TikTok" and authorize in the same browser tab. The QR flow can be more sensitive to env/state issues.

4. **Verify config** – Visit `https://creatorpulse-9ldz.onrender.com/api/auth/tiktok/debug` in your browser. It shows whether client key, redirect URI, etc. are set correctly (without exposing secrets). `redirectUri` must exactly match `expectedRedirectUri`.

5. **App approval** – If the app is in "Draft" or "Pending review", only test users can connect. Add your TikTok account as a test user in Developer Portal → App details → Test users (or similar). Or wait for Production approval.

6. **Contact TikTok Support** – If the error continues, use [TikTok Developer Support](https://developers.tiktok.com/) and include your **log_id** (e.g. `20260208155531155384BF4AA04467FB66`). They can look up the exact cause.
