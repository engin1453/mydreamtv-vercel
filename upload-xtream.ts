import type { VercelRequest, VercelResponse } from "@vercel/node";
import { upsertPlaylist } from "./lib/db";
import { setCache } from "./lib/data-cache";

function normalizeMac(mac: string): string {
  return mac.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body;
    if (!body || !body.macAddress || !body.serverName) {
      res.status(400).json({ error: "macAddress ve serverName zorunludur" });
      return;
    }

    const mac = normalizeMac(body.macAddress);

    // Save to database
    await upsertPlaylist({
      macAddress: mac,
      serverName: body.serverName,
      m3uUrl: null,
      uploadMethod: "file",
    });

    // Cache the parsed data
    const data = {
      liveCategories: body.liveCategories || [],
      liveChannels: body.liveChannels || [],
      movieCategories: body.movieCategories || [],
      movies: body.movies || [],
      seriesCategories: body.seriesCategories || [],
      series: body.series || [],
    };
    setCache(data);

    console.log(`[M3U] File upload: ${data.liveChannels.length} channels, ${data.movies.length} movies, ${data.series.length} series`);

    res.status(200).json({
      success: true,
      channels: data.liveChannels.length,
      movies: data.movies.length,
      series: data.series.length,
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    res.status(500).json({ error: "Sunucu hatası: " + (error as Error).message });
  }
}
