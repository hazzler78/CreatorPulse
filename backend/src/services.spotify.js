import axios from "axios";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

/**
 * Try to normalise a Spotify artist "handle" into an artist ID.
 * Accepts:
 * - Full URL: https://open.spotify.com/artist/29Hv3V1dVlsGzLZCzNVWNZ?si=...
 * - Bare ID: 29Hv3V1dVlsGzLZCzNVWNZ
 *
 * Returns empty string for names like "Velvet Orion X" so that callers
 * can fall back to the search API.
 */
function extractArtistId(raw) {
  if (!raw || typeof raw !== "string") return "";
  const s = raw.trim();
  if (s.includes("open.spotify.com/artist/")) {
    const match = s.match(/artist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : "";
  }
  const candidate = s.split("?")[0].trim();
  // Spotify IDs are 22-char base62 tokens; anything else is treated as a name.
  if (/^[A-Za-z0-9]{22}$/.test(candidate)) {
    return candidate;
  }
  return "";
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

async function resolveArtistId(rawHandle, clientId, clientSecret) {
  const directId = extractArtistId(rawHandle);
  if (directId) return directId;
  if (!clientId || !clientSecret || !rawHandle) return "";

  const token = await getClientCredentialsToken(clientId, clientSecret);
  if (!token) return "";

  // Fallback: search by artist name
  const res = await axios.get(`${API_BASE}/search`, {
    params: {
      q: rawHandle,
      type: "artist",
      limit: 1
    },
    headers: { Authorization: `Bearer ${token}` }
  });
  const first = res.data?.artists?.items?.[0];
  return first?.id || "";
}

/**
 * Fetch public artist stats (followers, popularity, name) using Client Credentials.
 * Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in env.
 */
export async function fetchArtistStats(rawHandle, clientId, clientSecret) {
  const artistId = await resolveArtistId(rawHandle, clientId, clientSecret);
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
  const artistId = await resolveArtistId(rawHandle, clientId, clientSecret);
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
