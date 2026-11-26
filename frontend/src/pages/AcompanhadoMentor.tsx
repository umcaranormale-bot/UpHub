import SeloStatus from '../components/SeloStatus'

/**
 * 39 · Mentor — histórico do acompanhado · rota /acompanhados
 *
 * A linha do tempo das sprints da squad acompanhada, o resumo gerado por IA
 * (somente leitura) e as pendências que o mentor abriu.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 */

type EstadoDaSprint = 'avaliada' | 'andamento' | 'planejada'

interface Sprint {
    id: string
    rotulo: string
    situacao: string
    estado: EstadoDaSprint
}

const sprints: Sprint[] = [
    { id: 's1', rotulo: 'Sprint 1', situacao: 'Avaliada · 12/09', estado: 'avaliada' },
    { id: 's2', rotulo: 'Sprint 2', situacao: 'Avaliada · 26/09', estado: 'avaliada' },
    {
        id: 's3',
        rotulo: 'Sprint 3',
        situacao: 'Em andamento · entrega até 10/10',
        estado: 'andamento',
    },
    { id: 's4', rotulo: 'Sprint 4', situacao: 'Planejada', estado: 'planejada' },
    {
        id: 'fim',
        rotulo: 'Encerramento',
        situacao: 'previsto para 20/11',
        estado: 'planejada',
    },
]

const corDoPonto: Record<EstadoDaSprint, string> = {
    avaliada: 'bg-status-aprovada-texto',
    andamento: 'bg-acento',
    planejada: 'bg-sutil',
}

const corDaLinha: Record<EstadoDaSprint, string> = {
    avaliada: 'bg-status-aprovada-texto',
    andamento: 'bg-acento',
    planejada: 'bg-sutil',
}

function AcompanhadoMentor() {
    return (
        <div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-5">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">Squad 3 · FICR</h1>
                    <p className="mt-2 text-apoio text-secundario">
                        Movetech · Desafio Logística Urbana · alocação aceita em 02/09/2026
                    </p>
                </div>
                <SeloStatus status="aprovada" rotulo="Em acompanhamento" comPonto />
            </div>

            <section
                aria-labelledby="titulo-sprints"
                className="mt-6 rounded-bloco border border-sutil bg-card p-card shadow-card"
            >
                <h2 id="titulo-sprints" className="font-display text-bloco text-titulo">
                    Sprints do desafio
                </h2>

                <div className="mt-6 overflow-x-auto">
                <ol className="flex min-w-[520px] items-start">
                    {sprints.map((sprint, indice) => (
                        <li key={sprint.id} className="min-w-0 flex-1">
                            <div className="flex items-center">
                                <span
                                    aria-hidden="true"
                                    className={`size-3 shrink-0 rounded-full ${corDoPonto[sprint.estado]}`}
                                />
                                {indice < sprints.length - 1 && (
                                    <span
                                        aria-hidden="true"
                                        className={`h-0.5 min-w-0 flex-1 ${corDaLinha[sprints[indice + 1].estado]}`}
                                    />
                                )}
                            </div>
                            <p className="mt-3 pr-5 font-display text-bloco text-titulo">
                                {sprint.rotulo}
                            </p>
                            <p className="mt-1 pr-5 text-apoio text-secundario">
                                {sprint.situacao}
                            </p>
                        </li>
                    ))}
                </ol>
                </div>
            </section>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <section
                    aria-labelledby="titulo-resumo"
                    className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                >
                    <p id="titulo-resumo" className="text-apoio text-secundario">
                        Resumo do histórico
                    </p>
                    <h2 className="mt-1 font-display text-bloco text-titulo">
                        Gerado por IA em 16/10/2026 · somente leitura
                    </h2>
                    <p className="mt-3 text-apoio text-secundario">
                        A squad entregou as sprints 1 e 2 no prazo. O ponto aberto desde a
                        sprint 2 é a cobertura de testes. Resumo montado só a partir dos
                        registros existentes (IA-7): nenhum registro foi alterado.
                    </p>
                </section>

                <section
                    aria-labelledby="titulo-pendencias"
                    className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                >
                    <p id="titulo-pendencias" className="text-apoio text-secundario">
                        Pendências abertas
                    </p>
                    <h2 className="mt-1 font-display text-bloco text-titulo">
                        Cobertura de testes · sprint 2
                    </h2>
                    <p className="mt-3 text-apoio text-secundario">
                        Registrada por você em 26/09 e a squad respondeu que entra na sprint
                        3. Com o serviço de IA fora do ar, o histórico completo continua aqui
                        e só o resumo fica indisponível (E6).
                    </p>
                </section>
            </div>
        </div>
    )
}

export default AcompanhadoMentor
