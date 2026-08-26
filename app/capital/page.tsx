import ClashShell from '../../components/ClashShell';
import { getCapitalRaidSeasons } from '../../lib/clash/client';
import { CLAN_TAG } from '../../lib/dashboard';
import { getSupabaseAdmin } from '../../lib/supabase/admin';

function formatTime(value?: string | null) {
  if (!value) return '—';
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  const date = match ? new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export default async function Page() {
  const database = getSupabaseAdmin();
  const [liveRaids, seasonsResult] = await Promise.all([
    getCapitalRaidSeasons(CLAN_TAG, 10).catch(() => ({ items: [] })),
    database
      ? database.from('capital_raid_seasons').select('id,start_time,end_time,state,capital_total_loot,raids_completed,total_attacks,enemy_districts_destroyed,offensive_reward,defensive_reward').order('start_time', { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
  ]);

  const latest = liveRaids.items?.[0] ?? null;
  const members = [...(latest?.members ?? [])].sort((a, b) => Number(b.capitalResourcesLooted ?? 0) - Number(a.capitalResourcesLooted ?? 0));
  const archived = seasonsResult.data ?? [];

  return <ClashShell active="capital" title="Capital" description="Raid Weekend, Capital Gold, ataques e participação dos membros.">
    {latest ? <>
      <section className="live-data-grid">
        <article className="live-data-card"><small>RAID WEEKEND · API AO VIVO</small><strong>{formatTime(latest.startTime)}</strong><span>{latest.state ?? 'Estado disponível'}</span></article>
        <article className="live-data-card"><small>CAPITAL GOLD</small><strong>{Number(latest.capitalTotalLoot ?? 0).toLocaleString('pt-BR')}</strong><span>saque total do clã</span></article>
        <article className="live-data-card"><small>ATAQUES</small><strong>{latest.totalAttacks ?? 0}</strong><span>{latest.raidsCompleted ?? 0} raid(s) concluída(s)</span></article>
        <article className="live-data-card"><small>DISTRITOS</small><strong>{latest.enemyDistrictsDestroyed ?? 0}</strong><span>destruídos neste weekend</span></article>
        <article className="live-data-card"><small>RECOMPENSA OFENSIVA</small><strong>{latest.offensiveReward ?? '—'}</strong><span>medalhas</span></article>
        <article className="live-data-card"><small>RECOMPENSA DEFENSIVA</small><strong>{latest.defensiveReward ?? '—'}</strong><span>medalhas</span></article>
      </section>

      <section className="table-wrap">
        <div className="section-toolbar"><strong>Ranking do Raid Weekend</strong><span>{members.length} participante(s)</span></div>
        {members.length ? <table className="data-table"><thead><tr><th>#</th><th>JOGADOR</th><th>ATAQUES</th><th>LIMITE</th><th>BÔNUS</th><th>CAPITAL GOLD</th></tr></thead><tbody>{members.map((member, index) => <tr key={member.tag}><td>{index + 1}</td><td><strong>{member.name}</strong><br/><small>{member.tag}</small></td><td>{member.attacks ?? 0}</td><td>{member.attackLimit ?? '—'}</td><td>{member.bonusAttackLimit ?? 0}</td><td><strong>{Number(member.capitalResourcesLooted ?? 0).toLocaleString('pt-BR')}</strong></td></tr>)}</tbody></table> : <div className="empty"><div>Nenhum participante retornado neste Raid Weekend.</div></div>}
      </section>
    </> : <section className="feature-grid"><article className="feature-panel"><div><span className="eyebrow">API AO VIVO</span><h3>Nenhum Raid Weekend retornado</h3><p>A página consulta a Supercell diretamente ao abrir. Quando houver dados disponíveis eles aparecerão aqui.</p></div></article></section>}

    <section className="feature-grid">
      <article className="feature-panel"><div><span className="eyebrow">HISTÓRICO PERSISTIDO</span><h3>{archived.length ? `${archived.length} Raid Weekends arquivados` : 'Histórico ainda vazio'}</h3><p>O sync guarda os weekends, totais e desempenho por membro para o histórico não depender eternamente da API.</p></div></article>
      <article className="feature-panel compact"><span className="eyebrow">DADOS DETALHADOS</span><h3>Attack/Defense logs preservados</h3><p>O JSON bruto de cada Raid Weekend fica salvo para podermos detalhar distritos e ataques depois sem perder informação.</p></article>
    </section>

    {archived.length ? <section className="table-wrap"><div className="section-toolbar"><strong>Últimos Raid Weekends arquivados</strong><span>Supabase</span></div><table className="data-table"><thead><tr><th>INÍCIO</th><th>OURO</th><th>ATAQUES</th><th>RAIDS</th><th>DISTRITOS</th></tr></thead><tbody>{archived.map((raid: any) => <tr key={raid.id}><td>{formatTime(raid.start_time)}</td><td>{Number(raid.capital_total_loot ?? 0).toLocaleString('pt-BR')}</td><td>{raid.total_attacks ?? 0}</td><td>{raid.raids_completed ?? 0}</td><td>{raid.enemy_districts_destroyed ?? 0}</td></tr>)}</tbody></table></section> : null}
  </ClashShell>;
}
