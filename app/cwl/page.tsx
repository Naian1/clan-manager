import Link from 'next/link';
import ClashShell from '../../components/ClashShell';
import { getSupabaseAdmin } from '../../lib/supabase/admin';

function seasonLabel(value?: string | null) {
  if (!value) return '—';
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return value;
  const [, year, month] = match;
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${year}-${month}-01T00:00:00Z`));
}

export default async function Page() {
  const database = getSupabaseAdmin();
  if (!database) {
    return <ClashShell active="cwl" title="CWL" description="Temporadas, rodadas, ataques e desempenho individual na Liga de Guerra."><section className="table-wrap"><div className="empty"><div><strong>CWL indisponível</strong><br/>Os dados históricos aparecerão aqui quando estiverem disponíveis.</div></div></section></ClashShell>;
  }

  const seasonResult = await database.from('cwl_seasons').select('*').order('season', { ascending: false }).limit(1).maybeSingle();
  const season: any = seasonResult.data;
  if (!season) {
    return <ClashShell active="cwl" title="CWL" description="Temporadas, rodadas, ataques e desempenho individual na Liga de Guerra."><section className="table-wrap"><div className="empty"><div><strong>Nenhuma temporada arquivada</strong><br/>Quando houver uma CWL observada, as rodadas e ataques ficarão salvos aqui.</div></div></section></ClashShell>;
  }

  const attacksResult = await database.from('cwl_attacks')
    .select('player_id,round,stars,destruction_percentage,attacker_town_hall,defender_town_hall,players(name,tag)')
    .eq('cwl_season_id', season.id)
    .order('round', { ascending: true });
  const attacks: any[] = attacksResult.data ?? [];
  const rounds = new Set(attacks.map(attack => Number(attack.round))).size;
  const totalStars = attacks.reduce((sum, attack) => sum + Number(attack.stars ?? 0), 0);
  const averageDestruction = attacks.length ? attacks.reduce((sum, attack) => sum + Number(attack.destruction_percentage ?? 0), 0) / attacks.length : null;

  const byPlayer = new Map<number, { id: number; name: string; tag: string; attacks: number; stars: number; destruction: number; triples: number; rounds: number[] }>();
  for (const attack of attacks) {
    const playerData = Array.isArray(attack.players) ? attack.players[0] : attack.players;
    const id = Number(attack.player_id);
    const row = byPlayer.get(id) ?? { id, name: playerData?.name ?? `Jogador ${id}`, tag: playerData?.tag ?? '', attacks: 0, stars: 0, destruction: 0, triples: 0, rounds: [] };
    row.attacks += 1;
    row.stars += Number(attack.stars ?? 0);
    row.destruction += Number(attack.destruction_percentage ?? 0);
    if (Number(attack.stars ?? 0) === 3) row.triples += 1;
    row.rounds.push(Number(attack.round));
    byPlayer.set(id, row);
  }

  const ranking = [...byPlayer.values()].sort((a, b) => b.stars - a.stars || (b.destruction / Math.max(1, b.attacks)) - (a.destruction / Math.max(1, a.attacks)) || b.attacks - a.attacks);

  return <ClashShell active="cwl" title="CWL" description="Temporadas, rodadas, ataques e desempenho individual na Liga de Guerra.">
    <section className="cwl-summary-grid">
      <article className="cwl-summary-card"><small>TEMPORADA</small><strong>{seasonLabel(season.season)}</strong><span>{season.state ?? '—'}</span></article>
      <article className="cwl-summary-card"><small>LIGA DO CLÃ</small><strong>{season.league_name ?? '—'}</strong><span>registrada nesta temporada</span></article>
      <article className="cwl-summary-card"><small>RODADAS COLETADAS</small><strong>{rounds || '—'}</strong><span>{attacks.length} ataque(s) arquivado(s)</span></article>
      <article className="cwl-summary-card"><small>DESEMPENHO</small><strong>{attacks.length ? `${totalStars} ★` : '—'}</strong><span>{averageDestruction == null ? 'destruição —' : `${averageDestruction.toFixed(1)}% destruição média`}</span></article>
    </section>

    <section className="table-wrap">
      <div className="section-toolbar"><strong>Ranking individual da CWL</strong><span>{ranking.length} jogador(es) com ataque registrado</span></div>
      {ranking.length ? <table className="data-table"><thead><tr><th>#</th><th>JOGADOR</th><th>ATAQUES</th><th>ESTRELAS</th><th>TRIPLES</th><th>DESTRUIÇÃO</th><th>RODADAS</th></tr></thead><tbody>{ranking.map((player, index) => <tr key={player.id}><td>{index + 1}</td><td>{player.tag ? <Link href={`/players/${encodeURIComponent(player.tag.replace('#', ''))}`}><strong>{player.name}</strong><br/><small>{player.tag}</small></Link> : <strong>{player.name}</strong>}</td><td>{player.attacks}</td><td><strong>{player.stars}</strong></td><td>{player.triples}</td><td>{(player.destruction / Math.max(1, player.attacks)).toFixed(1)}%</td><td>{[...new Set(player.rounds)].sort((a, b) => a - b).join(', ')}</td></tr>)}</tbody></table> : <div className="empty"><div><strong>Temporada identificada</strong><br/>Ainda não há ataques de CWL arquivados para esta temporada.</div></div>}
    </section>
  </ClashShell>;
}
