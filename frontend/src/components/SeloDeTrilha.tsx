/**
 * SeloDeTrilha — a etiqueta da trilha de uma oportunidade.
 *
 * As três trilhas têm cor reservada no design system e nunca são decorativas,
 * então o mapa de rótulo e de cor mora aqui, e não copiado em cada tela.
 */

export type Trilha = 'fomento' | 'investimento' | 'formacao'

const ROTULO_DA_TRILHA: Record<Trilha, string> = {
    fomento: 'Fomento',
    investimento: 'Investimento',
    formacao: 'Formação',
}

const COR_DA_TRILHA: Record<Trilha, string> = {
    fomento: 'bg-trilha-fomento-suave text-trilha-fomento',
    investimento: 'bg-trilha-investimento-suave text-trilha-investimento',
    formacao: 'bg-trilha-formacao-suave text-trilha-formacao',
}

interface SeloDeTrilhaProps {
    trilha: Trilha
}

export function SeloDeTrilha({ trilha }: SeloDeTrilhaProps) {
    return (
        <span className={`rounded-badge px-2 py-1 text-selo ${COR_DA_TRILHA[trilha]}`}>
            {ROTULO_DA_TRILHA[trilha]}
        </span>
    )
}

export default SeloDeTrilha
