import { apiFetch } from "./api.js";

/**
 * Fetch learned TikTok hashtag performance for the current user.
 * Wraps GET /api/platforms/tiktok/hashtags.
 */
export async function getTikTokHashtagIntel() {
  const res = await apiFetch("/api/platforms/tiktok/hashtags");
  if (!res.ok) {
    throw new Error("Failed to load TikTok hashtag intel");
  }
  return res.json();
}

/**
 * Fetch learned YouTube keyword/hashtag performance for the current user.
 * Wraps GET /api/platforms/youtube/keywords.
 */
export async function getYouTubeKeywordIntel() {
  const res = await apiFetch("/api/platforms/youtube/keywords");
  if (!res.ok) {
    throw new Error("Failed to load YouTube keyword intel");
  }
  return res.json();
}

