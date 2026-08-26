import GameNav from './GameNav';

export default function ClashShell({ active, children, title, description }: { active: string; children: React.ReactNode; title?: string; description?: string }) {
  return <div className="game-shell">
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand-mark"><span className="brand-shield">CM</span><div><div className="brand-kicker">CLAN MANAGER</div><h1>Gestão do clã</h1><p>#2GRURLPLL · Clash of Clans</p></div></div>
        <div className="header-status"><span className="status-dot"/> painel administrativo</div>
      </div>
    </header>
    <GameNav active={active}/>
    <main className="page-main">
      {title && <div className="page-heading"><div><span className="eyebrow">PAINEL DO CLÃ</span><h2>{title}</h2>{description && <p>{description}</p>}</div><span className="season-badge">TEMPORADA<br/><strong>ATUAL</strong></span></div>}
      {children}
    </main>
  </div>;
}
