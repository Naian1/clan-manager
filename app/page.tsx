import Link from 'next/link';
import GameNav from '../components/GameNav';

const CLAN_TAG = '#2GRURLPLL';
const demoPlayers = [
  { rank: 1, name: 'Aguardando sincronização', tag: '#---', score: 0, stars: 0, donations: 0 },
  { rank: 2, name: 'Os membros aparecerão aqui', tag: '#---', score: 0, stars: 0, donations: 0 },
  { rank: 3, name: 'Sem dados ainda', tag: '#---', score: 0, stars: 0, donations: 0 },
];
const metrics = [
  ['players','Membros','— / 50','Temporada atual'],['wars','Guerras vencidas','—','Temporada atual'],
  ['streak','Sequência de vitórias','—','Guerras do clã'],['stars','Estrelas no mês','—','Guerras + CWL'],
  ['donations','Doações no mês','—','Temporada atual'],['received','Recebidas no mês','—','Temporada atual'],
  ['raid','Capital Raid','—','Fim de semana'],['alerts','Alertas','0','Tudo certo!'],
];
type ClanData = { name?: string; badgeUrls?: { medium?: string; large?: string } };
async function getClan(): Promise<ClanData | null> {
  const token = process.env.CLASH_API_TOKEN ?? process.env.SUPERCELL_API_TOKEN;
  if (!token) return null;
  try {
    const r = await fetch(`https://api.clashofclans.com/v1/clans/${encodeURIComponent(CLAN_TAG)}`, {
      headers:{Authorization:`Bearer ${token}`}, cache:'no-store'
    });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

export default async function HomePage(){
  const clan = await getClan();
  const badge = clan?.badgeUrls?.large ?? clan?.badgeUrls?.medium;
  return <div className="game-shell clash-home">
    <style>{`
      .clash-home .hero-header{margin-bottom:0}
      .clash-home .home-nav-wrap{margin-top:-28px;position:relative;z-index:30}
      .clash-home .home-nav-wrap .shared-game-nav{margin-top:0}
      .clash-home .metrics-game{margin-top:14px}
      .clash-home .stone-card{
        background:transparent url('/assets/clash/card-parchment-final.png') center/100% 100% no-repeat!important;
        border:0!important;clip-path:none!important;border-radius:0!important;box-shadow:none!important;
        filter:drop-shadow(0 7px 5px #0008)!important;min-height:185px!important;padding:28px 22px!important
      }
      .clash-home .metric-icon{font-size:0!important;width:52px!important;height:52px!important}
      .clash-home .metric-icon .clash-icon{width:52px;height:52px}
      .clash-home .stone-title,.clash-home .stone-value{color:#24170f!important;text-shadow:0 1px #fff8!important}
      .clash-home .stone-note{color:#66513a!important}
      .clash-home .ranking-panel{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:visible!important}
      .clash-home .ranking-frame-bg{inset:0!important;width:100%!important;height:100%!important;object-fit:fill!important;background:transparent!important;border:0!important;border-radius:0!important}
      .clash-home .api-banner{display:none!important}
      .clash-home .battle-center b{font-size:0!important}.clash-home .battle-center b:after{content:'—';font-size:18px;color:#f5d6ba}
      .clash-home .clan-badge-placeholder{font-size:0!important}.clash-home .clan-badge-placeholder:after{content:'?';font-size:28px;color:#fff0b6}
      @media(max-width:760px){
        .clash-home .home-nav-wrap{margin-top:-16px}
        .clash-home .game-main{padding-top:10px!important}
        .clash-home .stone-card{min-height:145px!important;padding:20px 12px!important}
        .clash-home .metric-icon,.clash-home .metric-icon .clash-icon{width:40px!important;height:40px!important}
        .clash-home .stone-title{font-size:11px!important}.clash-home .stone-value{font-size:24px!important}.clash-home .stone-note{font-size:8px!important}
        .clash-home .ranking-panel{padding:48px 16px 22px!important;min-height:326px!important}
      }
    `}</style>

    <header className="hero-header">
      <div className="hero-content">
        <div className="brand-game">
          {badge?<img src={badge} className="clan-shield" alt={`Escudo de ${clan?.name ?? 'clã'}`}/>:<div className="clan-badge-placeholder"/>}
          <div><h1>Clan Manager</h1><p>{clan?.name?`${clan.name} · `:''}{CLAN_TAG}</p></div>
        </div>
        <div className="hero-actions"><div className="round-action">🏆</div><div className="round-action">🧔</div></div>
      </div>
    </header>

    <div className="home-nav-wrap"><GameNav active="home"/></div>

    <main className="game-main">
      <section className="metrics-game">
        {metrics.map(([icon,label,value,note])=><article className="stone-card" key={label}>
          <div className="metric-icon"><span className={`clash-icon ico-${icon}`}/></div>
          <div className="metric-copy"><div className="stone-title">{label}</div><div className="stone-value">{value}</div><div className="stone-note">{note}</div></div>
        </article>)}
      </section>

      <section className="war-panel game-panel">
        <h2 className="ribbon">GUERRA ATUAL</h2>
        <div className="war-grid">
          <div className="war-team"><b>Seu clã</b><div className="mini-shield">?</div><div className="stars">★★★</div><strong>—%</strong></div>
          <div className="battle-center"><img src="/assets/clash/war-axes.png" className="battle-icon-image" alt="Machados cruzados"/><b/></div>
          <div className="war-team"><b>Inimigo</b><div className="mini-shield enemy">?</div><div className="stars enemy-stars">★★★</div><strong>—%</strong></div>
        </div>
        <div className="war-footer"><span>⚔️ Ataques usados: — / —</span><span>⏱️ Termina em: —</span><span>⚠️ Membros pendentes: —</span></div>
      </section>

      <section className="ranking-panel game-panel">
        <img src="/assets/clash/panel-ranking.png" className="panel-frame-bg ranking-frame-bg" alt="" aria-hidden="true"/>
        <div className="ranking-head"><h2 className="ribbon">RANKING DA TEMPORADA</h2><Link href="/players" className="stone-button">Ver todos</Link></div>
        <div className="ranking-list">{demoPlayers.map(p=><div className="ranking-row" key={p.rank}>
          <div className={`rank-medal rank-${p.rank}`}>{p.rank}</div><div className="player-shield">?</div>
          <div className="ranking-name"><strong>{p.name}</strong><span>{p.tag}</span></div>
          <div className="ranking-stat"><small>PONTOS</small><b>{p.score}</b></div>
          <div className="ranking-stat"><small>DOAÇÕES</small><b>{p.donations}</b></div>
          <div className="ranking-stat mobile-hide"><small>ESTRELAS</small><b>{p.stars}</b></div>
        </div>)}</div>
      </section>

      <section className="shortcut-grid">
        <Link href="/players" className="shortcut green"><span className="shortcut-icon"><span className="clash-icon ico-donations"/></span><strong>Melhores doadores</strong><small>Temporada atual</small></Link>
        <Link href="/wars" className="shortcut blue"><span className="shortcut-icon"><span className="clash-icon ico-stars"/></span><strong>Mais Estrelas</strong><small>Guerras + CWL</small></Link>
        <Link href="/capital" className="shortcut purple"><span className="shortcut-icon"><span className="clash-icon ico-raid"/></span><strong>Capital Raid</strong><small>Fim de semana</small></Link>
      </section>
    </main>
  </div>;
}
