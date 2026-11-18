import { useMemo, useState } from 'react'

import { CustomButton } from '../components/CustomButton'
import CascaDoApp from '../components/CascaDoApp'
import { MENU_SQUAD } from '../navegacao/menus'
import SeloDeTrilha, { type Trilha } from '../components/SeloDeTrilha'
import AbasDeFiltro, { type Aba } from '../components/AbasDeFiltro'
import { ANEL_FOCO, TRANSICAO_COR } from '../estilos/classes'

/**
 * 53 · Candidato squad — oportunidades · rota /oportunidades
 *
 * A vitrine do ecossistema do ponto de vista da squad: o que está aberto,
 * o quanto combina com o perfil dela e se ela é elegível.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 */

type Elegibilidade = 'elegivel' | 'acompanhando' | 'nao-elegivel'

interface Oportunidade {
    id: number
    trilha: Trilha
    titulo: string
    ofertante: string
    resumo: string
    elegibilidade: Elegibilidade
    prazo: string
    match: number
    acao: string
    recomendada: boolean
}

const oportunidades: Oportunidade[] = [
    {
        id: 1,
        trilha: 'formacao',
        titulo: 'Desafio Rotas Verdes',
        ofertante: 'Movetech',
        resumo: 'Roteirização sustentável para entregas de última milha no Recife.',
        elegibilidade: 'elegivel',
        prazo: 'Inscrições até 30 nov 2026',
        match: 88,
        acao: 'Ver detalhes',
        recomendada: true,
    },
    {
        id: 2,
        trilha: 'formacao',
        titulo: 'Residência Saúde Digital 2026',
        ofertante: 'Porto Digital + CESAR',
        resumo: 'Squads de residência criam soluções para a rede pública de saúde.',
        elegibilidade: 'elegivel',
        prazo: 'Inscrições até 12 dez 2026',
        match: 72,
        acao: 'Ver detalhes',
        recomendada: true,
    },
    {
        id: 3,
        trilha: 'formacao',
        titulo: 'Desafio Logística Urbana',
        ofertante: 'Movetech',
        resumo: 'Desafio real de roteirização para squads de residência.',
        elegibilidade: 'acompanhando',
        prazo: 'Aprovada em 28/08',
        match: 74,
        acao: 'Acompanhar',
        recomendada: true,
    },
    {
        id: 4,
        trilha: 'formacao',
        titulo: 'Desafio Cidades Inteligentes',
        ofertante: 'Sebrae PE',
        resumo: 'Pede de 6 a 8 integrantes; a Squad 3 · FICR tem 4.',
        elegibilidade: 'nao-elegivel',
        prazo: 'Inscrições até 18 dez 2026',
        match: 51,
        acao: 'Ver detalhes',
        recomendada: false,
    },
]



const rotuloDaElegibilidade: Record<Elegibilidade, string> = {
    elegivel: 'Elegível',
    acompanhando: 'Em acompanhamento',
    'nao-elegivel': 'Não elegível',
}

const corDaElegibilidade: Record<Elegibilidade, string> = {
    elegivel: 'text-status-aprovada-texto',
    acompanhando: 'text-status-aprovada-texto',
    'nao-elegivel': 'text-status-reprovada-texto',
}

type AbaId = 'todas' | 'recomendadas' | 'favoritas'

const TOTAL_ABERTAS = 12

const FILTROS = [
    { rotulo: 'Trilha', valor: 'Todas as trilhas', ativo: false },
    { rotulo: 'Área', valor: 'Software', ativo: true },
    { rotulo: 'Prazo', valor: 'Aberto até 30 dias', ativo: true },
    { rotulo: 'Elegibilidade', valor: 'Qualquer', ativo: false },
]

