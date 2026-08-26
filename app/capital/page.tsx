import ClashShell from '../../components/ClashShell';

export default function Page() {
  return <ClashShell active="capital" title="Capital" description="Raid Weekend, Capital Gold, ataques e participação dos membros.">
    <section className="feature-grid"><article className="feature-panel"><div><span className="eyebrow">DADOS HISTÓRICOS</span><h3>Nenhum Raid Weekend arquivado</h3><p>A Capital será preenchida pela sincronização oficial do clã.</p></div></article><article className="feature-panel compact"><span className="eyebrow">PRÓXIMO PASSO</span><h3>Conecte a sincronização</h3><p>Configure a chave oficial da Supercell e execute a primeira sincronização na área Admin.</p><a className="primary-button" href="/admin">Ir para Admin →</a></article></section>
  </ClashShell>;
}
