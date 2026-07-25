import type { VercelRequest, VercelResponse } from "@vercel/node";
import { upsertPlaylist } from "./lib/db";
import { clearCache } from "./lib/data-cache";

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
    if (!body || !body.macAddress || !body.serverName || !body.host || !body.port || !body.username || !body.password) {
      res.status(400).json({ error: "Tüm alanlar zorunludur" });
      return;
    }

    const mac = normalizeMac(body.macAddress);

    // Save to database with Xtream credentials
    await upsertPlaylist({
      macAddress: mac,
      serverName: body.serverName,
      xtreamHost: body.host,
      xtreamPort: body.port,
      xtreamUsername: body.username,
      xtreamPassword: body.password,
      uploadMethod: "xtream",
    });

    // Clear cache so next query will refetch
    clearCache();

    console.log(`[M3U] Xtream upload: ${body.host}:${body.port}`);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Xtream Upload] Error:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}
