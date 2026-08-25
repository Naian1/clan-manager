import Link from 'next/link';

const CLAN_TAG = '#2GRURLPLL';

const demoPlayers = [
  { rank: 1, name: 'Aguardando sincronização', tag: '#---', score: 0, stars: 0, donations: 0 },
  { rank: 2, name: 'Os membros aparecerão aqui', tag: '#---', score: 0, stars: 0, donations: 0 },
  { rank: 3, name: 'Sem dados ainda', tag: '#---', score: 0, stars: 0, donations: 0 },
];

const nav = [
  ['star', 'Visão geral', '/'], ['members', 'Jogadores', '/players'], ['swords', 'Guerras', '/wars'],
  ['capital', 'CWL', '/cwl'], ['capital', 'Capital', '/capital'], ['alert', 'Administração', '/admin'],
];

const metrics = [
  ['members', 'Membros', '— / 50', 'Aguardando API'],
  ['swords', 'Guerras vencidas', '—', 'Aguardando API'],
  ['fire', 'Sequência de vitórias', '—', 'Aguardando API'],
  ['star', 'Estrelas no mês', '—', 'Guerras + CWL'],
  ['potion-green', 'Doações no mês', '—', 'Aguardando API'],
  ['potion-purple', 'Recebidas no mês', '—', 'Aguardando API'],
  ['capital', 'Capital Raid', '—', 'Aguardando API'],
  ['alert', 'Alertas', '0', 'Tudo certo!'],
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

function RasterIcon({ name, className = 'raster-icon' }: { name: string; className?: string }) {
  return <img src={`/assets/clash/${name}.png`} className={className} alt="" aria-hidden="true" />;
}

export default async function HomePage() {
  const clan = await getClan();
  const badge = clan?.badgeUrls?.large ?? clan?.badgeUrls?.medium;

  return (
    <div className="game-shell">
      <header className="hero-header">
        <div className="hero-content">
          <div className="brand-game">
            <img src={badge ?? '/assets/clash/shield-fallback.png'} className="clan-shield" alt={badge ? `Escudo de ${clan?.name ?? 'clã'}` : 'Escudo aguardando API'} />
            <div><h1>Clan Manager</h1><p>{clan?.name ? `${clan.name} · ` : ''}{CLAN_TAG}</p></div>
          </div>
          <div className="hero-actions"><div className="round-action">🏆</div><div className="round-action">🧔</div></div>
        </div>
      </header>

      <nav className="game-nav" aria-label="Navegação principal">
        {nav.map(([icon, label, href], i) => (
          <Link href={href} key={`${label}-${href}`} className={`game-nav-item ${i === 0 ? 'active' : ''}`}>
            <RasterIcon name={icon} className="nav-raster-icon" /><span>{label}</span>
          </Link>
        ))}
      </nav>

      <main className="game-main">
        <section className="metrics-game">
          {metrics.map(([icon, label, value, note]) => (
            <article className="stone-card" key={label}>
              <img src="/assets/clash/panel-stone.png" className="panel-frame-bg" alt="" aria-hidden="true" />
              <RasterIcon name={icon} className="metric-raster-icon" />
              <div className="metric-copy"><div className="stone-title">{label}</div><div className="stone-value">{value}</div><div className="stone-note">{note}</div></div>
            </article>
          ))}
        </section>

        <section className="war-panel game-panel">
          <img src="/assets/clash/panel-war.png" className="panel-frame-bg war-frame-bg" alt="" aria-hidden="true" />
          <h2 className="ribbon">GUERRA ATUAL</h2>
          <div className="war-grid">
            <div className="war-team"><b>Seu clã</b><div className="mini-shield">?</div><div className="stars">★★★</div><strong>—%</strong></div>
            <div className="battle-center"><img src="/assets/clash/war-axes.png" className="battle-icon-image" alt="Machados cruzados" /><b>Aguardando dados da API</b></div>
            <div className="war-team"><b>Inimigo</b><div className="mini-shield enemy">?</div><div className="stars enemy-stars">★★★</div><strong>—%</strong></div>
          </div>
          <div className="war-footer"><span>⚔️ Ataques usados: — / —</span><span>⏱️ Termina em: —</span><span>⚠️ Membros pendentes: —</span></div>
        </section>

        <section className="ranking-panel game-panel">
          <img src="/assets/clash/ranking-frame.png" className="panel-frame-bg ranking-frame-bg" alt="" aria-hidden="true" />
          <div className="ranking-head"><h2 className="ribbon">RANKING DA TEMPORADA</h2><Link href="/players" className="stone-button">Ver todos</Link></div>
          <div className="ranking-list">{demoPlayers.map(p => <div className="ranking-row" key={p.rank}><div className={`rank-medal rank-${p.rank}`}>{p.rank}</div><div className="player-shield">?</div><div className="ranking-name"><strong>{p.name}</strong><span>{p.tag}</span></div><div className="ranking-stat"><small>PONTOS</small><b>{p.score}</b></div><div className="ranking-stat"><small>DOAÇÕES</small><b>{p.donations}</b></div><div className="ranking-stat mobile-hide"><small>ESTRELAS</small><b>{p.stars}</b></div></div>)}</div>
        </section>

        <section className="shortcut-grid">
          <Link href="/players" className="shortcut green"><RasterIcon name="potion-green" className="shortcut-raster-icon" /><strong>Melhores doadores</strong><small>Aguardando dados</small></Link>
          <Link href="/wars" className="shortcut blue"><RasterIcon name="star" className="shortcut-raster-icon" /><strong>Mais Estrelas</strong><small>Aguardando dados</small></Link>
          <Link href="/capital" className="shortcut purple"><RasterIcon name="capital" className="shortcut-raster-icon" /><strong>Capital Raid</strong><small>Aguardando dados</small></Link>
        </section>

        <section className="api-banner"><div className="barbarian">🗡️</div><div><strong>Conecte sua API da Supercell</strong><span>O escudo real do clã e os dados entram automaticamente quando a integração estiver ativa.</span></div><Link href="/admin" className="gold-button">Configurar API</Link></section>
      </main>
    </div>
  );
}
