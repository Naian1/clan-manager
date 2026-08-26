import { ClashApiError, getCwlLeagueGroup, getCwlWar } from '../clash/client';
import type { ClashCurrentWar, ClashWarClan } from '../clash/types';
import { getSupabaseAdmin } from '../supabase/admin';
import { DEFAULT_CLAN_TAG } from './sync-clan';

function requireAdminClient() {
  const client = getSupabaseAdmin();
  if (!client) throw new Error('SUPABASE_SECRET_KEY não está configurada.');
  return client;
}

function normalized(tag?: string | null) {
  if (!tag) return '';
  const value = tag.trim().toUpperCase();
  return value.startsWith('#') ? value : `#${value}`;
}

function isPlaceholderWarTag(tag?: string) {
  const value = normalized(tag);
  return !value || value === '#0';
}

function sideForClan(war: ClashCurrentWar, clanTag: string): { ours?: ClashWarClan; opponent?: ClashWarClan } {
  const wanted = normalized(clanTag);
  if (normalized(war.clan?.tag) === wanted) return { ours: war.clan, opponent: war.opponent };
  if (normalized(war.opponent?.tag) === wanted) return { ours: war.opponent, opponent: war.clan };
  return {};
}

async function findClanWar(warTags: string[], clanTag: string) {
  const validTags = warTags.filter(tag => !isPlaceholderWarTag(tag));
  const wars = await Promise.all(validTags.map(async tag => {
    try {
      return await getCwlWar(tag);
    } catch (error) {
      console.warn('[cwl-sync] guerra indisponível', tag, error instanceof Error ? error.message : error);
      return null;
    }
  }));

  return wars.find(war => war && sideForClan(war, clanTag).ours) ?? null;
}

export async function syncCwlMonitoring() {
  const database = requireAdminClient();
  const clanTag = process.env.CLAN_TAG ?? DEFAULT_CLAN_TAG;

  let group;
  try {
    group = await getCwlLeagueGroup(clanTag);
  } catch (error) {
    if (error instanceof ClashApiError && error.status === 404) {
      return { clanTag, active: false, season: null, rounds: 0, attacks: 0, finishedAt: new Date().toISOString() };
    }
    throw error;
  }

  const state = String(group.state ?? 'unknown');
  if (!group.season || /not.?in.?war|group.?not.?found/i.test(state)) {
    return { clanTag, active: false, season: group.season ?? null, rounds: group.rounds?.length ?? 0, attacks: 0, finishedAt: new Date().toISOString() };
  }

  const clanResult = await database.from('clans').select('id,war_league').eq('tag', clanTag).maybeSingle();
  if (clanResult.error) throw new Error(`Não foi possível localizar o clã para CWL: ${clanResult.error.message}`);
  if (!clanResult.data) throw new Error('O clã ainda não existe no banco. Execute o sync de membros primeiro.');
  const clanId = Number(clanResult.data.id);

  const seasonResult = await database.from('cwl_seasons').upsert({
    clan_id: clanId,
    season: group.season,
    state,
    league_name: clanResult.data.war_league ?? null,
  }, { onConflict: 'clan_id,season' }).select('id').single();
  if (seasonResult.error) throw new Error(`Não foi possível salvar a temporada de CWL: ${seasonResult.error.message}`);
  const seasonId = Number(seasonResult.data.id);

  const playersResult = await database.from('players').select('id,tag').eq('clan_id', clanId);
  if (playersResult.error) throw new Error(`Não foi possível relacionar os jogadores da CWL: ${playersResult.error.message}`);
  const playerByTag = new Map((playersResult.data ?? []).map((player: any) => [normalized(player.tag), Number(player.id)]));

  const attackRows: Array<{
    cwl_season_id: number;
    player_id: number;
    round: number;
    stars: number;
    destruction_percentage: number;
    defender_tag: string;
    attacker_town_hall: number | null;
    defender_town_hall: number | null;
  }> = [];
  let roundsFound = 0;

  for (const [roundIndex, round] of (group.rounds ?? []).entries()) {
    const war = await findClanWar(round.warTags ?? [], clanTag);
    if (!war) continue;
    const { ours, opponent } = sideForClan(war, clanTag);
    if (!ours) continue;
    roundsFound += 1;

    const defenderByTag = new Map((opponent?.members ?? []).map(member => [normalized(member.tag), member]));
    for (const member of ours.members ?? []) {
      const playerId = playerByTag.get(normalized(member.tag));
      const attack = member.attacks?.[0];
      if (!playerId || !attack) continue;
      const defender = defenderByTag.get(normalized(attack.defenderTag));
      attackRows.push({
        cwl_season_id: seasonId,
        player_id: playerId,
        round: roundIndex + 1,
        stars: Number(attack.stars ?? 0),
        destruction_percentage: Number(attack.destructionPercentage ?? 0),
        defender_tag: attack.defenderTag,
        attacker_town_hall: member.townhallLevel ?? member.townHallLevel ?? null,
        defender_town_hall: defender?.townhallLevel ?? defender?.townHallLevel ?? null,
      });
    }
  }

  if (attackRows.length) {
    const attacksResult = await database.from('cwl_attacks').upsert(attackRows, { onConflict: 'cwl_season_id,player_id,round' });
    if (attacksResult.error) throw new Error(`Não foi possível salvar os ataques da CWL: ${attacksResult.error.message}`);
  }

  return {
    clanTag,
    active: true,
    season: group.season,
    state,
    rounds: roundsFound,
    attacks: attackRows.length,
    finishedAt: new Date().toISOString(),
  };
}
