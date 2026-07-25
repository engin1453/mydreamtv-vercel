import type { VercelRequest, VercelResponse } from "@vercel/node";
import { upsertPlaylist } from "./lib/db";
import { setCache } from "./lib/data-cache";
import { parseM3UText, fetchAndParseM3U, type ParsedM3U } from "./lib/m3u-parser";

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
    let parsedData: ParsedM3U | null = null;

    // Strategy 1: M3U URL provided - fetch and parse it
    if (body.m3uUrl) {
      console.log("[Upload] Fetching M3U from URL:", body.m3uUrl.substring(0, 80));
      parsedData = await fetchAndParseM3U(body.m3uUrl);
      if (parsedData) {
        console.log(`[Upload] Parsed from URL: ${parsedData.liveChannels.length} channels, ${parsedData.movies.length} movies, ${parsedData.series.length} series`);
      } else {
        console.warn("[Upload] Failed to parse M3U from URL");
      }

      // Save M3U URL to database
      await upsertPlaylist({
        macAddress: mac,
        serverName: body.serverName,
        m3uUrl: body.m3uUrl,
        uploadMethod: "m3u",
      });
    }
    // Strategy 2: Xtream credentials provided - build URL and fetch
    else if (body.host && body.port && body.username && body.password) {
      const xtreamUrl = `${body.host}:${body.port}/get.php?username=${body.username}&password=${body.password}&type=m3u_plus`;
      console.log("[Upload] Fetching Xtream M3U from:", body.host);
      parsedData = await fetchAndParseM3U(xtreamUrl);
      if (parsedData) {
        console.log(`[Upload] Parsed from Xtream: ${parsedData.liveChannels.length} channels, ${parsedData.movies.length} movies, ${parsedData.series.length} series`);
      } else {
        console.warn("[Upload] Failed to parse Xtream M3U");
      }

      await upsertPlaylist({
        macAddress: mac,
        serverName: body.serverName,
        xtreamHost: body.host,
        xtreamPort: body.port,
        xtreamUsername: body.username,
        xtreamPassword: body.password,
        uploadMethod: "xtream",
      });
    }
    // Strategy 3: File upload (parsed data sent directly)
    else if (body.liveCategories && body.liveChannels) {
      parsedData = {
        liveCategories: body.liveCategories,
        liveChannels: body.liveChannels,
        movieCategories: body.movieCategories || [],
        movies: body.movies || [],
        seriesCategories: body.seriesCategories || [],
        series: body.series || [],
      };

      await upsertPlaylist({
        macAddress: mac,
        serverName: body.serverName,
        uploadMethod: "file",
      });
    }
    // Strategy 4: Only MAC and server name - no data to parse
    else {
      await upsertPlaylist({
        macAddress: mac,
        serverName: body.serverName,
        uploadMethod: "none",
      });
    }

    // If we have parsed data, cache it
    if (parsedData) {
      setCache(parsedData);
    }

    const stats = parsedData ? {
      channels: parsedData.liveChannels.length,
      movies: parsedData.movies.length,
      series: parsedData.series.length,
    } : { channels: 0, movies: 0, series: 0 };

    res.status(200).json({
      success: true,
      ...stats,
      message: parsedData
        ? `Başarılı! ${body.serverName} yüklendi: ${stats.channels} kanal, ${stats.movies} film, ${stats.series} dizi`
        : `MAC kaydedildi. M3U verisi çekilemedi.`,
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    res.status(500).json({ error: "Sunucu hatası: " + (error as Error).message });
  }
}
