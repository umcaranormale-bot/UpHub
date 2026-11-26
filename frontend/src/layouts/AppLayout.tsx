import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'
import MenuLateral from '../components/MenuLateral'
import { useAuth } from '../contexts/AuthContext'
import type { Papel } from '../api/vinculos'
import { MENUS_POR_PAPEL, MENU_SEM_VINCULO } from '../navegacao/menus'
import { ROTULO_DO_PAPEL } from '../navegacao/papeis'
import { initialRoute } from '../utils/InitialRoute'

function iniciaisDe(nome: string) {
    const partes = nome.trim().split(/\s+/)
    const primeira = partes[0]?.[0] ?? ''
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
    return (primeira + ultima).toUpperCase()
}

interface AppLayoutProps {
    /**
     * Papel da área (squad, mentor...). Sem papel, o layout vale para telas da
     * conta em si, como /organizacoes/nova, que quem ainda não tem vínculo
     * também precisa ver: o topo fica sem o selo organização/papel e o menu
     * mostra só o que não depende de vínculo.
     */
    papel?: Papel
}

export default function AppLayout({ papel }: AppLayoutProps) {
    const { sessao } = useAuth()
    // No celular o menu lateral fica escondido e abre por cima da tela pelo botão ☰.
    const [menuAberto, setMenuAberto] = useState(false)

    // O PrivateRoute garante a sessão; isto só serve para o TypeScript.
    if (!sessao) return <Navigate to="/entrar" replace />

    const vinculo = papel
        ? sessao.vinculos.find((v) => v.papel === papel && v.encerradoEm === null)
        : null

    // Tentou abrir a área de um papel que não tem: vai para a própria área.
    if (papel && !vinculo) return <Navigate to={initialRoute(sessao) ?? '/'} replace />

    const rotuloDoPapel = papel ? ROTULO_DO_PAPEL[papel] : null
    const itens = papel ? MENUS_POR_PAPEL[papel] : MENU_SEM_VINCULO

    return (
        <div className="min-h-screen bg-page">
            <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-sutil bg-card px-4 shadow-card sm:gap-4 lg:px-10">
                <button
                    type="button"
                    onClick={() => setMenuAberto(true)}
                    aria-label="Abrir menu"
                    aria-expanded={menuAberto}
                    className="grid size-9 shrink-0 place-items-center rounded-card text-titulo hover:bg-page lg:hidden"
                >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <Logo variante="pervinca" altura={28} />

                {vinculo && rotuloDoPapel && (
                    <span className="flex min-w-0 items-center gap-2 rounded-card bg-acento-suave px-2 py-1.5 sm:gap-3 sm:px-4 sm:py-2">
                        <span className="hidden truncate text-apoio text-titulo sm:inline">{vinculo.organizacaoNome}</span>
                        <span className="shrink-0 rounded-badge bg-acento px-2 py-1 text-selo text-white">
                            {rotuloDoPapel}
                        </span>
                    </span>
                )}

                <span
                    className="ml-auto grid size-9 shrink-0 place-items-center rounded-full bg-acento-suave text-selo text-acento"
                    title={sessao.pessoa.nome}
                >
                    {iniciaisDe(sessao.pessoa.nome)}
                </span>
            </header>

            <div className="flex">
                <div className="hidden lg:block">
                    <MenuLateral
                        itens={itens}
                        rotulo={rotuloDoPapel ? `Menu de ${rotuloDoPapel}` : 'Menu da conta'}
                        grudento
                    />
                </div>

                {menuAberto && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <button
                            type="button"
                            aria-label="Fechar menu"
                            onClick={() => setMenuAberto(false)}
                            className="absolute inset-0 bg-black/40"
                        />
                        <div className="absolute inset-y-0 left-0 flex">
                            <MenuLateral
                                itens={itens}
                                rotulo={rotuloDoPapel ? `Menu de ${rotuloDoPapel}` : 'Menu da conta'}
                                aoNavegar={() => setMenuAberto(false)}
                                className="h-full shadow-card"
                            />
                        </div>
                    </div>
                )}

                <main id="conteudo" className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}