function OportunidadesSquad() {
    const [aba, setAba] = useState<AbaId>('todas')

    const recomendadas = useMemo(
        () => oportunidades.filter((o) => o.recomendada),
        [],
    )

    const lista = aba === 'recomendadas' ? recomendadas : aba === 'favoritas' ? [] : oportunidades

    const abas: Aba<AbaId>[] = [
        { id: 'todas', rotulo: 'Todas', quantidade: TOTAL_ABERTAS },
        { id: 'recomendadas', rotulo: 'Recomendadas', quantidade: recomendadas.length },
        { id: 'favoritas', rotulo: 'Favoritas', quantidade: 0 },
    ]

    return (
        <CascaDoApp
            organizacao="Squad 3 · FICR"
            papel="Candidato · squad"
            iniciais="SC"
            nome="Sua Chen Letícia"
            itens={MENU_SQUAD}
            voltarPara="/squad"
        >
            <div className="flex items-start gap-6">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">Oportunidades</h1>
                    <p className="mt-2 text-apoio text-secundario">
                        {TOTAL_ABERTAS} abertas agora no ecossistema do Porto Digital
                    </p>
                </div>

                <label className="w-[320px] shrink-0">
                    <span className="sr-only">Buscar oportunidade</span>
                    <input
                        type="search"
                        placeholder="Buscar por título ou organização"
                        className={`w-full rounded-card border border-sutil bg-card px-4 py-3 text-apoio text-titulo outline-none ${TRANSICAO_COR} placeholder:text-secundario focus:border-acento focus-visible:shadow-foco`}
                    />
                </label>
            </div>

            <section
                aria-label="Recomendação para a squad"
                className="mt-6 flex items-center gap-5 rounded-card bg-acento-suave p-5"
            >
                <div className="min-w-0 flex-1">
                    <p className="font-display text-bloco text-acento">
                        {recomendadas.length} oportunidades combinam com o perfil da Squad 3 ·
                        FICR
                    </p>
                    <p className="mt-1 text-apoio text-secundario">
                        A recomendação usa trilha, área, número de integrantes e o código da
                        coordenação da squad
                    </p>
                </div>
                <CustomButton
                    variant="neutro"
                    size="auto"
                    onClick={() => setAba('recomendadas')}
                >
                    Ver recomendadas
                </CustomButton>
            </section>

            <div className="mt-6">

                <AbasDeFiltro
                    abas={abas}
                    ativa={aba}
                    aoEscolher={setAba}
                    rotulo="Filtrar oportunidades"
                    variante="sublinhado"
                />

            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                {FILTROS.map((filtro) => (
                    <span
                        key={filtro.rotulo}
                        className={`rounded-card border px-4 py-2 text-apoio ${
                            filtro.ativo
                                ? 'border-acento bg-acento-suave text-titulo'
                                : 'border-sutil bg-card text-secundario'
                        }`}
                    >
                        {filtro.rotulo}: <span className="text-titulo">{filtro.valor}</span> ▾
                    </span>
                ))}
                <button
                    type="button"
                    className={`rounded-card px-2 py-2 text-apoio text-acento ${TRANSICAO_COR} hover:text-titulo ${ANEL_FOCO}`}
                >
                    Limpar filtros
                </button>
                <span className="ml-auto text-apoio text-secundario">
                    Ordenar por compatibilidade ▾
                </span>
            </div>

            {lista.length === 0 ? (
                <p className="mt-8 rounded-bloco border border-sutil bg-card p-card text-apoio text-secundario shadow-card">
                    Nenhuma oportunidade favoritada ainda. Marque uma na lista para
                    encontrá-la aqui depois.
                </p>
            ) : (
                <ul className="mt-6 grid grid-cols-2 gap-5">
                    {lista.map((oportunidade) => (
                        <li key={oportunidade.id}>
                            <article className="flex h-full flex-col rounded-bloco border border-sutil bg-card p-card shadow-card transition-[box-shadow,border-color,transform] duration-[var(--dur-padrao)] ease-padrao hover:-translate-y-px hover:shadow-card-hover">
                                <div className="flex items-center gap-3">
                                    <SeloDeTrilha trilha={oportunidade.trilha} />
                                    <span className="ml-auto text-apoio text-acento">
                                        {oportunidade.match}% de match
                                    </span>
                                </div>

                                <h2 className="mt-3 font-display text-bloco text-titulo">
                                    {oportunidade.titulo}
                                </h2>
                                <p className="mt-1 text-apoio text-secundario">
                                    {oportunidade.ofertante}
                                </p>
                                <p className="mt-3 text-apoio text-titulo">
                                    {oportunidade.resumo}
                                </p>

                                <div className="mt-5 flex items-center gap-3 pt-1">
                                    <span
                                        className={`inline-flex items-center gap-2 text-apoio ${corDaElegibilidade[oportunidade.elegibilidade]}`}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="size-1.5 rounded-full bg-current"
                                        />
                                        {rotuloDaElegibilidade[oportunidade.elegibilidade]}
                                    </span>
                                    <span className="text-apoio text-secundario">
                                        {oportunidade.prazo}
                                    </span>
                                    <span className="ml-auto">
                                        <CustomButton variant="aprovar" size="auto">
                                            {oportunidade.acao}
                                        </CustomButton>
                                    </span>
                                </div>
                            </article>
                        </li>
                    ))}
                </ul>
            )}
        </CascaDoApp>
    )
}

export default OportunidadesSquad
