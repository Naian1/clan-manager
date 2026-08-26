import ClashShell from '../../components/ClashShell';

export default function Page() {
  return <ClashShell active="cwl" title="CWL" description="Temporadas, rodadas, ataques e desempenho individual na Liga de Guerra.">
    <section className="feature-grid"><article className="feature-panel"><div><span className="eyebrow">DADOS HISTÓRICOS</span><h3>Nenhuma temporada de CWL arquivada</h3><p>Quando uma temporada estiver disponível, as rodadas e ataques aparecerão aqui.</p></div></article><article className="feature-panel compact"><span className="eyebrow">PRÓXIMO PASSO</span><h3>Conecte a sincronização</h3><p>Configure a chave oficial da Supercell e execute a primeira sincronização na área Admin.</p><a className="primary-button" href="/admin">Ir para Admin →</a></article></section>
  </ClashShell>;
}
