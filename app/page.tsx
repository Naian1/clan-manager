import Link from 'next/link';

const demoPlayers = [
  { rank: 1, name: 'Aguardando sincronização', tag: '#---', score: 0, stars: 0, donations: 0 },
  { rank: 2, name: 'Os membros aparecerão aqui', tag: '#---', score: 0, stars: 0, donations: 0 },
  { rank: 3, name: 'Sem dados ainda', tag: '#---', score: 0, stars: 0, donations: 0 },
];

export default function HomePage() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="shield">CM</div>
          <div><h1>Clan Manager</h1><span>#2GRURLPLL</span></div>
        </div>
        <nav className="nav">
          <Link className="active" href="/">Visão geral</Link>
          <Link href="/players">Jogadores</Link>
          <Link href="/wars">Guerras</Link>
          <Link href="/cwl">CWL</Link>
          <Link href="/capital">Capital</Link>
          <Link href="/admin">Administração</Link>
        </nav>
      </aside>

      <main className="main">
        <div className="topbar">
          <div><div className="eyebrow">Painel administrativo</div><h1 className="title">Visão geral do clã</h1></div>
          <div className="status">API Supercell aguardando nova key</div>
        </div>

        <section className="grid metrics">
          <article className="card"><div className="metric-label">Membros</div><div className="metric-value">— / 50</div><div className="metric-note">Será atualizado pela API</div></article>
          <article className="card"><div className="metric-label">Estrelas no mês</div><div className="metric-value">—</div><div className="metric-note">Guerras + CWL</div></article>
          <article className="card"><div className="metric-label">Doações</div><div className="metric-value">—</div><div className="metric-note">Temporada atual</div></article>
          <article className="card"><div className="metric-label">Alertas</div><div className="metric-value">0</div><div className="metric-note">Nenhuma análise disponível ainda</div></article>
        </section>

        <section className="grid cols">
          <article className="card">
            <div className="section-head"><h2>Ranking da temporada</h2><span className="badge">Score interno</span></div>
            <table className="table">
              <thead><tr><th>#</th><th>Jogador</th><th>Score</th><th>Estrelas</th><th>Doações</th></tr></thead>
              <tbody>{demoPlayers.map((p) => <tr key={p.rank}><td className="rank">{p.rank}</td><td><div className="player"><div className="avatar">?</div><div><strong>{p.name}</strong><div className="small">{p.tag}</div></div></div></td><td>{p.score}</td><td>{p.stars}</td><td>{p.donations}</td></tr>)}</tbody>
            </table>
          </article>

          <article className="card">
            <div className="section-head"><h2>Guerra atual</h2><span className="badge">Sem dados</span></div>
            <div className="war-score"><div className="clan-side"><div className="small">Seu clã</div><div className="big-stars">— ⭐</div></div><div className="vs">VS</div><div className="clan-side"><div className="small">Adversário</div><div className="big-stars">— ⭐</div></div></div>
            <div className="small">Quando a integração com a Supercell estiver ativa, esta área mostrará placar, destruição, ataques restantes e membros que ainda não atacaram.</div>
          </article>
        </section>
      </main>
    </div>
  );
}
