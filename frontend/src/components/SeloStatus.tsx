/**
 * SeloStatus — os cinco estados de inscrição do Bloco 3, mais o estado
 * "pendente" que o protótipo usa nas telas de convite (58 e 59).
 *
 * Regra de acessibilidade (WCAG 1.4.1): cor sozinha nunca comunica estado.
 * Por isso o selo sempre traz o ponto colorido E o texto.
 */

export type Status =
    | 'rascunho'
    | 'enviada'
    | 'avaliacao'
    | 'aprovada'
    | 'reprovada'
    | 'pendente'

const rotulos: Record<Status, string> = {
    rascunho: 'Rascunho',
    enviada: 'Enviada',
    avaliacao: 'Em análise',
    aprovada: 'Aprovada',
    reprovada: 'Reprovada',
    pendente: 'Pendente',
}

const cores: Record<Status, string> = {
    rascunho: 'bg-status-rascunho-fundo text-status-rascunho-texto',
    enviada: 'bg-status-enviada-fundo text-status-enviada-texto',
    avaliacao: 'bg-status-avaliacao-fundo text-status-avaliacao-texto',
    aprovada: 'bg-status-aprovada-fundo text-status-aprovada-texto',
    reprovada: 'bg-status-reprovada-fundo text-status-reprovada-texto',
    pendente: 'bg-aviso-fundo text-ocre',
}

interface SeloStatusProps {
    status: Status
    /** Troca o texto padrão do estado, quando a tela pede outro rótulo. */
    rotulo?: string
    /** Ponto colorido antes do texto. O protótipo não usa, então vem desligado. */
    comPonto?: boolean
}

export function SeloStatus({ status, rotulo, comPonto = false }: SeloStatusProps) {
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-badge px-2.5 py-1 text-selo transition-colors duration-[var(--dur-rapida)] ease-padrao ${cores[status]}`}
        >
            {comPonto && (
                <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            )}
            {rotulo ?? rotulos[status]}
        </span>
    )
}

export default SeloStatus
