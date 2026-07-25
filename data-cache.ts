import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import type { Pool } from "pg";

// Unique table name to avoid conflict with existing app
export const mydreamtvPlaylists = pgTable("mydreamtv_playlists", {
  id: serial("id").primaryKey(),
  macAddress: varchar("mac_address", { length: 50 }).notNull().unique(),
  serverName: varchar("server_name", { length: 255 }).notNull(),
  m3uUrl: text("m3u_url"),
  xtreamHost: varchar("xtream_host", { length: 500 }),
  xtreamPort: varchar("xtream_port", { length: 10 }),
  xtreamUsername: varchar("xtream_username", { length: 255 }),
  xtreamPassword: varchar("xtream_password", { length: 255 }),
  uploadMethod: varchar("upload_method", { length: 20 }).notNull(),
  s3Key: text("s3_key"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

let pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getPool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    pool = new (require("pg").Pool)({ connectionString: databaseUrl });
  }
  return pool;
}

export async function getDb() {
  if (!_db) {
    _db = drizzle(getPool());
  }
  return _db;
}

export type Playlist = {
  id: number;
  macAddress: string;
  serverName: string;
  m3uUrl: string | null;
  xtreamHost: string | null;
  xtreamPort: string | null;
  xtreamUsername: string | null;
  xtreamPassword: string | null;
  uploadMethod: string;
  s3Key: string | null;
  lastUpdated: Date;
  createdAt: Date;
};

export async function ensureTable() {
  const db = await getDb();
  try {
    await db.execute(
      `CREATE TABLE IF NOT EXISTS mydreamtv_playlists (
        id SERIAL PRIMARY KEY,
        mac_address VARCHAR(50) NOT NULL UNIQUE,
        server_name VARCHAR(255) NOT NULL,
        m3u_url TEXT,
        xtream_host VARCHAR(500),
        xtream_port VARCHAR(10),
        xtream_username VARCHAR(255),
        xtream_password VARCHAR(255),
        upload_method VARCHAR(20) NOT NULL,
        s3_key TEXT,
        last_updated TIMESTAMP DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`
    );
  } catch (e) {
    console.warn("[DB] Table creation error (may already exist):", (e as Error).message);
  }
}

function normalizeMac(mac: string): string {
  return mac.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
}

export async function upsertPlaylist(data: {
  macAddress: string;
  serverName: string;
  m3uUrl?: string | null;
  xtreamHost?: string | null;
  xtreamPort?: string | null;
  xtreamUsername?: string | null;
  xtreamPassword?: string | null;
  uploadMethod: string;
  s3Key?: string | null;
}): Promise<void> {
  await ensureTable();
  const db = await getDb();
  const mac = normalizeMac(data.macAddress);
  await db.insert(mydreamtvPlaylists).values({
    macAddress: mac,
    serverName: data.serverName,
    m3uUrl: data.m3uUrl ?? null,
    xtreamHost: data.xtreamHost ?? null,
    xtreamPort: data.xtreamPort ?? null,
    xtreamUsername: data.xtreamUsername ?? null,
    xtreamPassword: data.xtreamPassword ?? null,
    uploadMethod: data.uploadMethod,
    s3Key: data.s3Key ?? null,
    lastUpdated: new Date(),
  }).onConflictDoUpdate({
    target: [mydreamtvPlaylists.macAddress],
    set: {
      serverName: data.serverName,
      m3uUrl: data.m3uUrl ?? null,
      xtreamHost: data.xtreamHost ?? null,
      xtreamPort: data.xtreamPort ?? null,
      xtreamUsername: data.xtreamUsername ?? null,
      xtreamPassword: data.xtreamPassword ?? null,
      uploadMethod: data.uploadMethod,
      lastUpdated: new Date(),
    },
  });
}

export async function getPlaylistByMac(macAddress: string): Promise<Playlist | undefined> {
  const db = await getDb();
  const normalized = normalizeMac(macAddress);
  const result = await db.select().from(mydreamtvPlaylists).where(eq(mydreamtvPlaylists.macAddress, normalized)).limit(1);
  return result.length > 0 ? (result[0] as Playlist) : undefined;
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  await ensureTable();
  const db = await getDb();
  const result = await db.select().from(mydreamtvPlaylists).orderBy(mydreamtvPlaylists.lastUpdated);
  return result as Playlist[];
}

export async function deletePlaylistByMac(macAddress: string): Promise<boolean> {
  const db = await getDb();
  await db.delete(mydreamtvPlaylists).where(eq(mydreamtvPlaylists.macAddress, normalizeMac(macAddress)));
  return true;
}

export async function updatePlaylistM3u(macAddress: string, m3uUrl: string): Promise<boolean> {
  const db = await getDb();
  const normalized = normalizeMac(macAddress);
  await db.update(mydreamtvPlaylists).set({ m3uUrl, uploadMethod: "m3u", lastUpdated: new Date() }).where(eq(mydreamtvPlaylists.macAddress, normalized));
  return true;
}

export async function updatePlaylistXtream(macAddress: string, host: string, port: string, username: string, password: string): Promise<boolean> {
  const db = await getDb();
  const normalized = normalizeMac(macAddress);
  await db.update(mydreamtvPlaylists).set({ xtreamHost: host, xtreamPort: port, xtreamUsername: username, xtreamPassword: password, uploadMethod: "xtream", lastUpdated: new Date() }).where(eq(mydreamtvPlaylists.macAddress, normalized));
  return true;
}

export async function updatePlaylistServerName(macAddress: string, serverName: string): Promise<boolean> {
  const db = await getDb();
  const normalized = normalizeMac(macAddress);
  await db.update(mydreamtvPlaylists).set({ serverName, lastUpdated: new Date() }).where(eq(mydreamtvPlaylists.macAddress, normalized));
  return true;
}
