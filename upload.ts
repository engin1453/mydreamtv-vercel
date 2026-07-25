export type ParsedM3U = {
  liveCategories: string[];
  liveChannels: { name: string; url: string; group: string; logo?: string }[];
  movieCategories: string[];
  movies: { name: string; url: string; group: string; logo?: string }[];
  seriesCategories: string[];
  series: { name: string; url: string; group: string; logo?: string }[];
};

export function parseM3UText(text: string): ParsedM3U {
  const lines = text.split('\n');
  const liveCategories = new Set<string>();
  const liveChannels: ParsedM3U['liveChannels'] = [];
  const movieCategories = new Set<string>();
  const movies: ParsedM3U['movies'] = [];
  const seriesCategories = new Set<string>();
  const series: ParsedM3U['series'] = [];

  let currentName = "";
  let currentGroup = "";
  let currentLogo = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF')) {
      const nameMatch = line.match(/tvg-name="([^"]*)"|,(.+)$/);
      currentName = nameMatch?.[1] || nameMatch?.[2] || "";
      const groupMatch = line.match(/group-title="([^"]*)"/);
      currentGroup = groupMatch?.[1] || "";
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      currentLogo = logoMatch?.[1] || "";
    } else if (line && !line.startsWith('#')) {
      if (!currentGroup || !line.includes('://')) continue;

      const groupUpper = currentGroup.toUpperCase();
      const groupLower = currentGroup.toLowerCase();
      const isTurkish = currentGroup.includes('TR') || currentGroup.includes('tr');

      const hasLiveMarker = currentGroup.includes('➧➧') || currentGroup.includes('►►') || currentGroup.includes('>>>');
      const hasMovieMarker = currentGroup.includes('∞') || groupUpper.includes('FILM') || groupUpper.includes('FİLM') || groupUpper.includes('MOVIE') || groupUpper.includes('VIZYON');
      const hasSeriesMarker = groupLower.includes('dizi') || groupUpper.includes('SERI') || groupUpper.includes('SERIES') || groupUpper.includes('SEZON') || groupUpper.includes('SEASON') || groupUpper.includes('BOXSET');

      let isLive = false, isMovie = false, isDizi = false;
      if (hasSeriesMarker) isDizi = true;
      else if (hasMovieMarker) isMovie = true;
      else if (hasLiveMarker) isLive = true;

      if (!isLive && !isMovie && !isDizi) {
        const liveKeywords = ['KANAL', 'HABER', 'SPOR', 'SPORT', 'MUZIK', 'COCUK', 'BELGESEL', 'ULUSAL'];
        if (liveKeywords.some(kw => groupUpper.includes(kw))) isLive = true;
      }

      if (isTurkish) {
        if (isLive) { liveCategories.add(currentGroup); liveChannels.push({ name: currentName, url: line, group: currentGroup, logo: currentLogo }); }
        else if (isDizi) { seriesCategories.add(currentGroup); series.push({ name: currentName, url: line, group: currentGroup, logo: currentLogo }); }
        else if (isMovie) { movieCategories.add(currentGroup); movies.push({ name: currentName, url: line, group: currentGroup, logo: currentLogo }); }
      }
    }
  }

  return {
    liveCategories: Array.from(liveCategories),
    liveChannels,
    movieCategories: Array.from(movieCategories),
    movies,
    seriesCategories: Array.from(seriesCategories),
    series,
  };
}

export async function fetchAndParseM3U(url: string): Promise<ParsedM3U | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (SmartHub; TV) AppleWebKit/537.36 (KHTML, like Gecko) MyDreamTV/1.0', 'Accept': 'text/plain, */*' }
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const text = await response.text();
    if (!text || text.length < 100) return null;
    return parseM3UText(text);
  } catch (e) {
    console.warn("[M3U] Failed to fetch/parse:", (e as Error).message);
    return null;
  }
}
