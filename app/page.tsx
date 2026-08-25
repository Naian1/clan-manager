import Link from 'next/link';

const demoPlayers=[
 {rank:1,name:'Aguardando sincronização',tag:'#---',score:0,stars:0,donations:0},
 {rank:2,name:'Os membros aparecerão aqui',tag:'#---',score:0,stars:0,donations:0},
 {rank:3,name:'Sem dados ainda',tag:'#---',score:0,stars:0,donations:0},
];
const nav=[['🏠','Visão geral','/'],['👥','Jogadores','/players'],['⚔️','Guerras','/wars'],['🛡️','CWL','/cwl'],['🏰','Capital','/capital'],['⚙️','Administração','/admin']];
const metrics=[
 ['members','Membros','— / 50','Aguardando API'],['swords','Guerras vencidas','—','Aguardando API'],['fire','Sequência de vitórias','—','Aguardando API'],['star','Estrelas no mês','—','Guerras + CWL'],
 ['potion','Doações no mês','—','Aguardando API'],['potion','Recebidas no mês','—','Aguardando API'],['capital','Capital Raid','—','Aguardando API'],['alert','Alertas','0','Tudo certo!']
];
function Icon({name,className='game-icon'}:{name:string,className?:string}){return <svg className={className} aria-hidden="true"><use href={`/assets/ui/icons.svg#${name}`}/></svg>}
export default function HomePage(){return <div className="game-shell">
 <header className="hero-header"><div className="hero-content"><div className="brand-game"><div className="clan-badge"><span className="atlas atlas-shield clan-shield"/><span className="badge-api">API</span></div><div><h1>Clan Manager</h1><p>#2GRURLPLL</p></div></div><div className="hero-actions"><div className="round-action">🏆</div><div className="round-action">🧔</div></div></div></header>
 <nav className="game-nav">{nav.map(([icon,label,href],i)=><Link href={href} key={href} className={`game-nav-item ${i===0?'active':''}`}><span className="nav-icon">{icon}</span><span>{label}</span></Link>)}</nav>
 <main className="game-main">
  <section className="metrics-game">{metrics.map(([icon,label,value,note])=><article className="stone-card" key={label}><span className="atlas atlas-stone card-art"/><Icon name={icon}/><div className="metric-copy"><div className="stone-title">{label}</div><div className="stone-value">{value}</div><div className="stone-note">{note}</div></div></article>)}</section>
  <section className="war-panel game-panel"><span className="atlas atlas-war panel-art"/><div className="ribbon"><span className="atlas atlas-ribbon ribbon-art"/><h2>GUERRA ATUAL</h2></div><div className="war-grid"><div className="war-team"><b>Seu clã</b><div className="mini-shield">?</div><div className="stars">★★★</div><strong>—%</strong></div><div className="battle-center"><Icon name="swords" className="battle-icon"/><b>Aguardando dados da API</b></div><div className="war-team"><b>Inimigo</b><div className="mini-shield enemy">?</div><div className="stars enemy-stars">★★★</div><strong>—%</strong></div></div><div className="war-footer"><span>⚔️ Ataques usados: — / —</span><span>⏱️ Termina em: —</span><span>⚠️ Membros pendentes: —</span></div></section>
  <section className="ranking-panel game-panel"><span className="atlas atlas-ranking panel-art"/><div className="ranking-head"><div className="ribbon ranking-ribbon"><span className="atlas atlas-ribbon ribbon-art"/><h2>RANKING DA TEMPORADA</h2></div><Link href="/players" className="stone-button">Ver todos</Link></div><div className="ranking-list">{demoPlayers.map(p=><div className="ranking-row" key={p.rank}><div className={`rank-medal rank-${p.rank}`}>{p.rank}</div><div className="player-shield">?</div><div className="ranking-name"><strong>{p.name}</strong><span>{p.tag}</span></div><div className="ranking-stat"><small>PONTOS</small><b>{p.score}</b></div><div className="ranking-stat"><small>DOAÇÕES</small><b>{p.donations}</b></div><div className="ranking-stat mobile-hide"><small>ESTRELAS</small><b>{p.stars}</b></div></div>)}</div></section>
  <section className="shortcut-grid"><Link href="/players" className="shortcut"><span className="atlas atlas-green shortcut-art"/><Icon name="potion"/><strong>Melhores doadores</strong><small>Aguardando dados</small></Link><Link href="/wars" className="shortcut"><span className="atlas atlas-blue shortcut-art"/><Icon name="star"/><strong>Mais Estrelas</strong><small>Aguardando dados</small></Link><Link href="/capital" className="shortcut"><span className="atlas atlas-purple shortcut-art"/><Icon name="capital"/><strong>Capital Raid</strong><small>Aguardando dados</small></Link></section>
  <section className="api-banner"><div className="barbarian">🗡️</div><div><strong>Conecte sua API da Supercell</strong><span>O escudo real do clã e os dados entram automaticamente quando a integração estiver ativa.</span></div><Link href="/admin" className="gold-button"><span className="atlas atlas-gold gold-art"/>Configurar API</Link></section>
 </main>
 </div>}
