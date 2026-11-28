import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { recomendadas, type Match } from '../api/matching'
import { listarOportunidadesPublicadas, type Oportunidade } from '../api/oportunidades'
import { listarTrilhas, type TrilhaCodigo } from '../api/trilhas'
import AbasDeFiltro, { type Aba } from '../components/AbasDeFiltro'
import CascaDoApp from '../components/CascaDoApp'
import CartaoDeOportunidade, { BotaoFavorito } from '../components/candidato/CartaoDeOportunidade'
import { LIMITE_RECOMENDADAS, trilhasDoTipo } from '../components/candidato/apoio'
import useFavoritas from '../components/candidato/useFavoritas'
import { CustomButton } from '../components/CustomButton'
import SeloDeTrilha from '../components/SeloDeTrilha'
import { Campo, CampoLista } from '../components/ui/Campo'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { ANEL_FOCO, CARTAO_COM_RESPIRO, TRANSICAO_COR } from '../estilos/classes'
import { formatarData, ROTULO_TRILHA, trilhaDoSelo } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_CANDIDATO } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 17 · Candidato — buscar oportunidades · rota /candidato/oportunidades
 *
 * As oportunidades abertas para o tipo da organização, com as abas Todas,
 * Recomendadas (as 10 mais compatíveis, tela 63) e Favoritas. A lista principal
 * vem do matching (as abertas, no prazo e da trilha certa, com a nota). Na aba
 * Todas, as outras publicadas (que a organização não cumpre, de outra trilha ou
 * pausadas) aparecem abaixo, vindas de listarOportunidadesPublicadas.
 */

type IdAba = 'todas' | 'recomendadas' | 'favoritas'
type Ordem = 'compatibilidade' | 'prazo'

