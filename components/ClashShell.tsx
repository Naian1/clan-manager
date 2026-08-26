import GameNav from './GameNav';
import { CLAN_TAG, getClanBranding } from '../lib/dashboard';

function LeagueChip({ icon, label, value }: { icon?: string | null; label: string; value?: string | number | null }) {
  return <span className="brand-meta-chip">
    {icon ? <img src={icon} alt=""/> : <span className="brand-meta-dot"/>}
    <span><small>{label}</small><b>{value ?? '—'}</b></span>
  </span>;
}

export default async function ClashShell({ active, children, title, description }: { active: string; children: React.ReactNode; title?: string; description?: string }) {
  const clan = await getClanBranding();
  const badgeUrl = clan?.badge_url ?? null;

  return <div className="game-shell">
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand-mark">
          <div className={`brand-shield ${badgeUrl ? 'brand-shield-clan' : 'brand-shield-fallback'}`}>
            {badgeUrl ? <img src={badgeUrl} alt={`Escudo do clã ${clan?.name ?? ''}`.trim()} /> : <span>CM</span>}
          </div>
          <div className="brand-copy"><div className="brand-kicker">CLAN MANAGER</div><h1>Gestão do clã</h1><p>{clan?.tag ?? CLAN_TAG} · Clash of Clans</p>
            <div className="brand-meta">
              <LeagueChip icon={clan?.war_league_icon_url} label="Liga de guerra" value={clan?.war_league}/>
              <LeagueChip label="Troféus do clã" value={clan?.points?.toLocaleString('pt-BR')}/>
              <LeagueChip icon={clan?.capital_league_icon_url} label="Liga da Capital" value={clan?.capital_league}/>
              <LeagueChip label="Troféus da Capital" value={clan?.capital_points?.toLocaleString('pt-BR')}/>
            </div>
          </div>
        </div>
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
