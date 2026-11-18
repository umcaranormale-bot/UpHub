import { CARTAO_COM_RESPIRO } from '../estilos/classes'

/**
 * Indicadores — a fileira de números grandes no topo das telas de gestão.
 *
 * Aparecia copiada no painel do ecossistema, na aprovação de provedores e na
 * alocação de mentores.
 */

export interface Indicador {
    id: string
    rotulo: string
    valor: string
    /** Linha de apoio abaixo do número, quando a tela traz uma. */
    apoio?: string
    /** Classe de cor do número. Sem ela, sai na cor de acento. */
    cor?: string
}

interface IndicadoresProps {
    itens: Indicador[]
    /** Vai para o aria-label da lista. */
    rotulo?: string
}

export function Indicadores({ itens, rotulo = 'Indicadores' }: IndicadoresProps) {
    return (
        <ul aria-label={rotulo} className="grid grid-cols-4 gap-5">
            {itens.map((item) => (
                <li key={item.id} className={CARTAO_COM_RESPIRO}>
                    <p className="text-item text-secundario">{item.rotulo}</p>
                    <p className={`mt-2 font-display text-tela ${item.cor ?? 'text-acento'}`}>
                        {item.valor}
                    </p>
                    {item.apoio && (
                        <p className="mt-2 text-apoio text-secundario">{item.apoio}</p>
                    )}
                </li>
            ))}
        </ul>
    )
}

export default Indicadores
