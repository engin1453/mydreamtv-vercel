import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, upsertPlaylist, getAllPlaylists } from "./lib/db";
import { parseM3UText, fetchAndParseM3U } from "./lib/m3u-parser";
import { getCachedData, setCache, clearCache } from "./lib/data-cache";
import type { ParsedM3U } from "./lib/m3u-parser";

// Lazy-load data from DB on cold start
async function loadData(): Promise<ParsedM3U | null> {
  // Check in-memory cache first
  const cached = getCachedData();
  if (cached) return cached;

  // Priority: Load from database playlist URL
  try {
    const db = await getDb();
    const allPlaylists = await getAllPlaylists();
    if (allPlaylists.length > 0) {
      // Find most recent playlist with URL
      const urlPlaylist = allPlaylists
        .filter((p) => p.m3uUrl || (p.xtreamHost && p.xtreamUsername))
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0];

      if (urlPlaylist?.m3uUrl) {
        console.log("[M3U] Loading from DB URL:", urlPlaylist.serverName);
        const data = await fetchAndParseM3U(urlPlaylist.m3uUrl);
        if (data) {
          setCache(data);
          return data;
        }
      }

      // Try Xtream
      if (urlPlaylist?.xtreamHost && urlPlaylist?.xtreamUsername) {
        const xtreamUrl = `${urlPlaylist.xtreamHost}:${urlPlaylist.xtreamPort}/get.php?username=${urlPlaylist.xtreamUsername}&password=${urlPlaylist.xtreamPassword}&type=m3u_plus`;
        console.log("[M3U] Loading from Xtream:", urlPlaylist.serverName);
        const data = await fetchAndParseM3U(xtreamUrl);
        if (data) {
          setCache(data);
          return data;
        }
      }
    }
  } catch (e) {
    console.warn("[M3U] DB load error:", (e as Error).message);
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const data = await loadData();
    const type = (req.query.type as string) || "stats";
    const category = req.query.category as string;

    switch (type) {
      case "stats": {
        if (!data) {
          res.json({ live: 0, movies: 0, series: 0, totalLive: 0, totalMovies: 0, totalSeries: 0 });
        } else {
          res.json({
            live: data.liveCategories.length,
            movies: data.movieCategories.length,
            series: data.seriesCategories.length,
            totalLive: data.liveChannels.length,
            totalMovies: data.movies.length,
            totalSeries: data.series.length,
          });
        }
        break;
      }

      case "live-categories": {
        res.json(data ? data.liveCategories : []);
        break;
      }

      case "channels": {
        if (!data || !category) {
          res.json([]);
        } else {
          res.json(data.liveChannels.filter((c) => c.group === category).slice(0, 500));
        }
        break;
      }

      case "movie-categories": {
        res.json(data ? data.movieCategories : []);
        break;
      }

      case "movies": {
        if (!data || !category) {
          res.json([]);
        } else {
          res.json(data.movies.filter((m) => m.group === category).slice(0, 200));
        }
        break;
      }

      case "series-categories": {
        res.json(data ? data.seriesCategories : []);
        break;
      }

      case "series": {
        if (!data || !category) {
          res.json([]);
        } else {
          res.json(data.series.filter((s) => s.group === category).slice(0, 200));
        }
        break;
      }

      case "wake": {
        // Simple wake-up endpoint
        res.json({ status: "ok" });
        break;
      }

      default: {
        res.status(400).json({ error: "Unknown type. Use: stats, live-categories, channels, movie-categories, movies, series-categories, series, wake" });
        break;
      }
    }
  } catch (error) {
    console.error("[Data API] Error:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}
