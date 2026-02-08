import express from "express";
import { supabase } from "./config.js";
import { fetchChannelStatsByHandle } from "./services.youtube.js";
import { fetchArtistStats } from "./services.spotify.js";
import {
  fetchUserInfo as fetchTikTokUserInfo,
  fetchVideoList as fetchTikTokVideoList,
  refreshAccessToken as refreshTikTokToken
} from "./services.tiktok.js";

const router = express.Router();

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

// In a real app, fetch TikTok, Facebook, YouTube & Spotify analytics via their APIs.
// Here we return a shaped demo response so the frontend can render, with optional
// live YouTube channel stats when a YOUTUBE_API_KEY is configured.
router.get("/summary", async (req, res) => {
  try {
    const userId = req.user?.sub || "demo-user";

    // TikTok: live stats when account has access_token (from OAuth)
    let tiktokLiveStats = null;
    let tiktokHandle = "mikachristina";
    if (supabase) {
      const { data: ttAccount } = await supabase
        .from("platform_accounts")
        .select("*")
        .eq("user_id", userId)
        .eq("platform", "tiktok")
        .maybeSingle();

      if (ttAccount?.handle) tiktokHandle = ttAccount.handle;
      let accessToken = ttAccount?.access_token || null;
      const refreshToken = ttAccount?.refresh_token || null;
      const tokenExpiresAt = ttAccount?.token_expires_at
        ? new Date(ttAccount.token_expires_at).getTime()
        : 0;

      if (accessToken) {
        try {
          tiktokLiveStats = await fetchTikTokUserInfo(accessToken);
          const tiktokVideos = await fetchTikTokVideoList(accessToken);
          if (tiktokLiveStats) tiktokLiveStats._videos = tiktokVideos ?? [];
          if (!tiktokLiveStats && refreshToken && TIKTOK_CLIENT_KEY && TIKTOK_CLIENT_SECRET) {
            const refreshed = await refreshTikTokToken(
              refreshToken,
              TIKTOK_CLIENT_KEY,
              TIKTOK_CLIENT_SECRET
            );
            if (refreshed?.access_token) {
              const expiresAt = new Date(
                Date.now() + (refreshed.expires_in || 86400) * 1000
              ).toISOString();
              await supabase
                .from("platform_accounts")
                .update({
                  access_token: refreshed.access_token,
                  refresh_token: refreshed.refresh_token,
                  token_expires_at: expiresAt,
                  updated_at: new Date().toISOString()
                })
                .eq("user_id", userId)
                .eq("platform", "tiktok");
              tiktokLiveStats = await fetchTikTokUserInfo(refreshed.access_token);
              if (tiktokLiveStats) {
                tiktokLiveStats._videos = await fetchTikTokVideoList(refreshed.access_token) ?? [];
              }
            }
          }
        } catch (err) {
          console.error("TikTok API error:", err?.response?.data || err.message);
        }
      }
    }

    const tiktokMetrics = (() => {
      const displayHandle = (tiktokHandle || "").replace(/^@+/, "");
      if (!tiktokLiveStats) {
        return {
          platform: "TikTok",
          handle: displayHandle || "mikachristina",
          _live: false,
          metrics: {
            revenue: 1800,
            revenueChange: 24.3,
            engagement: 5.2,
            engagementChange: 1.1,
            topPostViews: 42000,
            topPostLabel: "Top: 'Day in the studio'"
          },
          hashtags: [
            { tag: "#creatorlife", lift: 3.4 },
            { tag: "#smallcreators", lift: 2.7 },
            { tag: "#tiktoksweden", lift: 2.2 },
            { tag: "#dailyvlog", lift: 1.9 }
          ],
          engagementTrend: [3.2, 3.8, 4.4, 4.1, 4.9, 5.3, 4.7]
        };
      }
      const {
        username,
        display_name,
        follower_count,
        likes_count,
        video_count,
        _videos: videos = []
      } = tiktokLiveStats;
      const approxRevenue = Math.round((follower_count / 1000) * 4 + (likes_count / 5000));
      const engagementRate =
        video_count && likes_count
          ? Math.min((likes_count / (video_count * 100)) * 10, 15)
          : 2.5;
      // Use real view_count from video list when available; fallback to approximation
      const topVideo = videos.length > 0
        ? videos.reduce((a, b) => (a.view_count >= b.view_count ? a : b), videos[0])
        : null;
      const topPostViews = topVideo?.view_count ?? (video_count > 0 ? Math.round(likes_count / Math.max(video_count, 1)) : follower_count);
      const topPostLabel = topVideo
        ? (topVideo.title
            ? `Live · "${topVideo.title.slice(0, 30)}${topVideo.title.length > 30 ? "…" : ""}"`
            : `Live · Top post (${display_name || username})`)
        : `Live · "${display_name || username}"`;
      return {
        platform: "TikTok",
        handle: username || displayHandle || display_name,
        _live: true,
        metrics: {
          revenue: Math.max(approxRevenue, 0),
          revenueChange: 0,
          engagement: Number(engagementRate.toFixed(1)),
          engagementChange: 0,
          topPostViews,
          topPostLabel
        },
        hashtags: [
          { tag: "#followers", lift: Math.max(follower_count / 1000, 0.1) },
          { tag: "#likes", lift: Math.max(likes_count / 10000, 0.1) },
          { tag: "#videos", lift: Math.max(video_count / 20, 0.1) },
          { tag: "#tiktokgrowth", lift: 1.5 }
        ],
        engagementTrend: [3.2, 3.8, 4.4, 4.1, 4.9, 5.3, 4.7]
      };
    })();

    let youtubeHandle = "VelvetOrionX";
    if (supabase) {
      const { data: ytAccount } = await supabase
        .from("platform_accounts")
        .select("*")
        .eq("user_id", userId)
        .eq("platform", "youtube")
        .maybeSingle();

      if (ytAccount?.handle) {
        youtubeHandle = ytAccount.handle;
      }
    }

    let youtubeLiveStats = null;
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        youtubeLiveStats = await fetchChannelStatsByHandle(youtubeHandle, apiKey);
        if (!youtubeLiveStats) {
          console.warn("YouTube API: no channel found for handle:", youtubeHandle);
        }
      } catch (err) {
        console.error("YouTube API error:", err?.response?.data || err.message);
      }
    } else {
      console.warn("YOUTUBE_API_KEY not set; using demo YouTube data.");
    }

    const youtubeMetrics = (() => {
      if (!youtubeLiveStats) {
        // fall back to demo numbers
        return {
          platform: "YouTube",
          handle: youtubeHandle,
          _live: false,
          metrics: {
            revenue: 1200,
            revenueChange: 18.5,
            engagement: 6.1,
            engagementChange: 1.3,
            topPostViews: 58000,
            topPostLabel: "Top: 'Long-form breakdown'"
          },
          hashtags: [
            { tag: "#longform", lift: 2.9 },
            { tag: "#tutorial", lift: 2.4 },
            { tag: "#ytshorts", lift: 2.1 },
            { tag: "#creatorstudio", lift: 1.8 }
          ],
          engagementTrend: [4.1, 4.4, 4.9, 5.2, 5.8, 6.3, 6.1]
        };
      }

      const { subscribers, views, videos, title } = youtubeLiveStats;
      const approxRevenue = (views / 1000) * 3; // very rough €3 CPM estimate
      const engagementRate = subscribers && videos ? (subscribers / videos) * 0.1 : 2.5;
      // Strip leading @ so the frontend never shows @@
      const displayHandle = (youtubeHandle || "").replace(/^@+/, "");

      return {
        platform: "YouTube",
        handle: displayHandle,
        _live: true,
        metrics: {
          revenue: Math.round(approxRevenue),
          revenueChange: 0,
          engagement: Number(engagementRate.toFixed(1)),
          engagementChange: 0,
          topPostViews: Number(views),
          topPostLabel: `Total channel views · "${title}"`
        },
        hashtags: [
          { tag: "#subscribers", lift: Math.max(subscribers / 1000, 0.1) },
          { tag: "#views", lift: Math.max(views / 100000, 0.1) },
          { tag: "#videos", lift: Math.max(videos / 50, 0.1) },
          { tag: "#youtubegrowth", lift: 1.5 }
        ],
        engagementTrend: [2.8, 3.1, 3.6, 3.9, 4.2, 4.5, 4.9]
      };
    })();

    // Spotify: live stats when SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET are set
    let spotifyHandle = "";
    if (supabase) {
      const { data: spAccount } = await supabase
        .from("platform_accounts")
        .select("*")
        .eq("user_id", userId)
        .eq("platform", "spotify")
        .maybeSingle();
      if (spAccount?.handle) spotifyHandle = spAccount.handle;
    }
    let spotifyLiveStats = null;
    const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (spotifyClientId && spotifyClientSecret && spotifyHandle) {
      try {
        spotifyLiveStats = await fetchArtistStats(
          spotifyHandle,
          spotifyClientId,
          spotifyClientSecret
        );
        if (!spotifyLiveStats) {
          console.warn("Spotify API: no artist found for handle:", spotifyHandle);
        }
      } catch (err) {
        console.error("Spotify API error:", err?.response?.data || err.message);
      }
    }

    const spotifyMetrics = (() => {
      const displayHandle = (spotifyHandle || "artist").replace(/^@+/, "");
      if (!spotifyLiveStats) {
        return {
          platform: "Spotify",
          handle: displayHandle || "mikachristina",
          _live: false,
          metrics: {
            revenue: 500,
            revenueChange: 12.1,
            engagement: 4.3,
            engagementChange: 0.7,
            topPostViews: 32000,
            topPostLabel: "Top: 'Playlist collab episode'"
          },
          hashtags: [
            { tag: "#newmusic", lift: 2.6 },
            { tag: "#podcast", lift: 2.2 },
            { tag: "#spotifyplaylist", lift: 2.0 },
            { tag: "#listentothis", lift: 1.6 }
          ],
          engagementTrend: [3.0, 3.2, 3.6, 3.9, 4.4, 4.7, 4.3]
        };
      }
      const { name, followers, popularity } = spotifyLiveStats;
      const approxRevenue = Math.round((followers / 1000) * 2 + (popularity / 10));
      return {
        platform: "Spotify",
        handle: name || displayHandle,
        _live: true,
        metrics: {
          revenue: Math.max(approxRevenue, 0),
          revenueChange: 0,
          engagement: Math.min(popularity / 10, 10),
          engagementChange: 0,
          topPostViews: followers,
          topPostLabel: `Total followers · "${name}"`
        },
        hashtags: [
          { tag: "#followers", lift: Math.max(followers / 1000, 0.1) },
          { tag: "#popularity", lift: Math.max(popularity / 25, 0.1) },
          { tag: "#artist", lift: 1.5 },
          { tag: "#listentothis", lift: 1.6 }
        ],
        engagementTrend: [3.0, 3.2, 3.6, 3.9, 4.4, 4.7, 4.3]
      };
    })();

    return res.json({
      platforms: [
        tiktokMetrics,
        {
          platform: "Facebook",
          handle: "mikachristina",
          metrics: {
            revenue: 800,
            revenueChange: 14.7,
            engagement: 3.4,
            engagementChange: 0.6,
            topPostViews: 21000,
            topPostLabel: "Top: 'Behind the scenes reel'"
          },
          hashtags: [
            { tag: "#community", lift: 2.8 },
            { tag: "#reels", lift: 2.3 },
            { tag: "#behindthescenes", lift: 1.8 },
            { tag: "#creatoreconomy", lift: 1.7 }
          ],
          engagementTrend: [2.4, 2.9, 3.1, 3.0, 3.6, 3.9, 3.5]
        },
        youtubeMetrics,
        spotifyMetrics
      ]
    });
  } catch (err) {
    console.error("Error fetching platform summary", err);
    return res.status(500).json({ message: "Failed to fetch platform data" });
  }
});

export default router;

