import type { SupabaseClient } from '@supabase/supabase-js';
import { getClan } from '../clash/client';
import type { ClashClanMember } from '../clash/types';
import { getSupabaseAdmin } from '../supabase/admin';

export const DEFAULT_CLAN_TAG = '#2GRURLPLL';

type StoredPlayer = {
  id: number;
  tag: string;
  active: boolean;
};

export type ClanSyncResult = {
  clanTag: string;
  clanName: string;
  membersFound: number;
  membersActivated: number;
  membersDeactivated: number;
  snapshotsCreated: number;
  finishedAt: string;
};

function requireAdminClient() {
  const client = getSupabaseAdmin();
  if (!client) throw new Error('SUPABASE_SECRET_KEY não está configurada.');
  return client;
}

function throwIfError(error: { message: string } | null, operation: string) {
  if (error) throw new Error(`${operation}: ${error.message}`);
}

function memberRow(member: ClashClanMember, clanId: number, timestamp: string) {
  return {
    tag: member.tag,
    clan_id: clanId,
    name: member.name,
    role: member.role ?? null,
    town_hall_level: member.townHallLevel ?? null,
    trophies: member.trophies ?? null,
    best_trophies: member.bestTrophies ?? null,
    war_stars: member.warStars ?? 0,
    donations: member.donations ?? 0,
    donations_received: member.donationsReceived ?? 0,
    clan_rank: member.clanRank ?? null,
    previous_clan_rank: member.previousClanRank ?? null,
    exp_level: member.expLevel ?? null,
    league_name: member.league?.name ?? null,
    league_icon_url: member.league?.iconUrls?.medium ?? member.league?.iconUrls?.small ?? null,
    active: true,
    last_seen_at: timestamp,
    updated_at: timestamp,
  };
}

async function markSyncFailed(
  database: SupabaseClient,
  runId: number | null,
  error: unknown,
) {
  if (!runId) return;
  const message = error instanceof Error ? error.message : 'Falha desconhecida na sincronização.';
  await database
    .from('sync_runs')
    .update({ status: 'failed', error_message: message.slice(0, 1_000), finished_at: new Date().toISOString() })
    .eq('id', runId);
}

