import CascaDoApp from '../components/CascaDoApp'
import PaginaDeConta, { BlocoDoPapel } from '../components/PaginaDeConta'
import { MENU_SQUAD } from '../navegacao/menus'

/** 57 · Candidato squad — conta (Sua Chen Letícia) · rota /conta/squad */
function ContaSquad() {
    return (
        <CascaDoApp
            organizacao="Squad 3 · FICR"
            papel="Candidato · squad"
            iniciais="SC"
            nome="Sua Chen Letícia"
            itens={MENU_SQUAD}
            voltarPara="/squad"
        >
            <PaginaDeConta
                pessoa={{
                    iniciais: 'SC',
                    nome: 'Sua Chen Letícia',
                    email: 'leticia.chen@ficr.edu.br',
                    telefone: '(81) 9 8888-1203',
                    funcao: 'Representante da squad',
                    criadaEm: '03/03/2026',
                    id: 'USR-0212',
                }}
                destaqueTitulo="Minha nota do match"
                destaque={
                    <>
                        <div className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3">
                            <p className="text-bloco text-status-aprovada-texto">
                                82 em lógica e dados
                            </p>
                            <p className="mt-1 text-apoio text-status-aprovada-texto">
                                válida até 30/12/2026
                            </p>
                        </div>
                        <p className="mt-3 text-apoio text-secundario">
                            A nota é sua, não da organização, e acompanha você em qualquer
                            vínculo.
                        </p>
                    </>
                }
                vinculos={[{ organizacao: 'Squad 3 · FICR', papel: 'Candidato · squad' }]}
            >
                <BlocoDoPapel
                    titulo="Resultado da última candidatura"
                    status="aprovada"
                    chamada="Desafio Logística Urbana"
                    contexto="Movetech · aprovada em 28/08/2026 · em acompanhamento desde 02/09"
                    explicacao="Mentor: Paulo Tavares. As sprints e as entregas ficam em Minhas candidaturas."
                    acao="Ver acompanhamento"
                />
            </PaginaDeConta>
        </CascaDoApp>
    )
}

export default ContaSquad
