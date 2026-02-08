import axios from "axios";
import crypto from "crypto";

const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";

const SCOPES = "user.info.basic,user.info.profile,user.info.stats";

/** In-memory state store for OAuth (state -> { userId, createdAt }). Use Redis in production. */
const stateStore = new Map();
const STATE_TTL_MS = 10 * 60 * 1000; // 10 min

function pruneStateStore() {
  const now = Date.now();
  for (const [state, data] of stateStore.entries()) {
    if (now - data.createdAt > STATE_TTL_MS) stateStore.delete(state);
  }
}

/**
 * Build TikTok authorization URL and store state for the current user.
 * Returns { url, state } or null if missing config.
 */
export function getAuthUrl(clientKey, clientSecret, redirectUri, userId) {
  if (!clientKey || !redirectUri || !userId) return null;
  pruneStateStore();
  const state = crypto.randomBytes(24).toString("hex");
  stateStore.set(state, { userId, createdAt: Date.now() });

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: SCOPES,
    response_type: "code",
    redirect_uri: redirectUri,
    state
  });
  return { url: `${AUTH_URL}?${params.toString()}`, state };
}

/**
 * Look up userId for this state (and remove from store). Returns null if invalid/expired.
 */
export function consumeState(state) {
  pruneStateStore();
  const data = stateStore.get(state);
  if (!data) return null;
  if (Date.now() - data.createdAt > STATE_TTL_MS) {
    stateStore.delete(state);
    return null;
  }
  stateStore.delete(state);
  return data.userId;
}

/**
 * Exchange authorization code for access_token and refresh_token.
 */
export async function exchangeCodeForToken(code, clientKey, clientSecret, redirectUri) {
  if (!code || !clientKey || !clientSecret || !redirectUri) return null;
  const res = await axios.post(
    TOKEN_URL,
    new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  const data = res.data;
  if (!data?.access_token) return null;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    open_id: data.open_id
  };
}

/**
 * Fetch user info (username, follower_count, etc.) using access token.
 * Requires user.info.basic, user.info.profile, user.info.stats.
 */
export async function fetchUserInfo(accessToken) {
  if (!accessToken) return null;
  const fields = "username,display_name,follower_count,following_count,likes_count,video_count";
  const res = await axios.get(`${USER_INFO_URL}?fields=${encodeURIComponent(fields)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  const user = res.data?.data?.user;
  if (!user) return null;
  return {
    username: user.username || "",
    display_name: user.display_name || "",
    follower_count: Number(user.follower_count ?? 0),
    following_count: Number(user.following_count ?? 0),
    likes_count: Number(user.likes_count ?? 0),
    video_count: Number(user.video_count ?? 0)
  };
}

/**
 * Refresh access token. Returns new { access_token, refresh_token, expires_in } or null.
 */
export async function refreshAccessToken(refreshToken, clientKey, clientSecret) {
  if (!refreshToken || !clientKey || !clientSecret) return null;
  const res = await axios.post(
    TOKEN_URL,
    new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  const data = res.data;
  if (!data?.access_token) return null;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_in: data.expires_in
  };
}
