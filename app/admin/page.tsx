import Link from 'next/link';

export default function AdminPage() {
  return <main className="main"><Link href="/" className="eyebrow">← Voltar ao painel</Link><div className="topbar"><div><h1 className="title">Administração</h1><div className="small">Acesso de líderes, regras, pontuação, sincronizações e auditoria.</div></div></div><section className="grid cols"><article className="card"><div className="section-head"><h2>Acesso</h2><span className="badge">Preparado</span></div><p className="small">O login será pelo Google via Supabase Auth e só e-mails presentes na allowlist poderão entrar. Líder, colíder e viewer terão permissões diferentes.</p></article><article className="card"><div className="section-head"><h2>Integração Supercell</h2><span className="badge">Pendente</span></div><p className="small">A nova key ainda não foi criada. Isso é intencional: primeiro definimos uma saída de rede compatível com a allowlist de IP da Supercell.</p></article></section></main>;
}
