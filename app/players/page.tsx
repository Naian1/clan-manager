import Link from 'next/link';
import ClashShell from '../../components/ClashShell';
import { getDashboardData } from '../../lib/dashboard';

export default async function PlayersPage() {
  const { players, clan, error } = await getDashboardData();
  return <ClashShell active="players" title="Jogadores" description="Membros atuais, liga, troféus, desempenho e histórico de permanência no clã.">
    <section className="table-wrap"><div className="section-toolbar"><strong>{players.length} jogadores ativos</strong><span>{error ? 'Falha ao consultar jogadores' : clan ? `Clã ${clan.tag}` : '—'}</span></div>{players.length ? <table className="data-table player-table"><thead><tr><th>#</th><th>JOGADOR</th><th>TH</th><th>LIGA</th><th>TROFÉUS</th><th>DOAÇÕES</th><th>WAR STARS</th><th>SCORE</th></tr></thead><tbody>{players.map((player, index) => <tr key={player.id}><td>{player.clan_rank ?? index + 1}</td><td><Link href={`/players/${encodeURIComponent(player.tag.replace('#', ''))}`}><strong>{player.name}</strong><br/><small>{player.tag}</small></Link></td><td><div className="table-th"><img src={`/api/assets/townhall/${player.town_hall_level ?? 1}`} alt=""/><span>TH{player.town_hall_level ?? '—'}</span></div></td><td><div className="table-league">{player.league_icon_url ? <img src={player.league_icon_url} alt=""/> : null}<span><b>{player.league_name ?? '—'}</b></span></div></td><td>{player.trophies?.toLocaleString('pt-BR') ?? '—'}</td><td>{player.donations ?? 0}</td><td>{player.war_stars ?? '—'}</td><td><strong>{player.score}</strong></td></tr>)}</tbody></table> : <div className="empty"><div><strong>Nenhum jogador sincronizado</strong>A primeira sincronização vai identificar cada membro pela player tag oficial.</div></div>}</section>
  </ClashShell>;
}
