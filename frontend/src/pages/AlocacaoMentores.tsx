import { useState } from 'react'

import { CustomButton } from '../components/CustomButton'
import SeloStatus, { type Status } from '../components/SeloStatus'
import Indicadores, { type Indicador } from '../components/Indicadores'
import TabelaSelecionavel, { type ColunaDaTabela } from '../components/TabelaSelecionavel'
import CartoesDeDetalhe from '../components/CartoesDeDetalhe'

/**
 * 44 · Gestão do PD — alocar mentor · rota /alocacao
 *
 * Squads aprovadas em desafios de Formação que precisam de um mentor. O mentor
 * recebe o convite e aceita ou recusa até o prazo; se recusar ou o prazo vencer,
 * a squad volta para esta lista.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 */


const indicadores: Indicador[] = [
    { id: 'sem-mentor', rotulo: 'Squads sem mentor', valor: '2', cor: 'text-ocre' },
    { id: 'pendentes', rotulo: 'Convites pendentes', valor: '1', cor: 'text-ocre' },
    {
        id: 'ativas',
        rotulo: 'Alocações ativas',
        valor: '5',
        cor: 'text-status-aprovada-texto',
    },
    { id: 'horas', rotulo: 'Horas doadas no mês', valor: '38 h', cor: 'text-acento' },
]

interface Detalhe {
    rotulo: string
    valor: string
    nota: string
}

interface Linha {
    id: number
    squad: string
    composicao: string
    oportunidade: string
    trilha: string
    aprovadaEm: string
    semMentorHa: string
    status: Status
    rotulo: string
    detalhes: Detalhe[]
}

const linhas: Linha[] = [
    {
        id: 1,
        squad: 'Squad Alpha',
        composicao: '4 integrantes · representante Bianca Rocha',
        oportunidade: 'Desafio Logística Urbana',
        trilha: 'Formação',
        aprovadaEm: '22/10/2026',
        semMentorHa: '9 dias',
        status: 'pendente',
        rotulo: 'Sem mentor',
        detalhes: [
            {
                rotulo: 'Oportunidade',
                valor: 'Desafio Logística Urbana',
                nota: 'Formação · squad de 4 integrantes',
            },
            {
                rotulo: 'Mentor sugerido',
                valor: 'Paulo Tavares',
                nota: 'disponível · 1 squad acompanhada',
            },
            {
                rotulo: 'Horas previstas por mês',
                valor: '8 h',
                nota: 'sugerido pelo desafio',
            },
            {
                rotulo: 'Prazo para o mentor responder',
                valor: '08/11/2026',
                nota: '7 dias a partir do convite',
            },
        ],
    },
    {
        id: 2,
        squad: 'Squad Recife Dev',
        composicao: '3 integrantes · representante Tiago Nery',
        oportunidade: 'Desafio Mobilidade Verde',
        trilha: 'Formação',
        aprovadaEm: '25/10/2026',
        semMentorHa: '6 dias',
        status: 'pendente',
        rotulo: 'Convite enviado',
        detalhes: [],
    },
    {
        id: 3,
        squad: 'Squad Mangue',
        composicao: '5 integrantes · mentor Paulo Tavares',
        oportunidade: 'Programa Conecta Indústria',
        trilha: 'Formação',
        aprovadaEm: '10/10/2026',
        semMentorHa: '—',
        status: 'aprovada',
        rotulo: 'Alocada',
        detalhes: [],
    },
    {
        id: 4,
        squad: 'Squad Capibaribe',
        composicao: '4 integrantes · mentora Joana Lins',
        oportunidade: 'Desafio Logística Urbana',
        trilha: 'Formação',
        aprovadaEm: '08/10/2026',
        semMentorHa: '—',
        status: 'aprovada',
        rotulo: 'Alocada',
        detalhes: [],
    },
]

const COLUNAS: ColunaDaTabela<Linha>[] = [
    {
        rotulo: 'Squad',
        celula: (l) => (
            <>
                <p className="text-item text-titulo">{l.squad}</p>
                <p className="mt-1 text-apoio text-secundario">{l.composicao}</p>
            </>
        ),
    },
    {
        rotulo: 'Oportunidade',
        celula: (l) => <span className="text-apoio text-titulo">{l.oportunidade}</span>,
    },
    { rotulo: 'Trilha', celula: (l) => <span className="text-apoio text-titulo">{l.trilha}</span> },
    {
        rotulo: 'Aprovada em',
        celula: (l) => <span className="text-apoio text-titulo">{l.aprovadaEm}</span>,
    },
    {
        rotulo: 'Sem mentor há',
        celula: (l) => <span className="text-apoio text-titulo">{l.semMentorHa}</span>,
    },
    {
        rotulo: 'Situação',
        celula: (l) => <SeloStatus status={l.status} rotulo={l.rotulo} comPonto />,
    },
]

function AlocacaoMentores() {
    const [selecionada, setSelecionada] = useState(linhas[0].id)

    const linha = linhas.find((l) => l.id === selecionada) ?? linhas[0]

    return (
        <div>
            <h1 className="font-display text-tela text-titulo">Alocação de mentores</h1>
            <p className="mt-2 text-apoio text-secundario">
                Squads aprovadas em desafios de Formação que precisam de um mentor. O mentor
                recebe o convite e aceita ou recusa até o prazo.
            </p>

            <div className="mt-6">
                <Indicadores itens={indicadores} rotulo="Indicadores do mês" />
            </div>

            <div className="mt-6">
                <TabelaSelecionavel
                    rotulo="Squads aguardando mentor"
                    colunas={COLUNAS}
                    linhas={linhas}
                    chave={(l) => l.id}
                    selecionada={selecionada}
                    aoSelecionar={(id) => setSelecionada(Number(id))}
                />
            </div>

            <section
                aria-label={`Alocação da ${linha.squad}`}
                className="mt-6 rounded-bloco border border-sutil bg-card p-card shadow-card"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-h3 text-titulo">{linha.squad}</h2>
                    <SeloStatus status={linha.status} rotulo={linha.rotulo} comPonto />
                    <span className="ml-auto text-apoio text-secundario">
                        aprovada em {linha.aprovadaEm}
                    </span>
                </div>

                {linha.detalhes.length === 0 ? (
                    <p className="mt-5 rounded-card bg-page p-5 text-apoio text-secundario">
                        Esta squad não está aguardando alocação. Escolha uma linha com
                        situação "Sem mentor" para enviar um convite.
                    </p>
                ) : (
                    <div className="mt-5">
                        <CartoesDeDetalhe
                            itens={linha.detalhes.map((d) => ({
                                rotulo: d.rotulo,
                                valor: d.valor,
                                nota: d.nota,
                            }))}
                        />
                    </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-sutil pt-5">
                    <CustomButton
                        variant="aprovar"
                        size="auto"
                        disabled={linha.detalhes.length === 0}
                    >
                        Enviar convite ao mentor
                    </CustomButton>
                    <CustomButton
                        variant="neutro"
                        size="auto"
                        disabled={linha.detalhes.length === 0}
                    >
                        Escolher outro mentor
                    </CustomButton>
                    <p className="max-w-[360px] sm:ml-auto text-apoio text-secundario">
                        O mentor responde em Mentor · convites. Se recusar ou o prazo vencer,
                        a squad volta para esta lista.
                    </p>
                </div>
            </section>
        </div>
    )
}

export default AlocacaoMentores
