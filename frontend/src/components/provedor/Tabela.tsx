import type { ReactNode } from 'react'

import { CARTAO } from '../../estilos/classes'

/** A tabela das telas do provedor: cabeçalho cinza em maiúsculas e linhas separadas. */
export function Tabela({
    rotulo,
    colunas,
    children,
    semMoldura = false,
}: {
    rotulo: string
    colunas: string[]
    children: ReactNode
    /** Dentro de um cartão que já tem borda. */
    semMoldura?: boolean
}) {
    return (
        <div className={`relative overflow-x-auto ${semMoldura ? 'rounded-card border border-sutil' : CARTAO}`}>
            <table aria-label={rotulo} className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-sutil bg-page">
                        {colunas.map((coluna, i) => (
                            <th key={`${coluna}-${i}`} scope="col" className="px-card py-3 text-selo uppercase text-secundario">
                                {coluna}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    )
}

export function Linha({ children, destaque = false }: { children: ReactNode; destaque?: boolean }) {
    return <tr className={`border-b border-sutil last:border-b-0 ${destaque ? 'bg-acento-suave/60' : ''}`}>{children}</tr>
}

export function Celula({ children, forte = false }: { children?: ReactNode; forte?: boolean }) {
    return (
        <td className={`px-card py-4 align-middle ${forte ? 'text-item text-titulo' : 'text-apoio text-secundario'}`}>
            {children}
        </td>
    )
}

export default Tabela
