import ClashShell from '../../components/ClashShell';

export default function Page() {
  return <ClashShell active="wars" title="Guerras" description="Histórico de guerras, ataques, estrelas, destruição e faltas.">
    <section className="feature-grid"><article className="feature-panel"><div><span className="eyebrow">DADOS HISTÓRICOS</span><h3>Nenhuma guerra arquivada</h3><p>A sincronização vai salvar cada guerra observada para que o histórico não dependa eternamente da API.</p></div></article><article className="feature-panel compact"><span className="eyebrow">PRÓXIMO PASSO</span><h3>Conecte a sincronização</h3><p>Configure a chave oficial da Supercell e execute a primeira sincronização na área Admin.</p><a className="primary-button" href="/admin">Ir para Admin →</a></article></section>
  </ClashShell>;
}
