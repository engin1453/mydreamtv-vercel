import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAllPlaylists, deletePlaylistByMac, updatePlaylistM3u, updatePlaylistXtream, updatePlaylistServerName } from "./lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Password");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Admin auth check
  const password = req.headers["x-admin-password"] as string;
  if (ADMIN_PASSWORD && password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Yanlış şifre" });
    return;
  }

  try {
    if (req.method === "GET") {
      const action = (req.query.action as string) || "list";

      if (action === "list") {
        const playlists = await getAllPlaylists();
        res.json(playlists.map((p) => ({
          id: p.id,
          macAddress: p.macAddress,
          serverName: p.serverName,
          uploadMethod: p.uploadMethod,
          m3uUrl: p.m3uUrl,
          xtreamHost: p.xtreamHost,
          xtreamPort: p.xtreamPort,
          xtreamUsername: p.xtreamUsername,
          lastUpdated: p.lastUpdated instanceof Date ? p.lastUpdated.toISOString() : String(p.lastUpdated),
          createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
        })));
      } else if (action === "stats") {
        const all = await getAllPlaylists();
        const now = Date.now();
        const recentThreshold = 24 * 60 * 60 * 1000;
        res.json({
          totalDevices: all.length,
          m3uDevices: all.filter((p) => p.uploadMethod === "m3u").length,
          xtreamDevices: all.filter((p) => p.uploadMethod === "xtream").length,
          fileDevices: all.filter((p) => p.uploadMethod === "file").length,
          recentUpdates: all.filter((p) => {
            const date = p.lastUpdated instanceof Date ? p.lastUpdated.getTime() : new Date(p.lastUpdated).getTime();
            return now - date < recentThreshold;
          }).length,
        });
      } else {
        res.status(400).json({ error: "Unknown action. Use: list, stats" });
      }
    } else if (req.method === "POST") {
      const body = req.body;
      const action = body?.action;

      if (action === "update-m3u") {
        await updatePlaylistM3u(body.macAddress, body.m3uUrl);
        res.json({ success: true });
      } else if (action === "update-xtream") {
        await updatePlaylistXtream(body.macAddress, body.host, body.port, body.username, body.password);
        res.json({ success: true });
      } else if (action === "update-server-name") {
        await updatePlaylistServerName(body.macAddress, body.serverName);
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "Unknown action" });
      }
    } else if (req.method === "DELETE") {
      const macAddress = req.query.macAddress as string;
      if (!macAddress) {
        res.status(400).json({ error: "macAddress required" });
        return;
      }
      await deletePlaylistByMac(macAddress);
      res.json({ success: true });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("[Admin] Error:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}
