import { NavLink } from 'react-router-dom'
import { ANEL_FOCO, TRANSICAO_COR } from '../estilos/classes'

/**
 * MenuLateral — o menu lateral do sistema, um só para o projeto inteiro.

 */

export interface ItemDeMenu {
    rotulo: string
    /**
     * Rota do item. Sem ela, o item aparece no menu mas não é clicável, que é
     * o caso das telas ainda não implementadas. Antes esses itens levavam ao
     * catch-all da rota "*", que devolve o usuário para a landing page.
     */
    para?: string
}

interface MenuLateralProps {
    itens: ItemDeMenu[]
    /** Vai para o aria-label da navegação: "Menu de Mentor", por exemplo. */
    rotulo: string
    /**
     * Gruda o menu abaixo da Navbar pública, que tem 4rem de altura.
     * As telas que trazem a própria casca não precisam disso.
     */
    grudento?: boolean
    /** Chamado ao clicar num item. No celular, fecha o menu aberto por cima da tela. */
    aoNavegar?: () => void
    /** Classes extras do aside (o menu do celular ocupa a altura toda). */
    className?: string
}

const ITEM_BASE = `block rounded-card px-4 py-3 text-apoio ${TRANSICAO_COR}`


export function MenuLateral({ itens, rotulo, grudento = false, aoNavegar, className = '' }: MenuLateralProps) {
    return (
        <aside
            className={`w-[260px] max-w-[85vw] shrink-0 overflow-y-auto border-r border-sutil bg-card px-4 py-6 ${
                grudento ? 'sticky top-16 h-[calc(100vh-4rem)]' : ''
            } ${className}`}
        >
            <nav aria-label={rotulo}>
                <ul className="flex flex-col gap-1">
                    {itens.map((item) => (
                        <li key={item.rotulo}>
                            {item.para ? (
                                <NavLink
                                    to={item.para}
                                    end
                                    onClick={aoNavegar}
                                    className={({ isActive }) =>
                                        [
                                            ITEM_BASE,
                                            ANEL_FOCO,
                                            isActive
                                                ? 'bg-acento-suave text-titulo'
                                                : 'text-secundario hover:bg-page hover:text-titulo',
                                        ].join(' ')
                                    }
                                >
                                    {item.rotulo}
                                </NavLink>
                            ) : (
                                <span
                                    aria-disabled="true"
                                    title="Tela ainda não implementada"
                                    className={`${ITEM_BASE} cursor-not-allowed text-secundario/55`}
                                >
                                    {item.rotulo}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    )
}

export default MenuLateral
