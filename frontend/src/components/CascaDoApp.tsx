import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { listarNotificacoes, marcarComoLida, marcarTodasComoLidas, type Notificacao } from '../api/notificacoes'
import { CONTA_DA_AREA, iniciais as iniciaisDe, ROTULO_DA_AREA } from '../navegacao/areas'
import { useSessao } from '../sessao/contexto'
import { ANEL_FOCO, TRANSICAO_COR } from '../estilos/classes'
import { formatarDataHora } from '../estilos/formatos'
import { CustomButton } from './CustomButton'
import Logo from './Logo'
import MenuLateral, { type ItemDeMenu } from './MenuLateral'
import Modal from './ui/Modal'

export type { ItemDeMenu }

/**
 * CascaDoApp — topo e menu lateral das telas de dentro do sistema.
 *
 * O topo mostra a organização e o papel do perfil ativo (da sessão), o sino
 * de notificações e o avatar, que abre o menu da conta: Conta, Trocar perfil
 * (quem tem mais de um vínculo) e Sair. As propriedades organizacao, papel,
 * iniciais e nome só precisam ser passadas para mostrar outra coisa.
 */
interface CascaDoAppProps {
    organizacao?: string
    papel?: string
    iniciais?: string
    nome?: string
    itens: ItemDeMenu[]
    /** Rota do "‹ Voltar" do topo. */
    voltarPara?: string
    /** Telas de tarefa trocam o menu lateral por um título só. */
    semMenu?: boolean
    /** Título ao lado do "‹ Voltar", usado quando a tela não tem menu. */
    tituloDoTopo?: string
    children: ReactNode
}

export function CascaDoApp({
    organizacao,
    papel,
    iniciais,
    nome,
    itens,
    voltarPara,
    semMenu = false,
    tituloDoTopo,
    children,
}: CascaDoAppProps) {
    const { pessoa, perfilAtivo } = useSessao()
    const nomeNaTela = nome ?? pessoa?.nome ?? ''
    const organizacaoNaTela = organizacao ?? perfilAtivo?.vinculo.organizacaoNome ?? ''
    const papelNaTela = papel ?? (perfilAtivo ? ROTULO_DA_AREA[perfilAtivo.area] : '')

    const { pathname } = useLocation()
    // no celular o menu é uma gaveta; ela guarda a tela em que foi aberta e fecha sozinha ao trocar de tela
    const [gavetaAbertaEm, setGavetaAbertaEm] = useState<string | null>(null)
    const gavetaAberta = gavetaAbertaEm === pathname
    const setGavetaAberta = (aberta: boolean) => setGavetaAbertaEm(aberta ? pathname : null)
    const rotuloDoMenu = `Menu de ${papelNaTela || 'navegação'}`

    return (
        <div className="min-h-screen overflow-x-clip bg-page">
            <header className="flex flex-wrap items-center gap-x-3 gap-y-3 border-b border-sutil bg-card px-4 py-3 shadow-card md:gap-x-4 md:px-10 md:py-4">
                {!semMenu && (
                    <button
                        type="button"
                        onClick={() => setGavetaAberta(true)}
                        aria-label="Abrir menu"
                        aria-expanded={gavetaAberta}
                        className={`grid size-9 shrink-0 place-items-center rounded-card border border-sutil text-titulo lg:hidden ${ANEL_FOCO}`}
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                )}

                <Logo variante="pervinca" altura={28} />

                {voltarPara && (
                    <Link
                        to={voltarPara}
                        className={`rounded-card border border-sutil px-3 py-2 text-apoio text-titulo md:px-4 ${TRANSICAO_COR} hover:bg-page ${ANEL_FOCO}`}
                    >
                        ‹ Voltar
                    </Link>
                )}

                {tituloDoTopo && (
                    <span className="order-last basis-full font-display text-bloco text-titulo sm:order-none sm:basis-auto">
                        {tituloDoTopo}
                    </span>
                )}

                {organizacaoNaTela && (
                    <span className="order-last flex min-w-0 basis-full items-center justify-between gap-3 rounded-card bg-acento-suave px-4 py-2 sm:order-none sm:basis-auto sm:justify-start">
                        <span className="min-w-0 truncate text-apoio text-titulo">{organizacaoNaTela}</span>
                        {papelNaTela && (
                            <span className="shrink-0 rounded-badge bg-acento px-2 py-1 text-selo text-white">{papelNaTela}</span>
                        )}
                    </span>
                )}

                <div className="ml-auto flex items-center gap-3">
                    {pessoa && <SinoDeNotificacoes />}
                    <MenuDaConta iniciais={iniciais ?? iniciaisDe(nomeNaTela)} nome={nomeNaTela} />
                </div>
            </header>

            <div className="flex">
                {!semMenu && (
                    <div className="hidden lg:block">
                        <MenuLateral itens={itens} rotulo={rotuloDoMenu} />
                    </div>
                )}

                <main id="conteudo" className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
                    {children}
                </main>
            </div>

            {!semMenu && gavetaAberta && (
                <GavetaDoMenu itens={itens} rotulo={rotuloDoMenu} fechar={() => setGavetaAberta(false)} />
            )}
        </div>
    )
}

