import { useEffect, useId, useRef, type ReactNode } from 'react'

/**
 * Janela por cima da tela (os "Modal · ..." do Figma): fundo escuro, título,
 * conteúdo e a fileira de botões. Fecha no Esc e no clique fora.
 */
interface ModalProps {
    aberto: boolean
    titulo: string
    /** Texto curto abaixo do título. */
    descricao?: ReactNode
    aoFechar: () => void
    children?: ReactNode
    /** Botões do rodapé (Cancelar, Confirmar). */
    acoes?: ReactNode
    largura?: 'normal' | 'larga'
}

export function Modal({ aberto, titulo, descricao, aoFechar, children, acoes, largura = 'normal' }: ModalProps) {
    const idTitulo = useId()
    const caixa = useRef<HTMLDivElement>(null)
    // o aoFechar fica num ref: se a tela passar uma função nova a cada render, o foco não pula de volta para a caixa
    const fechar = useRef(aoFechar)
    useEffect(() => {
        fechar.current = aoFechar
    })

    useEffect(() => {
        if (!aberto) return
        const anterior = document.activeElement as HTMLElement | null
        caixa.current?.focus()
        const aoTeclar = (e: KeyboardEvent) => {
            if (e.key === 'Escape') fechar.current()
        }
        document.addEventListener('keydown', aoTeclar)
        return () => {
            document.removeEventListener('keydown', aoTeclar)
            anterior?.focus()
        }
    }, [aberto])

    if (!aberto) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-profundo/50 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) aoFechar()
            }}
        >
            <div
                ref={caixa}
                role="dialog"
                aria-modal="true"
                aria-labelledby={idTitulo}
                tabIndex={-1}
                className={`max-h-[90vh] w-full overflow-y-auto rounded-modal bg-card p-6 shadow-modal outline-none ${
                    largura === 'larga' ? 'max-w-[560px]' : 'max-w-[520px]'
                }`}
            >
                <h2 id={idTitulo} className="text-h3 text-titulo">
                    {titulo}
                </h2>
                {descricao && <div className="mt-2 text-apoio text-secundario">{descricao}</div>}
                {children && <div className="mt-4 flex flex-col gap-4">{children}</div>}
                {acoes && <div className="mt-6 flex flex-wrap justify-end gap-3">{acoes}</div>}
            </div>
        </div>
    )
}

export default Modal