export async function syncClanManager(): Promise<ClanSyncResult> {
  const database = requireAdminClient();
  const clanTag = process.env.CLAN_TAG ?? DEFAULT_CLAN_TAG;
  let runId: number | null = null;

  try {
    const clan = await getClan(clanTag);
    const timestamp = new Date().toISOString();
    const members = clan.memberList ?? [];

    const clanResult = await database
      .from('clans')
      .upsert({
        tag: clan.tag,
        name: clan.name,
        badge_url: clan.badgeUrls?.large ?? clan.badgeUrls?.medium ?? null,
        clan_level: clan.clanLevel ?? null,
        members: clan.members ?? members.length,
        war_league: clan.warLeague?.name ?? null,
        capital_league: clan.capitalLeague?.name ?? null,
        war_wins: clan.warWins ?? 0,
        war_losses: clan.warLosses ?? 0,
        war_ties: clan.warTies ?? 0,
        win_streak: clan.winStreak ?? 0,
        points: clan.clanPoints ?? null,
        capital_points: clan.clanCapitalPoints ?? null,
        last_synced_at: timestamp,
        updated_at: timestamp,
      }, { onConflict: 'tag' })
      .select('id')
      .single();
    throwIfError(clanResult.error, 'Não foi possível salvar o clã');
    if (!clanResult.data) throw new Error('O Supabase não retornou o clã salvo.');
    const clanId = Number(clanResult.data.id);

    const runResult = await database
      .from('sync_runs')
      .insert({ clan_id: clanId, sync_type: 'clan_and_members', status: 'running', records_found: members.length })
      .select('id')
      .single();
    throwIfError(runResult.error, 'Não foi possível registrar a sincronização');
    if (!runResult.data) throw new Error('O Supabase não retornou o registro da sincronização.');
    runId = Number(runResult.data.id);

    const previousResult = await database
      .from('players')
      .select('id,tag,active')
      .eq('clan_id', clanId);
    throwIfError(previousResult.error, 'Não foi possível ler os jogadores atuais');
    const previousPlayers = (previousResult.data ?? []) as StoredPlayer[];
    const previousByTag = new Map(previousPlayers.map((player) => [player.tag, player]));
    const incomingTags = new Set(members.map((member) => member.tag));

    if (members.length > 0) {
      const upsertResult = await database
        .from('players')
        .upsert(members.map((member) => memberRow(member, clanId, timestamp)), { onConflict: 'tag' });
      throwIfError(upsertResult.error, 'Não foi possível salvar os jogadores');
    }

    const currentResult = await database
      .from('players')
      .select('id,tag,active')
      .eq('clan_id', clanId)
      .in('tag', members.length > 0 ? members.map((member) => member.tag) : ['__none__']);
    throwIfError(currentResult.error, 'Não foi possível reler os jogadores');
    const currentPlayers = (currentResult.data ?? []) as StoredPlayer[];
    const currentByTag = new Map(currentPlayers.map((player) => [player.tag, player]));

    const membershipsResult = await database
      .from('player_memberships')
      .select('player_id')
      .eq('clan_id', clanId)
      .eq('is_current', true);
    throwIfError(membershipsResult.error, 'Não foi possível ler as permanências');
    const openMemberships = new Set((membershipsResult.data ?? []).map((row) => Number(row.player_id)));

    const membershipsToOpen = currentPlayers
      .filter((player) => !openMemberships.has(player.id))
      .map((player) => ({ player_id: player.id, clan_id: clanId, joined_at: timestamp, is_current: true }));
    if (membershipsToOpen.length > 0) {
      const membershipInsert = await database.from('player_memberships').insert(membershipsToOpen);
      throwIfError(membershipInsert.error, 'Não foi possível registrar as entradas');
    }

    const playersLeaving = previousPlayers.filter((player) => player.active && !incomingTags.has(player.tag));
    if (playersLeaving.length > 0) {
      const leavingIds = playersLeaving.map((player) => player.id);
      const playersUpdate = await database
        .from('players')
        .update({ active: false, updated_at: timestamp })
        .in('id', leavingIds);
      throwIfError(playersUpdate.error, 'Não foi possível desativar jogadores ausentes');

      const membershipsUpdate = await database
        .from('player_memberships')
        .update({ is_current: false, left_at: timestamp })
        .eq('clan_id', clanId)
        .eq('is_current', true)
        .in('player_id', leavingIds);
      throwIfError(membershipsUpdate.error, 'Não foi possível registrar as saídas');
    }

    const snapshots = members.flatMap((member) => {
      const player = currentByTag.get(member.tag);
      if (!player) return [];
      return [{
        player_id: player.id,
        trophies: member.trophies ?? null,
        war_stars: member.warStars ?? null,
        donations: member.donations ?? null,
        donations_received: member.donationsReceived ?? null,
        clan_rank: member.clanRank ?? null,
        captured_at: timestamp,
      }];
    });
    if (snapshots.length > 0) {
      const snapshotResult = await database.from('player_snapshots').insert(snapshots);
      throwIfError(snapshotResult.error, 'Não foi possível criar os snapshots');
    }

    const membersActivated = members.filter((member) => previousByTag.get(member.tag)?.active !== true).length;
    const recordsChanged = members.length + playersLeaving.length + snapshots.length;
    const finishResult = await database
      .from('sync_runs')
      .update({
        status: 'completed',
        records_changed: recordsChanged,
        finished_at: timestamp,
        error_message: null,
      })
      .eq('id', runId);
    throwIfError(finishResult.error, 'Não foi possível finalizar o registro da sincronização');

    return {
      clanTag: clan.tag,
      clanName: clan.name,
      membersFound: members.length,
      membersActivated,
      membersDeactivated: playersLeaving.length,
      snapshotsCreated: snapshots.length,
      finishedAt: timestamp,
    };
  } catch (error) {
    await markSyncFailed(database, runId, error);
    throw error;
  }
}