/** O menu lateral no celular: abre por cima da tela e fecha no Esc, no X ou no clique fora. */
function GavetaDoMenu({ itens, rotulo, fechar }: { itens: ItemDeMenu[]; rotulo: string; fechar: () => void }) {
    useEffect(() => {
        const aoTeclar = (e: KeyboardEvent) => {
            if (e.key === 'Escape') fechar()
        }
        document.addEventListener('keydown', aoTeclar)
        const rolagem = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', aoTeclar)
            document.body.style.overflow = rolagem
        }
    }, [fechar])

    return (
        <div
            className="fixed inset-0 z-50 flex bg-profundo/50 lg:hidden"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) fechar()
            }}
        >
            <div role="dialog" aria-modal="true" aria-label={rotulo} className="flex h-full w-[280px] max-w-[85vw] flex-col bg-card shadow-modal">
                <div className="flex items-center justify-between border-b border-sutil px-4 py-3">
                    <Logo variante="pervinca" altura={24} />
                    <button
                        type="button"
                        onClick={fechar}
                        aria-label="Fechar menu"
                        className={`grid size-9 place-items-center rounded-card border border-sutil text-titulo ${ANEL_FOCO}`}
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <MenuLateral itens={itens} rotulo={rotulo} naGaveta />
                </div>
            </div>
        </div>
    )
}

/** Fecha o painel aberto ao clicar fora ou apertar Esc. */
function useFecharFora(aberto: boolean, fechar: () => void) {
    const caixa = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!aberto) return
        const aoClicar = (e: MouseEvent) => {
            if (caixa.current && !caixa.current.contains(e.target as Node)) fechar()
        }
        const aoTeclar = (e: KeyboardEvent) => {
            if (e.key === 'Escape') fechar()
        }
        document.addEventListener('mousedown', aoClicar)
        document.addEventListener('keydown', aoTeclar)
        return () => {
            document.removeEventListener('mousedown', aoClicar)
            document.removeEventListener('keydown', aoTeclar)
        }
    }, [aberto, fechar])
    return caixa
}

