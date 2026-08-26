import Link from 'next/link';
import { notFound } from 'next/navigation';
import ClashShell from '../../../components/ClashShell';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';

function formatTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function resultLabel(result?: string | null) {
  if (result === 'win') return 'Vitória';
  if (result === 'lose') return 'Derrota';
  if (result === 'tie') return 'Empate';
  return result ?? 'Em andamento';
}

function AttackStars({ stars = 0 }: { stars?: number | null }) {
  const amount = Number(stars ?? 0);
  return <span className="war-map-stars">{'★'.repeat(amount)}{'☆'.repeat(Math.max(0, 3 - amount))}</span>;
}

function TownHallBadge({ level }: { level?: number | null }) {
  if (!level) return <div className="war-th-icon war-th-fallback">TH?</div>;
  return <div className="war-th-icon"><img src={`/api/assets/townhall/${level}`} alt={`Centro da Vila ${level}`}/><span>TH{level}</span></div>;
}

type MemberRow = {
  id: number;
  side: 'clan' | 'opponent' | string;
  player_id?: number | null;
  player_tag: string;
  player_name: string;
  map_position: number;
  town_hall_level?: number | null;
  opponent_attacks?: number | null;
  best_opponent_stars?: number | null;
  best_opponent_destruction?: number | null;
  attacks_used?: number | null;
  stars_earned?: number | null;
  best_attack_destruction?: number | null;
};

type AttackRow = {
  id: number;
  attacker_tag: string;
  defender_tag: string;
  attacker_side: string;
  stars: number;
  destruction_percentage: number;
  attack_order?: number | null;
  duration?: number | null;
};

function StoredWarMap({
  side,
  title,
  members,
  attacks,
  otherMembers,
  attacksPerMember,
}: {
  side: 'clan' | 'opponent';
  title: string;
  members: MemberRow[];
  attacks: AttackRow[];
  otherMembers: MemberRow[];
  attacksPerMember: number;
}) {
  const ordered = [...members].sort((a, b) => Number(a.map_position) - Number(b.map_position));
  const targets = new Map(otherMembers.map(member => [member.player_tag, member]));

  return <section className={`war-map-section ${side === 'clan' ? 'war-map-own' : 'war-map-enemy'}`}>
    <div className="war-map-heading">
      <div><span className="eyebrow">{side === 'clan' ? 'NOSSO MAPA ARQUIVADO' : 'MAPA INIMIGO ARQUIVADO'}</span><h3>{title}</h3></div>
      <span>{ordered.length} participantes</span>
    </div>
    <div className="war-map-list">{ordered.map(member => {
      const memberAttacks = attacks.filter(attack => attack.attacker_tag === member.player_tag && attack.attacker_side === side).sort((a, b) => Number(a.attack_order ?? 999) - Number(b.attack_order ?? 999));
      const bestDestruction = memberAttacks.length ? Math.max(...memberAttacks.map(attack => Number(attack.destruction_percentage ?? 0))) : null;
      const player = <><strong>{member.player_name}</strong><span>{member.player_tag}</span></>;

      return <article className="war-map-row advanced" key={`${side}-${member.player_tag}`}>
        <div className="war-map-position">#{member.map_position}</div>
        <TownHallBadge level={member.town_hall_level}/>
        <div className="war-map-player">{side === 'clan' ? <Link href={`/players/${encodeURIComponent(member.player_tag.replace('#', ''))}`}>{player}</Link> : player}</div>
        <div className="war-map-cell"><small>ATAQUES</small><b>{memberAttacks.length}/{attacksPerMember}</b><em>{memberAttacks.length ? memberAttacks.map(attack => {
          const target = targets.get(attack.defender_tag);
          return target ? `#${target.map_position} ${target.player_name}` : attack.defender_tag;
        }).join(' · ') : 'Nenhum ataque arquivado'}</em></div>
        <div className="war-map-cell"><small>ESTRELAS FEITAS</small><b>{memberAttacks.reduce((sum, attack) => sum + Number(attack.stars ?? 0), 0)}</b><em>{bestDestruction == null ? '—' : `${bestDestruction}% melhor destruição`}</em></div>
        <div className="war-map-cell defense"><small>MELHOR ATAQUE RECEBIDO</small>{member.best_opponent_stars != null ? <><AttackStars stars={member.best_opponent_stars}/><em>{Number(member.best_opponent_destruction ?? 0).toFixed(2)}% · {member.opponent_attacks ?? 0} ataque(s)</em></> : <><AttackStars stars={0}/><em>Não atacada / não registrado</em></>}</div>
        {memberAttacks.length > 0 && <div className="war-attack-detail-list">{memberAttacks.map((attack, index) => {
          const target = targets.get(attack.defender_tag);
          return <div className="war-attack-detail" key={attack.id}><span>#{attack.attack_order ?? index + 1}</span><b>{target ? `#${target.map_position} ${target.player_name}` : attack.defender_tag}</b><AttackStars stars={attack.stars}/><em>{Number(attack.destruction_percentage ?? 0).toFixed(2)}%{attack.duration ? ` · ${attack.duration}s` : ''}</em></div>;
        })}</div>}
      </article>;
    })}</div>
  </section>;
}

