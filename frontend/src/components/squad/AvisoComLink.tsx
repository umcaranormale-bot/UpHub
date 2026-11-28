import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ANEL_FOCO, TRANSICAO_COR } from '../../estilos/classes'

/**
 * AvisoComLink — o mesmo bloco ocre do CartaoDeAviso, com o botão levando para
 * uma rota (o CartaoDeAviso comum só mostra o botão, sem destino).
 */
interface AvisoComLinkProps {
    contexto: string
    children: ReactNode
    acao: string
    para: string
}

export function AvisoComLink({ contexto, children, acao, para }: AvisoComLinkProps) {
    return (
        <section
            aria-label={contexto}
            className="flex items-center gap-5 rounded-card border border-aviso-borda bg-aviso-fundo p-5"
        >
            <div className="min-w-0 flex-1">
                <p className="text-apoio text-ocre">{contexto}</p>
                <p className="mt-1 font-display text-bloco text-titulo">{children}</p>
            </div>
            <Link
                to={para}
                className={`inline-flex h-[45px] shrink-0 items-center rounded-lg border border-profundo bg-white px-3 font-semibold text-profundo hover:bg-profundo hover:text-white ${TRANSICAO_COR} ${ANEL_FOCO}`}
            >
                {acao}
            </Link>
        </section>
    )
}

/** Link de texto na cor de acento (Ver todas, Abrir sprints...). */
export function LinkDeTexto({ para, children }: { para: string; children: ReactNode }) {
    return (
        <Link
            to={para}
            className={`rounded-card px-1 text-apoio text-acento ${TRANSICAO_COR} hover:text-titulo ${ANEL_FOCO}`}
        >
            {children}
        </Link>
    )
}

export default AvisoComLink
