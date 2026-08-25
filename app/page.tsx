import Link from 'next/link';

const demoPlayers = [
  { rank: 1, name: 'Aguardando sincronização', tag: '#---', score: 0, stars: 0, donations: 0 },
  { rank: 2, name: 'Os membros aparecerão aqui', tag: '#---', score: 0, stars: 0, donations: 0 },
  { rank: 3, name: 'Sem dados ainda', tag: '#---', score: 0, stars: 0, donations: 0 },
];

const navItems = [
  ['🏠', 'Visão geral', '/'],
  ['👥', 'Jogadores', '/players'],
  ['⚔️', 'Guerras', '/wars'],
  ['🛡️', 'CWL', '/cwl'],
  ['🏰', 'Capital', '/capital'],
  ['⚙️', 'Admin', '/admin'],
];

const metrics = [
  ['👥', 'Membros', '— / 50', 'Aguardando API'],
  ['⚔️', 'Guerras vencidas', '—', 'Aguardando API'],
  ['🔥', 'Sequência', '—', 'Aguardando API'],
  ['⭐', 'Estrelas no mês', '—', 'Guerras + CWL'],
  ['🧪', 'Doações', '—', 'Temporada atual'],
  ['📦', 'Recebidas', '—', 'Temporada atual'],
  ['💎', 'Capital Raid', '—', 'Aguardando API'],
  ['🚨', 'Alertas', '0', 'Tudo certo por enquanto'],
];

export default function HomePage() {
  return (
    <div className="game-shell">
      <header className="hero-header">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="brand-game">
            <div className="shield-game"><span>10</span><b>CM</b></div>
            <div>
              <h1>Clan Manager</h1>
              <p>#2GRURLPLL</p>
            </div>
          </div>
          <div className="hero-actions">
            <div className="round-action">🏆</div>
            <div className="round-action">🧔</div>
          </div>
        </div>
      </header>

      <nav className="game-nav" aria-label="Navegação principal">
        {navItems.map(([icon, label, href], index) => (
          <Link href={href} key={href} className={index === 0 ? 'game-nav-item active' : 'game-nav-item'}>
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <main className="game-main">
        <section className="metrics-game">
          {metrics.map(([icon, label, value, note]) => (
            <article className="stone-card" key={label}>
              <div className="metric-icon">{icon}</div>
              <div className="stone-title">{label}</div>
              <div className="stone-value">{value}</div>
              <div className="stone-note">{note}</div>
            </article>
          ))}
        </section>

        <section className="war-panel game-panel">
          <div className="ribbon">GUERRA ATUAL</div>
          <div className="war-grid">
            <div className="war-team">
              <div className="team-label">Seu clã</div>
              <div className="mini-shield">?</div>
              <div className="stars">⭐⭐⭐</div>
              <strong>—%</strong>
            </div>
            <div className="battle-center">
              <div className="axes">⚔️</div>
              <div className="battle-status">Aguardando dados da API</div>
            </div>
            <div className="war-team">
              <div className="team-label">Inimigo</div>
              <div className="mini-shield enemy">?</div>
              <div className="stars muted-stars">☆☆☆</div>
              <strong>—%</strong>
            </div>
          </div>
          <div className="war-footer">
            <span>⚔️ Ataques usados: — / —</span>
            <span>⏱️ Termina em: —</span>
            <span>⚠️ Pendentes: —</span>
          </div>
        </section>

        <section className="ranking-panel game-panel">
          <div className="panel-heading">
            <div className="ribbon small-ribbon">RANKING DA TEMPORADA</div>
            <Link href="/players" className="stone-button">Ver todos</Link>
          </div>
          <div className="ranking-list">
            {demoPlayers.map((player) => (
              <div className="ranking-row" key={player.rank}>
                <div className={`rank-medal rank-${player.rank}`}>{player.rank}</div>
                <div className="player-shield">?</div>
                <div className="ranking-name"><strong>{player.name}</strong><span>{player.tag}</span></div>
                <div className="ranking-stat"><span>Pontos</span><b>{player.score}</b></div>
                <div className="ranking-stat"><span>Doações</span><b>{player.donations}</b></div>
                <div className="ranking-stat mobile-hide"><span>Estrelas</span><b>{player.stars}</b></div>
              </div>
            ))}
          </div>
        </section>

        <section className="shortcut-grid">
          <Link href="/players" className="shortcut green"><span>🧪</span><strong>Melhores doadores</strong><small>Aguardando dados</small></Link>
          <Link href="/wars" className="shortcut blue"><span>⭐</span><strong>Mais estrelas</strong><small>Aguardando dados</small></Link>
          <Link href="/capital" className="shortcut purple"><span>🏰</span><strong>Capital Raid</strong><small>Aguardando dados</small></Link>
        </section>

        <section className="api-banner">
          <div className="barbarian">⚔️</div>
          <div><strong>Conecte sua API da Supercell</strong><span>Adicione a nova key quando definirmos a rota segura de acesso.</span></div>
          <Link href="/admin" className="gold-button">Configurar API</Link>
        </section>
      </main>
    </div>
  );
}
