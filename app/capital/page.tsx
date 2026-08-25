import Link from 'next/link';

export default function CapitalPage() {
  return <main className="main"><Link href="/" className="eyebrow">← Voltar ao painel</Link><div className="topbar"><div><h1 className="title">Capital do Clã</h1><div className="small">Ataques, ouro saqueado, distritos destruídos e participação por temporada.</div></div></div><section className="card empty"><div><strong>Sem temporada sincronizada</strong>Os dados de Raid Capital serão armazenados por temporada e por jogador.</div></section></main>;
}