function MenuDaConta({ iniciais, nome }: { iniciais: string; nome: string }) {
    const { pessoa, perfis, perfilAtivo, escolherPerfil, sair } = useSessao()
    const navigate = useNavigate()
    const [aberto, setAberto] = useState(false)
    const [trocando, setTrocando] = useState(false)
    const caixa = useFecharFora(aberto, () => setAberto(false))

    async function trocarPara(vinculoId: number) {
        const rota = await escolherPerfil(vinculoId)
        setTrocando(false)
        navigate(rota)
    }

    return (
        <div ref={caixa} className="relative">
            <button
                type="button"
                onClick={() => setAberto((a) => !a)}
                aria-haspopup="menu"
                aria-expanded={aberto}
                title={nome}
                className={`grid size-9 place-items-center rounded-full bg-acento-suave text-selo text-acento ${ANEL_FOCO}`}
            >
                {iniciais}
            </button>

            {aberto && (
                <div
                    role="menu"
                    className="fixed inset-x-4 top-16 z-40 rounded-modal border border-sutil bg-card p-2 shadow-dropdown sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-[320px]"
                >
                    <div className="border-b border-sutil px-3 pb-3 pt-2">
                        <p className="text-bloco text-titulo">{pessoa?.nome ?? nome}</p>
                        <p className="text-apoio text-secundario">{pessoa?.email}</p>
                        {perfilAtivo && (
                            <p className="mt-1 text-legenda text-secundario">
                                {ROTULO_DA_AREA[perfilAtivo.area]} · {perfilAtivo.vinculo.organizacaoNome}
                            </p>
                        )}
                    </div>
                    {perfilAtivo && (
                        <Link
                            role="menuitem"
                            to={CONTA_DA_AREA[perfilAtivo.area]}
                            className={`block rounded-card px-3 py-2 text-apoio text-titulo hover:bg-page ${ANEL_FOCO}`}
                        >
                            Minha conta
                        </Link>
                    )}
                    <Link
                        role="menuitem"
                        to="/conta/nova-organizacao"
                        className={`block rounded-card px-3 py-2 text-apoio text-titulo hover:bg-page ${ANEL_FOCO}`}
                    >
                        Nova organização
                    </Link>
                    {perfis.length > 1 && (
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setAberto(false)
                                setTrocando(true)
                            }}
                            className={`block w-full rounded-card px-3 py-2 text-left text-apoio text-titulo hover:bg-page ${ANEL_FOCO}`}
                        >
                            Trocar de perfil
                        </button>
                    )}
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            sair()
                            navigate('/')
                        }}
                        className={`block w-full rounded-card px-3 py-2 text-left text-apoio text-status-reprovada-texto hover:bg-page ${ANEL_FOCO}`}
                    >
                        Sair
                    </button>
                </div>
            )}

            <Modal
                aberto={trocando}
                titulo="Trocar de perfil"
                descricao="Escolha com qual vínculo você quer continuar. Não precisa entrar de novo."
                aoFechar={() => setTrocando(false)}
                acoes={
                    <CustomButton variant="neutro" onClick={() => setTrocando(false)}>
                        Cancelar
                    </CustomButton>
                }
            >
                <ul className="flex flex-col gap-2">
                    {perfis.map((p) => (
                        <li key={p.vinculo.id}>
                            <button
                                type="button"
                                onClick={() => void trocarPara(p.vinculo.id)}
                                disabled={p.vinculo.id === perfilAtivo?.vinculo.id}
                                className={`flex w-full items-center justify-between rounded-card border border-sutil px-4 py-3 text-left ${TRANSICAO_COR} hover:bg-page disabled:cursor-default disabled:bg-acento-suave ${ANEL_FOCO}`}
                            >
                                <span className="text-apoio text-titulo">{p.vinculo.organizacaoNome}</span>
                                <span className="rounded-badge bg-acento px-2 py-1 text-selo text-white">
                                    {ROTULO_DA_AREA[p.area]}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </Modal>
        </div>
    )
}

function SinoDeNotificacoes() {
    const { perfilAtivo } = useSessao()
    const [aberto, setAberto] = useState(false)
    const [lista, setLista] = useState<Notificacao[]>([])
    const caixa = useFecharFora(aberto, () => setAberto(false))

    const carregar = () => {
        listarNotificacoes()
            .then(setLista)
            .catch(() => setLista([]))
    }

    useEffect(carregar, [])

    const naoLidas = lista.filter((n) => !n.lidaEm).length

    async function ler(n: Notificacao) {
        if (n.lidaEm) return
        const lida = await marcarComoLida(n.id).catch(() => null)
        if (lida) setLista((atual) => atual.map((x) => (x.id === lida.id ? lida : x)))
    }

    async function lerTodas() {
        await marcarTodasComoLidas().catch(() => undefined)
        carregar()
    }

    return (
        <div ref={caixa} className="relative">
            <button
                type="button"
                onClick={() => {
                    setAberto((a) => !a)
                    if (!aberto) carregar()
                }}
                aria-haspopup="dialog"
                aria-expanded={aberto}
                aria-label={naoLidas ? `Notificações, ${naoLidas} não lidas` : 'Notificações'}
                className={`relative grid size-9 place-items-center rounded-full border border-sutil bg-card text-titulo ${ANEL_FOCO}`}
            >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                </svg>
                {naoLidas > 0 && (
                    <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-acento px-1 text-[10px] font-semibold text-white">
                        {naoLidas}
                    </span>
                )}
            </button>

            {aberto && (
                <div
                    role="dialog"
                    aria-label="Notificações"
                    className="fixed inset-x-4 top-16 z-40 rounded-modal border border-sutil bg-card shadow-dropdown sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-[360px]"
                >
                    <div className="flex items-center justify-between border-b border-sutil px-4 py-3">
                        <span className="text-bloco text-titulo">Notificações</span>
                        {naoLidas > 0 && (
                            <button type="button" onClick={() => void lerTodas()} className="text-apoio text-acento hover:underline">
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>
                    <ul className="max-h-[360px] overflow-y-auto">
                        {lista.length === 0 && <li className="px-4 py-6 text-apoio text-secundario">Nenhuma notificação.</li>}
                        {lista.slice(0, 20).map((n) => (
                            <li key={n.id} className="border-b border-sutil last:border-b-0">
                                <button
                                    type="button"
                                    onClick={() => void ler(n)}
                                    className={`flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-page ${n.lidaEm ? '' : 'bg-acento-suave/60'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        {n.tipo === 'PEDE_ACAO' && (
                                            <span className="rounded-badge bg-aviso-fundo px-1.5 py-0.5 text-selo text-ocre">Pede ação</span>
                                        )}
                                        <span className="text-item text-titulo">{n.titulo}</span>
                                    </span>
                                    {n.mensagem && <span className="text-apoio text-secundario">{n.mensagem}</span>}
                                    <span className="text-legenda text-secundario">{formatarDataHora(n.criadaEm)}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {perfilAtivo?.area === 'provedor' && (
                        <Link
                            to="/provedor/notificacoes"
                            className="block border-t border-sutil px-4 py-3 text-center text-apoio text-acento hover:underline"
                        >
                            Ver notificações e prazos
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}

export default CascaDoApp
