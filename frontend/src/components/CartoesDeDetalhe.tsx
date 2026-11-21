/**
 * CartoesDeDetalhe — a fileira de quatro cartões cinza que detalha o registro
 * escolhido na tabela. Aparecia na aprovação de provedores e na alocação de
 * mentores com o mesmo formato.
 */

export interface CartaoDeDetalhe {
    rotulo: string
    valor: string
    nota: string
    /** Nota em verde, para o que foi conferido e confere. */
    confirmado?: boolean
}

interface CartoesDeDetalheProps {
    itens: CartaoDeDetalhe[]
}

export function CartoesDeDetalhe({ itens }: CartoesDeDetalheProps) {
    return (
        <ul className="grid grid-cols-4 gap-5">
            {itens.map((item) => (
                <li key={item.rotulo} className="rounded-card bg-page p-5">
                    <p className="text-apoio text-secundario">{item.rotulo}</p>
                    <p className="mt-1 break-words text-item text-titulo">{item.valor}</p>
                    <p
                        className={`mt-1 text-apoio ${
                            item.confirmado ? 'text-status-aprovada-texto' : 'text-secundario'
                        }`}
                    >
                        {item.nota}
                    </p>
                </li>
            ))}
        </ul>
    )
}

export default CartoesDeDetalhe
