import { getCurrentWar, getWarLog } from '../clash/client';
import type { ClashCurrentWar, ClashWarClan, ClashWarLogEntry, ClashWarMember } from '../clash/types';
import { getSupabaseAdmin } from '../supabase/admin';
import { DEFAULT_CLAN_TAG } from './sync-clan';

function requireAdminClient() {
  const client = getSupabaseAdmin();
  if (!client) throw new Error('SUPABASE_SECRET_KEY não está configurada.');
  return client;
}

function toIso(value?: string) {
  if (!value) return null;
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.\d+)?Z?$/);
  if (!match) return null;
  const [, y, m, d, hh, mm, ss] = match;
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
}

function warKey(clanTag: string, opponentTag?: string, endTime?: string) {
  return `${clanTag}:${opponentTag ?? 'unknown'}:${endTime ?? 'unknown'}`;
}

function calculateResult(war: ClashCurrentWar) {
  if (war.state !== 'warEnded' || !war.clan || !war.opponent) return null;
  const clanStars = war.clan.stars ?? 0;
  const opponentStars = war.opponent.stars ?? 0;
  if (clanStars > opponentStars) return 'win';
  if (clanStars < opponentStars) return 'lose';
  const clanDestruction = Number(war.clan.destructionPercentage ?? 0);
  const opponentDestruction = Number(war.opponent.destructionPercentage ?? 0);
  if (clanDestruction > opponentDestruction) return 'win';
  if (clanDestruction < opponentDestruction) return 'lose';
  return 'tie';
}

function th(member?: ClashWarMember) {
  return member?.townhallLevel ?? member?.townHallLevel ?? null;
}

function memberMaps(side?: ClashWarClan) {
  const byTag = new Map<string, ClashWarMember>();
  for (const member of side?.members ?? []) byTag.set(member.tag, member);
  return byTag;
}

async function upsertWarSummary(
  database: ReturnType<typeof requireAdminClient>,
  clanId: number,
  clanTag: string,
  entry: ClashWarLogEntry,
) {
  const timestamp = new Date().toISOString();
  const key = warKey(clanTag, entry.opponent?.tag, entry.endTime);
  const row = {
    clan_id: clanId,
    war_key: key,
    state: 'warEnded',
    team_size: entry.teamSize ?? null,
    attacks_per_member: entry.attacksPerMember ?? null,
    end_time: toIso(entry.endTime),
    clan_stars: entry.clan?.stars ?? 0,
    clan_destruction: entry.clan?.destructionPercentage ?? 0,
    clan_attacks: entry.clan?.attacks ?? 0,
    opponent_name: entry.opponent?.name ?? null,
    opponent_tag: entry.opponent?.tag ?? null,
    opponent_badge_url: entry.opponent?.badgeUrls?.large ?? entry.opponent?.badgeUrls?.medium ?? null,
    opponent_stars: entry.opponent?.stars ?? 0,
    opponent_destruction: entry.opponent?.destructionPercentage ?? 0,
    opponent_attacks: entry.opponent?.attacks ?? 0,
    result: entry.result ?? null,
    battle_modifier: entry.battleModifier ?? null,
    observed_at: timestamp,
    raw: entry,
    updated_at: timestamp,
  };

  const result = await database.from('wars').upsert(row, { onConflict: 'war_key' }).select('id').single();
  if (result.error) throw new Error(`Não foi possível salvar guerra do warlog: ${result.error.message}`);
  return Number(result.data.id);
}

