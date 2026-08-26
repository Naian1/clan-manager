import Link from 'next/link';
import ClashShell from '../components/ClashShell';
import { getDashboardData } from '../lib/dashboard';

export default async function HomePage() {
  const { clan, players, configured, error } = await getDashboardData();
  const metrics = [
    ['players', 'Membros', clan?.members == null ? '— / 50' : `${clan.members} / 50`, 'Aguardando API'],
    ['wars', 'Guerras vencidas', clan?.war_wins ?? '—', 'Aguardando API'],
    ['streak', 'Sequência de vitórias', clan?.win_streak ?? '—', 'Guerras do clã'],
    ['stars', 'Estrelas no mês', '—', 'Guerras + CWL'],
    ['donations', 'Doações no mês', '—', 'Aguardando API'],
    ['received', 'Recebidas no mês', '—', 'Aguardando API'],
    ['raid', 'Capital Raid', clan?.capital_points ?? '—', 'Aguardando API'],
    ['alerts', 'Alertas', error ? 'Erro' : configured ? '0' : '—', error ? 'Verificar conexão' : 'Tudo certo!'],
  ];

  return <ClashShell active="home">
    <section className="home-intro">
      <div><span className="eyebrow">VISÃO GERAL</span><h2>{clan?.name ?? 'Seu clã'}</h2><p>{clan?.tag ?? '#2GRURLPLL'} · centro de acompanhamento e histórico</p></div>
      <Link className="primary-button" href="/admin">Abrir administração <span>→</span></Link>
    </section>
    <section className="metrics-game">{metrics.map(([icon, label, value, note]) => <article className="stone-card" key={label}><span className={`metric-icon game-icon icon-${icon}`} aria-hidden="true"/><div className="metric-copy"><div className="stone-title">{label}</div><div className="stone-value">{value}</div><div className="stone-note">{note}</div></div></article>)}</section>

    <section className="war-panel game-panel"><h2 className="ribbon">GUERRA ATUAL</h2><div className="war-grid"><div className="war-team"><b>SEU CLÃ</b><div className="mini-shield">—</div><div className="stars">—</div><strong>—%</strong></div><div className="battle-center"><b>Sincronização de guerras pendente</b></div><div className="war-team"><b>OPONENTE</b><div className="mini-shield enemy">—</div><div className="stars enemy-stars">—</div><strong>—%</strong></div></div><div className="war-footer"><span>ATAQUES USADOS · — / —</span><span>TERMINA EM · —</span><span>AGUARDANDO DADOS DA API</span></div></section>

    <section className="ranking-panel game-panel"><div className="ranking-head"><h2 className="ribbon">RANKING DA TEMPORADA</h2><Link href="/players" className="stone-button">Ver todos</Link></div><div className="ranking-list">{players.length ? players.slice(0, 5).map((player, index) => <div className="ranking-row" key={player.id}><div className={`rank-medal rank-${index + 1}`}>{index + 1}</div><div className="player-shield">{player.town_hall_level ?? '?'}</div><div className="ranking-name"><strong>{player.name}</strong><span>{player.tag}</span></div><div className="ranking-stat"><small>PONTOS</small><b>{player.score}</b></div><div className="ranking-stat"><small>DOAÇÕES</small><b>{player.donations ?? 0}</b></div><div className="ranking-stat mobile-hide"><small>ESTRELAS</small><b>{player.war_stars ?? 0}</b></div></div>) : <div className="ranking-empty">Ainda não há jogadores sincronizados. Abra Admin para configurar a primeira sincronização.</div>}</div></section>

    <section className="shortcut-grid"><Link href="/players" className="shortcut green"><span className="shortcut-rule"/><strong>Melhores doadores</strong><small>Ranking por temporada</small></Link><Link href="/wars" className="shortcut blue"><span className="shortcut-rule"/><strong>Desempenho em guerras</strong><small>Estrelas e ataques</small></Link><Link href="/capital" className="shortcut purple"><span className="shortcut-rule"/><strong>Capital do clã</strong><small>Raid Weekend</small></Link></section>
  </ClashShell>;
}
