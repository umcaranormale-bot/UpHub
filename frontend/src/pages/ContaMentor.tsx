import PaginaDeConta, { BlocoDoPapel } from '../components/PaginaDeConta'

/** 59 · Mentor — conta (Paulo Tavares) · rota /conta/mentor */
function ContaMentor() {
    return (
        <div>
            <PaginaDeConta
                pessoa={{
                    iniciais: 'PT',
                    nome: 'Paulo Tavares',
                    email: 'paulo@movetech.com.br',
                    telefone: '(81) 9 9712-4580',
                    funcao: 'Mentor voluntário · Movetech',
                    criadaEm: '18/08/2026',
                    id: 'USR-0198',
                }}
                destaqueTitulo="Horas doadas"
                destaque={
                    <>
                        <div className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3">
                            <p className="text-bloco text-status-aprovada-texto">
                                12 h 30 min em outubro
                            </p>
                            <p className="mt-1 text-apoio text-status-aprovada-texto">
                                5 sessões registradas
                            </p>
                        </div>
                        <p className="mt-3 text-apoio text-secundario">
                            As horas aparecem no seu perfil e no histórico do acompanhado.
                        </p>
                    </>
                }
                vinculos={[{ organizacao: 'Movetech', papel: 'Mentor' }]}
            >
                <BlocoDoPapel
                    titulo="Alocação atual"
                    status="aprovada"
                    rotuloDoStatus="Em acompanhamento"
                    chamada="Squad 3 · FICR"
                    contexto="Desafio Logística Urbana · alocação aceita em 02/09/2026"
                    explicacao="Sprint 3 em andamento. Os feedbacks e as horas ficam no histórico do acompanhado."
                    acao="Abrir histórico"
                />
            </PaginaDeConta>
        </div>
    )
}

export default ContaMentor
