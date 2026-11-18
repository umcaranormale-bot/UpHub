import { useState } from 'react'

import { CustomButton } from '../components/CustomButton'
import CascaDoApp from '../components/CascaDoApp'
import SeloStatus, { type Status } from '../components/SeloStatus'
import { MENU_GESTAO } from '../navegacao/menus'

/**
 * 44 · Gestão do PD — alocar mentor · rota /alocacao
 *
 * Squads aprovadas em desafios de Formação que precisam de um mentor. O mentor
 * recebe o convite e aceita ou recusa até o prazo; se recusar ou o prazo vencer,
 * a squad volta para esta lista.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 */

interface Indicador {
    id: string
    rotulo: string
    valor: string
    cor: string
}

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

const COLUNAS = [
    'Squad',
    'Oportunidade',
    'Trilha',
    'Aprovada em',
    'Sem mentor há',
    'Situação',
]

function AlocacaoMentores() {
    const [selecionada, setSelecionada] = useState(linhas[0].id)

    const linha = linhas.find((l) => l.id === selecionada) ?? linhas[0]

    return (
        <CascaDoApp
            organizacao="Porto Digital"
            papel="Gestão do PD"
            iniciais="MV"
            nome="Marcos Vilela"
            itens={MENU_GESTAO}
            voltarPara="/painel"
        >
            <h1 className="font-display text-tela text-titulo">Alocação de mentores</h1>
            <p className="mt-2 text-apoio text-secundario">
                Squads aprovadas em desafios de Formação que precisam de um mentor. O mentor
                recebe o convite e aceita ou recusa até o prazo.
            </p>

            <ul className="mt-6 grid grid-cols-4 gap-5">
                {indicadores.map((indicador) => (
                    <li
                        key={indicador.id}
                        className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                    >
                        <p className="text-item text-secundario">{indicador.rotulo}</p>
                        <p className={`mt-2 font-display text-tela ${indicador.cor}`}>
                            {indicador.valor}
                        </p>
                    </li>
                ))}
            </ul>

            <section
                aria-label="Squads aguardando mentor"
                className="mt-6 overflow-hidden rounded-bloco border border-sutil bg-card shadow-card"
            >
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-sutil bg-page">
                            {COLUNAS.map((coluna) => (
                                <th
                                    key={coluna}
                                    scope="col"
                                    className="px-card py-3 text-selo text-secundario uppercase"
                                >
                                    {coluna}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.map((item) => (
                            <tr
                                key={item.id}
                                aria-selected={item.id === selecionada}
                                onClick={() => setSelecionada(item.id)}
                                className={`cursor-pointer border-b border-sutil transition-colors duration-[var(--dur-rapida)] ease-padrao last:border-b-0 ${
                                    item.id === selecionada
                                        ? 'bg-acento-suave'
                                        : 'hover:bg-page'
                                }`}
                            >
                                <td className="px-card py-4">
                                    <p className="text-item text-titulo">{item.squad}</p>
                                    <p className="mt-1 text-apoio text-secundario">
                                        {item.composicao}
                                    </p>
                                </td>
                                <td className="px-card py-4 text-apoio text-titulo">
                                    {item.oportunidade}
                                </td>
                                <td className="px-card py-4 text-apoio text-titulo">
                                    {item.trilha}
                                </td>
                                <td className="px-card py-4 text-apoio text-titulo">
                                    {item.aprovadaEm}
                                </td>
                                <td className="px-card py-4 text-apoio text-titulo">
                                    {item.semMentorHa}
                                </td>
                                <td className="px-card py-4">
                                    <SeloStatus
                                        status={item.status}
                                        rotulo={item.rotulo}
                                        comPonto
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section
                aria-label={`Alocação da ${linha.squad}`}
                className="mt-6 rounded-bloco border border-sutil bg-card p-card shadow-card"
            >
                <div className="flex items-center gap-3">
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
                    <ul className="mt-5 grid grid-cols-4 gap-5">
                        {linha.detalhes.map((detalhe) => (
                            <li key={detalhe.rotulo} className="rounded-card bg-page p-5">
                                <p className="text-apoio text-secundario">{detalhe.rotulo}</p>
                                <p className="mt-1 text-item text-titulo">{detalhe.valor}</p>
                                <p className="mt-1 text-apoio text-secundario">
                                    {detalhe.nota}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-6 flex items-center gap-4 border-t border-sutil pt-5">
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
                    <p className="ml-auto max-w-[360px] text-apoio text-secundario">
                        O mentor responde em Mentor · convites. Se recusar ou o prazo vencer,
                        a squad volta para esta lista.
                    </p>
                </div>
            </section>
        </CascaDoApp>
    )
}

export default AlocacaoMentores
