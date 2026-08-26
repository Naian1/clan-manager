import type {
  ClashApiList,
  ClashCapitalRaidSeasons,
  ClashClan,
  ClashClanMember,
  ClashCurrentWar,
  ClashCwlLeagueGroup,
  ClashPlayer,
  ClashPlayerBattleLog,
  ClashPlayerLeagueGroup,
  ClashPlayerLeagueHistory,
  ClashWarLog,
} from './types';

const OFFICIAL_API_URL = 'https://api.clashofclans.com';

export class ClashApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ClashApiError';
  }
}

function normalizeTag(tag: string) {
  const normalized = tag.trim().toUpperCase();
  return normalized.startsWith('#') ? normalized : `#${normalized}`;
}

function getConfiguration() {
  const token = process.env.CLASH_API_TOKEN ?? process.env.SUPERCELL_API_TOKEN;
  if (!token) throw new Error('CLASH_API_TOKEN não está configurado.');
  const baseUrl = (process.env.CLASH_API_BASE_URL ?? OFFICIAL_API_URL).replace(/\/$/, '');
  return { token, baseUrl };
}

type RequestOptions = { method?: 'GET' | 'POST'; body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, baseUrl } = getConfiguration();
  const method = options.method ?? 'GET';
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string; reason?: string } | null;
    const detail = payload?.message ?? payload?.reason ?? response.statusText;
    throw new ClashApiError(`A API do Clash respondeu ${response.status}: ${detail}`, response.status);
  }
  return response.json() as Promise<T>;
}

function listPath(path: string, limit?: number) {
  if (!limit) return path;
  const query = new URLSearchParams({ limit: String(Math.max(1, Math.min(200, limit))) });
  return `${path}?${query.toString()}`;
}

export function getClan(tag: string): Promise<ClashClan> {
  return request<ClashClan>(`/v1/clans/${encodeURIComponent(normalizeTag(tag))}`);
}

export function getClanMembers(tag: string, limit = 50): Promise<ClashApiList<ClashClanMember>> {
  return request<ClashApiList<ClashClanMember>>(listPath(`/v1/clans/${encodeURIComponent(normalizeTag(tag))}/members`, limit));
}

export function searchClans(params: Record<string, string | number | boolean | undefined>): Promise<ClashApiList> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== '') query.set(key, String(value));
  return request<ClashApiList>(`/v1/clans?${query.toString()}`);
}

export function getCurrentWar(tag: string): Promise<ClashCurrentWar> {
  return request<ClashCurrentWar>(`/v1/clans/${encodeURIComponent(normalizeTag(tag))}/currentwar`);
}

export function getWarLog(tag: string, limit = 20): Promise<ClashWarLog> {
  return request<ClashWarLog>(listPath(`/v1/clans/${encodeURIComponent(normalizeTag(tag))}/warlog`, limit));
}

export function getCwlLeagueGroup(clanTag: string): Promise<ClashCwlLeagueGroup> {
  return request<ClashCwlLeagueGroup>(`/v1/clans/${encodeURIComponent(normalizeTag(clanTag))}/currentwar/leaguegroup`);
}

export function getCwlWar(warTag: string): Promise<ClashCurrentWar> {
  return request<ClashCurrentWar>(`/v1/clanwarleagues/wars/${encodeURIComponent(normalizeTag(warTag))}`);
}

export function getCapitalRaidSeasons(clanTag: string, limit = 10): Promise<ClashCapitalRaidSeasons> {
  return request<ClashCapitalRaidSeasons>(listPath(`/v1/clans/${encodeURIComponent(normalizeTag(clanTag))}/capitalraidseasons`, limit));
}

export function getPlayer(tag: string): Promise<ClashPlayer> {
  return request<ClashPlayer>(`/v1/players/${encodeURIComponent(normalizeTag(tag))}`);
}

export function getPlayerBattleLog(tag: string): Promise<ClashPlayerBattleLog> {
  return request<ClashPlayerBattleLog>(`/v1/players/${encodeURIComponent(normalizeTag(tag))}/battlelog`);
}

export function getPlayerLeagueHistory(tag: string): Promise<ClashPlayerLeagueHistory> {
  return request<ClashPlayerLeagueHistory>(`/v1/players/${encodeURIComponent(normalizeTag(tag))}/leaguehistory`);
}

