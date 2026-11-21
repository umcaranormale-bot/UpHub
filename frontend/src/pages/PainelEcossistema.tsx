import { CustomButton } from '../components/CustomButton'
import CascaDoApp from '../components/CascaDoApp'
import { MENU_GESTAO } from '../navegacao/menus'
import Indicadores, { type Indicador } from '../components/Indicadores'

/**
 * 09 · Gestão do PD — painel do ecossistema · rota /painel
 *
 * Visão de quem coordena o programa: os quatro indicadores do mês, o funil
 * das três trilhas, os gargalos que já passaram do prazo e a taxa de
 * resposta por empresa.
 *
 * Nenhum número é digitado à mão no produto final: todos vêm do histórico
 * de estados. Nesta etapa os dados são simulados, conforme o Bloco 4.
 */



const indicadores: Indicador[] = [
    { id: 'oportunidades', rotulo: 'Oportunidades ativas', valor: '12', apoio: '+3 no mês' },
    { id: 'candidaturas', rotulo: 'Candidaturas no mês', valor: '148', apoio: '+22%' },
    { id: 'conexao', rotulo: 'Taxa de conexão', valor: '14,9%', apoio: 'homologadas ÷ enviadas' },
    { id: 'decisao', rotulo: 'Tempo até a decisão', valor: '11 dias', apoio: 'média das três trilhas' },
]

interface Etapa {
    rotulo: string
    quantidade: number
}

interface Trilha {
    id: string
    nome: string
    etapas: Etapa[]
}

const trilhas: Trilha[] = [
    {
        id: 'fomento',
        nome: 'Fomento',
        etapas: [
            { rotulo: 'Enviadas', quantidade: 82 },
            { rotulo: 'Elegíveis', quantidade: 54 },
            { rotulo: 'Em análise', quantidade: 31 },
            { rotulo: 'Aprovadas', quantidade: 12 },
            { rotulo: 'Homologadas', quantidade: 10 },
        ],
    },
    {
        id: 'investimento',
        nome: 'Investimento',
        etapas: [
            { rotulo: 'Enviadas', quantidade: 38 },
            { rotulo: 'Elegíveis', quantidade: 29 },
            { rotulo: 'Em análise', quantidade: 14 },
            { rotulo: 'Aprovadas', quantidade: 6 },
            { rotulo: 'Homologadas', quantidade: 5 },
        ],
    },
    {
        id: 'formacao',
        nome: 'Formação',
        etapas: [
            { rotulo: 'Enviadas', quantidade: 28 },
            { rotulo: 'Elegíveis', quantidade: 25 },
            { rotulo: 'Em análise', quantidade: 18 },
            { rotulo: 'Aprovadas', quantidade: 9 },
            { rotulo: 'Homologadas', quantidade: 7 },
        ],
    },
]

interface Gargalo {
    id: string
    titulo: string
    motivo: string
    historia: string
}

const gargalos: Gargalo[] = [
    {
        id: 'seed',
        titulo: 'Aceleração Seed Recife',
        motivo: 'sem avaliador designado há 9 dias',
        historia: 'H12',
    },
    {
        id: 'logistica',
        titulo: 'Desafio Logística Urbana',
        motivo: 'squad aprovada sem mentor alocado',
        historia: 'H13',
    },
    {
        id: 'inova',
        titulo: 'Inova PE 2026',
        motivo: '17 pareceres assinados aguardando homologação',
        historia: 'H12',
    },
]

interface Resposta {
    id: string
    empresa: string
    taxa: number
}

const respostas: Resposta[] = [
    { id: 'fomento-pe', empresa: 'Órgão de Fomento PE', taxa: 100 },
    { id: 'investe', empresa: 'Investe Recife', taxa: 64 },
    { id: 'sebrae', empresa: 'Sebrae PE', taxa: 92 },
]

/** Verde a partir de 90%, ocre abaixo disso: o texto repete o número, nunca só a cor. */
function corDaTaxa(taxa: number) {
    return taxa >= 90 ? 'text-status-aprovada-texto' : 'text-ocre'
}

