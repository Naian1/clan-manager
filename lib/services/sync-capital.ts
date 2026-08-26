import { getCapitalRaidSeasons } from '../clash/client';
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
  if (!match) return value;
  const [, y, m, d, hh, mm, ss] = match;
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
}

export async function syncCapitalMonitoring() {
  const database = requireAdminClient();
  const clanTag = process.env.CLAN_TAG ?? DEFAULT_CLAN_TAG;
  const clanResult = await database.from('clans').select('id').eq('tag', clanTag).maybeSingle();
  if (clanResult.error) throw new Error(`Não foi possível localizar o clã para Capital: ${clanResult.error.message}`);
  if (!clanResult.data) throw new Error('O clã ainda não existe no banco. Execute o sync de membros primeiro.');
  const clanId = Number(clanResult.data.id);

  const raids = await getCapitalRaidSeasons(clanTag, 10).catch((error) => {
    console.warn('[capital-sync] temporadas indisponíveis', error instanceof Error ? error.message : error);
    return { items: [] };
  });

  const playersResult = await database.from('players').select('id,tag').eq('clan_id', clanId);
  if (playersResult.error) throw new Error(`Não foi possível relacionar jogadores da Capital: ${playersResult.error.message}`);
  const playerByTag = new Map((playersResult.data ?? []).map((player: any) => [String(player.tag).toUpperCase(), Number(player.id)]));

  let seasonsSaved = 0;
  let membersSaved = 0;
  for (const season of raids.items ?? []) {
    const startTime = toIso(season.startTime);
    if (!startTime) continue;
    const timestamp = new Date().toISOString();
    const seasonResult = await database.from('capital_raid_seasons').upsert({
      clan_id: clanId,
      start_time: startTime,
      end_time: toIso(season.endTime),
      state: season.state ?? null,
      capital_total_loot: season.capitalTotalLoot ?? 0,
      raids_completed: season.raidsCompleted ?? 0,
      total_attacks: season.totalAttacks ?? 0,
      enemy_districts_destroyed: season.enemyDistrictsDestroyed ?? 0,
      offensive_reward: season.offensiveReward ?? 0,
      defensive_reward: season.defensiveReward ?? 0,
      raw: season,
      updated_at: timestamp,
    }, { onConflict: 'clan_id,start_time' }).select('id').single();
    if (seasonResult.error) throw new Error(`Não foi possível salvar Raid Weekend: ${seasonResult.error.message}`);
    const seasonId = Number(seasonResult.data.id);
    seasonsSaved += 1;

    const memberRows = (season.members ?? []).map((member) => ({
      raid_season_id: seasonId,
      player_id: playerByTag.get(member.tag.toUpperCase()) ?? null,
      player_tag: member.tag,
      player_name: member.name,
      attacks: member.attacks ?? 0,
      attack_limit: member.attackLimit ?? null,
      bonus_attack_limit: member.bonusAttackLimit ?? null,
      capital_resources_looted: member.capitalResourcesLooted ?? 0,
    }));
    if (memberRows.length) {
      const membersResult = await database.from('capital_raid_members').upsert(memberRows, { onConflict: 'raid_season_id,player_tag' });
      if (membersResult.error) throw new Error(`Não foi possível salvar participantes da Capital: ${membersResult.error.message}`);
      membersSaved += memberRows.length;
    }
  }

  return { clanTag, seasonsSaved, membersSaved, finishedAt: new Date().toISOString() };
}