async function persistCurrentWar(
  database: ReturnType<typeof requireAdminClient>,
  clanId: number,
  clanTag: string,
  war: ClashCurrentWar,
) {
  if (war.state === 'notInWar' || !war.clan || !war.opponent) return { warId: null, members: 0, attacks: 0 };

  const timestamp = new Date().toISOString();
  const key = warKey(clanTag, war.opponent.tag, war.endTime);
  const warRow = {
    clan_id: clanId,
    war_key: key,
    state: war.state,
    team_size: war.teamSize ?? null,
    attacks_per_member: war.attacksPerMember ?? null,
    preparation_start_time: toIso(war.preparationStartTime),
    start_time: toIso(war.startTime),
    end_time: toIso(war.endTime),
    clan_stars: war.clan.stars ?? 0,
    clan_destruction: war.clan.destructionPercentage ?? 0,
    clan_attacks: war.clan.attacks ?? 0,
    opponent_name: war.opponent.name,
    opponent_tag: war.opponent.tag,
    opponent_badge_url: war.opponent.badgeUrls?.large ?? war.opponent.badgeUrls?.medium ?? null,
    opponent_stars: war.opponent.stars ?? 0,
    opponent_destruction: war.opponent.destructionPercentage ?? 0,
    opponent_attacks: war.opponent.attacks ?? 0,
    result: calculateResult(war),
    battle_modifier: war.battleModifier ?? null,
    observed_at: timestamp,
    raw: war,
    updated_at: timestamp,
  };

  const warResult = await database.from('wars').upsert(warRow, { onConflict: 'war_key' }).select('id').single();
  if (warResult.error) throw new Error(`Não foi possível salvar a guerra atual: ${warResult.error.message}`);
  const warId = Number(warResult.data.id);

  const ourTags = (war.clan.members ?? []).map((member) => member.tag);
  const playersResult = ourTags.length
    ? await database.from('players').select('id,tag').in('tag', ourTags)
    : { data: [], error: null };
  if (playersResult.error) throw new Error(`Não foi possível relacionar jogadores da guerra: ${playersResult.error.message}`);
  const playerByTag = new Map((playersResult.data ?? []).map((player: any) => [player.tag, Number(player.id)]));

  const clanByTag = memberMaps(war.clan);
  const opponentByTag = memberMaps(war.opponent);
  const memberRows: any[] = [];

  const appendMembers = (sideName: 'clan' | 'opponent', side?: ClashWarClan) => {
    for (const member of side?.members ?? []) {
      const attacks = member.attacks ?? [];
      memberRows.push({
        war_id: warId,
        player_id: sideName === 'clan' ? playerByTag.get(member.tag) ?? null : null,
        side: sideName,
        player_tag: member.tag,
        player_name: member.name,
        map_position: member.mapPosition,
        town_hall_level: th(member),
        opponent_attacks: member.opponentAttacks ?? 0,
        best_opponent_stars: member.bestOpponentAttack?.stars ?? null,
        best_opponent_destruction: member.bestOpponentAttack?.destructionPercentage ?? null,
        attacks_used: attacks.length,
        stars_earned: attacks.reduce((total, attack) => total + (attack.stars ?? 0), 0),
        best_attack_destruction: attacks.length ? Math.max(...attacks.map((attack) => Number(attack.destructionPercentage ?? 0))) : null,
      });
    }
  };

  appendMembers('clan', war.clan);
  appendMembers('opponent', war.opponent);

  if (memberRows.length) {
    const membersResult = await database.from('war_members').upsert(memberRows, { onConflict: 'war_id,side,player_tag' });
    if (membersResult.error) throw new Error(`Não foi possível salvar o mapa da guerra: ${membersResult.error.message}`);
  }

  const attackRows: any[] = [];
  const appendAttacks = (attackerSide: 'clan' | 'opponent', side?: ClashWarClan) => {
    const defenderSide = attackerSide === 'clan' ? 'opponent' : 'clan';
    const defenderMap = attackerSide === 'clan' ? opponentByTag : clanByTag;
    const attackerMap = attackerSide === 'clan' ? clanByTag : opponentByTag;

    for (const member of side?.members ?? []) {
      for (const [index, attack] of (member.attacks ?? []).entries()) {
        const attacker = attackerMap.get(attack.attackerTag) ?? member;
        const defender = defenderMap.get(attack.defenderTag);
        attackRows.push({
          war_id: warId,
          attacker_player_id: attackerSide === 'clan' ? playerByTag.get(attack.attackerTag) ?? null : null,
          attacker_tag: attack.attackerTag,
          defender_tag: attack.defenderTag,
          stars: attack.stars,
          destruction_percentage: attack.destructionPercentage,
          attack_order: attack.order ?? index + 1,
          duration: attack.duration ?? null,
          attacker_town_hall: th(attacker),
          defender_town_hall: th(defender),
          attacker_side: attackerSide,
          defender_side: defenderSide,
          attacker_map_position: attacker?.mapPosition ?? null,
          defender_map_position: defender?.mapPosition ?? null,
          captured_at: timestamp,
        });
      }
    }
  };

  appendAttacks('clan', war.clan);
  appendAttacks('opponent', war.opponent);

  if (attackRows.length) {
    const attacksResult = await database.from('war_attacks').upsert(attackRows, { onConflict: 'war_id,attacker_tag,attack_order' });
    if (attacksResult.error) throw new Error(`Não foi possível salvar os ataques da guerra: ${attacksResult.error.message}`);
  }

  return { warId, members: memberRows.length, attacks: attackRows.length };
}

export async function syncWarMonitoring() {
  const database = requireAdminClient();
  const clanTag = process.env.CLAN_TAG ?? DEFAULT_CLAN_TAG;
  const clanResult = await database.from('clans').select('id').eq('tag', clanTag).maybeSingle();
  if (clanResult.error) throw new Error(`Não foi possível localizar o clã: ${clanResult.error.message}`);
  if (!clanResult.data) throw new Error('O clã ainda não existe no banco. Execute o sync de membros primeiro.');
  const clanId = Number(clanResult.data.id);

  const [warLog, currentWar] = await Promise.all([
    getWarLog(clanTag, 20).catch((error) => {
      console.warn('[war-sync] warlog indisponível', error instanceof Error ? error.message : error);
      return { items: [] };
    }),
    getCurrentWar(clanTag),
  ]);

  let backfilled = 0;
  for (const entry of warLog.items ?? []) {
    await upsertWarSummary(database, clanId, clanTag, entry);
    backfilled += 1;
  }

  const current = await persistCurrentWar(database, clanId, clanTag, currentWar);
  return {
    clanTag,
    backfilledWars: backfilled,
    currentWarId: current.warId,
    currentWarMembers: current.members,
    currentWarAttacks: current.attacks,
    finishedAt: new Date().toISOString(),
  };
}
