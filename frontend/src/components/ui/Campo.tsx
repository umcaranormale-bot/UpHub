import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

/** Classes da caixa de texto, as mesmas do login e do cadastro. */
export const CLASSE_ENTRADA =
    'w-full rounded-lg border border-gray-300 bg-card px-3 py-2 text-corpo text-titulo outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-page disabled:text-secundario'

interface Base {
    rotulo: string
    /** Texto de ajuda abaixo do campo. */
    ajuda?: ReactNode
}

function Moldura({ id, rotulo, ajuda, children }: Base & { id: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium text-secundario">
                {rotulo}
            </label>
            {children}
            {ajuda && <p className="text-legenda text-secundario">{ajuda}</p>}
        </div>
    )
}

export function Campo({ rotulo, ajuda, className, ...resto }: Base & InputHTMLAttributes<HTMLInputElement>) {
    const id = useId()
    return (
        <Moldura id={id} rotulo={rotulo} ajuda={ajuda}>
            <input id={id} className={`${CLASSE_ENTRADA} ${className ?? ''}`} {...resto} />
        </Moldura>
    )
}

export function CampoTexto({ rotulo, ajuda, className, ...resto }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
    const id = useId()
    return (
        <Moldura id={id} rotulo={rotulo} ajuda={ajuda}>
            <textarea id={id} rows={4} className={`${CLASSE_ENTRADA} ${className ?? ''}`} {...resto} />
        </Moldura>
    )
}

export function CampoLista({
    rotulo,
    ajuda,
    className,
    children,
    ...resto
}: Base & SelectHTMLAttributes<HTMLSelectElement>) {
    const id = useId()
    return (
        <Moldura id={id} rotulo={rotulo} ajuda={ajuda}>
            <select id={id} className={`${CLASSE_ENTRADA} ${className ?? ''}`} {...resto}>
                {children}
            </select>
        </Moldura>
    )
}
