import Link from 'next/link';
import ClashShell from '../../components/ClashShell';
import { getDashboardData } from '../../lib/dashboard';

export default async function PlayersPage() {
  const { players, clan, error } = await getDashboardData();
  return <ClashShell active="players" title="Jogadores" description="Membros atuais, desempenho e histórico de permanência no clã.">
    <section className="table-wrap"><div className="section-toolbar"><strong>{players.length} jogadores ativos</strong><span>{error ? 'Falha ao consultar jogadores' : clan ? `Clã ${clan.tag}` : 'Aguardando sincronização'}</span></div>{players.length ? <table className="data-table"><thead><tr><th>#</th><th>JOGADOR</th><th>TH</th><th>DOAÇÕES</th><th>ESTRELAS</th><th>SCORE</th><th>STATUS</th></tr></thead><tbody>{players.map((player, index) => <tr key={player.id}><td>{player.clan_rank ?? index + 1}</td><td><Link href={`/players/${encodeURIComponent(player.tag.replace('#', ''))}`}><strong>{player.name}</strong><br/><small>{player.tag}</small></Link></td><td>{player.town_hall_level ?? '—'}</td><td>{player.donations ?? 0}</td><td>{player.war_stars ?? 0}</td><td><strong>{player.score}</strong></td><td><span className="badge">Ativo</span></td></tr>)}</tbody></table> : <div className="empty"><div><strong>Nenhum jogador sincronizado</strong>A primeira sincronização vai identificar cada membro pela player tag oficial.</div></div>}</section>
  </ClashShell>;
}
