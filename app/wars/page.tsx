import Link from 'next/link';

export default function WarsPage() {
  return <main className="main"><Link href="/" className="eyebrow">← Voltar ao painel</Link><div className="topbar"><div><h1 className="title">Guerras</h1><div className="small">Guerra atual, ataques, estrelas, destruição, triplos e faltas.</div></div></div><section className="card empty"><div><strong>Sem dados de guerra ainda</strong>O sistema vai salvar cada guerra e cada ataque para que o histórico não dependa do que a API continuar exibindo no futuro.</div></section></main>;
}
