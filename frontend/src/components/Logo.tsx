import logoBranco from '../assets/logo-uphub-branco.svg'
import logoPervinca from '../assets/logo-uphub-pervinca.svg'

/**
 * Logo — o logotipo oficial do Up Hub, vindo do design system.
 *
 * Regras da marca: use sempre o SVG fornecido, nunca redesenhe nem recorte.
 * Altura mínima de 24px. Sobre fundo pervinca ou foto, use a variante branca.
 */

type Variante = 'pervinca' | 'branco'

const arquivos: Record<Variante, string> = {
    pervinca: logoPervinca,
    branco: logoBranco,
}

interface LogoProps {
    variante?: Variante
    /** Altura em pixels. Mínimo 24, conforme o guia da marca. */
    altura?: number
    /** Decorativo quando já existe outro texto identificando a marca ao lado. */
    decorativo?: boolean
}

export function Logo({ variante = 'pervinca', altura = 32, decorativo = false }: LogoProps) {
    return (
        <img
            src={arquivos[variante]}
            alt={decorativo ? '' : 'Up Hub'}
            aria-hidden={decorativo || undefined}
            height={altura}
            style={{ height: Math.max(altura, 24) }}
            className="w-auto select-none"
        />
    )
}

export default Logo
