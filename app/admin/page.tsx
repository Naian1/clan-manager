import ClashShell from '../../components/ClashShell';

export default function AdminPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
  const supercellConfigured = Boolean(process.env.CLASH_API_TOKEN || process.env.SUPERCELL_API_TOKEN);
  return <ClashShell active="admin" title="Administração" description="Acesso restrito para líderes e co-líderes do clã.">
    <section className="admin-grid"><article className="admin-card"><span className="eyebrow">INTEGRAÇÕES</span><h3>Conexões do sistema</h3><div className="check-row"><span>Supabase</span><span className={`badge ${configured ? '' : 'muted'}`}>{configured ? 'Configurado' : 'Pendente'}</span></div><div className="check-row"><span>API Supercell</span><span className={`badge ${supercellConfigured ? '' : 'muted'}`}>{supercellConfigured ? 'Configurada' : 'Pendente'}</span></div><div className="check-row"><span>RLS do banco</span><span className="badge">Ativo</span></div></article><article className="admin-card"><span className="eyebrow">SINCRONIZAÇÃO</span><h3>Atualizar dados do clã</h3><p>A sincronização será server-side, idempotente e registrada em <code>sync_runs</code>. A chave da Supercell nunca vai para o navegador.</p><button className="primary-button" type="button" disabled>Sincronizar agora <small>(em implementação)</small></button></article><article className="admin-card"><span className="eyebrow">AUTORIZAÇÃO</span><h3>Allowlist de administradores</h3><p>O acesso futuro usará Google Auth + <code>admin_allowlist</code>. Autenticar não será suficiente para entrar no painel.</p><a className="secondary-button" href="/api/health">Ver health check</a></article></section>
  </ClashShell>;
}
