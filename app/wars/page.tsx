import Link from 'next/link';
import ClashShell from '../../components/ClashShell';
import { getCurrentWar } from '../../lib/clash/client';
import { CLAN_TAG } from '../../lib/dashboard';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import type { ClashCurrentWar, ClashWarClan, ClashWarMember } from '../../lib/clash/types';

function townHall(member: ClashWarMember) {
  return member.townhallLevel ?? member.townHallLevel ?? null;
}

function statusLabel(state?: string) {
  if (state === 'inWar') return 'Em guerra';
  if (state === 'preparation') return 'Preparação';
  if (state === 'warEnded') return 'Encerrada';
  if (state === 'notInWar') return 'Sem guerra';
  return state ?? '—';
}

function formatClashTime(value?: string | null) {
  if (!value) return '—';
  const compact = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  const date = compact
    ? new Date(`${compact[1]}-${compact[2]}-${compact[3]}T${compact[4]}:${compact[5]}:${compact[6]}Z`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}

function AttackStars({ stars = 0 }: { stars?: number }) {
  return <span className="war-map-stars">{'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 3 - stars))}</span>;
}

function TownHallBadge({ level }: { level: number | null }) {
  if (!level) return <div className="war-th-icon war-th-fallback">TH?</div>;
  return <div className="war-th-icon"><img src={`/api/assets/townhall/${level}`} alt={`Centro da Vila ${level}`}/><span>TH{level}</span></div>;
}

function WarMap({ side, otherSide, ownSide, attacksPerMember }: { side: ClashWarClan; otherSide: ClashWarClan; ownSide: boolean; attacksPerMember: number }) {
  const members = [...(side.members ?? [])].sort((a, b) => a.mapPosition - b.mapPosition);
  const otherByTag = new Map((otherSide.members ?? []).map(member => [member.tag, member]));

  return <section className={`war-map-section ${ownSide ? 'war-map-own' : 'war-map-enemy'}`}>
    <div className="war-map-heading">
      <div><span className="eyebrow">{ownSide ? 'NOSSO MAPA' : 'MAPA INIMIGO'}</span><h3>Vilas do {side.name}</h3></div>
      <span>{members.length} participantes</span>
    </div>
    <div className="war-map-list">{members.map(member => {
      const attacks = member.attacks ?? [];
      const bestDefense = member.bestOpponentAttack;
      const targetMembers = attacks.map(attack => otherByTag.get(attack.defenderTag));
      const starsMade = attacks.reduce((sum, attack) => sum + attack.stars, 0);
      const bestDestruction = attacks.length ? Math.max(...attacks.map(attack => Number(attack.destructionPercentage ?? 0))) : null;
      const level = townHall(member);
      const playerContent = <><strong>{member.name}</strong><span>{member.tag}</span></>;

      return <article className="war-map-row advanced" key={`${ownSide ? 'ours' : 'enemy'}-${member.tag}`}>
        <div className="war-map-position">#{member.mapPosition}</div>
        <TownHallBadge level={level}/>
        <div className="war-map-player">{ownSide ? <Link href={`/players/${encodeURIComponent(member.tag.replace('#', ''))}`}>{playerContent}</Link> : playerContent}</div>
        <div className="war-map-cell"><small>ATAQUES</small><b>{attacks.length}/{attacksPerMember}</b><em>{targetMembers.length ? targetMembers.map(target => target ? `#${target.mapPosition} ${target.name}` : 'alvo').join(' · ') : 'Nenhum ainda'}</em></div>
        <div className="war-map-cell"><small>ESTRELAS FEITAS</small><b>{starsMade}</b><em>{bestDestruction == null ? '—' : `${bestDestruction}% melhor destruição`}</em></div>
        <div className="war-map-cell defense"><small>MELHOR ATAQUE RECEBIDO</small>{bestDefense ? <><AttackStars stars={bestDefense.stars}/><em>{bestDefense.destructionPercentage}% · {member.opponentAttacks ?? 0} ataque(s)</em></> : <><AttackStars stars={0}/><em>Não atacada</em></>}</div>
        {attacks.length > 0 && <div className="war-attack-detail-list">{attacks.map((attack, index) => {
          const target = otherByTag.get(attack.defenderTag);
          return <div className="war-attack-detail" key={`${member.tag}-${attack.order ?? index}`}><span>#{attack.order ?? index + 1}</span><b>{target ? `#${target.mapPosition} ${target.name}` : attack.defenderTag}</b><AttackStars stars={attack.stars}/><em>{attack.destructionPercentage}%{attack.duration ? ` · ${attack.duration}s` : ''}</em></div>;
        })}</div>}
      </article>;
    })}</div>
  </section>;
}

function historyResultLabel(result?: string | null) {
  if (result === 'win') return 'Vitória';
  if (result === 'lose') return 'Derrota';
  if (result === 'tie') return 'Empate';
  return result ?? '—';
}

export default async function Page() {
  const [currentWar, historyResult] = await Promise.all([
    getCurrentWar(CLAN_TAG).catch(() => null as ClashCurrentWar | null),
    (async () => {
      const database = getSupabaseAdmin();
      if (!database) return [] as any[];
      const result = await database.from('wars').select('id,war_key,state,end_time,clan_stars,clan_destruction,clan_attacks,opponent_name,opponent_tag,opponent_badge_url,opponent_stars,opponent_destruction,opponent_attacks,result,team_size').order('end_time', { ascending: false, nullsFirst: false }).limit(20);
      return result.data ?? [];
    })(),
  ]);
  const clan = currentWar?.clan;
  const opponent = currentWar?.opponent;
  const totalAttacks = (currentWar?.teamSize ?? 0) * (currentWar?.attacksPerMember ?? 0);
  const attacksPerMember = currentWar?.attacksPerMember ?? 2;

  return <ClashShell active="wars" title="Guerras" description="Guerra atual ao vivo, os dois mapas e histórico monitorado de ataques, estrelas, destruição e faltas.">
    {currentWar && currentWar.state !== 'notInWar' && clan && opponent ? <>
      <section className="war-panel live-war-page">
        <div className="panel-title-wrap"><span className="panel-kicker">GUERRA ATUAL · API AO VIVO</span><h2 className="ribbon">{clan.name} VS {opponent.name}</h2></div>
        <div className="war-grid">
          <div className="war-team"><b>{clan.name}</b><span>{clan.tag}</span><div className="mini-shield live-badge">{clan.badgeUrls?.medium || clan.badgeUrls?.large ? <img src={clan.badgeUrls.medium ?? clan.badgeUrls.large} alt=""/> : '—'}</div><div className="stars">★ {clan.stars ?? 0}</div><strong>{Number(clan.destructionPercentage ?? 0).toFixed(2)}%</strong></div>
          <div className="battle-center"><span className="battle-axes" aria-hidden="true"/><strong>VS</strong><b>{statusLabel(currentWar.state)} · {currentWar.teamSize ?? '—'} x {currentWar.teamSize ?? '—'}</b></div>
          <div className="war-team"><b>{opponent.name}</b><span>{opponent.tag}</span><div className="mini-shield enemy live-badge">{opponent.badgeUrls?.medium || opponent.badgeUrls?.large ? <img src={opponent.badgeUrls.medium ?? opponent.badgeUrls.large} alt=""/> : '—'}</div><div className="stars enemy-stars">★ {opponent.stars ?? 0}</div><strong>{Number(opponent.destructionPercentage ?? 0).toFixed(2)}%</strong></div>
        </div>
        <div className="war-footer"><span><b>ATAQUES DO CLÃ</b>{clan.attacks ?? 0} / {totalAttacks || '—'}</span><span><b>ATAQUES INIMIGOS</b>{opponent.attacks ?? 0} / {totalAttacks || '—'}</span><span><b>TERMINA</b>{formatClashTime(currentWar.endTime)}</span><span><b>STATUS</b>{statusLabel(currentWar.state)}</span></div>
      </section>

      <div className="war-map-columns">
        <WarMap side={clan} otherSide={opponent} ownSide attacksPerMember={attacksPerMember}/>
        <WarMap side={opponent} otherSide={clan} ownSide={false} attacksPerMember={attacksPerMember}/>
      </div>
    </> : <section className="feature-grid"><article className="feature-panel"><div><span className="eyebrow">GUERRA ATUAL</span><h3>Nenhuma guerra ativa</h3><p>Quando houver preparação ou guerra em andamento, esta tela consulta currentwar e mostra placar, os dois mapas, ataques e defesas em tempo real.</p></div></article></section>}

    <section className="war-history-section">
      <div className="war-map-heading"><div><span className="eyebrow">HISTÓRICO MONITORADO</span><h3>Guerras arquivadas</h3></div><span>{historyResult.length} carregadas</span></div>
      {historyResult.length ? <div className="war-history-list">{historyResult.map((war: any) => <article className="war-history-row" key={war.id}>
        <div className={`war-result war-result-${war.result ?? 'unknown'}`}>{historyResultLabel(war.result)}</div>
        <div className="war-history-opponent">{war.opponent_badge_url ? <img src={war.opponent_badge_url} alt=""/> : null}<span><strong>{war.opponent_name ?? 'Adversário'}</strong><small>{war.opponent_tag ?? '—'} · {formatClashTime(war.end_time)}</small></span></div>
        <div className="war-history-score"><span><b>{war.clan_stars ?? 0} ★</b><small>{Number(war.clan_destruction ?? 0).toFixed(2)}%</small></span><em>×</em><span><b>{war.opponent_stars ?? 0} ★</b><small>{Number(war.opponent_destruction ?? 0).toFixed(2)}%</small></span></div>
        <div className="war-history-attacks"><small>ATAQUES</small><b>{war.clan_attacks ?? 0} × {war.opponent_attacks ?? 0}</b></div>
      </article>)}</div> : <div className="war-history-empty"><strong>O monitoramento começa agora</strong><span>O sync já está preparado para backfill do War Log e para arquivar cada ataque observado da guerra atual.</span></div>}
    </section>
  </ClashShell>;
}
