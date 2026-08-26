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
  if (!supabase) return null;

  const result = await supabase
    .from('clans')
    .select('tag,name,badge_url,war_league,war_league_icon_url,capital_league,capital_league_icon_url,points,capital_points')
    .eq('tag', CLAN_TAG)
    .maybeSingle();

  if (result.error || !result.data) return null;
  return result.data as ClanBranding;
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseAdmin() ?? await getSupabaseServer();
  if (!supabase) return { clan: null, players: [], configured: false, error: null };

  const clanResult = await supabase.from('clans').select('*').eq('tag', CLAN_TAG).maybeSingle();
  if (clanResult.error) return { clan: null, players: [], configured: true, error: clanResult.error.message };
  if (!clanResult.data) return { clan: null, players: [], configured: true, error: null };

  const playersResult = await supabase.from('players')
    .select('id,tag,name,role,town_hall_level,trophies,donations,donations_received,war_stars,war_stars_baseline,war_stars_baseline_at,clan_rank,league_id,league_name,league_icon_url,active,player_scores(total_score)')
    .eq('clan_id', clanResult.data.id).eq('active', true).order('clan_rank', { ascending: true, nullsFirst: false });

  const players = (playersResult.data ?? []).map((row: any) => ({
    ...row,
    score: Number(row.player_scores?.[0]?.total_score ?? 0),
    player_scores: undefined,
  })) as Player[];

  return { clan: clanResult.data as Clan, players, configured: true, error: playersResult.error?.message ?? null };
}