export default function CandidatoOportunidades({ abaInicial = 'todas' }: { abaInicial?: IdAba }) {
    const { perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId
    const tipo = perfilAtivo?.organizacao?.tipo

    const abertas = useDados(() => recomendadas(organizacaoId as number, 100), [organizacaoId], !!organizacaoId)
    const trilhas = useDados(() => listarTrilhas(), [])
    const publicadas = useDados(() => listarOportunidadesPublicadas(), [])
    const favoritas = useFavoritas(organizacaoId)

    const [aba, setAba] = useState<IdAba>(abaInicial)
    const [busca, setBusca] = useState('')
    const [trilha, setTrilha] = useState<TrilhaCodigo | ''>('')
    const [elegibilidade, setElegibilidade] = useState<'' | 'ELEGIVEL' | 'PENDENTE'>('')
    const [ordem, setOrdem] = useState<Ordem>('compatibilidade')

    const todas = useMemo(() => abertas.dados ?? [], [abertas.dados])
    const top = useMemo(() => todas.slice(0, LIMITE_RECOMENDADAS), [todas])
    const outras = useMemo(() => {
        const naLista = new Set(todas.map((m) => m.oportunidadeId))
        const termo = busca.trim().toLowerCase()
        return (publicadas.dados ?? []).filter(
            (o) =>
                !naLista.has(o.id) &&
                (!trilha || o.trilhaCodigo === trilha) &&
                (!termo || `${o.titulo} ${o.area ?? ''}`.toLowerCase().includes(termo)),
        )
    }, [publicadas.dados, todas, busca, trilha])

    const filtrar = (lista: Match[]) => {
        const termo = busca.trim().toLowerCase()
        const filtrada = lista.filter(
            (m) =>
                (!trilha || m.trilhaCodigo === trilha) &&
                (!elegibilidade || m.elegibilidade === elegibilidade) &&
                (!termo || `${m.oportunidadeTitulo} ${m.area ?? ''}`.toLowerCase().includes(termo)),
        )
        if (ordem === 'prazo') {
            return [...filtrada].sort((a, b) => (a.prazoEnvio ?? '9999').localeCompare(b.prazoEnvio ?? '9999'))
        }
        return filtrada
    }

    const opcoesDeTrilha = (trilhas.dados ?? []).filter((t) => trilhasDoTipo(tipo).includes(t.codigo))

    const abas: Aba<IdAba>[] = [
        { id: 'todas', rotulo: 'Todas', quantidade: todas.length },
        { id: 'recomendadas', rotulo: 'Recomendadas', quantidade: top.length },
        { id: 'favoritas', rotulo: 'Favoritas', quantidade: favoritas.ids ? favoritas.lista.length : 0 },
    ]

    const limparFiltros = () => {
        setBusca('')
        setTrilha('')
        setElegibilidade('')
    }

    const favoritaDe = (id: number) => (favoritas.ids ? favoritas.ids.has(id) : undefined)

    return (
        <CascaDoApp itens={MENU_CANDIDATO}>
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">Oportunidades</h1>
                    <p className="mt-1 text-apoio text-secundario">
                        {abertas.dados
                            ? `${todas.length} abertas agora para ${perfilAtivo?.vinculo.organizacaoNome ?? 'a sua organização'}`
                            : 'O que está aberto no ecossistema do Porto Digital'}
                    </p>
                </div>
                <div className="w-full max-w-[320px]">
                    <Campo
                        rotulo="Buscar por título ou área"
                        type="search"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
            </div>

            {top.length > 0 && (
                <section className="mt-6 flex flex-wrap items-center gap-4 rounded-bloco bg-acento-suave p-card">
                    <div className="min-w-0 flex-1">
                        <p className="text-bloco text-titulo">
                            As {top.length} mais compatíveis com o perfil de {perfilAtivo?.vinculo.organizacaoNome}
                        </p>
                        <p className="mt-1 text-apoio text-secundario">
                            A recomendação usa a trilha, o setor, o estágio e a descrição do perfil da organização.
                        </p>
                    </div>
                    <CustomButton to="/candidato/recomendadas" variant="neutro" size="auto">
                        Ver recomendadas
                    </CustomButton>
                </section>
            )}

            <div className="mt-6">
                <AbasDeFiltro abas={abas} ativa={aba} aoEscolher={setAba} rotulo="Filtrar oportunidades" variante="sublinhado" />
            </div>

            {aba !== 'favoritas' && (
                <div className="mt-4 flex flex-wrap items-end gap-3">
                    <div className="w-48">
                        <CampoLista rotulo="Trilha" value={trilha} onChange={(e) => setTrilha(e.target.value as TrilhaCodigo | '')}>
                            <option value="">Todas as trilhas</option>
                            {opcoesDeTrilha.map((t) => (
                                <option key={t.codigo} value={t.codigo}>
                                    {t.nome || ROTULO_TRILHA[t.codigo]}
                                </option>
                            ))}
                        </CampoLista>
                    </div>
                    <div className="w-48">
                        <CampoLista
                            rotulo="Elegibilidade"
                            value={elegibilidade}
                            onChange={(e) => setElegibilidade(e.target.value as '' | 'ELEGIVEL' | 'PENDENTE')}
                        >
                            <option value="">Qualquer</option>
                            <option value="ELEGIVEL">Elegível</option>
                            <option value="PENDENTE">Pendente</option>
                        </CampoLista>
                    </div>
                    <div className="w-56">
                        <CampoLista rotulo="Ordenar por" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
                            <option value="compatibilidade">Compatibilidade</option>
                            <option value="prazo">Prazo mais próximo</option>
                        </CampoLista>
                    </div>
                    {(busca || trilha || elegibilidade) && (
                        <button
                            type="button"
                            onClick={limparFiltros}
                            className={`mb-2 rounded-card px-1 text-apoio text-acento hover:text-titulo ${TRANSICAO_COR} ${ANEL_FOCO}`}
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>
            )}

            {favoritas.erroDaAcao && (
                <div className="mt-4">
                    <Aviso tipo="erro">{favoritas.erroDaAcao}</Aviso>
                </div>
            )}

            <div className="mt-5">
                {aba === 'favoritas' ? (
                    <ListaDeFavoritas favoritas={favoritas} abertas={todas} />
                ) : abertas.carregando && !abertas.dados ? (
                    <Carregando />
                ) : abertas.erro ? (
                    <ErroNaTela mensagem={abertas.erro} tentarDeNovo={abertas.recarregar} />
                ) : (
                    <Lista
                        lista={filtrar(aba === 'todas' ? todas : top)}
                        detalhado={aba === 'recomendadas'}
                        favoritaDe={favoritaDe}
                        alternar={favoritas.alternar}
                        vazio={
                            todas.length === 0
                                ? 'Nenhuma oportunidade aberta para a sua organização agora'
                                : 'Nenhuma oportunidade com estes filtros'
                        }
                    />
                )}
            </div>

            {aba === 'todas' && !elegibilidade && outras.length > 0 && <OutrasPublicadas lista={outras} />}

            <p className="mt-6 text-legenda text-secundario">
                Pendente quer dizer que falta um dado do perfil para conferir alguma regra. As outras publicadas são as que a
                organização não cumpre, de uma trilha em que ela não se candidata, ou pausadas.
            </p>
        </CascaDoApp>
    )
}

function OutrasPublicadas({ lista }: { lista: Oportunidade[] }) {
    return (
        <section aria-labelledby="titulo-outras" className="mt-8">
            <h2 id="titulo-outras" className="font-display text-bloco text-titulo">
                Outras oportunidades publicadas ({lista.length})
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
                {lista.map((o) => (
                    <li key={o.id}>
                        <Link
                            to={`/candidato/oportunidades/${o.id}`}
                            className={`${CARTAO_COM_RESPIRO} flex flex-wrap items-center gap-3 hover:bg-page ${TRANSICAO_COR} ${ANEL_FOCO}`}
                        >
                            <SeloDeTrilha trilha={trilhaDoSelo(o.trilhaCodigo)} />
                            <span className="min-w-0 flex-1 text-item text-titulo">{o.titulo}</span>
                            {o.area && <span className="text-apoio text-secundario">{o.area}</span>}
                            {o.suspensaEm && (
                                <span className="rounded-badge bg-aviso-fundo px-2 py-1 text-selo text-ocre">Pausada</span>
                            )}
                            <span className="text-apoio text-secundario">publicada em {formatarData(o.publicadaEm)}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}

function Lista({
    lista,
    detalhado,
    favoritaDe,
    alternar,
    vazio,
}: {
    lista: Match[]
    detalhado: boolean
    favoritaDe: (id: number) => boolean | undefined
    alternar: (id: number) => Promise<void>
    vazio: string
}) {
    if (lista.length === 0) {
        return (
            <Vazio titulo={vazio}>
                Complete o <Link to="/candidato/organizacao" className="text-acento underline">perfil da organização</Link> para
                melhorar a recomendação.
            </Vazio>
        )
    }
    return (
        <ul className={detalhado ? 'flex flex-col gap-4' : 'grid gap-4 lg:grid-cols-2'}>
            {lista.map((m) => (
                <li key={m.oportunidadeId}>
                    <CartaoDeOportunidade
                        match={m}
                        detalhado={detalhado}
                        favorita={favoritaDe(m.oportunidadeId)}
                        aoAlternarFavorita={() => alternar(m.oportunidadeId)}
                    />
                </li>
            ))}
        </ul>
    )
}

function ListaDeFavoritas({ favoritas, abertas }: { favoritas: ReturnType<typeof useFavoritas>; abertas: Match[] }) {
    if (favoritas.carregando && !favoritas.ids) return <Carregando />
    if (favoritas.erro) {
        return (
            <ErroNaTela
                mensagem={`As favoritas ainda não estão disponíveis (${favoritas.erro}).`}
                tentarDeNovo={favoritas.recarregar}
            />
        )
    }
    if (favoritas.lista.length === 0) {
        return <Vazio titulo="Nenhuma oportunidade favoritada">Use a estrela das oportunidades para acompanhar as que interessam.</Vazio>
    }
    return (
        <ul className="grid gap-4 lg:grid-cols-2">
            {favoritas.lista.map((f) => {
                const aberta = abertas.find((m) => m.oportunidadeId === f.oportunidadeId)
                if (aberta) {
                    return (
                        <li key={f.oportunidadeId}>
                            <CartaoDeOportunidade
                                match={aberta}
                                favorita
                                aoAlternarFavorita={() => favoritas.alternar(f.oportunidadeId)}
                            />
                        </li>
                    )
                }
                return (
                    <li key={f.oportunidadeId}>
                        <article className={CARTAO_COM_RESPIRO}>
                            <div className="flex items-start gap-3">
                                <div className="min-w-0 flex-1">
                                    <SeloDeTrilha trilha={trilhaDoSelo(f.trilhaCodigo)} />
                                    <h3 className="mt-3 font-display text-bloco text-titulo">{f.titulo}</h3>
                                    <p className="mt-1 text-apoio text-secundario">
                                        Favoritada em {formatarData(f.favoritadaEm)} · fora da lista de abertas
                                    </p>
                                </div>
                                <BotaoFavorito favorita titulo={f.titulo} aoAlternar={() => favoritas.alternar(f.oportunidadeId)} />
                            </div>
                            <div className="mt-4">
                                <CustomButton to={`/candidato/oportunidades/${f.oportunidadeId}`} variant="neutro" size="auto">
                                    Ver detalhes
                                </CustomButton>
                            </div>
                        </article>
                    </li>
                )
            })}
        </ul>
    )
}
