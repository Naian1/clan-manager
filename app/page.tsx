import Link from 'next/link';

const CLAN_TAG = '#2GRURLPLL';

const demoPlayers = [
  { rank: 1, name: 'Aguardando sincronização', tag: '#---', score: 0, stars: 0, donations: 0 },
  { rank: 2, name: 'Os membros aparecerão aqui', tag: '#---', score: 0, stars: 0, donations: 0 },
  { rank: 3, name: 'Sem dados ainda', tag: '#---', score: 0, stars: 0, donations: 0 },
];

const nav = [
  ['🏠', 'Visão geral', '/'], ['👥', 'Jogadores', '/players'], ['⚔️', 'Guerras', '/wars'],
  ['🛡️', 'CWL', '/cwl'], ['🏰', 'Capital', '/capital'], ['⚙️', 'Administração', '/admin'],
];

const metrics = [
  ['👥', 'Membros', '— / 50', 'Aguardando API'],
  ['⚔️', 'Guerras vencidas', '—', 'Aguardando API'],
  ['🔥', 'Sequência de vitórias', '—', 'Aguardando API'],
  ['⭐', 'Estrelas no mês', '—', 'Guerras + CWL'],
  ['🧪', 'Doações no mês', '—', 'Aguardando API'],
  ['📦', 'Recebidas no mês', '—', 'Aguardando API'],
  ['💎', 'Capital Raid', '—', 'Aguardando API'],
  ['🚨', 'Alertas', '0', 'Tudo certo!'],
];

type ClanData = {
  name?: string;
  tag?: string;
  badgeUrls?: { small?: string; medium?: string; large?: string };
};

async function getClan(): Promise<ClanData | null> {
  const token = process.env.CLASH_API_TOKEN ?? process.env.SUPERCELL_API_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`https://api.clashofclans.com/v1/clans/${encodeURIComponent(CLAN_TAG)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const clan = await getClan();
  const badge = clan?.badgeUrls?.large ?? clan?.badgeUrls?.medium;

  return (
    <div className="game-shell">
      <style>{`
        .stone-card{
          clip-path:none!important;
          border:0!important;
          border-radius:0!important;
          background:transparent url('/assets/clash/panel-ranking.png') center/100% 100% no-repeat!important;
          box-shadow:none!important;
          filter:drop-shadow(0 8px 5px rgba(0,0,0,.55));
          padding:38px 34px 34px!important;
          min-height:205px!important;
          overflow:visible!important;
        }
        .stone-card .metric-copy{padding-top:8px!important}
        .stone-card .stone-title,.stone-card .stone-value{color:#25180f!important;text-shadow:0 1px rgba(255,255,255,.75)!important}
        .stone-card .stone-note{color:#5b4933!important}
        .ranking-panel{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:visible!important}
        .ranking-frame-bg{inset:0!important;width:100%!important;height:100%!important;object-fit:fill!important;background:transparent!important;border:0!important;border-radius:0!important}
        .shortcut{border:0!important}
        @media(max-width:760px){
          .stone-card{min-height:160px!important;padding:30px 18px 25px!important}
          .stone-card .metric-icon{font-size:40px!important;margin-top:3px!important}
          .stone-card .stone-title{font-size:12px!important}
          .stone-card .stone-value{font-size:25px!important;margin-top:11px!important}
          .stone-card .stone-note{font-size:9px!important;margin-top:9px!important}
          .ranking-panel{padding:48px 19px 25px!important}
        }
      `}</style>

      <header className="hero-header">
        <div className="hero-content">
          <div className="brand-game">
            {badge ? <img src={badge} className="clan-shield" alt={`Escudo de ${clan?.name ?? 'clã'}`} /> : <div className="clan-badge-placeholder">API</div>}
            <div><h1>Clan Manager</h1><p>{clan?.name ? `${clan.name} · ` : ''}{CLAN_TAG}</p></div>
          </div>
          <div className="hero-actions"><div className="round-action">🏆</div><div className="round-action">🧔</div></div>
        </div>
      </header>

      <nav className="game-nav" aria-label="Navegação principal">
        {nav.map(([icon, label, href], i) => (
          <Link href={href} key={`${label}-${href}`} className={`game-nav-item ${i === 0 ? 'active' : ''}`}>
            <span className="nav-icon">{icon}</span><span>{label}</span>
          </Link>
        ))}
      </nav>

      <main className="game-main">
        <section className="metrics-game">
          {metrics.map(([icon, label, value, note]) => (
            <article className="stone-card" key={label}>
              <div className="metric-icon">{icon}</div>
              <div className="metric-copy"><div className="stone-title">{label}</div><div className="stone-value">{value}</div><div className="stone-note">{note}</div></div>
            </article>
          ))}
        </section>

        <section className="war-panel game-panel">
          <h2 className="ribbon">GUERRA ATUAL</h2>
          <div className="war-grid">
            <div className="war-team"><b>Seu clã</b><div className="mini-shield">?</div><div className="stars">★★★</div><strong>—%</strong></div>
            <div className="battle-center"><img src="/assets/clash/war-axes.png" className="battle-icon-image" alt="Machados cruzados" /><b>Aguardando dados da API</b></div>
            <div className="war-team"><b>Inimigo</b><div className="mini-shield enemy">?</div><div className="stars enemy-stars">★★★</div><strong>—%</strong></div>
          </div>
          <div className="war-footer"><span>⚔️ Ataques usados: — / —</span><span>⏱️ Termina em: —</span><span>⚠️ Membros pendentes: —</span></div>
        </section>

        <section className="ranking-panel game-panel">
          <img src="/assets/clash/panel-ranking.png" className="panel-frame-bg ranking-frame-bg" alt="" aria-hidden="true" />
          <div className="ranking-head"><h2 className="ribbon">RANKING DA TEMPORADA</h2><Link href="/players" className="stone-button">Ver todos</Link></div>
          <div className="ranking-list">{demoPlayers.map(p => <div className="ranking-row" key={p.rank}><div className={`rank-medal rank-${p.rank}`}>{p.rank}</div><div className="player-shield">?</div><div className="ranking-name"><strong>{p.name}</strong><span>{p.tag}</span></div><div className="ranking-stat"><small>PONTOS</small><b>{p.score}</b></div><div className="ranking-stat"><small>DOAÇÕES</small><b>{p.donations}</b></div><div className="ranking-stat mobile-hide"><small>ESTRELAS</small><b>{p.stars}</b></div></div>)}</div>
        </section>

        <section className="shortcut-grid">
          <Link href="/players" className="shortcut green"><span className="shortcut-icon">🧪</span><strong>Melhores doadores</strong><small>Aguardando dados</small></Link>
          <Link href="/wars" className="shortcut blue"><span className="shortcut-icon">⭐</span><strong>Mais Estrelas</strong><small>Aguardando dados</small></Link>
          <Link href="/capital" className="shortcut purple"><span className="shortcut-icon">🛡️</span><strong>Capital Raid</strong><small>Aguardando dados</small></Link>
        </section>

        <section className="api-banner"><div className="barbarian">🗡️</div><div><strong>Conecte sua API da Supercell</strong><span>O escudo real do clã e os dados entram automaticamente quando a integração estiver ativa.</span></div><Link href="/admin" className="gold-button">Configurar API</Link></section>
      </main>
    </div>
  );
}
