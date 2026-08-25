import Link from 'next/link';

export default function CwlPage() {
  return <main className="main"><Link href="/" className="eyebrow">← Voltar ao painel</Link><div className="topbar"><div><h1 className="title">CWL</h1><div className="small">Desempenho por rodada, estrelas, destruição e ranking interno.</div></div></div><section className="card empty"><div><strong>Aguardando temporada</strong>As rodadas e ataques de CWL aparecerão aqui assim que a integração estiver ativa.</div></section></main>;
}
