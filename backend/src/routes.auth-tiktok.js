import express from "express";
import { supabase } from "./config.js";
import {
  getAuthUrl,
  consumeState,
  exchangeCodeForToken,
  fetchUserInfo
} from "./services.tiktok.js";

const router = express.Router();
const clientKey = (process.env.TIKTOK_CLIENT_KEY || "").trim();
const clientSecret = (process.env.TIKTOK_CLIENT_SECRET || "").trim();
const redirectUri = (process.env.TIKTOK_REDIRECT_URI || "").trim();
const frontendOrigin = (process.env.FRONTEND_ORIGIN || "http://localhost:5173").trim();

/**
 * GET /api/auth/tiktok/debug
 * Returns config status for troubleshooting (no secrets). Call from browser or curl.
 */
router.get("/debug", (req, res) => {
  res.json({
    clientKey: clientKey ? `${clientKey.slice(0, 4)}...${clientKey.slice(-4)}` : "MISSING",
    clientSecretSet: !!clientSecret,
    redirectUri: redirectUri || "MISSING",
    redirectUriLength: redirectUri?.length ?? 0,
    frontendOrigin: frontendOrigin || "MISSING",
    expectedRedirectUri: "https://creatorpulse-9ldz.onrender.com/api/auth/tiktok/callback"
  });
});

/**
 * GET /api/auth/tiktok/url
 * Returns { url } to redirect the user to TikTok's authorization page.
 * Requires auth middleware to set req.user.sub (current user id).
 */
router.get("/url", (req, res) => {
  const userId = req.user?.sub || "demo-user";
  if (!clientKey || !redirectUri) {
    return res.status(400).json({ error: "TikTok auth not configured" });
  }
  const result = getAuthUrl(clientKey, clientSecret, redirectUri, userId);
  if (!result) {
    return res.status(500).json({ error: "Failed to build auth URL" });
  }
  res.json({ url: result.url });
});

/**
 * GET /api/auth/tiktok/callback?code=...&state=...
 * TikTok redirects here after user authorizes. Exchange code for token, store, redirect to app.
 */
router.get("/callback", async (req, res) => {
  const { code, state, error, error_description, log_id } = req.query;
  const redirectSuccess = `${frontendOrigin}?tiktok=connected`;
  const errParam = error || "callback";
  const redirectError = `${frontendOrigin}?tiktok_error=${encodeURIComponent(errParam)}&tiktok_desc=${encodeURIComponent(error_description || "")}`;

  if (error) {
    console.error("TikTok OAuth error (from redirect):", { error, error_description, log_id, query: req.query });
    return res.redirect(redirectError);
  }

  const userId = consumeState(state);
  if (!userId) {
    return res.redirect(`${frontendOrigin}?tiktok_error=state`);
  }

  if (!code || !clientKey || !clientSecret || !redirectUri) {
    return res.redirect(redirectError);
  }

  try {
    const tokenData = await exchangeCodeForToken(
      code,
      clientKey,
      clientSecret,
      redirectUri
    );
    if (!tokenData) {
      console.error("TikTok token exchange failed – check Render logs for axios error");
      return res.redirect(redirectError);
    }

    const userInfo = await fetchUserInfo(tokenData.access_token);
    const handle = userInfo?.username || "tiktok-user";

    if (supabase) {
      const expiresAt = new Date(Date.now() + (tokenData.expires_in || 86400) * 1000).toISOString();
      await supabase.from("platform_accounts").upsert(
        {
          user_id: userId,
          platform: "tiktok",
          handle,
          status: "connected",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id,platform" }
      );
    }

    return res.redirect(redirectSuccess);
  } catch (err) {
    const tikErr = err?.response?.data;
    console.error("TikTok callback error:", {
      message: err.message,
      status: err?.response?.status,
      data: tikErr,
      log_id: tikErr?.log_id
    });
    const errCode = tikErr?.error === "invalid_client" ? "client_key" : errParam;
    return res.redirect(`${frontendOrigin}?tiktok_error=${encodeURIComponent(errCode)}&tiktok_desc=${encodeURIComponent(tikErr?.description || err.message || "")}`);
  }
});

export default router;
