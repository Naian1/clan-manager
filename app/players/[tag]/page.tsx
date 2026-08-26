import ClashShell from '../../../components/ClashShell';
import { getPlayer, getPlayerBattleLog, getPlayerLeagueGroup, getPlayerLeagueHistory } from '../../../lib/clash/client';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import type { ClashPlayerItem } from '../../../lib/clash/types';

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function signedTrophies(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toLocaleString('pt-BR')}`;
}

function UnitList({ title, items, limit = 12 }: { title: string; items?: ClashPlayerItem[]; limit?: number }) {
  const visible = (items ?? []).filter(item => item.village !== 'builderBase' && item.village !== 'BUILDER_BASE').slice(0, limit);
  return <article className="profile-unit-panel"><div className="profile-section-title"><span>{title}</span><b>{items?.length ?? 0}</b></div>{visible.length ? <div className="profile-unit-list">{visible.map(item => <div className="profile-unit-row" key={`${title}-${item.name}`}><strong>{item.name}</strong><span>Nível {item.level ?? '—'}<small>/ {item.maxLevel ?? '—'}</small></span></div>)}</div> : <div className="profile-unit-empty">Sem dados retornados.</div>}</article>;
}

function extractRecords(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.filter(item => item && typeof item === 'object') as Record<string, unknown>[];
  if (!payload || typeof payload !== 'object') return [];
  const obj = payload as Record<string, unknown>;
  for (const key of ['items', 'battleLogs', 'battles', 'seasons', 'history']) {
    const value = obj[key];
    if (Array.isArray(value)) return value.filter(item => item && typeof item === 'object') as Record<string, unknown>[];
  }
  return [];
}

function firstValue(record: Record<string, unknown> | undefined, keys: string[]) {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' || typeof value === 'number') return String(value);
  }
  return null;
}

export default async function PlayerPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const playerTag = `#${decodeURIComponent(tag).replace(/^#/, '').toUpperCase()}`;
  const database = getSupabaseAdmin();
  const storedResult = database ? await database.from('players').select('*,player_scores(total_score)').eq('tag', playerTag).maybeSingle() : { data: null, error: null };
  const stored: any = storedResult.data;
  const live = await getPlayer(playerTag).catch(() => null);
  const playerId = stored?.id ? Number(stored.id) : null;

  const [battleLogRaw, leagueHistoryRaw, personalLeague] = await Promise.all([
    getPlayerBattleLog(playerTag).catch(() => null),
    getPlayerLeagueHistory(playerTag).catch(() => null),
    live?.currentLeagueGroupTag && live?.currentLeagueSeasonId != null
      ? getPlayerLeagueGroup(playerTag, live.currentLeagueGroupTag, live.currentLeagueSeasonId).catch(() => null)
      : Promise.resolve(null),
  ]);

  const battleRecords = extractRecords(battleLogRaw);
  const leagueHistory = extractRecords(leagueHistoryRaw);
  const personalAttacks = personalLeague?.attackLogs ?? [];
  const personalDefenses = personalLeague?.defenseLogs ?? [];
  const attackTrophies = personalAttacks.reduce((sum, battle) => sum + Number(battle.trophies ?? 0), 0);
  const defenseTrophies = personalDefenses.reduce((sum, battle) => sum + Number(battle.trophies ?? 0), 0);

  const [attacksResult, cwlResult, capitalResult, membershipsResult] = database && playerId ? await Promise.all([
    database.from('war_attacks').select('war_id,stars,destruction_percentage,attacker_town_hall,defender_town_hall,captured_at').eq('attacker_player_id', playerId).eq('attacker_side', 'clan').order('captured_at', { ascending: false }),
    database.from('cwl_attacks').select('cwl_season_id,stars,destruction_percentage,attacker_town_hall,defender_town_hall,created_at').eq('player_id', playerId).order('created_at', { ascending: false }),
    database.from('capital_raid_members').select('raid_season_id,attacks,attack_limit,bonus_attack_limit,capital_resources_looted').eq('player_id', playerId).order('raid_season_id', { ascending: false }),
    database.from('player_memberships').select('id,joined_at,left_at,is_current').eq('player_id', playerId).order('joined_at', { ascending: false }),
  ]) : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }] as any;

  const regularAttacks: any[] = attacksResult.data ?? [];
  const cwlAttacks: any[] = cwlResult.data ?? [];
  const capitalRaids: any[] = capitalResult.data ?? [];
  const regularStars = regularAttacks.reduce((sum, attack) => sum + Number(attack.stars ?? 0), 0);
  const cwlStars = cwlAttacks.reduce((sum, attack) => sum + Number(attack.stars ?? 0), 0);
  const monitoredStars = regularStars + cwlStars;
  const monitoredAttacks = regularAttacks.length + cwlAttacks.length;
  const triples = [...regularAttacks, ...cwlAttacks].filter(attack => Number(attack.stars) === 3).length;
  const averageDestruction = monitoredAttacks ? [...regularAttacks, ...cwlAttacks].reduce((sum, attack) => sum + Number(attack.destruction_percentage ?? 0), 0) / monitoredAttacks : null;
  const warsMonitored = new Set(regularAttacks.map(attack => attack.war_id)).size;
  const capitalGold = capitalRaids.reduce((sum, raid) => sum + Number(raid.capital_resources_looted ?? 0), 0);
  const capitalAttacks = capitalRaids.reduce((sum, raid) => sum + Number(raid.attacks ?? 0), 0);
  const league = live?.leagueTier ?? live?.league;
  const th = live?.townHallLevel ?? stored?.town_hall_level ?? null;
  const officialWarStars = live?.warStars ?? stored?.war_stars ?? null;
  const baseline = stored?.war_stars_baseline ?? null;
  const accountDelta = officialWarStars != null && baseline != null ? Number(officialWarStars) - Number(baseline) : null;
  const monitoringStarted = stored?.war_stars_baseline_at ?? stored?.joined_tracking_at ?? null;

  return <ClashShell active="players" title={live?.name ?? stored?.name ?? 'Jogador'} description={live?.tag ?? stored?.tag ?? playerTag}>
    <section className="player-hero-card">
      <div className="player-th-art">{th ? <img src={`/api/assets/townhall/${th}`} alt={`Centro da Vila ${th}`}/> : null}<span>TH {th ?? '—'}</span></div>
      <div className="player-live-copy"><span className="eyebrow">PERFIL AO VIVO · SUPERCELL</span><h3>{live?.name ?? stored?.name ?? playerTag}</h3><p>{live?.role ?? stored?.role ?? 'Membro'} · {live?.warPreference === 'in' ? 'Disponível para guerra' : live?.warPreference === 'out' ? 'Fora da guerra' : 'Preferência de guerra —'}</p><div className="player-live-stats"><span><small>TROFÉUS</small><b>{live?.trophies?.toLocaleString('pt-BR') ?? stored?.trophies?.toLocaleString?.('pt-BR') ?? '—'}</b></span><span><small>MELHOR</small><b>{live?.bestTrophies?.toLocaleString('pt-BR') ?? stored?.best_trophies?.toLocaleString?.('pt-BR') ?? '—'}</b></span><span><small>WAR STARS</small><b>{officialWarStars?.toLocaleString?.('pt-BR') ?? '—'}</b></span><span><small>EXP</small><b>{live?.expLevel ?? stored?.exp_level ?? '—'}</b></span></div></div>
      <div className="player-league-card">
        {league?.iconUrls?.medium || stored?.league_icon_url ? <img src={league?.iconUrls?.medium ?? stored?.league_icon_url} alt=""/> : null}
        <small>LIGA PESSOAL ATUAL</small><strong>{league?.name ?? stored?.league_name ?? '—'}</strong>
        <div className="player-league-trophy-row"><span><small>ATAQUES</small><b>{personalLeague ? signedTrophies(attackTrophies) : '—'}</b></span><span><small>DEFESAS</small><b>{personalLeague ? signedTrophies(defenseTrophies) : '—'}</b></span></div>
        <div className="player-league-battles">{personalLeague ? `${personalAttacks.length} ataque(s) · ${personalDefenses.length} defesa(s)` : 'Sem grupo ranqueado disponível agora'}</div>
      </div>
    </section>

    <section className="profile-monitor-grid">
      <article className="profile-monitor-card accent"><span className="eyebrow">PELO CLÃ · MONITORADO</span><h3>{monitoredAttacks ? `${monitoredStars} estrelas` : '—'}</h3><p>Exato a partir dos ataques arquivados pelo Clan Manager.</p><div className="profile-monitor-stats"><span><small>GUERRAS</small><b>{regularAttacks.length ? warsMonitored : '—'}</b></span><span><small>ATAQUES</small><b>{monitoredAttacks || '—'}</b></span><span><small>TRIPLES</small><b>{monitoredAttacks ? triples : '—'}</b></span><span><small>DESTRUIÇÃO</small><b>{averageDestruction == null ? '—' : `${averageDestruction.toFixed(1)}%`}</b></span></div></article>
      <article className="profile-monitor-card"><span className="eyebrow">BASELINE DA CONTA</span><h3>{baseline ?? '—'} War Stars</h3><p>War Stars totais quando o monitoramento começou em {formatDate(monitoringStarted)}.</p><div className="profile-monitor-stats"><span><small>CONTA AGORA</small><b>{officialWarStars ?? '—'}</b></span><span><small>VARIAÇÃO</small><b>{accountDelta == null ? '—' : `${accountDelta >= 0 ? '+' : ''}${accountDelta}`}</b></span><span><small>REGULAR</small><b>{regularAttacks.length ? regularStars : '—'}</b></span><span><small>CWL</small><b>{cwlAttacks.length ? cwlStars : '—'}</b></span></div></article>
      <article className="profile-monitor-card"><span className="eyebrow">ATIVIDADE ATUAL</span><h3>{live?.donations ?? stored?.donations ?? 0} doações</h3><p>{live?.donationsReceived ?? stored?.donations_received ?? 0} recebidas nesta temporada observada.</p><div className="profile-monitor-stats"><span><small>BUILDER HALL</small><b>{live?.builderHallLevel ?? stored?.builder_hall_level ?? '—'}</b></span><span><small>BH TROFÉUS</small><b>{live?.builderBaseTrophies ?? stored?.builder_base_trophies ?? '—'}</b></span><span><small>SCORE</small><b>{stored?.player_scores?.[0]?.total_score ?? 0}</b></span></div></article>
      <article className="profile-monitor-card"><span className="eyebrow">CAPITAL · HISTÓRICO</span><h3>{capitalRaids.length ? capitalGold.toLocaleString('pt-BR') : '—'} ouro</h3><p>Raid Weekends arquivados pelo monitoramento.</p><div className="profile-monitor-stats"><span><small>WEEKENDS</small><b>{capitalRaids.length || '—'}</b></span><span><small>ATAQUES</small><b>{capitalRaids.length ? capitalAttacks : '—'}</b></span></div></article>
    </section>

    <section className="live-data-grid">
      <article className="live-data-card"><small>BATTLE LOG · API AO VIVO</small><strong>{battleRecords.length || '—'}</strong><span>{battleRecords.length ? `Último: ${firstValue(battleRecords[0], ['opponentName','defenderName','attackerName','name']) ?? 'registro disponível'}` : 'A API não retornou batalhas agora.'}</span></article>
      <article className="live-data-card"><small>HISTÓRICO DE LIGA · API</small><strong>{leagueHistory.length || '—'}</strong><span>{leagueHistory.length ? `Mais recente: ${firstValue(leagueHistory[0], ['season','seasonId','leagueSeasonId','id']) ?? 'temporada disponível'}` : 'Sem temporada retornada agora.'}</span></article>
      <article className="live-data-card"><small>LABELS</small><strong>{live?.labels?.length ?? 0}</strong><span>{live?.labels?.map(label => label.name).filter(Boolean).join(' · ') || 'Nenhuma label retornada.'}</span></article>
      <article className="live-data-card"><small>CONQUISTAS</small><strong>{live?.achievements?.length ?? 0}</strong><span>{live?.achievements?.filter(a => Number(a.stars ?? 0) >= 3).length ?? 0} com 3 estrelas</span></article>
    </section>

    <section className="profile-unit-grid">
      <UnitList title="Heróis" items={live?.heroes} limit={12}/><UnitList title="Tropas" items={live?.troops} limit={16}/><UnitList title="Feitiços" items={live?.spells} limit={14}/><UnitList title="Equipamentos" items={live?.heroEquipment} limit={14}/>
    </section>

    <section className="profile-membership-panel"><div className="profile-section-title"><span>Histórico no clã</span><b>{membershipsResult.data?.length ?? 0} passagem(ns)</b></div><div className="membership-list">{(membershipsResult.data ?? []).map((membership: any) => <div className="membership-row" key={membership.id}><span><small>ENTRADA MONITORADA</small><b>{formatDate(membership.joined_at)}</b></span><span><small>SAÍDA</small><b>{membership.is_current ? 'No clã atualmente' : formatDate(membership.left_at)}</b></span></div>)}</div></section>
  </ClashShell>;
}
