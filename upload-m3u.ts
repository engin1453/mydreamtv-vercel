import { ParsedM3U } from "./m3u-parser";

// In-memory cache (survives within same Lambda container, reset on cold start)
let cachedData: ParsedM3U | null = null;
let cacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 min

export function setCache(data: ParsedM3U) {
  cachedData = data;
  cacheTime = Date.now();
}

export function clearCache() {
  cachedData = null;
  cacheTime = 0;
}

export function getCachedData(): ParsedM3U | null {
  if (cachedData && Date.now() - cacheTime < CACHE_TTL) {
    return cachedData;
  }
  return null;
}
