import ClashShell from '../../components/ClashShell';
import { getCurrentWar } from '../../lib/clash/client';
import { CLAN_TAG } from '../../lib/dashboard';
import type { ClashCurrentWar, ClashWarMember } from '../../lib/clash/types';

function townHall(member: ClashWarMember) {
  return member.townhallLevel ?? member.townHallLevel ?? '—';
}

function statusLabel(state?: string) {
  if (state === 'inWar') return 'Em guerra';
  if (state === 'preparation') return 'Preparação';
  if (state === 'warEnded') return 'Encerrada';
  if (state === 'notInWar') return 'Sem guerra';
  return state ?? '—';
}

function formatClashTime(value?: string) {
  if (!value) return '—';
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (!match) return value;
  const [, y, m, d, hh, mm, ss] = match;
  const date = new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}

function AttackStars({ stars = 0 }: { stars?: number }) {
  return <span className="war-map-stars">{'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 3 - stars))}</span>;
}

export default async function Page() {
  const currentWar = await getCurrentWar(CLAN_TAG).catch(() => null as ClashCurrentWar | null);
  const clan = currentWar?.clan;
  const opponent = currentWar?.opponent;
  const members = [...(clan?.members ?? [])].sort((a, b) => a.mapPosition - b.mapPosition);
  const opponentByTag = new Map((opponent?.members ?? []).map(member => [member.tag, member]));
  const totalAttacks = (currentWar?.teamSize ?? 0) * (currentWar?.attacksPerMember ?? 0);

  return <ClashShell active="wars" title="Guerras" description="Guerra atual ao vivo e histórico monitorado de ataques, estrelas, destruição e faltas.">
    {currentWar && currentWar.state !== 'notInWar' && clan && opponent ? <>
      <section className="war-panel live-war-page">
        <div className="panel-title-wrap"><span className="panel-kicker">GUERRA ATUAL · API AO VIVO</span><h2 className="ribbon">{clan.name} VS {opponent.name}</h2></div>
        <div className="war-grid">
          <div className="war-team"><b>{clan.name}</b><span>{clan.tag}</span><div className="mini-shield live-badge">{clan.badgeUrls?.medium || clan.badgeUrls?.large ? <img src={clan.badgeUrls.medium ?? clan.badgeUrls.large} alt=""/> : '—'}</div><div className="stars">★ {clan.stars ?? 0}</div><strong>{Number(clan.destructionPercentage ?? 0).toFixed(2)}%</strong></div>
          <div className="battle-center"><span className="battle-axes" aria-hidden="true"/><strong>VS</strong><b>{statusLabel(currentWar.state)} · {currentWar.teamSize ?? '—'} x {currentWar.teamSize ?? '—'}</b></div>
          <div className="war-team"><b>{opponent.name}</b><span>{opponent.tag}</span><div className="mini-shield enemy live-badge">{opponent.badgeUrls?.medium || opponent.badgeUrls?.large ? <img src={opponent.badgeUrls.medium ?? opponent.badgeUrls.large} alt=""/> : '—'}</div><div className="stars enemy-stars">★ {opponent.stars ?? 0}</div><strong>{Number(opponent.destructionPercentage ?? 0).toFixed(2)}%</strong></div>
        </div>
        <div className="war-footer"><span><b>ATAQUES DO CLÃ</b>{clan.attacks ?? 0} / {totalAttacks || '—'}</span><span><b>TERMINA</b>{formatClashTime(currentWar.endTime)}</span><span><b>STATUS</b>{statusLabel(currentWar.state)}</span></div>
      </section>

      <section className="war-map-section">
        <div className="war-map-heading"><div><span className="eyebrow">MAPA DA GUERRA</span><h3>Vilas do {clan.name}</h3></div><span>{members.length} participantes</span></div>
        <div className="war-map-list">{members.map(member => {
          const attacks = member.attacks ?? [];
          const bestDefense = member.bestOpponentAttack;
          const targetNames = attacks.map(attack => opponentByTag.get(attack.defenderTag)?.name ?? attack.defenderTag);
          return <article className="war-map-row" key={member.tag}>
            <div className="war-map-position">#{member.mapPosition}</div>
            <div className="war-map-player"><strong>{member.name}</strong><span>{member.tag} · TH{townHall(member)}</span></div>
            <div className="war-map-cell"><small>ATAQUES</small><b>{attacks.length}/{currentWar.attacksPerMember ?? 2}</b><em>{targetNames.length ? targetNames.join(' · ') : 'Nenhum ainda'}</em></div>
            <div className="war-map-cell"><small>ESTRELAS FEITAS</small><b>{attacks.reduce((sum, attack) => sum + attack.stars, 0)}</b><em>{attacks.length ? `${Math.max(...attacks.map(attack => attack.destructionPercentage))}% melhor destruição` : '—'}</em></div>
            <div className="war-map-cell defense"><small>MELHOR ATAQUE RECEBIDO</small>{bestDefense ? <><AttackStars stars={bestDefense.stars}/><em>{bestDefense.destructionPercentage}% · {member.opponentAttacks ?? 0} ataque(s)</em></> : <><AttackStars stars={0}/><em>Não atacada</em></>}</div>
          </article>;
        })}</div>
      </section>
    </> : <section className="feature-grid"><article className="feature-panel"><div><span className="eyebrow">GUERRA ATUAL</span><h3>Nenhuma guerra ativa</h3><p>Quando houver preparação ou guerra em andamento, esta tela consulta a rota currentwar e mostra placar, mapa, ataques e defesas em tempo real.</p></div></article></section>}

    <section className="feature-grid war-history-note"><article className="feature-panel"><div><span className="eyebrow">HISTÓRICO MONITORADO</span><h3>Próxima etapa: arquivar cada ataque</h3><p>O estado atual pode ser consultado diretamente na API. Já guerras encerradas e ataques individuais precisam ser persistidos para não desaparecerem quando a Supercell trocar a guerra atual.</p></div></article></section>
  </ClashShell>;
}
