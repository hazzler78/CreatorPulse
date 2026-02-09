import axios from "axios";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

/**
 * Extract Spotify artist ID from a handle that might be:
 * - Full URL: https://open.spotify.com/artist/29Hv3V1dVlsGzLZCzNVWNZ?si=...
 * - Just the ID: 29Hv3V1dVlsGzLZCzNVWNZ
 */
function extractArtistId(raw) {
  if (!raw || typeof raw !== "string") return "";
  const s = raw.trim();
  if (s.includes("open.spotify.com/artist/")) {
    const match = s.match(/artist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : "";
  }
  // Assume it's already an ID (22 chars typical for Spotify)
  return s.split("?")[0].trim();
}

async function getClientCredentialsToken(clientId, clientSecret) {
  const res = await axios.post(
    TOKEN_URL,
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      auth: { username: clientId, password: clientSecret }
    }
  );
  return res.data?.access_token || null;
}

/**
 * Fetch public artist stats (followers, popularity, name) using Client Credentials.
 * Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in env.
 */
export async function fetchArtistStats(rawHandle, clientId, clientSecret) {
  const artistId = extractArtistId(rawHandle);
  if (!artistId || !clientId || !clientSecret) return null;

  const token = await getClientCredentialsToken(clientId, clientSecret);
  if (!token) return null;

  const res = await axios.get(`${API_BASE}/artists/${artistId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = res.data;
  if (!data) return null;

  return {
    id: data.id || artistId,
    name: data.name || rawHandle,
    followers: Number(data.followers?.total ?? 0),
    popularity: Number(data.popularity ?? 0)
  };
}

/**
 * Fetch an artist's top tracks for a given market.
 * Returns array of { id, name, popularity, previewUrl }.
 */
export async function fetchArtistTopTracks(rawHandle, clientId, clientSecret, market = "DE") {
  const artistId = extractArtistId(rawHandle);
  if (!artistId || !clientId || !clientSecret) return [];

  const token = await getClientCredentialsToken(clientId, clientSecret);
  if (!token) return [];

  const res = await axios.get(`${API_BASE}/artists/${artistId}/top-tracks`, {
    params: { market },
    headers: { Authorization: `Bearer ${token}` }
  });

  const tracks = res.data?.tracks || [];
  return tracks.map((t) => ({
    id: t.id,
    name: t.name || "",
    popularity: Number(t.popularity ?? 0),
    previewUrl: t.preview_url || null
  }));
}