function PainelEcossistema() {
    return (
        <CascaDoApp
            organizacao="Porto Digital"
            papel="Gestão do PD"
            iniciais="MV"
            nome="Marcos Vilela"
            itens={MENU_GESTAO}
        >
            <h1 className="font-display text-tela text-titulo">Painel do ecossistema</h1>
            <p className="mt-2 text-apoio text-secundario">
                Marcos Vilela · setembro de 2026 · nada aqui é digitado à mão: todo
                número vem do histórico de estados
            </p>

            <section
                aria-label="Pedido de publicação reenviado"
                className="mt-6 flex items-center gap-5 rounded-card bg-acento-suave p-5"
            >
                <div className="min-w-0 flex-1">
                    <p className="font-display text-bloco text-acento">
                        Pedido de publicação reenviado
                    </p>
                    <p className="mt-1 text-apoio text-titulo">
                        Instituto Recife Inova respondeu à recusa de 28/09 e mandou um
                        documento novo. O 2º pedido aguarda análise.
                    </p>
                </div>
                <CustomButton variant="neutro" size="auto">
                    Analisar 2º pedido
                </CustomButton>
            </section>

            <div className="mt-6">
                <Indicadores itens={indicadores} rotulo="Indicadores do mês" />
            </div>

            <div className="mt-6 flex items-start gap-6">
                <section
                    aria-labelledby="titulo-funil"
                    className="min-w-0 flex-1 rounded-bloco border border-sutil bg-card p-card shadow-card"
                >
                    <h2 id="titulo-funil" className="font-display text-bloco text-titulo">
                        Funil por trilha
                    </h2>
                    <p className="mt-1 text-apoio text-secundario">
                        US-30 · clicar em uma etapa abre a lista correspondente
                    </p>

                    {trilhas.map((trilha) => {
                        const maior = trilha.etapas[0].quantidade

                        return (
                            <div key={trilha.id} className="mt-6">
                                <h3 className="text-item text-acento">{trilha.nome}</h3>
                                <ul className="mt-3 flex flex-col gap-2">
                                    {trilha.etapas.map((etapa) => (
                                        <li
                                            key={etapa.rotulo}
                                            className="flex items-center gap-4"
                                        >
                                            <span className="w-[108px] shrink-0 text-apoio text-secundario">
                                                {etapa.rotulo}
                                            </span>
                                            <span
                                                aria-hidden="true"
                                                className="h-2 min-w-0 flex-1 overflow-hidden rounded-badge bg-page"
                                            >
                                                <span
                                                    className="block h-full rounded-badge bg-acento transition-[width] duration-[var(--dur-lenta)] ease-padrao"
                                                    style={{
                                                        width: `${(etapa.quantidade / maior) * 100}%`,
                                                    }}
                                                />
                                            </span>
                                            <span className="w-8 shrink-0 text-right text-apoio text-titulo">
                                                {etapa.quantidade}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </section>

                <aside className="flex w-[376px] shrink-0 flex-col gap-5">
                    <section
                        aria-labelledby="titulo-gargalos"
                        className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                    >
                        <div className="flex items-center gap-3">
                            <h2
                                id="titulo-gargalos"
                                className="font-display text-bloco text-titulo"
                            >
                                Gargalos
                            </h2>
                            <span className="rounded-badge bg-aviso-fundo px-2 py-1 text-selo text-ocre">
                                {gargalos.length}
                            </span>
                        </div>

                        <ul className="mt-4 flex flex-col gap-3">
                            {gargalos.map((gargalo) => (
                                <li
                                    key={gargalo.id}
                                    className="flex items-start gap-3 rounded-card border border-aviso-borda bg-aviso-fundo p-4"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-item text-titulo">{gargalo.titulo}</p>
                                        <p className="mt-1 text-apoio text-secundario">
                                            {gargalo.motivo}
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-badge bg-card px-2 py-1 text-selo text-secundario">
                                        {gargalo.historia}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section
                        aria-labelledby="titulo-resposta"
                        className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                    >
                        <span className="inline-block rounded-badge bg-acento-suave px-2 py-1 text-selo text-acento">
                            DIFERENCIAL 03
                        </span>
                        <h2
                            id="titulo-resposta"
                            className="mt-3 font-display text-bloco text-titulo"
                        >
                            Taxa de resposta por empresa
                        </h2>

                        <ul className="mt-3 flex flex-col gap-2">
                            {respostas.map((resposta) => (
                                <li key={resposta.id} className="flex items-center gap-3">
                                    <span className="min-w-0 flex-1 text-apoio text-titulo">
                                        {resposta.empresa}
                                    </span>
                                    <span
                                        className={`text-item ${corDaTaxa(resposta.taxa)}`}
                                    >
                                        {resposta.taxa}%
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <p className="mt-3 text-apoio text-secundario">
                            Fica visível no perfil de cada empresa. Nenhuma candidatura pode
                            ficar sem resposta.
                        </p>
                    </section>
                </aside>
            </div>
        </CascaDoApp>
    )
}

export default PainelEcossistema
