import ClashShell from '../../components/ClashShell';

export default function Page() {
  return <ClashShell active="capital" title="Capital" description="Raid Weekend, Capital Gold, ataques e participação dos membros.">
    <section className="feature-grid">
      <article className="feature-panel"><div><span className="eyebrow">DADOS HISTÓRICOS</span><h3>Nenhum Raid Weekend arquivado</h3><p>A Capital será preenchida pelas coletas automáticas do clã assim que um Raid Weekend estiver disponível.</p></div></article>
      <article className="feature-panel compact"><span className="eyebrow">MONITORAMENTO</span><h3>Histórico preservado</h3><p>Cada Raid Weekend coletado ficará salvo para comparar ataques, Capital Gold e participação dos membros ao longo do tempo.</p></article>
    </section>
  </ClashShell>;
}
