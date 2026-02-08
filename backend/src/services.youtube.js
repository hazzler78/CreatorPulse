import axios from "axios";

const API_BASE = "https://www.googleapis.com/youtube/v3";

function normaliseHandle(raw) {
  if (!raw) return "";
  let h = raw.trim();
  // Strip URL parts if a full URL was pasted
  if (h.includes("youtube.com")) {
    const url = new URL(h);
    const path = url.pathname.replace(/^\/+/, "");
    if (path.startsWith("@")) {
      h = path;
    }
  }
  if (h.startsWith("https://")) {
    h = h.replace("https://", "");
  }
  if (h.startsWith("@")) {
    h = h.slice(1);
  }
  return h;
}

export async function fetchChannelStatsByHandle(rawHandle, apiKey) {
  const handle = normaliseHandle(rawHandle);
  if (!apiKey || !handle) {
    return null;
  }

  // 1) Prefer channels.list with forHandle (reliable for @handle lookups)
  let channel = null;
  try {
    const channelRes = await axios.get(`${API_BASE}/channels`, {
      params: {
        part: "statistics,snippet",
        forHandle: handle,
        key: apiKey
      }
    });
    channel = channelRes.data?.items?.[0];
  } catch (e) {
    // forHandle may not exist in older API docs; fall back to search
  }

  // 2) Fallback: search by handle
  if (!channel) {
    const searchRes = await axios.get(`${API_BASE}/search`, {
      params: {
        part: "snippet",
        q: handle,
        type: "channel",
        maxResults: 1,
        key: apiKey
      }
    });
    const searchItems = searchRes.data?.items || [];
    if (!searchItems.length) return null;
    const channelId = searchItems[0].snippet?.channelId || searchItems[0].id?.channelId;
    if (!channelId) return null;
    const byIdRes = await axios.get(`${API_BASE}/channels`, {
      params: { part: "statistics,snippet", id: channelId, key: apiKey }
    });
    channel = byIdRes.data?.items?.[0];
  }

  if (!channel) return null;

  const stats = channel.statistics || {};

  return {
    title: channel.snippet?.title || handle,
    subscribers: Number(stats.subscriberCount || 0),
    views: Number(stats.viewCount || 0),
    videos: Number(stats.videoCount || 0)
  };
}

