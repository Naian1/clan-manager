import Link from 'next/link';
import ClashShell from '../components/ClashShell';
import { getDashboardData, CLAN_TAG } from '../lib/dashboard';
import { getCurrentWar } from '../lib/clash/client';
import type { ClashCurrentWar } from '../lib/clash/types';

function formatClashTime(value?: string) {
  if (!value) return '—';
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (!match) return value;
  const [, y, m, d, hh, mm, ss] = match;
  const date = new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}

function warStatusLabel(state?: string) {
  if (state === 'inWar') return 'Em guerra';
  if (state === 'preparation') return 'Preparação';
  if (state === 'warEnded') return 'Encerrada';
  if (state === 'notInWar') return 'Sem guerra';
  return state ?? '—';
}

export default async function HomePage() {
  const [{ clan, players, configured, error }, currentWar] = await Promise.all([
    getDashboardData(),
    getCurrentWar(CLAN_TAG).catch(() => null as ClashCurrentWar | null),
  ]);
  const totalDonations = players.reduce((total, player) => total + (player.donations ?? 0), 0);
  const totalReceived = players.reduce((total, player) => total + (player.donations_received ?? 0), 0);
  const warClan = currentWar?.clan;
  const warOpponent = currentWar?.opponent;
  const totalWarAttacks = (currentWar?.teamSize ?? 0) * (currentWar?.attacksPerMember ?? 0);
  const metrics = [
    ['players', 'Membros', clan?.members == null ? '— / 50' : `${clan.members} / 50`, clan ? 'Clã sincronizado' : 'Aguardando API'],
    ['wars', 'Guerras vencidas', clan?.war_wins ?? '—', clan ? 'Histórico oficial' : 'Aguardando API'],
    ['streak', 'Sequência de vitórias', clan?.win_streak ?? '—', 'Guerras do clã'],
    ['stars', 'Estrelas no mês', '—', 'Guerras + CWL'],
    ['donations', 'Doações na temporada', players.length ? totalDonations : '—', players.length ? `${players.length} jogadores` : 'Aguardando API'],
    ['received', 'Recebidas na temporada', players.length ? totalReceived : '—', players.length ? 'Dados atualizados' : 'Aguardando API'],
    ['raid', 'Capital Raid', clan?.capital_points ?? '—', clan ? 'Pontos da Capital' : 'Aguardando API'],
    ['alerts', 'Alertas', error ? 'Erro' : configured ? '0' : '—', error ? 'Verificar conexão' : 'Tudo certo!'],
  ];

  return <ClashShell active="home">
    <section className="home-intro">
      <div><span className="eyebrow">VISÃO GERAL</span><h2>{clan?.name ?? 'Seu clã'}</h2><p>{clan?.tag ?? CLAN_TAG} · centro de acompanhamento e histórico</p></div>
      <Link className="primary-button" href="/admin">Abrir administração <span>→</span></Link>
    </section>
    <section className="metrics-game">{metrics.map(([icon, label, value, note]) => <article className="stone-card" key={label}><span className={`metric-icon game-icon icon-${icon}`} aria-hidden="true"/><div className="metric-copy"><div className="stone-title">{label}</div><div className="stone-value">{value}</div><div className="stone-note">{note}</div></div></article>)}</section>

    <section className="war-panel game-panel">
      <div className="panel-title-wrap"><span className="panel-kicker">CAMPO DE BATALHA</span><h2 className="ribbon">GUERRA ATUAL</h2></div>
      {currentWar && currentWar.state !== 'notInWar' && warClan && warOpponent ? <>
        <div className="war-grid">
          <div className="war-team"><b>SEU CLÃ</b><span>{warClan.name}</span><div className="mini-shield live-badge">{warClan.badgeUrls?.medium || warClan.badgeUrls?.large ? <img src={warClan.badgeUrls.medium ?? warClan.badgeUrls.large} alt=""/> : '—'}</div><div className="stars">★ {warClan.stars ?? 0}</div><strong>{Number(warClan.destructionPercentage ?? 0).toFixed(2)}%</strong></div>
          <div className="battle-center"><span className="battle-axes" aria-hidden="true"/><strong>VS</strong><b>{warStatusLabel(currentWar.state)} · {currentWar.teamSize ?? '—'} x {currentWar.teamSize ?? '—'}</b></div>
          <div className="war-team"><b>OPONENTE</b><span>{warOpponent.name}</span><div className="mini-shield enemy live-badge">{warOpponent.badgeUrls?.medium || warOpponent.badgeUrls?.large ? <img src={warOpponent.badgeUrls.medium ?? warOpponent.badgeUrls.large} alt=""/> : '—'}</div><div className="stars enemy-stars">★ {warOpponent.stars ?? 0}</div><strong>{Number(warOpponent.destructionPercentage ?? 0).toFixed(2)}%</strong></div>
        </div>
        <div className="war-footer"><span><b>ATAQUES USADOS</b>{warClan.attacks ?? 0} / {totalWarAttacks || '—'}</span><span><b>TERMINA</b>{formatClashTime(currentWar.endTime)}</span><span><b>STATUS</b>{warStatusLabel(currentWar.state)}</span></div>
      </> : <div className="war-empty-live"><strong>Sem guerra ativa</strong><span>O painel atualizará automaticamente quando uma guerra estiver disponível.</span></div>}
    </section>

    <section className="ranking-panel game-panel">
      <div className="ranking-head"><div><span className="panel-kicker">DESTAQUES DO CLÃ</span><h2>RANKING DA TEMPORADA</h2></div><Link href="/players" className="stone-button">Ver todos <span>→</span></Link></div>
      <div className="ranking-list">{players.length ? players.slice(0, 5).map((player, index) => <div className="ranking-row" key={player.id}><div className={`rank-medal rank-${index + 1}`}>{index + 1}</div><div className="player-shield">TH<br/><b>{player.town_hall_level ?? '?'}</b></div><div className="ranking-name"><strong>{player.name}</strong><span>{player.tag}</span></div><div className="ranking-stat"><small>PONTOS</small><b>{player.score}</b></div><div className="ranking-stat"><small>DOAÇÕES</small><b>{player.donations ?? 0}</b></div><div className="ranking-stat mobile-hide"><small>WAR STARS</small><b>{player.war_stars ?? 0}</b></div></div>) : <div className="ranking-empty"><strong>O salão ainda está vazio</strong><span>Execute a primeira sincronização para montar o ranking.</span></div>}</div>
    </section>

    <section className="shortcut-grid">
      <Link href="/players" className="shortcut green"><span className="shortcut-icon game-icon icon-donations" aria-hidden="true"/><span><small>TEMPORADA ATUAL</small><strong>Melhores doadores</strong><em>{totalDonations.toLocaleString('pt-BR')} doações</em></span><b className="shortcut-arrow">→</b></Link>
      <Link href="/wars" className="shortcut blue"><span className="shortcut-icon game-icon icon-stars" aria-hidden="true"/><span><small>HISTÓRICO DO CLÃ</small><strong>Desempenho em guerras</strong><em>{clan?.war_wins ?? 0} vitórias registradas</em></span><b className="shortcut-arrow">→</b></Link>
      <Link href="/capital" className="shortcut purple"><span className="shortcut-icon game-icon icon-raid" aria-hidden="true"/><span><small>RAID WEEKEND</small><strong>Capital do clã</strong><em>{clan?.capital_points?.toLocaleString('pt-BR') ?? '—'} pontos</em></span><b className="shortcut-arrow">→</b></Link>
    </section>
  </ClashShell>;
}
