import type { Sprint } from '../../api/sprints'
import { CARTAO } from '../../estilos/classes'
import { formatarData } from '../../estilos/formatos'
import SeloStatus, { type Status } from '../SeloStatus'

/**
 * Peças das telas de sprints (41 da squad, 39 e 77 do mentor): o selo do
 * estado da sprint e a linha do tempo PLANEJADA → EM_ANDAMENTO → ENTREGUE → AVALIADA.
 */

const SELO: Record<Sprint['estado'], { status: Status; rotulo: string }> = {
    PLANEJADA: { status: 'rascunho', rotulo: 'Planejada' },
    EM_ANDAMENTO: { status: 'pendente', rotulo: 'Em andamento' },
    ENTREGUE: { status: 'enviada', rotulo: 'Entregue' },
    AVALIADA: { status: 'aprovada', rotulo: 'Avaliada' },
}

export function SeloDaSprint({ estado }: { estado: Sprint['estado'] }) {
    return <SeloStatus status={SELO[estado].status} rotulo={SELO[estado].rotulo} comPonto />
}

function situacao(s: Sprint): string {
    switch (s.estado) {
        case 'AVALIADA':
            return `Avaliada · ${formatarData(s.avaliadaEm)}`
        case 'ENTREGUE':
            return `Entregue · ${formatarData(s.entregaRegistradaEm)}`
        case 'EM_ANDAMENTO':
            return s.prazoEntrega ? `Em andamento · entrega até ${formatarData(s.prazoEntrega)}` : 'Em andamento'
        default:
            return s.prazoEntrega ? `Planejada · prazo ${formatarData(s.prazoEntrega)}` : 'Planejada'
    }
}

const COR: Record<Sprint['estado'], string> = {
    AVALIADA: 'bg-status-aprovada-texto',
    ENTREGUE: 'bg-status-enviada-texto',
    EM_ANDAMENTO: 'bg-acento',
    PLANEJADA: 'bg-sutil',
}

export function LinhaDoTempoDeSprints({ sprints, titulo = 'Sprints e entregas' }: { sprints: Sprint[]; titulo?: string }) {
    return (
        <section aria-labelledby="titulo-linha-sprints" className={CARTAO}>
            <header className="border-b border-sutil p-card">
                <h2 id="titulo-linha-sprints" className="font-display text-bloco text-titulo">
                    {titulo}
                </h2>
            </header>
            {sprints.length === 0 ? (
                <p className="p-card text-apoio text-secundario">
                    Nenhuma sprint planejada ainda. O mentor ou o provedor planeja a primeira.
                </p>
            ) : (
                <ol className="flex items-start p-card">
                    {sprints.map((sprint, indice) => (
                        <li key={sprint.id} className="min-w-0 flex-1">
                            <div className="flex items-center">
                                <span aria-hidden="true" className={`size-3 shrink-0 rounded-full ${COR[sprint.estado]}`} />
                                {indice < sprints.length - 1 && (
                                    <span
                                        aria-hidden="true"
                                        className={`h-0.5 min-w-0 flex-1 ${COR[sprints[indice + 1].estado]}`}
                                    />
                                )}
                            </div>
                            <p className="mt-3 pr-5 font-display text-bloco text-titulo">Sprint {sprint.numero}</p>
                            <p className="mt-1 pr-5 text-apoio text-secundario">{situacao(sprint)}</p>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    )
}
