import { getClan } from './clash/client';
import { getSupabaseServer } from './supabase/server';
import { getSupabaseAdmin } from './supabase/admin';

export const CLAN_TAG = '#2GRURLPLL';

export type Clan = {
  id: number;
  tag: string;
  name: string | null;
  badge_url: string | null;
  clan_level: number | null;
  members: number | null;
  war_league_id: number | null;
  war_league: string | null;
  war_league_icon_url: string | null;
  capital_league_id: number | null;
  capital_league: string | null;
  capital_league_icon_url: string | null;
  war_wins: number | null;
  war_losses: number | null;
  war_ties: number | null;
  win_streak: number | null;
  points: number | null;
  capital_points: number | null;
  last_synced_at: string | null;
};

export type ClanBranding = Pick<Clan,
  'tag' | 'name' | 'badge_url' | 'war_league' | 'war_league_icon_url' | 'capital_league' | 'capital_league_icon_url' | 'points' | 'capital_points'
>;

export type Player = {
  id: number;
  tag: string;
  name: string;
  role: string | null;
  town_hall_level: number | null;
  trophies: number | null;
  donations: number | null;
  donations_received: number | null;
  war_stars: number | null;
  war_stars_baseline: number | null;
  war_stars_baseline_at: string | null;
  clan_rank: number | null;
  league_id: number | null;
  league_name: string | null;
  league_icon_url: string | null;
  active: boolean;
  score: number;
};

export type DashboardData = { clan: Clan | null; players: Player[]; configured: boolean; error: string | null };

export async function getClanBranding(): Promise<ClanBranding | null> {
  const supabase = getSupabaseAdmin() ?? await getSupabaseServer();
  const [storedResult, live] = await Promise.all([
    supabase
      ? supabase.from('clans').select('tag,name,badge_url,war_league,war_league_icon_url,capital_league,capital_league_icon_url,points,capital_points').eq('tag', CLAN_TAG).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    getClan(CLAN_TAG).catch(() => null),
  ]);

  const stored = storedResult.data as ClanBranding | null;
  if (!stored && !live) return null;
  return {
    tag: live?.tag ?? stored?.tag ?? CLAN_TAG,
    name: live?.name ?? stored?.name ?? null,
    badge_url: live?.badgeUrls?.large ?? live?.badgeUrls?.medium ?? stored?.badge_url ?? null,
    war_league: live?.warLeague?.name ?? stored?.war_league ?? null,
    war_league_icon_url: stored?.war_league_icon_url ?? null,
    capital_league: live?.capitalLeague?.name ?? stored?.capital_league ?? null,
    capital_league_icon_url: stored?.capital_league_icon_url ?? null,
    points: live?.clanPoints ?? stored?.points ?? null,
    capital_points: live?.clanCapitalPoints ?? stored?.capital_points ?? null,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseAdmin() ?? await getSupabaseServer();
  if (!supabase) return { clan: null, players: [], configured: false, error: null };

  const [clanResult, live] = await Promise.all([
    supabase.from('clans').select('*').eq('tag', CLAN_TAG).maybeSingle(),
    getClan(CLAN_TAG).catch(() => null),
  ]);
  if (clanResult.error) return { clan: null, players: [], configured: true, error: clanResult.error.message };
  if (!clanResult.data) return { clan: null, players: [], configured: true, error: null };

  const playersResult = await supabase.from('players')
    .select('id,tag,name,role,town_hall_level,trophies,donations,donations_received,war_stars,war_stars_baseline,war_stars_baseline_at,clan_rank,league_id,league_name,league_icon_url,active,player_scores(total_score)')
    .eq('clan_id', clanResult.data.id).eq('active', true).order('clan_rank', { ascending: true, nullsFirst: false });

  const liveByTag = new Map((live?.memberList ?? []).map(member => [member.tag, member]));
  const players = (playersResult.data ?? []).map((row: any) => {
    const member = liveByTag.get(row.tag);
    const league = member?.leagueTier ?? member?.league;
    return {
      ...row,
      name: member?.name ?? row.name,
      role: member?.role ?? row.role,
      town_hall_level: member?.townHallLevel ?? row.town_hall_level,
      trophies: member?.trophies ?? row.trophies,
      donations: member?.donations ?? row.donations,
      donations_received: member?.donationsReceived ?? row.donations_received,
      clan_rank: member?.clanRank ?? row.clan_rank,
      league_id: league?.id ?? row.league_id,
      league_name: league?.name ?? row.league_name,
      league_icon_url: league?.iconUrls?.medium ?? league?.iconUrls?.small ?? row.league_icon_url,
      score: Number(row.player_scores?.[0]?.total_score ?? 0),
      player_scores: undefined,
    };
  }) as Player[];

  const clan = {
    ...clanResult.data,
    tag: live?.tag ?? clanResult.data.tag,
    name: live?.name ?? clanResult.data.name,
    badge_url: live?.badgeUrls?.large ?? live?.badgeUrls?.medium ?? clanResult.data.badge_url,
    clan_level: live?.clanLevel ?? clanResult.data.clan_level,
    members: live?.members ?? clanResult.data.members,
    war_league_id: live?.warLeague?.id ?? clanResult.data.war_league_id,
    war_league: live?.warLeague?.name ?? clanResult.data.war_league,
    capital_league_id: live?.capitalLeague?.id ?? clanResult.data.capital_league_id,
    capital_league: live?.capitalLeague?.name ?? clanResult.data.capital_league,
    war_wins: live?.warWins ?? clanResult.data.war_wins,
    war_losses: live?.warLosses ?? clanResult.data.war_losses,
    war_ties: live?.warTies ?? clanResult.data.war_ties,
    win_streak: live?.winStreak ?? clanResult.data.win_streak,
    points: live?.clanPoints ?? clanResult.data.points,
    capital_points: live?.clanCapitalPoints ?? clanResult.data.capital_points,
  } as Clan;

  return { clan, players, configured: true, error: playersResult.error?.message ?? null };
}
