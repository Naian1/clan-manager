import Link from 'next/link';
import ClashShell from '../../components/ClashShell';
import { getDashboardData } from '../../lib/dashboard';

const sortOptions = [
  ['rank', 'Posição'],
  ['league', 'Liga'],
  ['trophies', 'Troféus'],
  ['donations', 'Doações'],
  ['warstars', 'War Stars'],
  ['score', 'Score'],
] as const;

type SortKey = typeof sortOptions[number][0];

function sortPlayers<T extends {
  clan_rank: number | null;
  league_id: number | null;
  trophies: number | null;
  donations: number | null;
  war_stars: number | null;
  score: number;
}>(players: T[], sort: SortKey) {
  return [...players].sort((a, b) => {
    if (sort === 'league') return (b.league_id ?? -1) - (a.league_id ?? -1) || (b.trophies ?? 0) - (a.trophies ?? 0);
    if (sort === 'trophies') return (b.trophies ?? 0) - (a.trophies ?? 0);
    if (sort === 'donations') return (b.donations ?? 0) - (a.donations ?? 0);
    if (sort === 'warstars') return (b.war_stars ?? 0) - (a.war_stars ?? 0);
    if (sort === 'score') return b.score - a.score;
    return (a.clan_rank ?? Number.MAX_SAFE_INTEGER) - (b.clan_rank ?? Number.MAX_SAFE_INTEGER);
  });
}

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { players, clan, error } = await getDashboardData();
  const params = await searchParams;
  const requestedSort = params.sort as SortKey | undefined;
  const sort: SortKey = sortOptions.some(([key]) => key === requestedSort) ? requestedSort! : 'rank';
  const orderedPlayers = sortPlayers(players, sort);

  return <ClashShell active="players" title="Jogadores" description="Membros atuais, liga, troféus, desempenho e histórico de permanência no clã.">
    <section className="table-wrap">
      <div className="section-toolbar">
        <strong>{players.length} jogadores ativos</strong>
        <span>{error ? 'Falha ao consultar jogadores' : clan ? `Clã ${clan.tag}` : '—'}</span>
      </div>
      <div className="player-sort-links">
        <span>ORDENAR</span>
        {sortOptions.map(([key, label]) => <Link key={key} href={`/players?sort=${key}`} className={sort === key ? 'active' : ''}>{label}</Link>)}
      </div>
      {orderedPlayers.length ? <table className="data-table player-table"><thead><tr><th>#</th><th>JOGADOR</th><th>TH</th><th>LIGA</th><th>TROFÉUS</th><th>DOAÇÕES</th><th>WAR STARS</th><th>SCORE</th></tr></thead><tbody>{orderedPlayers.map((player, index) => <tr key={player.id}><td>{sort === 'rank' ? player.clan_rank ?? index + 1 : index + 1}</td><td><Link href={`/players/${encodeURIComponent(player.tag.replace('#', ''))}`}><strong>{player.name}</strong><br/><small>{player.tag}</small></Link></td><td><div className="table-th"><img src={`/api/assets/townhall/${player.town_hall_level ?? 1}`} alt=""/><span>TH{player.town_hall_level ?? '—'}</span></div></td><td><div className="table-league">{player.league_icon_url ? <img src={player.league_icon_url} alt=""/> : null}<span><b>{player.league_name ?? '—'}</b></span></div></td><td>{player.trophies?.toLocaleString('pt-BR') ?? '—'}</td><td>{player.donations ?? 0}</td><td>{player.war_stars ?? '—'}</td><td><strong>{player.score}</strong></td></tr>)}</tbody></table> : <div className="empty"><div><strong>Nenhum jogador disponível</strong><br/>Os membros aparecerão aqui assim que houver dados do clã.</div></div>}
    </section>
  </ClashShell>;
}
