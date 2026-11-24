import type { ReactNode } from 'react'

/** Título da tela, a linha de apoio e os botões da direita. */
export function Cabecalho({ titulo, apoio, acoes }: { titulo: string; apoio?: ReactNode; acoes?: ReactNode }) {
    return (
        <div className="flex flex-wrap items-start gap-4">
            <div className="min-w-0 flex-1">
                <h1 className="font-display text-tela text-titulo">{titulo}</h1>
                {apoio && <p className="mt-1 text-apoio text-secundario">{apoio}</p>}
            </div>
            {acoes && <div className="flex flex-wrap items-center gap-3">{acoes}</div>}
        </div>
    )
}

/** Cartão com título de bloco e o conteúdo. */
export function Bloco({
    titulo,
    apoio,
    acoes,
    children,
}: {
    titulo: string
    apoio?: ReactNode
    acoes?: ReactNode
    children: ReactNode
}) {
    return (
        <section className="rounded-bloco border border-sutil bg-card p-card shadow-card">
            <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                    <h2 className="font-display text-bloco text-titulo">{titulo}</h2>
                    {apoio && <p className="mt-1 text-apoio text-secundario">{apoio}</p>}
                </div>
                {acoes}
            </div>
            <div className="mt-4">{children}</div>
        </section>
    )
}

export default Cabecalho
