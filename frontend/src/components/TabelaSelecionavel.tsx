import type { ReactNode } from 'react'

import { CARTAO, TRANSICAO_COR } from '../estilos/classes'

/**
 * TabelaSelecionavel — a fila das telas de gestão: tabela em que clicar numa
 * linha escolhe o registro que o bloco de detalhe abaixo vai mostrar.
 *
 * A aprovação de provedores e a alocação de mentores tinham a mesma tabela
 * escrita duas vezes.
 */

export interface ColunaDaTabela<L> {
    rotulo: string
    celula: (linha: L) => ReactNode
}

interface TabelaSelecionavelProps<L> {
    /** Vai para o aria-label da tabela. */
    rotulo: string
    colunas: ColunaDaTabela<L>[]
    linhas: L[]
    chave: (linha: L) => string | number
    selecionada: string | number
    aoSelecionar: (chave: string | number) => void
}

export function TabelaSelecionavel<L>({
    rotulo,
    colunas,
    linhas,
    chave,
    selecionada,
    aoSelecionar,
}: TabelaSelecionavelProps<L>) {
    return (
        <section aria-label={rotulo} className={`overflow-x-auto ${CARTAO}`}>
            <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                    <tr className="border-b border-sutil bg-page">
                        {colunas.map((coluna) => (
                            <th
                                key={coluna.rotulo}
                                scope="col"
                                className="px-card py-3 text-selo text-secundario uppercase"
                            >
                                {coluna.rotulo}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {linhas.map((linha) => {
                        const id = chave(linha)
                        const estaSelecionada = id === selecionada

                        return (
                            <tr
                                key={id}
                                aria-selected={estaSelecionada}
                                onClick={() => aoSelecionar(id)}
                                className={`cursor-pointer border-b border-sutil last:border-b-0 ${TRANSICAO_COR} ${
                                    estaSelecionada ? 'bg-acento-suave' : 'hover:bg-page'
                                }`}
                            >
                                {colunas.map((coluna) => (
                                    <td key={coluna.rotulo} className="px-card py-4">
                                        {coluna.celula(linha)}
                                    </td>
                                ))}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </section>
    )
}

export default TabelaSelecionavel
