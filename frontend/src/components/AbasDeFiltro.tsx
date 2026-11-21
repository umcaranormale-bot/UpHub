import { ANEL_FOCO, TRANSICAO_COR } from '../estilos/classes'

/**
 * AbasDeFiltro — o grupo de abas com contador que filtra uma lista.
 *
 * Estava copiado em três telas, em dois visuais que o protótipo usa: a de
 * oportunidades traz abas sublinhadas, as de candidaturas e de convites trazem
 * pílulas. É a mesma mecânica, então vira uma propriedade.
 */

export interface Aba<Id extends string> {
    id: Id
    rotulo: string
    quantidade: number
}

interface AbasDeFiltroProps<Id extends string> {
    abas: Aba<Id>[]
    ativa: Id
    aoEscolher: (id: Id) => void
    /** Vai para o aria-label do grupo. */
    rotulo: string
    variante?: 'sublinhado' | 'pilula'
}

export function AbasDeFiltro<Id extends string>({
    abas,
    ativa,
    aoEscolher,
    rotulo,
    variante = 'pilula',
}: AbasDeFiltroProps<Id>) {
    const sublinhado = variante === 'sublinhado'

    return (
        <div
            role="tablist"
            aria-label={rotulo}
            className={
                sublinhado
                    ? 'flex items-center gap-6 border-b border-sutil'
                    : 'flex flex-wrap items-center gap-3'
            }
        >
            {abas.map((aba) => {
                const estaAtiva = aba.id === ativa

                const classes = sublinhado
                    ? `-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 text-item ${
                          estaAtiva
                              ? 'border-acento text-titulo'
                              : 'border-transparent text-secundario hover:text-titulo'
                      }`
                    : `inline-flex items-center gap-2 rounded-badge border px-4 py-2 text-item ${
                          estaAtiva
                              ? 'border-profundo bg-profundo text-white'
                              : 'border-sutil bg-card text-secundario hover:border-secundario'
                      }`

                return (
                    <button
                        key={aba.id}
                        type="button"
                        role="tab"
                        aria-selected={estaAtiva}
                        onClick={() => aoEscolher(aba.id)}
                        className={`${classes} ${TRANSICAO_COR} ${ANEL_FOCO}`}
                    >
                        {aba.rotulo}
                        <span
                            className={
                                !sublinhado && estaAtiva
                                    ? 'text-white'
                                    : 'text-apoio text-secundario'
                            }
                        >
                            {aba.quantidade}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

export default AbasDeFiltro
