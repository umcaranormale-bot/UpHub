import type { ReactNode } from 'react'

import { CARTAO_COM_RESPIRO } from '../../estilos/classes'

/** Os cartões de números do painel (79): título e uma lista rótulo → valor. */
export interface LinhaDeNumero {
    rotulo: string
    valor: ReactNode
    /** Classe de cor do valor. */
    cor?: string
}

interface CartaoDeNumerosProps {
    titulo: string
    linhas: LinhaDeNumero[]
    /** Texto quando a lista vem vazia. */
    vazio?: string
}

export function CartaoDeNumeros({ titulo, linhas, vazio = 'Nada para mostrar ainda.' }: CartaoDeNumerosProps) {
    return (
        <section aria-label={titulo} className={CARTAO_COM_RESPIRO}>
            <h2 className="font-display text-bloco text-titulo">{titulo}</h2>
            {linhas.length === 0 ? (
                <p className="mt-3 text-apoio text-secundario">{vazio}</p>
            ) : (
                <dl className="mt-3 flex flex-col gap-2">
                    {linhas.map((l) => (
                        <div key={l.rotulo} className="flex items-center gap-3">
                            <dt className="min-w-0 flex-1 text-apoio text-secundario">{l.rotulo}</dt>
                            <dd className={`text-item ${l.cor ?? 'text-titulo'}`}>{l.valor}</dd>
                        </div>
                    ))}
                </dl>
            )}
        </section>
    )
}

export default CartaoDeNumeros
