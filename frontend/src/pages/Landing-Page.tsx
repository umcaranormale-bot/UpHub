import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { listarTrilhas, type TrilhaCodigo } from '../api/trilhas'
import { CustomButton } from '../components/CustomButton'
import Logo from '../components/Logo'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { ANEL_FOCO, CARTAO_COM_RESPIRO, TRANSICAO_ELEVACAO } from '../estilos/classes'
import { useDados } from '../hooks/useDados'

/**
 * 13 · Início público (visitante) · rota /
 *
 * As trilhas vêm da API (é a única leitura pública). Os números do Figma
 * (oportunidades abertas, empresas, taxa de conexão) exigem login na API e
 * ficam fora da landing.
 */

// texto de apresentação de cada trilha; o nome vem da API
const SOBRE_A_TRILHA: Record<TrilhaCodigo, { cor: string; descricao: string; quem: string }> = {
    FOMENTO: {
        cor: 'bg-trilha-fomento',
        descricao: 'Editais e programas de órgãos e instituições',
        quem: 'Órgãos de fomento · empresas e startups se candidatam',
    },
    INVESTIMENTO: {
        cor: 'bg-trilha-investimento',
        descricao: 'Rodadas e programas de aceleração',
        quem: 'Investidores e aceleradoras · startups se candidatam',
    },
    FORMACAO: {
        cor: 'bg-trilha-formacao',
        descricao: 'Residências e desafios reais de empresas',
        quem: 'Empresas parceiras · squads de estudantes',
    },
}

const PASSOS = [
    {
        titulo: 'Descubra',
        texto: 'Veja as oportunidades abertas e as recomendadas para o perfil da sua organização.',
    },
    {
        titulo: 'Confira antes de montar',
        texto: 'O Up Hub mostra se você pode concorrer antes de você preparar a proposta.',
    },
    {
        titulo: 'Acompanhe até o resultado',
        texto: 'Avaliação, pedidos de ajuste, resultado e acompanhamento, tudo no mesmo lugar.',
    },
]

function LandingPage() {
    const { dados: trilhas, carregando, erro, recarregar } = useDados(() => listarTrilhas(), [])
    const { hash } = useLocation()

    // as âncoras da Navbar (/#trilhas): o React Router não rola sozinho até a seção
    useEffect(() => {
        if (!hash) return
        const alvo = document.getElementById(hash.slice(1))
        const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        alvo?.scrollIntoView({ behavior: semMovimento ? 'auto' : 'smooth' })
    }, [hash, trilhas])

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-page">
            <section className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
                <div className="max-w-2xl">
                    <span className="mb-5 inline-block rounded-badge bg-acento-suave px-2 py-1 text-selo text-acento">
                        Porto Digital · Recife
                    </span>

                    <h1 className="mb-6 font-display text-[clamp(2.25rem,5vw,3rem)] font-bold leading-tight tracking-tight text-titulo">
                        Todas as oportunidades do ecossistema em um só lugar.
                    </h1>

                    <p className="mb-8 max-w-lg text-lead text-secundario">
                        Editais, rodadas de investimento e residências. Você descobre o que combina com o seu perfil,
                        confere se pode concorrer antes de montar a proposta e acompanha cada etapa até o resultado.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <CustomButton to="/cadastro" variant="aprovar" size="auto" className="px-5">
                            Criar conta
                        </CustomButton>
                        <CustomButton to="/entrar" variant="neutro" size="auto" className="px-5">
                            Já tenho conta
                        </CustomButton>
                    </div>

                    {trilhas && trilhas.length > 0 && (
                        <p className="mt-12">
                            <span className="block font-display text-h1 text-acento">{trilhas.length}</span>
                            <span className="text-apoio text-secundario">
                                {trilhas.length === 1 ? 'trilha de oportunidades' : 'trilhas de oportunidades'}
                            </span>
                        </p>
                    )}
                </div>

                <div id="trilhas" className="flex scroll-mt-20 flex-col gap-4">
                    <h2 className="sr-only">Trilhas</h2>
                    {carregando && !trilhas && <Carregando texto="Carregando as trilhas…" />}
                    {erro && <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />}
                    {trilhas && trilhas.length === 0 && <Vazio titulo="Nenhuma trilha cadastrada ainda" />}
                    {trilhas?.map((trilha) => {
                        const sobre = SOBRE_A_TRILHA[trilha.codigo]
                        return (
                            <article
                                key={trilha.codigo}
                                className={`${CARTAO_COM_RESPIRO} ${TRANSICAO_ELEVACAO} hover:-translate-y-px hover:shadow-card-hover`}
                            >
                                <div className={`h-1 w-10 rounded-full ${sobre?.cor ?? 'bg-acento'}`} aria-hidden="true" />
                                <h3 className="mt-3 font-display text-h3 text-titulo">{trilha.nome}</h3>
                                {sobre && (
                                    <>
                                        <p className="mt-1 text-corpo text-secundario">{sobre.descricao}</p>
                                        <p className="mt-1 text-legenda text-secundario">{sobre.quem}</p>
                                    </>
                                )}
                            </article>
                        )
                    })}
                </div>
            </section>

            <section id="como-funciona" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 pb-16 sm:px-8">
                <h2 className="font-display text-tela text-titulo">Como funciona</h2>
                <ol className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {PASSOS.map((passo, i) => (
                        <li key={passo.titulo} className={CARTAO_COM_RESPIRO}>
                            <span className="text-selo text-acento">Passo {i + 1}</span>
                            <h3 className="mt-1 font-display text-bloco text-titulo">{passo.titulo}</h3>
                            <p className="mt-1 text-apoio text-secundario">{passo.texto}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section
                id="para-quem-publica"
                className="scroll-mt-20 bg-profundo text-white"
            >
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-8 sm:px-8 md:flex-row md:items-center">
                    <div className="max-w-2xl">
                        <h2 className="mb-1 font-display text-h3 font-bold">Publica editais, programas ou desafios?</h2>
                        <p className="text-corpo text-acento-suave">
                            Cadastre a sua organização. A permissão de publicar é liberada pela gestão do Porto Digital
                            depois da conferência dos dados.
                        </p>
                    </div>
                    <Link
                        to="/cadastro"
                        className={`shrink-0 rounded-lg border border-white bg-card px-5 py-3 font-semibold text-profundo transition-colors hover:bg-acento-suave ${ANEL_FOCO}`}
                    >
                        Cadastrar organização
                    </Link>
                </div>
            </section>

            <footer className="border-t border-sutil bg-card">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-8">
                    <Logo altura={24} />
                    <div className="flex flex-wrap items-center gap-4 text-apoio text-secundario">
                        <Link to="/privacidade" className={`rounded-card text-acento hover:underline ${ANEL_FOCO}`}>
                            Política de privacidade
                        </Link>
                        <span>Squad 3 · FICR · Residência Rise Up</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
