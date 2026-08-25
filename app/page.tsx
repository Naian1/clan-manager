import Link from 'next/link';

const CLAN_TAG = '#2GRURLPLL';

const demoPlayers = [
  { rank: 1, name: 'Aguardando sincronização', tag: '#---', score: 0, stars: 0, donations: 0 },
  { rank: 2, name: 'Os membros aparecerão aqui', tag: '#---', score: 0, stars: 0, donations: 0 },
  { rank: 3, name: 'Sem dados ainda', tag: '#---', score: 0, stars: 0, donations: 0 },
];

const nav = [
  ['home', 'Visão geral', '/'], ['players', 'Jogadores', '/players'], ['wars', 'Guerras', '/wars'],
  ['cwl', 'CWL', '/cwl'], ['capital', 'Capital', '/capital'], ['admin', 'Admin', '/admin'],
];

const metrics = [
  ['players', 'Membros', '— / 50', 'Temporada atual'],
  ['wars', 'Guerras vencidas', '—', 'Temporada atual'],
  ['streak', 'Sequência de vitórias', '—', 'Guerras do clã'],
  ['stars', 'Estrelas no mês', '—', 'Guerras + CWL'],
  ['donations', 'Doações no mês', '—', 'Temporada atual'],
  ['received', 'Recebidas no mês', '—', 'Temporada atual'],
  ['raid', 'Capital Raid', '—', 'Fim de semana'],
  ['alerts', 'Alertas', '0', 'Tudo certo!'],
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
    <div className="game-shell clash-home">
      <style>{`
        .clash-home .game-nav{position:sticky!important;top:0!important;z-index:60!important;max-width:980px!important;margin:-34px auto 0!important;padding:7px 9px!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:5px!important;background:rgba(28,36,42,.94)!important;border:2px solid #11191e!important;border-radius:16px!important;box-shadow:0 7px 0 #11191e,0 12px 22px #0008!important;backdrop-filter:blur(5px)}
        .clash-home .game-nav-item{height:66px!important;background:url('/assets/clash/nav-wood-final.png') center/100% 100% no-repeat!important;font-size:11px!important;gap:0!important;filter:drop-shadow(0 3px 2px #0008)!important;border-radius:0!important;box-shadow:none!important}
        .clash-home .game-nav-item.active{background-image:url('/assets/clash/nav-active-final.png')!important;transform:translateY(-2px)!important;filter:drop-shadow(0 5px 3px #0009) brightness(1.08)!important;box-shadow:none!important}
        .clash-icon{display:block;width:38px;height:38px;background-image:url('/assets/clash/icons-clash-final.png');background-size:300% 400%;background-repeat:no-repeat;filter:drop-shadow(0 3px 2px #0007);flex:none}
        .ico-home{background-position:0% 0%}.ico-players{background-position:50% 0%}.ico-wars{background-position:100% 0%}.ico-cwl{background-position:0% 33.333%}.ico-capital{background-position:50% 33.333%}.ico-admin{background-position:100% 33.333%}.ico-donations{background-position:0% 66.666%}.ico-received{background-position:50% 66.666%}.ico-streak{background-position:100% 66.666%}.ico-stars{background-position:0% 100%}.ico-raid{background-position:50% 100%}.ico-alerts{background-position:100% 100%}
        .clash-home .metrics-game{margin-top:26px!important}
        .clash-home .stone-card{clip-path:none!important;border:0!important;border-radius:0!important;background:transparent url('/assets/clash/card-parchment-final.png') center/100% 100% no-repeat!important;box-shadow:none!important;filter:drop-shadow(0 7px 5px #0008)!important;padding:28px 24px!important;min-height:190px!important;overflow:visible!important;align-items:center!important}
        .clash-home .metric-icon{font-size:0!important;width:52px!important;height:52px!important;display:grid!important;place-items:center!important;flex:none!important}
        .clash-home .metric-icon .clash-icon{width:52px;height:52px}
        .clash-home .metric-copy{padding-top:0!important}.clash-home .stone-title,.clash-home .stone-value{color:#24170f!important;text-shadow:0 1px #fff8!important}.clash-home .stone-note{color:#66513a!important}
        .clash-home .ranking-panel{min-height:360px!important;padding:84px 58px 40px!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;filter:drop-shadow(0 9px 6px #0008)!important;overflow:visible!important}
        .clash-home .ranking-frame-bg{content:url('/assets/clash/ranking-clean-final.png')!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:fill!important;background:transparent!important;border:0!important;z-index:0!important}
        .clash-home .ranking-panel>*:not(.ranking-frame-bg){position:relative!important;z-index:2!important}
        .clash-home .ranking-head{position:static!important}.clash-home .ranking-head .ribbon{background:none!important;filter:none!important;position:absolute!important;top:20px!important;height:auto!important;width:auto!important;left:50%!important;transform:translateX(-50%)!important;font-size:28px!important;padding:0!important;white-space:nowrap!important;text-shadow:0 3px 0 #6c160e,0 5px 6px #0009!important}
        .clash-home .stone-button{right:42px!important;top:50px!important;padding:8px 14px!important;font-size:10px!important}
        .clash-home .ranking-list{margin-top:0!important}.clash-home .ranking-row{padding:12px 8px!important;min-height:63px!important}
        .clash-home .api-banner{display:none!important}
        .clash-home .battle-center b{font-size:0!important}.clash-home .battle-center b:after{content:'—';font-size:18px;color:#f5d6ba}
        .clash-home .clan-badge-placeholder{font-size:0!important}.clash-home .clan-badge-placeholder:after{content:'?';font-size:28px;color:#fff0b6}
        @media(max-width:760px){
          .clash-home .game-nav{margin:-26px 6px 0!important;padding:5px!important;border-radius:12px!important;gap:2px!important}
          .clash-home .game-nav-item{height:54px!important;font-size:7.5px!important;text-shadow:0 2px 0 #21130d!important}
          .clash-home .game-nav-item .clash-icon{width:29px;height:29px}
          .clash-home .game-main{padding-top:18px!important}
          .clash-home .metrics-game{margin-top:8px!important}
          .clash-home .stone-card{min-height:146px!important;padding:20px 13px!important;gap:2px!important}
          .clash-home .metric-icon{width:40px!important;height:40px!important}.clash-home .metric-icon .clash-icon{width:40px;height:40px}
          .clash-home .stone-title{font-size:11px!important}.clash-home .stone-value{font-size:24px!important;margin-top:12px!important}.clash-home .stone-note{font-size:8px!important;margin-top:8px!important}
          .clash-home .ranking-panel{min-height:336px!important;padding:72px 18px 28px!important;margin-top:58px!important}
          .clash-home .ranking-head .ribbon{top:20px!important;font-size:19px!important}
          .clash-home .stone-button{right:24px!important;top:47px!important;font-size:7px!important;padding:6px 9px!important}
          .clash-home .ranking-row{grid-template-columns:29px 30px minmax(0,1fr) 38px 38px!important;padding:9px 4px!important;min-height:55px!important}
        }
      `}</style>

      <header className="hero-header">
        <div className="hero-content">
          <div className="brand-game">
            {badge ? <img src={badge} className="clan-shield" alt={`Escudo de ${clan?.name ?? 'clã'}`} /> : <div className="clan-badge-placeholder" aria-label="Escudo do clã ainda não sincronizado" />}
            <div><h1>Clan Manager</h1><p>{clan?.name ? `${clan.name} · ` : ''}{CLAN_TAG}</p></div>
          </div>
          <div className="hero-actions"><div className="round-action">🏆</div><div className="round-action">🧔</div></div>
        </div>
      </header>

      <nav className="game-nav" aria-label="Navegação principal">
        {nav.map(([icon, label, href], i) => (
          <Link href={href} key={`${label}-${href}`} className={`game-nav-item ${i === 0 ? 'active' : ''}`}>
            <span className={`clash-icon ico-${icon}`} aria-hidden="true"/><span>{label}</span>
          </Link>
        ))}
      </nav>

      <main className="game-main">
        <section className="metrics-game">
          {metrics.map(([icon, label, value, note]) => (
            <article className="stone-card" key={label}>
              <div className="metric-icon"><span className={`clash-icon ico-${icon}`} aria-hidden="true"/></div>
              <div className="metric-copy"><div className="stone-title">{label}</div><div className="stone-value">{value}</div><div className="stone-note">{note}</div></div>
            </article>
          ))}
        </section>

        <section className="war-panel game-panel">
          <h2 className="ribbon">GUERRA ATUAL</h2>
          <div className="war-grid">
            <div className="war-team"><b>Seu clã</b><div className="mini-shield">?</div><div className="stars">★★★</div><strong>—%</strong></div>
            <div className="battle-center"><img src="/assets/clash/war-axes.png" className="battle-icon-image" alt="Machados cruzados" /><b /></div>
            <div className="war-team"><b>Inimigo</b><div className="mini-shield enemy">?</div><div className="stars enemy-stars">★★★</div><strong>—%</strong></div>
          </div>
          <div className="war-footer"><span>⚔️ Ataques usados: — / —</span><span>⏱️ Termina em: —</span><span>⚠️ Membros pendentes: —</span></div>
        </section>

        <section className="ranking-panel game-panel">
          <img src="/assets/clash/ranking-clean-final.png" className="ranking-frame-bg" alt="" aria-hidden="true" />
          <div className="ranking-head"><h2 className="ribbon">RANKING DA TEMPORADA</h2><Link href="/players" className="stone-button">Ver todos</Link></div>
          <div className="ranking-list">{demoPlayers.map(p => <div className="ranking-row" key={p.rank}><div className={`rank-medal rank-${p.rank}`}>{p.rank}</div><div className="player-shield">?</div><div className="ranking-name"><strong>{p.name}</strong><span>{p.tag}</span></div><div className="ranking-stat"><small>PONTOS</small><b>{p.score}</b></div><div className="ranking-stat"><small>DOAÇÕES</small><b>{p.donations}</b></div><div className="ranking-stat mobile-hide"><small>ESTRELAS</small><b>{p.stars}</b></div></div>)}</div>
        </section>

        <section className="shortcut-grid">
          <Link href="/players" className="shortcut green"><span className="shortcut-icon"><span className="clash-icon ico-donations" /></span><strong>Melhores doadores</strong><small>Temporada atual</small></Link>
          <Link href="/wars" className="shortcut blue"><span className="shortcut-icon"><span className="clash-icon ico-stars" /></span><strong>Mais Estrelas</strong><small>Guerras + CWL</small></Link>
          <Link href="/capital" className="shortcut purple"><span className="shortcut-icon"><span className="clash-icon ico-raid" /></span><strong>Capital Raid</strong><small>Fim de semana</small></Link>
        </section>
      </main>
    </div>
  );
}