export default async function ArchivedWarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const warId = Number(id);
  if (!Number.isInteger(warId) || warId <= 0) notFound();

  const database = getSupabaseAdmin();
  if (!database) notFound();

  const warResult = await database.from('wars').select('*').eq('id', warId).maybeSingle();
  if (warResult.error || !warResult.data) notFound();
  const war: any = warResult.data;

  const [clanResult, membersResult, attacksResult] = await Promise.all([
    database.from('clans').select('tag,name,badge_url').eq('id', war.clan_id).maybeSingle(),
    database.from('war_members').select('*').eq('war_id', warId).order('map_position', { ascending: true }),
    database.from('war_attacks').select('*').eq('war_id', warId).order('attack_order', { ascending: true }),
  ]);

  const clan: any = clanResult.data;
  const members = (membersResult.data ?? []) as MemberRow[];
  const attacks = (attacksResult.data ?? []) as AttackRow[];
  const clanMembers = members.filter(member => member.side === 'clan');
  const opponentMembers = members.filter(member => member.side === 'opponent');
  const hasDetailedArchive = members.length > 0;
  const attacksPerMember = Number(war.attacks_per_member ?? 2);
  const totalAttacks = Number(war.team_size ?? 0) * attacksPerMember;

  return <ClashShell active="wars" title={`Guerra vs ${war.opponent_name ?? 'adversário'}`} description={`Arquivo monitorado · ${formatTime(war.end_time)}`}>
    <div className="archive-war-toolbar"><Link href="/wars">← Voltar para Guerras</Link><span className={`war-result war-result-${war.result ?? 'unknown'}`}>{resultLabel(war.result)}</span></div>

    <section className="war-panel live-war-page archived-war-summary">
      <div className="panel-title-wrap"><span className="panel-kicker">GUERRA ARQUIVADA · #{war.id}</span><h2 className="ribbon">{clan?.name ?? 'Nosso clã'} VS {war.opponent_name ?? 'Adversário'}</h2></div>
      <div className="war-grid">
        <div className="war-team"><b>{clan?.name ?? 'Nosso clã'}</b><span>{clan?.tag ?? '—'}</span><div className="mini-shield live-badge">{clan?.badge_url ? <img src={clan.badge_url} alt=""/> : '—'}</div><div className="stars">★ {war.clan_stars ?? 0}</div><strong>{Number(war.clan_destruction ?? 0).toFixed(2)}%</strong></div>
        <div className="battle-center"><span className="battle-axes" aria-hidden="true"/><strong>VS</strong><b>{resultLabel(war.result)} · {war.team_size ?? '—'} x {war.team_size ?? '—'}</b></div>
        <div className="war-team"><b>{war.opponent_name ?? 'Adversário'}</b><span>{war.opponent_tag ?? '—'}</span><div className="mini-shield enemy live-badge">{war.opponent_badge_url ? <img src={war.opponent_badge_url} alt=""/> : '—'}</div><div className="stars enemy-stars">★ {war.opponent_stars ?? 0}</div><strong>{Number(war.opponent_destruction ?? 0).toFixed(2)}%</strong></div>
      </div>
      <div className="war-footer"><span><b>ATAQUES DO CLÃ</b>{war.clan_attacks ?? 0} / {totalAttacks || '—'}</span><span><b>ATAQUES INIMIGOS</b>{war.opponent_attacks ?? 0} / {totalAttacks || '—'}</span><span><b>INÍCIO</b>{formatTime(war.start_time)}</span><span><b>FIM</b>{formatTime(war.end_time)}</span></div>
    </section>

    {hasDetailedArchive ? <>
      <section className="archive-detail-banner"><strong>{attacks.length} ataques individuais arquivados</strong><span>Este confronto foi observado pelo Clan Manager e mantém os mapas e ataques disponíveis depois que a guerra terminar.</span></section>
      <div className="war-map-columns">
        <StoredWarMap side="clan" title={`Vilas do ${clan?.name ?? 'nosso clã'}`} members={clanMembers} attacks={attacks} otherMembers={opponentMembers} attacksPerMember={attacksPerMember}/>
        <StoredWarMap side="opponent" title={`Vilas do ${war.opponent_name ?? 'adversário'}`} members={opponentMembers} attacks={attacks} otherMembers={clanMembers} attacksPerMember={attacksPerMember}/>
      </div>
    </> : <section className="archive-detail-unavailable"><span className="eyebrow">APENAS RESUMO</span><h3>Ataques individuais não estavam disponíveis quando esta guerra foi importada</h3><p>Ela veio retroativamente do War Log da Supercell, que informa placar, resultado, estrelas e destruição, mas não devolve a lista completa de ataques depois que a guerra expira. As guerras acompanhadas pelo monitor daqui para frente ficam detalhadas.</p></section>}
  </ClashShell>;
}
