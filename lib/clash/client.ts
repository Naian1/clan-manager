import type { ClashClan, ClashCurrentWar, ClashPlayer, ClashWarLog } from './types';

const OFFICIAL_API_URL = 'https://api.clashofclans.com';

export class ClashApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
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

async function request<T>(path: string): Promise<T> {
  const { token, baseUrl } = getConfiguration();
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string; reason?: string }
      | null;
    const detail = payload?.message ?? payload?.reason ?? response.statusText;
    throw new ClashApiError(`A API do Clash respondeu ${response.status}: ${detail}`, response.status);
  }

  return response.json() as Promise<T>;
}

export function getClan(tag: string): Promise<ClashClan> {
  return request<ClashClan>(`/v1/clans/${encodeURIComponent(normalizeTag(tag))}`);
}

export function getCurrentWar(tag: string): Promise<ClashCurrentWar> {
  return request<ClashCurrentWar>(`/v1/clans/${encodeURIComponent(normalizeTag(tag))}/currentwar`);
}

export function getWarLog(tag: string, limit = 20): Promise<ClashWarLog> {
  return request<ClashWarLog>(`/v1/clans/${encodeURIComponent(normalizeTag(tag))}/warlog?limit=${Math.max(1, Math.min(200, limit))}`);
}

export function getPlayer(tag: string): Promise<ClashPlayer> {
  return request<ClashPlayer>(`/v1/players/${encodeURIComponent(normalizeTag(tag))}`);
}
