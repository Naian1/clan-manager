import Link from 'next/link';

export default function PlayersPage() {
  return <main className="main"><Link href="/" className="eyebrow">← Voltar ao painel</Link><div className="topbar"><div><h1 className="title">Jogadores</h1><div className="small">Perfis, desempenho, doações, guerras, CWL, Capital e histórico de permanência.</div></div></div><section className="card empty"><div><strong>Aguardando a primeira sincronização</strong>Os jogadores serão identificados pela tag da Supercell. Se alguém sair e voltar, o mesmo perfil será reaproveitado e as passagens pelo clã ficarão separadas no histórico.</div></section></main>;
}
