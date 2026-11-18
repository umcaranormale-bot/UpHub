import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import Logo from './Logo'

/**
 * CascaDoApp — topo e menu lateral das telas de dentro do sistema.
 *
 * Cada papel entra com a própria organização e o próprio menu, mas a moldura
 * é sempre a mesma. Enquanto o SideNav e o Topbar do design system não forem
 * adotados pelo projeto, é aqui que essa moldura vive.
 */

export interface ItemDeMenu {
    rotulo: string
    para: string
}

interface CascaDoAppProps {
    /** Organização ativa, mostrada ao lado da logo. */
    organizacao: string
    /** Papel ativo: Avaliador, Candidato · squad, Mentor, Gestão. */
    papel: string
    /** Iniciais de quem está logado, para o avatar. */
    iniciais: string
    /** Nome completo, usado como título acessível do avatar. */
    nome: string
    itens: ItemDeMenu[]
    children: ReactNode
}

export function CascaDoApp({
    organizacao,
    papel,
    iniciais,
    nome,
    itens,
    children,
}: CascaDoAppProps) {
    return (
        <div className="min-h-screen bg-page">
            <header className="flex items-center gap-4 border-b border-sutil bg-card px-10 py-4 shadow-card">
                <Logo variante="pervinca" altura={28} />

                <span className="flex items-center gap-3 rounded-card bg-acento-suave px-4 py-2">
                    <span className="text-apoio text-titulo">{organizacao}</span>
                    <span className="rounded-badge bg-acento px-2 py-1 text-selo text-white">
                        {papel}
                    </span>
                </span>

                <span
                    className="ml-auto grid size-9 place-items-center rounded-full bg-acento-suave text-selo text-acento"
                    title={nome}
                >
                    {iniciais}
                </span>
            </header>

            <div className="flex">
                <aside className="w-[260px] shrink-0 border-r border-sutil bg-card px-4 py-6">
                    <nav aria-label={`Menu de ${papel}`}>
                        <ul className="flex flex-col gap-1">
                            {itens.map((item) => (
                                <li key={item.para}>
                                    <NavLink
                                        to={item.para}
                                        end
                                        className={({ isActive }) =>
                                            [
                                                'block rounded-card px-4 py-3 text-apoio',
                                                'transition-colors duration-[var(--dur-rapida)] ease-padrao',
                                                'focus-visible:shadow-foco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento',
                                                isActive
                                                    ? 'bg-acento-suave text-titulo'
                                                    : 'text-secundario hover:bg-page',
                                            ].join(' ')
                                        }
                                    >
                                        {item.rotulo}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                <main id="conteudo" className="flex-1 px-10 py-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default CascaDoApp
