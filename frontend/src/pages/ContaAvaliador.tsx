import CascaDoApp from '../components/CascaDoApp'
import PaginaDeConta, { BlocoDoPapel } from '../components/PaginaDeConta'
import { MENU_AVALIADOR } from '../navegacao/menus'

/** 60 · Avaliador — conta (Cláudia Rangel) · rota /conta/avaliador */
function ContaAvaliador() {
    return (
        <CascaDoApp
            organizacao="Órgão de Fomento PE"
            papel="Avaliador"
            iniciais="CR"
            nome="Cláudia Rangel"
            itens={MENU_AVALIADOR}
            voltarPara="/avaliacao"
        >
            <PaginaDeConta
                pessoa={{
                    iniciais: 'CR',
                    nome: 'Cláudia Rangel',
                    email: 'claudia@consultoria.com.br',
                    telefone: '(81) 9 9455-3021',
                    funcao: 'Avaliadora convidada',
                    criadaEm: '05/05/2026',
                    id: 'USR-0163',
                }}
                destaqueTitulo="Minha fila"
                destaque={
                    <>
                        <div className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3">
                            <p className="text-bloco text-status-aprovada-texto">
                                2 candidaturas aguardando
                            </p>
                            <p className="mt-1 text-apoio text-status-aprovada-texto">
                                1 reenviada após ajuste
                            </p>
                        </div>
                        <p className="mt-3 text-apoio text-secundario">
                            Cada candidatura mostra a rodada. Na 2ª rodada você vê o que foi
                            corrigido.
                        </p>
                    </>
                }
                vinculos={[{ organizacao: 'Órgão de Fomento PE', papel: 'Avaliador' }]}
            >
                <BlocoDoPapel
                    titulo="Último parecer registrado"
                    status="aprovada"
                    chamada="Programa Acelera PE 2026"
                    contexto="Ateliê TI Ltda · 2ª rodada, depois do ajuste"
                    explicacao="A decisão segue para o provedor homologar. O extrato com as notas fica com o candidato."
                    acao="Abrir fila"
                />
            </PaginaDeConta>
        </CascaDoApp>
    )
}

export default ContaAvaliador
