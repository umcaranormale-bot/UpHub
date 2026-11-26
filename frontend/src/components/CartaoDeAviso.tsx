import type { ReactNode } from 'react'

import { CustomButton } from './CustomButton'

/**
 * CartaoDeAviso — o bloco ocre que chama a atenção para algo que precisa de
 * ação ou que explica uma regra. Estava copiado em quatro telas.
 *
 * Sem "acao", vira só o recado em texto, que é o caso do perfil da squad.
 */

interface CartaoDeAvisoProps {
    /** Linha curta acima da chamada: prazo, contagem, contexto. */
    contexto?: string
    /** O recado em si. */
    children: ReactNode
    /** Texto do botão. Sem ele, o cartão não tem ação. */
    acao?: string
    /** Usado no aria-label quando existe contexto. */
    rotulo?: string
}

export function CartaoDeAviso({ contexto, children, acao, rotulo }: CartaoDeAvisoProps) {
    const moldura = 'rounded-card border border-aviso-borda bg-aviso-fundo p-5'

    if (!acao) {
        return (
            <p className={`${moldura} text-apoio text-ocre`}>{children}</p>
        )
    }

    return (
        <section
            aria-label={rotulo ?? contexto}
            className={`flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5 ${moldura}`}
        >
            <div className="min-w-0 flex-1">
                {contexto && <p className="text-apoio text-ocre">{contexto}</p>}
                <p className="mt-1 font-display text-bloco text-titulo">{children}</p>
            </div>
            <CustomButton variant="neutro" size="auto">
                {acao}
            </CustomButton>
        </section>
    )
}

export default CartaoDeAviso
