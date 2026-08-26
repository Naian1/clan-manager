import ClashShell from '../../../components/ClashShell';
import { getSupabaseServer } from '../../../lib/supabase/server';

export default async function PlayerPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const supabase = await getSupabaseServer();
  const playerTag = `#${decodeURIComponent(tag)}`;
  const result = supabase ? await supabase.from('players').select('*,player_scores(total_score)').eq('tag', playerTag).maybeSingle() : { data: null, error: null };
  const player: any = result.data;
  return <ClashShell active="players" title={player?.name ?? 'Jogador'} description={player?.tag ?? playerTag}>
    <section className="profile-grid"><article className="admin-card"><span className="eyebrow">PERFIL</span><h3>{player?.name ?? 'Aguardando sincronização'}</h3><p>{player?.role ?? 'Membro'} · TH {player?.town_hall_level ?? '—'} · {player?.league_name ?? 'Liga não registrada'}</p><div className="check-row"><span>Troféus</span><strong>{player?.trophies ?? '—'}</strong></div><div className="check-row"><span>Doações</span><strong>{player?.donations ?? '—'}</strong></div><div className="check-row"><span>Estrelas de guerra</span><strong>{player?.war_stars ?? '—'}</strong></div></article><article className="admin-card"><span className="eyebrow">SCORE ADMINISTRATIVO</span><h3>{player?.player_scores?.[0]?.total_score ?? '—'} pontos</h3><p>O score será calculado a partir de guerras, CWL, doações, Capital e atividade conforme as regras do clã.</p></article></section>
  </ClashShell>;
}