export function verifyPlayerToken(tag: string, playerApiToken: string): Promise<{ status?: string }> {
  return request<{ status?: string }>(`/v1/players/${encodeURIComponent(normalizeTag(tag))}/verifytoken`, { method: 'POST', body: { token: playerApiToken } });
}

export function getPlayerLeagueGroup(playerTag: string, leagueGroupTag: string, leagueSeasonId: string | number): Promise<ClashPlayerLeagueGroup> {
  const query = new URLSearchParams({ playerTag: normalizeTag(playerTag) });
  return request<ClashPlayerLeagueGroup>(`/v1/leaguegroup/${encodeURIComponent(normalizeTag(leagueGroupTag))}/${encodeURIComponent(String(leagueSeasonId))}?${query.toString()}`);
}

export function getLeagueTiers(): Promise<ClashApiList> { return request<ClashApiList>('/v1/leaguetiers'); }
export function getLeagueTier(id: string | number): Promise<Record<string, unknown>> { return request(`/v1/leaguetiers/${encodeURIComponent(String(id))}`); }
export function getLeagues(): Promise<ClashApiList> { return request<ClashApiList>('/v1/leagues'); }
export function getLeague(id: string | number): Promise<Record<string, unknown>> { return request(`/v1/leagues/${encodeURIComponent(String(id))}`); }
export function getLeagueSeasons(id: string | number): Promise<ClashApiList> { return request<ClashApiList>(`/v1/leagues/${encodeURIComponent(String(id))}/seasons`); }
export function getLeagueSeasonRanking(leagueId: string | number, seasonId: string | number, limit = 20): Promise<ClashApiList> { return request<ClashApiList>(listPath(`/v1/leagues/${encodeURIComponent(String(leagueId))}/seasons/${encodeURIComponent(String(seasonId))}`, limit)); }
export function getWarLeagues(): Promise<ClashApiList> { return request<ClashApiList>('/v1/warleagues'); }
export function getWarLeague(id: string | number): Promise<Record<string, unknown>> { return request(`/v1/warleagues/${encodeURIComponent(String(id))}`); }
export function getCapitalLeagues(): Promise<ClashApiList> { return request<ClashApiList>('/v1/capitalleagues'); }
export function getCapitalLeague(id: string | number): Promise<Record<string, unknown>> { return request(`/v1/capitalleagues/${encodeURIComponent(String(id))}`); }
export function getBuilderBaseLeagues(): Promise<ClashApiList> { return request<ClashApiList>('/v1/builderbaseleagues'); }
export function getBuilderBaseLeague(id: string | number): Promise<Record<string, unknown>> { return request(`/v1/builderbaseleagues/${encodeURIComponent(String(id))}`); }
export function getLocations(limit = 100): Promise<ClashApiList> { return request<ClashApiList>(listPath('/v1/locations', limit)); }
export function getLocation(id: string | number): Promise<Record<string, unknown>> { return request(`/v1/locations/${encodeURIComponent(String(id))}`); }
export function getClanRanking(locationId: string | number, limit = 20): Promise<ClashApiList> { return request<ClashApiList>(listPath(`/v1/locations/${encodeURIComponent(String(locationId))}/rankings/clans`, limit)); }
export function getPlayerRanking(locationId: string | number, limit = 20): Promise<ClashApiList> { return request<ClashApiList>(listPath(`/v1/locations/${encodeURIComponent(String(locationId))}/rankings/players`, limit)); }
export function getBuilderPlayerRanking(locationId: string | number, limit = 20): Promise<ClashApiList> { return request<ClashApiList>(listPath(`/v1/locations/${encodeURIComponent(String(locationId))}/rankings/players-builder-base`, limit)); }
export function getBuilderClanRanking(locationId: string | number, limit = 20): Promise<ClashApiList> { return request<ClashApiList>(listPath(`/v1/locations/${encodeURIComponent(String(locationId))}/rankings/clans-builder-base`, limit)); }
export function getCapitalRanking(locationId: string | number, limit = 20): Promise<ClashApiList> { return request<ClashApiList>(listPath(`/v1/locations/${encodeURIComponent(String(locationId))}/rankings/capitals`, limit)); }
export function getCurrentGoldPass(): Promise<Record<string, unknown>> { return request('/v1/goldpass/seasons/current'); }
export function getPlayerLabels(limit = 100): Promise<ClashApiList> { return request<ClashApiList>(listPath('/v1/labels/players', limit)); }
export function getClanLabels(limit = 100): Promise<ClashApiList> { return request<ClashApiList>(listPath('/v1/labels/clans', limit)); }
