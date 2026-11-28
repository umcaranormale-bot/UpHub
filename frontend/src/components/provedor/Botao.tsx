import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ANEL_FOCO, TRANSICAO_COR } from '../../estilos/classes'

/**
 * Botão compacto das tabelas e cartões do provedor. O CustomButton tem
 * largura fixa e 45px de altura, grande demais para uma linha de tabela.
 */
type Variante = 'primario' | 'neutro' | 'perigo'

const CORES: Record<Variante, string> = {
    primario: 'border-acento bg-acento text-white hover:opacity-90',
    neutro: 'border-sutil bg-card text-titulo hover:bg-page',
    perigo: 'border-status-reprovada-texto bg-status-reprovada-texto text-white hover:opacity-90',
}

function classes(variante: Variante) {
    return `inline-flex items-center justify-center whitespace-nowrap rounded-lg border px-3 py-1.5 text-apoio font-semibold ${TRANSICAO_COR} disabled:cursor-not-allowed disabled:opacity-50 ${CORES[variante]} ${ANEL_FOCO}`
}

export function Botao({
    variante = 'neutro',
    children,
    className = '',
    type = 'button',
    ...resto
}: { variante?: Variante; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button type={type} className={`${classes(variante)} ${className}`} {...resto}>
            {children}
        </button>
    )
}

export function BotaoLink({ para, variante = 'neutro', children }: { para: string; variante?: Variante; children: ReactNode }) {
    return (
        <Link to={para} className={classes(variante)}>
            {children}
        </Link>
    )
}

export default Botao
