import { Navigate, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'
import MenuLateral from '../components/MenuLateral'
import { useAuth } from '../contexts/AuthContext'
import type { Papel } from '../api/vinculos'
import { MENUS_POR_PAPEL } from '../navegacao/menus'
import { ROTULO_DO_PAPEL } from '../navegacao/papeis'
import { initialRoute } from '../utils/InitialRoute'

function iniciaisDe(nome: string) {
    const partes = nome.trim().split(/\s+/)
    const primeira = partes[0]?.[0] ?? ''
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
    return (primeira + ultima).toUpperCase()
}

export default function AppLayout({ papel }: { papel: Papel }) {
    const { sessao } = useAuth()

    if (!sessao) return <Navigate to="/entrar" replace />

    const vinculo = sessao.vinculos.find(
        (v) => v.papel === papel && v.encerradoEm === null,
    )

    // Tentou abrir a área de um papel que não tem: vai para a própria área.
    if (!vinculo) return <Navigate to={initialRoute(sessao) ?? '/'} replace />

    const rotuloDoPapel = ROTULO_DO_PAPEL[papel]

    return (
        <div className="min-h-screen bg-page">
            <header className="flex items-center gap-4 border-b border-sutil bg-card px-10 py-4 shadow-card">
                <Logo variante="pervinca" altura={28} />

                <span className="flex items-center gap-3 rounded-card bg-acento-suave px-4 py-2">
                    <span className="text-apoio text-titulo">{vinculo.organizacaoNome}</span>
                    <span className="rounded-badge bg-acento px-2 py-1 text-selo text-white">
                        {rotuloDoPapel}
                    </span>
                </span>

                <span
                    className="ml-auto grid size-9 place-items-center rounded-full bg-acento-suave text-selo text-acento"
                    title={sessao.pessoa.nome}
                >
                    {iniciaisDe(sessao.pessoa.nome)}
                </span>
            </header>

            <div className="flex">
                <MenuLateral itens={MENUS_POR_PAPEL[papel]} rotulo={`Menu de ${rotuloDoPapel}`} grudento />

                <main id="conteudo" className="flex-1 min-w-0 px-10 py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}